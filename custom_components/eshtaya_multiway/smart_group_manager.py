"""High-reliability Smart Group engine for Eshtaya Multi-Way Control."""
from __future__ import annotations

import asyncio
from collections import defaultdict, deque
from datetime import datetime, timezone, timedelta
from time import monotonic
from typing import Any
from uuid import uuid4

from homeassistant.core import Context, Event, HomeAssistant, State, callback
from homeassistant.helpers import entity_registry as er, issue_registry as ir
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_state_change_event, async_track_time_interval

from .const import (
    DOMAIN,
    MODE_EVENT,
    MODE_MIRROR,
    MODE_MOMENTARY_OFF,
    MODE_MOMENTARY_ON,
    MODE_TOGGLE,
    PERFORMANCE_SAFE,
    SIGNAL_SMART_GROUPS_UPDATED,
    SIGNAL_SMART_RUNTIME_UPDATED,
    SMART_DIRECTION_BIDIRECTIONAL,
    SMART_FAILURE_STOP,
    SMART_KIND_PHYSICAL,
    SMART_STATE_ALL,
    UNAVAILABLE_STATES,
    VALID_STATES,
)
from .smart_storage import SmartGroupStore


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


def _invert(state: str) -> str:
    return "off" if state == "on" else "on"


class SmartGroupManager:
    """Control physical-controller and virtual aggregate groups safely."""

    def __init__(self, hass: HomeAssistant, store: SmartGroupStore) -> None:
        self.hass = hass
        self.store = store
        self._groups: dict[str, dict[str, Any]] = {}
        self._entity_groups: dict[str, set[str]] = defaultdict(set)
        self._runtime: dict[str, dict[str, Any]] = {}
        self._pending_contexts: dict[str, tuple[str, str, str, float]] = {}
        self._unsub = None
        self._watchdog = None
        self._activity: deque[dict[str, Any]] = deque(maxlen=300)
        self._locks: dict[str, asyncio.Lock] = {}
        self._flaps: dict[tuple[str, str], deque[float]] = defaultdict(deque)
        self._quarantine: dict[tuple[str, str], float] = {}
        self._scene_edges: dict[str, deque[tuple[float, str]]] = defaultdict(deque)
        self._scene_tasks: dict[str, asyncio.Task] = {}
        self._verify_tasks: dict[str, asyncio.Task] = {}
        self._edge_queues: dict[str, deque[tuple[str, Event]]] = defaultdict(deque)
        self._edge_tasks: dict[str, asyncio.Task] = {}
        self._started = False

    async def async_start(self) -> None:
        if self._started:
            return
        self._started = True
        await self.async_reload()
        self._watchdog = async_track_time_interval(
            self.hass, self._async_watchdog_tick, timedelta(seconds=15)
        )

    async def async_stop(self) -> None:
        self._started = False
        if self._unsub:
            self._unsub()
            self._unsub = None
        if self._watchdog:
            self._watchdog()
            self._watchdog = None
        for task in (
            *self._scene_tasks.values(),
            *self._verify_tasks.values(),
            *self._edge_tasks.values(),
        ):
            task.cancel()
        self._scene_tasks.clear()
        self._verify_tasks.clear()
        self._edge_tasks.clear()
        self._edge_queues.clear()

    async def async_reload(self) -> None:
        self._groups = {g["id"]: g for g in self.store.groups()}
        self._entity_groups.clear()
        valid = set(self._groups)
        for group_id, group in self._groups.items():
            self._locks.setdefault(group_id, asyncio.Lock())
            runtime = self._runtime.setdefault(group_id, self._new_runtime())
            runtime["name"] = group["name"]
            controller = group.get("controller_entity")
            if controller:
                self._entity_groups[controller].add(group_id)
            for member in group["members"]:
                self._entity_groups[member["entity_id"]].add(group_id)
            self._refresh_runtime(group_id)
        for group_id in list(self._runtime):
            if group_id not in valid:
                self._runtime.pop(group_id, None)
                self._locks.pop(group_id, None)
                self._edge_queues.pop(group_id, None)
                task = self._edge_tasks.pop(group_id, None)
                if task and not task.done():
                    task.cancel()
        if self._unsub:
            self._unsub()
            self._unsub = None
        if self._entity_groups:
            self._unsub = async_track_state_change_event(
                self.hass, list(self._entity_groups), self._async_state_event
            )
        await self._async_reconcile_hidden_members()
        async_dispatcher_send(self.hass, SIGNAL_SMART_GROUPS_UPDATED)

    async def _async_reconcile_hidden_members(self) -> None:
        """Apply hide-members policy and remember only visibility owned by us."""
        desired = {
            member["entity_id"]
            for group in self._groups.values()
            if group.get("hide_members")
            for member in group.get("members", [])
        }
        owned = self.store.hidden_members_owned()
        registry = er.async_get(self.hass)
        new_owned = set(owned)

        for entity_id in desired:
            entry = registry.async_get(entity_id)
            if entry is None:
                continue
            if entry.hidden_by is None:
                registry.async_update_entity(
                    entity_id, hidden_by=er.RegistryEntryHider.INTEGRATION
                )
                new_owned.add(entity_id)
            elif entry.hidden_by == er.RegistryEntryHider.INTEGRATION:
                new_owned.add(entity_id)

        for entity_id in owned - desired:
            entry = registry.async_get(entity_id)
            if entry and entry.hidden_by == er.RegistryEntryHider.INTEGRATION:
                registry.async_update_entity(entity_id, hidden_by=None)
            new_owned.discard(entity_id)

        if new_owned != owned:
            await self.store.async_set_hidden_members_owned(new_owned)

    @staticmethod
    def _new_runtime() -> dict[str, Any]:
        return {
            "state": None,
            "desired_state": None,
            "health": "healthy",
            "last_source": None,
            "last_action": None,
            "last_changed": None,
            "last_latency_ms": None,
            "last_transaction_id": None,
            "last_error": None,
            "commands": 0,
            "failures": 0,
            "quarantined": [],
            "member_metrics": {},
            "manual_authority_until": 0.0,
            "manual_authority_source": None,
            "manual_authority_state": None,
        }

    def list_with_runtime(self) -> list[dict[str, Any]]:
        result = []
        for group in self.store.groups():
            item = dict(group)
            item["runtime"] = self.status(group["id"])
            result.append(item)
        return result

    def status(self, group_id: str) -> dict[str, Any]:
        group = self._groups.get(group_id)
        if not group:
            return {}
        self._refresh_runtime(group_id)
        runtime = dict(self._runtime[group_id])
        runtime["members"] = [
            self._member_status(group_id, member["entity_id"]) for member in group["members"]
        ]
        controller = group.get("controller_entity")
        runtime["controller"] = self._entity_snapshot(controller) if controller else None
        runtime["quality_score"] = self._quality_score(runtime)
        latencies = [
            metric.get("avg_latency_ms")
            for metric in runtime.get("member_metrics", {}).values()
            if metric.get("avg_latency_ms") is not None
        ]
        avg = round(sum(latencies) / len(latencies)) if latencies else None
        runtime["average_member_latency_ms"] = avg
        runtime["response_class"] = (
            "cloud_or_device_limited"
            if avg and avg >= 400
            else "moderate"
            if avg and avg >= 180
            else "fast"
        )
        return runtime

    def summary(self) -> dict[str, Any]:
        groups = self.store.groups()
        statuses = [self.status(group["id"]) for group in groups]
        return {
            "groups": len(groups),
            "healthy": sum(1 for runtime in statuses if runtime.get("health") == "healthy"),
            "degraded": sum(
                1 for runtime in statuses if runtime.get("health") not in {"healthy", "maintenance"}
            ),
            "maintenance": sum(1 for group in groups if group.get("maintenance")),
            "members": sum(len(group["members"]) for group in groups),
            "physical": sum(1 for group in groups if group["kind"] == SMART_KIND_PHYSICAL),
            "virtual": sum(1 for group in groups if group["kind"] != SMART_KIND_PHYSICAL),
            "average_quality": round(
                sum(runtime.get("quality_score", 100) for runtime in statuses) / len(statuses), 1
            )
            if statuses
            else 100,
        }

    def activity(self, limit: int = 200) -> list[dict[str, Any]]:
        return list(self._activity)[-limit:][::-1]

    @callback
    def _async_state_event(self, event: Event) -> None:
        """Queue state edges per Smart Group in exact Home Assistant arrival order."""
        entity_id = event.data.get("entity_id")
        if not entity_id:
            return
        for group_id in list(self._entity_groups.get(entity_id, ())):
            self._edge_queues[group_id].append((entity_id, event))
            task = self._edge_tasks.get(group_id)
            if task is None or task.done():
                self._edge_tasks[group_id] = self.hass.async_create_task(
                    self._async_process_edge_queue(group_id)
                )

    async def _async_process_edge_queue(self, group_id: str) -> None:
        """Serialize physical/member edges so rapid opposite states cannot reorder."""
        try:
            queue = self._edge_queues[group_id]
            while queue and self._started and group_id in self._groups:
                entity_id, event = queue.popleft()
                await self._async_handle_event(group_id, entity_id, event)
        except asyncio.CancelledError:
            return
        finally:
            task = self._edge_tasks.get(group_id)
            if task is asyncio.current_task():
                self._edge_tasks.pop(group_id, None)

    async def _async_handle_event(self, group_id: str, entity_id: str, event: Event) -> None:
        group = self._groups.get(group_id)
        if not group or not group.get("enabled", True) or group.get("maintenance"):
            return
        new: State | None = event.data.get("new_state")
        old: State | None = event.data.get("old_state")
        if new is None:
            return

        context_id = event.context.id if event.context else None
        pending = self._pending_contexts.pop(context_id, None) if context_id else None
        if pending and pending[0] == group_id and pending[1] == entity_id:
            self._refresh_runtime(group_id)
            self._notify(group_id)
            return
        if new.state in UNAVAILABLE_STATES:
            self._refresh_runtime(group_id)
            self._notify(group_id)
            return

        old_state = old.state if old else None
        new_state = new.state
        if old_state == new_state:
            # Attribute-only updates (brightness/color/effect/etc.) must refresh
            # the virtual aggregate entity, but are not physical control edges.
            self._refresh_runtime(group_id)
            self._notify(group_id)
            return
        if self._record_flap(group, entity_id):
            self._refresh_runtime(group_id)
            self._notify(group_id)
            return

        controller = group.get("controller_entity")
        if entity_id == controller:
            target = self._controller_target(group, old_state, new_state)
            if target in VALID_STATES:
                await self.async_set_state(group_id, target, source=entity_id, origin="physical")
            return

        if group["behavior"].get("direction") == SMART_DIRECTION_BIDIRECTIONAL and new_state in VALID_STATES:
            runtime = self._runtime[group_id]
            if (
                group["kind"] == SMART_KIND_PHYSICAL
                and monotonic() < float(runtime.get("manual_authority_until") or 0)
                and runtime.get("manual_authority_source") == controller
                and new_state != runtime.get("manual_authority_state")
            ):
                self._add_activity(
                    group_id, "manual_priority_guard", entity_id, new_state, "ignored", None,
                    runtime.get("last_transaction_id"), "member",
                )
                return
            if self._is_scene_batch(group, entity_id):
                self._schedule_scene_settle(group_id)
                return
            await self.async_set_state(group_id, new_state, source=entity_id, origin="member")
            return

        self._refresh_runtime(group_id)
        await self._reflect_controller_if_needed(group_id)
        self._notify(group_id)

    def _controller_target(
        self, group: dict[str, Any], old_state: str | None, new_state: str
    ) -> str | None:
        behavior = group["behavior"]
        mode = behavior.get("controller_mode", MODE_MIRROR)
        invert = behavior.get("invert_controller", False)
        mapped = _invert(new_state) if invert and new_state in VALID_STATES else new_state
        if mode == MODE_MIRROR and mapped in VALID_STATES:
            return mapped
        if mode == MODE_TOGGLE and old_state != new_state:
            return _invert(self._runtime[group["id"]].get("desired_state") or self._compute_state(group) or "off")
        if mode == MODE_MOMENTARY_ON and mapped == "on":
            return _invert(self._runtime[group["id"]].get("desired_state") or self._compute_state(group) or "off")
        if mode == MODE_MOMENTARY_OFF and mapped == "off":
            return _invert(self._runtime[group["id"]].get("desired_state") or self._compute_state(group) or "off")
        if mode == MODE_EVENT and old_state != new_state:
            return _invert(self._runtime[group["id"]].get("desired_state") or self._compute_state(group) or "off")
        return None

    async def async_set_state(
        self,
        group_id: str,
        state: str,
        *,
        source: str = "virtual",
        origin: str = "service",
        service_data: dict[str, Any] | None = None,
    ) -> bool:
        if state not in VALID_STATES:
            raise ValueError("State must be on or off")
        group = self._groups.get(group_id)
        if not group:
            raise ValueError("Smart Group not found")
        if not group.get("enabled", True):
            raise ValueError("Smart Group is disabled")
        if group.get("maintenance"):
            raise ValueError("Smart Group is in maintenance mode")

        async with self._locks[group_id]:
            started = monotonic()
            txid = uuid4().hex[:12]
            runtime = self._runtime[group_id]
            runtime.update(
                {
                    "desired_state": state,
                    "last_source": source,
                    "last_action": state,
                    "last_changed": _utcnow(),
                    "last_transaction_id": txid,
                    "last_error": None,
                }
            )
            if origin in {"physical", "member", "test"}:
                runtime["manual_authority_until"] = monotonic() + float(
                    group["behavior"].get("manual_priority_ms", 2500)
                ) / 1000
                runtime["manual_authority_source"] = source
                runtime["manual_authority_state"] = state

            targets = [
                member["entity_id"]
                for member in group["members"]
                if member.get("enabled", True)
                and member["entity_id"] != source
                and not self._is_quarantined(group_id, member["entity_id"])
            ]
            controller = group.get("controller_entity")
            if (
                group["kind"] == SMART_KIND_PHYSICAL
                and group["behavior"].get("reflect_controller")
                and source != controller
                and controller
                and self._domain(controller) in {"switch", "light", "input_boolean"}
                and not self._is_quarantined(group_id, controller)
            ):
                targets.append(controller)

            results: list[bool] = []
            delay = float(group["behavior"].get("member_delay_ms", 0)) / 1000
            performance = group["behavior"].get("performance_mode")
            if (
                performance != PERFORMANCE_SAFE
                and not delay
                and group["behavior"].get("failure_policy") != SMART_FAILURE_STOP
            ):
                if targets:
                    results.extend(
                        await asyncio.gather(
                            *(
                                self._async_command_entity(
                                    group, entity_id, state, txid, service_data=service_data
                                )
                                for entity_id in targets
                            )
                        )
                    )
            else:
                for entity_id in targets:
                    ok = await self._async_command_entity(
                        group, entity_id, state, txid, service_data=service_data
                    )
                    results.append(ok)
                    if not ok and group["behavior"].get("failure_policy") == SMART_FAILURE_STOP:
                        break
                    if delay:
                        await asyncio.sleep(delay)

            runtime["last_latency_ms"] = int((monotonic() - started) * 1000)
            runtime["commands"] += 1
            success = all(results) if results else True
            if not success:
                runtime["failures"] += 1
                runtime["last_error"] = "One or more members failed to accept the command"
            self._add_activity(
                group_id, "set_state", source, state, "success" if success else "partial",
                runtime["last_latency_ms"], txid, origin,
            )
            self._refresh_runtime(group_id)
            self._notify(group_id)

            if group["behavior"].get("verify_members"):
                old_task = self._verify_tasks.get(group_id)
                if old_task and not old_task.done():
                    old_task.cancel()
                self._verify_tasks[group_id] = self.hass.async_create_task(
                    self._async_verify(group_id, state, txid)
                )
            return success

    async def _async_command_entity(
        self,
        group: dict[str, Any],
        entity_id: str,
        state: str,
        txid: str,
        *,
        service_data: dict[str, Any] | None = None,
    ) -> bool:
        current = self.hass.states.get(entity_id)
        if current is None or current.state in UNAVAILABLE_STATES:
            self._metric(group["id"], entity_id, False, None)
            return False
        if current.state == state and not service_data:
            self._metric(group["id"], entity_id, True, 0)
            return True
        domain = self._domain(entity_id)
        if domain not in {"switch", "light", "input_boolean", "fan"}:
            return False
        context = Context()
        self._pending_contexts[context.id] = (group["id"], entity_id, state, monotonic() + 15.0)
        start = monotonic()
        try:
            blocking = group["behavior"].get("performance_mode") == PERFORMANCE_SAFE
            data: dict[str, Any] = {"entity_id": entity_id}
            if domain == "light" and service_data:
                if state == "on":
                    data.update(service_data)
                elif "transition" in service_data:
                    data["transition"] = service_data["transition"]
            await self.hass.services.async_call(
                domain,
                f"turn_{state}",
                data,
                blocking=blocking,
                context=context,
            )
            latency = int((monotonic() - start) * 1000)
            self._metric(group["id"], entity_id, True, latency)
            return True
        except Exception:  # noqa: BLE001
            self._pending_contexts.pop(context.id, None)
            self._metric(group["id"], entity_id, False, None)
            return False

    async def _async_verify(self, group_id: str, expected: str, txid: str) -> None:
        try:
            group = self._groups.get(group_id)
            if not group:
                return
            timeout = float(group["behavior"].get("command_timeout", 3.0))
            await asyncio.sleep(self._adaptive_verify_delay(group, timeout))
            runtime = self._runtime.get(group_id)
            if not runtime or runtime.get("last_transaction_id") != txid:
                return
            mismatches = self._mismatches(group, expected)
            retries = int(group["behavior"].get("max_retries", 1))
            for _ in range(retries):
                if not mismatches or runtime.get("last_transaction_id") != txid:
                    break
                await asyncio.gather(
                    *(
                        self._async_command_entity(group, entity_id, expected, txid)
                        for entity_id in mismatches
                        if not self._is_quarantined(group_id, entity_id)
                    )
                )
                await asyncio.sleep(min(timeout, 0.5))
                mismatches = self._mismatches(group, expected)
            if mismatches and runtime.get("last_transaction_id") == txid:
                runtime["last_error"] = f"Out of sync: {', '.join(mismatches[:4])}"
                self._create_issue(group, runtime["last_error"])
                if group["behavior"].get("notify_on_fault"):
                    self._notify_fault(group, runtime["last_error"])
            elif not mismatches:
                self._delete_issue(f"smart_group_out_of_sync_{group_id}")
            self._refresh_runtime(group_id)
            self._notify(group_id)
        except asyncio.CancelledError:
            return

    async def _reflect_controller_if_needed(self, group_id: str) -> None:
        group = self._groups[group_id]
        if group["kind"] != SMART_KIND_PHYSICAL or not group["behavior"].get("reflect_controller"):
            return
        controller = group.get("controller_entity")
        state = self._compute_state(group)
        if (
            controller
            and state in VALID_STATES
            and self._domain(controller) in {"switch", "light", "input_boolean"}
            and not self._is_quarantined(group_id, controller)
        ):
            if group["behavior"].get("invert_controller"):
                state = _invert(state)
            await self._async_command_entity(group, controller, state, "reflect")

    async def async_sync(self, group_id: str) -> bool:
        group = self._groups.get(group_id)
        if not group:
            raise ValueError("Smart Group not found")
        state: str | None
        if group["kind"] == SMART_KIND_PHYSICAL:
            controller_state = self.hass.states.get(group.get("controller_entity"))
            mode = group["behavior"].get("controller_mode", MODE_MIRROR)
            if mode == MODE_MIRROR and controller_state and controller_state.state in VALID_STATES:
                state = controller_state.state
                if group["behavior"].get("invert_controller"):
                    state = _invert(state)
            else:
                state = self._runtime[group_id].get("desired_state") or self._compute_state(group)
        else:
            state = self._runtime[group_id].get("desired_state") or self._compute_state(group)
        if state not in VALID_STATES:
            return False
        return await self.async_set_state(group_id, state, source="sync", origin="sync")

    async def async_full_test(self, group_id: str, destructive: bool = False) -> dict[str, Any]:
        group = self._groups.get(group_id)
        if not group:
            raise ValueError("Smart Group not found")
        before = self._compute_state(group)
        report = self.test_group(group_id)
        if destructive and before in VALID_STATES:
            target = _invert(before)
            started = monotonic()
            ok1 = await self.async_set_state(group_id, target, source="test_center", origin="test")
            await asyncio.sleep(0.35)
            after_toggle = self._compute_state(group)
            ok2 = await self.async_set_state(group_id, before, source="test_center", origin="test")
            await asyncio.sleep(0.35)
            restored = self._compute_state(group)
            report["destructive_test"] = {
                "toggle": ok1,
                "toggle_state": after_toggle,
                "restore": ok2,
                "restored_state": restored,
                "latency_ms": int((monotonic() - started) * 1000),
            }
            report["passed"] = report["passed"] and ok1 and ok2 and restored == before
        return report

    def test_group(self, group_id: str) -> dict[str, Any]:
        group = self._groups.get(group_id)
        if not group:
            raise ValueError("Smart Group not found")
        members = [self._member_status(group_id, member["entity_id"]) for member in group["members"]]
        controller = (
            self._entity_snapshot(group.get("controller_entity"))
            if group.get("controller_entity")
            else None
        )
        missing = [member["entity_id"] for member in members if member["state"] == "missing"]
        offline = [
            member["entity_id"] for member in members if member["state"] in UNAVAILABLE_STATES
        ]
        if controller and controller["state"] in {"missing", *UNAVAILABLE_STATES}:
            offline.append(controller["entity_id"])
        return {
            "group_id": group_id,
            "name": group["name"],
            "passed": not missing and not offline,
            "state": self._compute_state(group),
            "members": members,
            "controller": controller,
            "missing": missing,
            "offline": offline,
            "quality_score": self.status(group_id).get("quality_score"),
        }

    async def async_test_all(self) -> dict[str, Any]:
        results = [self.test_group(group_id) for group_id in self._groups]
        return {
            "total": len(results),
            "passed": sum(1 for result in results if result["passed"]),
            "failed": sum(1 for result in results if not result["passed"]),
            "results": results,
            "created_at": _utcnow(),
        }

    def diagnostics_bundle(self, group_id: str | None = None) -> dict[str, Any]:
        groups = (
            [self._groups[group_id]]
            if group_id and group_id in self._groups
            else list(self._groups.values())
        )
        return {
            "created_at": _utcnow(),
            "summary": self.summary(),
            "groups": [
                {"config": group, "runtime": self.status(group["id"])} for group in groups
            ],
            "activity": self.activity(100),
        }

    @callback
    def _async_watchdog_tick(self, _now) -> None:
        self.hass.async_create_task(self._async_watchdog())

    async def _async_watchdog(self) -> None:
        self._prune_pending_contexts()
        for group_id, group in list(self._groups.items()):
            if not group.get("enabled", True) or group.get("maintenance"):
                continue
            self._cleanup_quarantine(group_id)
            runtime = self._runtime[group_id]
            expected = runtime.get("desired_state")
            if group["behavior"].get("auto_heal") and expected in VALID_STATES:
                mismatches = self._mismatches(group, expected)
                if mismatches:
                    await self.async_set_state(
                        group_id, expected, source="watchdog", origin="auto_heal"
                    )
            self._refresh_runtime(group_id)
            self._notify(group_id)

    def _refresh_runtime(self, group_id: str) -> None:
        group = self._groups.get(group_id)
        if not group:
            return
        runtime = self._runtime.setdefault(group_id, self._new_runtime())
        state = self._compute_state(group)
        runtime["state"] = state
        if runtime.get("desired_state") not in VALID_STATES:
            runtime["desired_state"] = state if state in VALID_STATES else None

        tracked = [member["entity_id"] for member in group["members"]]
        controller = group.get("controller_entity") if group["kind"] == SMART_KIND_PHYSICAL else None
        if controller:
            tracked.append(controller)
        quarantined = [
            entity_id for entity_id in tracked if self._is_quarantined(group_id, entity_id)
        ]
        runtime["quarantined"] = quarantined
        if not group.get("enabled", True):
            health = "disabled"
        elif group.get("maintenance"):
            health = "maintenance"
        else:
            snapshots = [self._entity_snapshot(entity_id) for entity_id in tracked]
            if any(snapshot and snapshot["state"] == "missing" for snapshot in snapshots):
                health = "missing"
            elif any(
                snapshot and snapshot["state"] in UNAVAILABLE_STATES for snapshot in snapshots
            ):
                health = "degraded"
            elif quarantined:
                health = "quarantined"
            elif (
                runtime.get("desired_state") in VALID_STATES
                and self._mismatches(group, runtime["desired_state"])
            ):
                health = "out_of_sync"
            else:
                health = "healthy"
        runtime["health"] = health

    def _compute_state(self, group: dict[str, Any]) -> str:
        states: list[str] = []
        takeover_compat = bool((group.get("migration") or {}).get("takeover"))
        for member in group["members"]:
            if not member.get("enabled", True) or self._is_quarantined(
                group["id"], member["entity_id"]
            ):
                continue
            state = self.hass.states.get(member["entity_id"])
            if takeover_compat:
                states.append(state.state if state is not None else "unavailable")
            elif state and state.state in VALID_STATES:
                states.append(state.state)
        if not states:
            return "unavailable"

        all_policy = group["behavior"].get("state_policy") == SMART_STATE_ALL
        if takeover_compat:
            valid = [state not in UNAVAILABLE_STATES for state in states]
            valid_state = all(valid) if all_policy else any(valid)
            if not valid_state:
                return "unavailable"
            command_states = [state for state in states if state in VALID_STATES]
        else:
            command_states = states

        if not command_states:
            return "unavailable"
        if all_policy:
            return "on" if all(state == "on" for state in command_states) else "off"
        return "on" if any(state == "on" for state in command_states) else "off"

    def _mismatches(self, group: dict[str, Any], expected: str) -> list[str]:
        result = []
        for member in group["members"]:
            entity_id = member["entity_id"]
            if (
                not member.get("enabled", True)
                or self._is_quarantined(group["id"], entity_id)
            ):
                continue
            state = self.hass.states.get(entity_id)
            if state and state.state not in UNAVAILABLE_STATES and state.state != expected:
                result.append(entity_id)
        return result

    def _member_status(self, group_id: str, entity_id: str) -> dict[str, Any]:
        snapshot = self._entity_snapshot(entity_id) or {
            "entity_id": entity_id,
            "state": "missing",
            "domain": self._domain(entity_id),
            "friendly_name": None,
        }
        metric = self._runtime[group_id].get("member_metrics", {}).get(entity_id, {})
        snapshot.update(
            {
                "quarantined": self._is_quarantined(group_id, entity_id),
                "commands": metric.get("commands", 0),
                "failures": metric.get("failures", 0),
                "avg_latency_ms": metric.get("avg_latency_ms"),
                "last_latency_ms": metric.get("last_latency_ms"),
                "quality_score": self._metric_quality(metric),
            }
        )
        return snapshot

    def _entity_snapshot(self, entity_id: str | None) -> dict[str, Any] | None:
        if not entity_id:
            return None
        state = self.hass.states.get(entity_id)
        return {
            "entity_id": entity_id,
            "state": state.state if state else "missing",
            "domain": self._domain(entity_id),
            "friendly_name": state.attributes.get("friendly_name") if state else None,
        }

    def _metric(
        self, group_id: str, entity_id: str, success: bool, latency: int | None
    ) -> None:
        runtime = self._runtime[group_id]
        metrics = runtime.setdefault("member_metrics", {})
        metric = metrics.setdefault(
            entity_id,
            {"commands": 0, "failures": 0, "samples": 0, "total_latency": 0},
        )
        metric["commands"] += 1
        if not success:
            metric["failures"] += 1
        if latency is not None:
            metric["samples"] += 1
            metric["total_latency"] += latency
            metric["avg_latency_ms"] = round(metric["total_latency"] / metric["samples"])
            metric["last_latency_ms"] = latency

    @staticmethod
    def _metric_quality(metric: dict[str, Any]) -> int:
        commands = max(1, int(metric.get("commands", 0)))
        failures = int(metric.get("failures", 0))
        latency = int(metric.get("avg_latency_ms") or 0)
        score = 100 - round((failures / commands) * 60) - min(30, latency // 100)
        return max(0, min(100, score))

    def _quality_score(self, runtime: dict[str, Any]) -> int:
        metrics = list(runtime.get("member_metrics", {}).values())
        if not metrics:
            return 100
        return round(sum(self._metric_quality(metric) for metric in metrics) / len(metrics))

    def _adaptive_verify_delay(self, group: dict[str, Any], timeout: float) -> float:
        runtime = self._runtime[group["id"]]
        samples = [
            metric.get("avg_latency_ms")
            for metric in runtime.get("member_metrics", {}).values()
            if metric.get("avg_latency_ms")
        ]
        if not samples:
            return min(timeout, 0.35)
        avg = sum(samples) / len(samples) / 1000
        return min(timeout, max(0.12, min(1.2, avg * 1.35)))

    def _is_scene_batch(self, group: dict[str, Any], entity_id: str) -> bool:
        guard = float(group["behavior"].get("scene_guard_ms", 800)) / 1000
        if guard <= 0:
            return False
        now = monotonic()
        queue = self._scene_edges[group["id"]]
        queue.append((now, entity_id))
        while queue and now - queue[0][0] > guard:
            queue.popleft()
        return len({item[1] for item in queue}) >= 2

    def _schedule_scene_settle(self, group_id: str) -> None:
        old = self._scene_tasks.get(group_id)
        if old and not old.done():
            old.cancel()
        self._scene_tasks[group_id] = self.hass.async_create_task(
            self._async_scene_settle(group_id)
        )

    async def _async_scene_settle(self, group_id: str) -> None:
        try:
            group = self._groups.get(group_id)
            if not group:
                return
            await asyncio.sleep(float(group["behavior"].get("scene_guard_ms", 800)) / 1000)
            state = self._compute_state(group)
            if state in VALID_STATES:
                runtime = self._runtime[group_id]
                runtime["desired_state"] = state
                runtime["last_source"] = "scene_guard"
                runtime["last_action"] = state
                runtime["last_changed"] = _utcnow()
                self._add_activity(
                    group_id, "scene_adopted", "scene_guard", state, "success", None, None, "scene"
                )
                await self._reflect_controller_if_needed(group_id)
                self._refresh_runtime(group_id)
                self._notify(group_id)
        except asyncio.CancelledError:
            return

    def _prune_pending_contexts(self) -> None:
        now = monotonic()
        for context_id, pending in list(self._pending_contexts.items()):
            if pending[3] <= now:
                self._pending_contexts.pop(context_id, None)

    def _record_flap(self, group: dict[str, Any], entity_id: str) -> bool:
        key = (group["id"], entity_id)
        now = monotonic()
        queue = self._flaps[key]
        window = float(group["behavior"].get("flap_window_sec", 10))
        queue.append(now)
        while queue and now - queue[0] > window:
            queue.popleft()
        threshold = int(group["behavior"].get("flap_threshold", 8))
        if len(queue) >= threshold:
            until = now + float(group["behavior"].get("quarantine_sec", 60))
            self._quarantine[key] = until
            self._add_activity(
                group["id"], "member_quarantined", entity_id, None, "warning", None, None,
                "flapping",
            )
            return True
        return False

    def _is_quarantined(self, group_id: str, entity_id: str) -> bool:
        until = self._quarantine.get((group_id, entity_id), 0)
        if until and monotonic() >= until:
            self._quarantine.pop((group_id, entity_id), None)
            return False
        return bool(until)

    def _cleanup_quarantine(self, group_id: str) -> None:
        for key in list(self._quarantine):
            if key[0] == group_id:
                self._is_quarantined(*key)

    async def async_set_member_quarantine(
        self, group_id: str, entity_id: str, enabled: bool
    ) -> None:
        group = self._groups.get(group_id)
        if not group:
            raise ValueError("Smart Group not found")
        valid = {member["entity_id"] for member in group["members"]}
        if group.get("controller_entity"):
            valid.add(group["controller_entity"])
        if entity_id not in valid:
            raise ValueError("Entity does not belong to this Smart Group")
        key = (group_id, entity_id)
        if enabled:
            self._quarantine[key] = monotonic() + 86400 * 365
        else:
            self._quarantine.pop(key, None)
        self._refresh_runtime(group_id)
        self._notify(group_id)

    def _add_activity(
        self,
        group_id,
        event,
        source=None,
        action=None,
        result="success",
        latency_ms=None,
        txid=None,
        origin=None,
    ) -> None:
        self._activity.append(
            {
                "timestamp": _utcnow(),
                "group_id": group_id,
                "event": event,
                "source": source,
                "action": action,
                "result": result,
                "latency_ms": latency_ms,
                "transaction_id": txid,
                "origin": origin,
            }
        )

    def _notify(self, group_id: str) -> None:
        async_dispatcher_send(self.hass, SIGNAL_SMART_RUNTIME_UPDATED, group_id)
        self.hass.bus.async_fire(
            f"{DOMAIN}_event", {"section": "smart_group", "group_id": group_id}
        )

    def _create_issue(self, group: dict[str, Any], message: str) -> None:
        ir.async_create_issue(
            self.hass,
            DOMAIN,
            f"smart_group_out_of_sync_{group['id']}",
            is_fixable=False,
            severity=ir.IssueSeverity.WARNING,
            translation_key="smart_group_fault",
            translation_placeholders={"group": group["name"], "error": message},
        )

    def _delete_issue(self, issue_id: str) -> None:
        ir.async_delete_issue(self.hass, DOMAIN, issue_id)

    def _notify_fault(self, group: dict[str, Any], message: str) -> None:
        try:
            from homeassistant.components import persistent_notification

            persistent_notification.async_create(
                self.hass,
                message,
                title=f"Eshtaya Smart Group: {group['name']}",
                notification_id=f"{DOMAIN}_smart_{group['id']}",
            )
        except Exception:  # noqa: BLE001
            return

    @staticmethod
    def _domain(entity_id: str) -> str:
        return entity_id.split(".", 1)[0] if isinstance(entity_id, str) and "." in entity_id else ""
