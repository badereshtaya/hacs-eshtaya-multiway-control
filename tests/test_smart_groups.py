"""Smart Group data-model tests."""

import pytest

from custom_components.eshtaya_multiway.const import (
    MODE_EVENT,
    SMART_KIND_PHYSICAL,
    SMART_KIND_VIRTUAL,
)
from custom_components.eshtaya_multiway.smart_storage import SmartGroupStore


def test_virtual_group_normalizes_members_and_defaults() -> None:
    """A virtual group is normalized with safe defaults."""
    store = SmartGroupStore.__new__(SmartGroupStore)
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Ground Floor",
            "kind": SMART_KIND_VIRTUAL,
            "members": ["light.hall", "light.living", "light.hall"],
        },
        keep_id=False,
    )
    store._validate(group)  # noqa: SLF001
    assert [member["entity_id"] for member in group["members"]] == [
        "light.hall",
        "light.living",
    ]
    assert group["behavior"]["state_policy"] == "any"
    assert group["behavior"]["performance_mode"] == "instant"


def test_physical_button_controller_becomes_event_mode() -> None:
    """Event-style physical controllers cannot remain in mirror mode."""
    store = SmartGroupStore.__new__(SmartGroupStore)
    group = store._normalize(  # noqa: SLF001
        {
            "name": "All Lights",
            "kind": SMART_KIND_PHYSICAL,
            "controller_entity": "button.wall_scene",
            "members": [{"entity_id": "light.hall"}],
            "behavior": {"controller_mode": "mirror"},
        },
        keep_id=False,
    )
    store._validate(group)  # noqa: SLF001
    assert group["behavior"]["controller_mode"] == MODE_EVENT




def test_group_type_is_inferred_from_first_member_for_legacy_payloads() -> None:
    """Legacy Smart Group payloads without a type infer it from their members."""
    store = SmartGroupStore.__new__(SmartGroupStore)
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Legacy Switch Group",
            "kind": SMART_KIND_VIRTUAL,
            "members": [{"entity_id": "switch.one"}],
        },
        keep_id=False,
    )
    assert group["group_type"] == "switch"
    assert group["virtual_type"] == "switch"
    store._validate(group)  # noqa: SLF001


def test_physical_controller_cannot_be_group_member() -> None:
    """A physical controller cannot simultaneously be a controlled member."""
    store = SmartGroupStore.__new__(SmartGroupStore)
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Bad Group",
            "kind": SMART_KIND_PHYSICAL,
            "controller_entity": "switch.master",
            "members": [{"entity_id": "switch.master"}],
        },
        keep_id=False,
    )
    with pytest.raises(ValueError, match="cannot also be a member"):
        store._validate(group)  # noqa: SLF001


def test_imported_source_group_is_preserved() -> None:
    """Imported native HA group identity survives normalization and future updates."""
    store = SmartGroupStore.__new__(SmartGroupStore)
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Living Lights",
            "kind": SMART_KIND_VIRTUAL,
            "members": [{"entity_id": "light.living_1"}],
            "source_group_entity": "light.living_group",
        },
        keep_id=False,
    )
    assert group["source_group_entity"] == "light.living_group"


def test_takeover_metadata_and_exact_entity_id_survive_normalization() -> None:
    """Takeover identity and original group behavior are persistent Smart Group data."""
    store = SmartGroupStore.__new__(SmartGroupStore)
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Living Lights",
            "kind": SMART_KIND_VIRTUAL,
            "members": [
                {"entity_id": "light.living_1"},
                {"entity_id": "light.living_2"},
            ],
            "virtual_type": "light",
            "preferred_entity_id": "light.living_group",
            "hide_members": True,
            "migration": {
                "takeover": True,
                "source_entity_id": "light.living_group",
                "source_group_type": "light",
            },
            "behavior": {"state_policy": "all"},
        },
        keep_id=False,
    )
    store._validate(group)  # noqa: SLF001
    assert group["preferred_entity_id"] == "light.living_group"
    assert group["hide_members"] is True
    assert group["migration"]["takeover"] is True
    assert group["behavior"]["state_policy"] == "all"


@pytest.mark.asyncio
async def test_undo_cannot_erase_completed_takeover() -> None:
    """Generic Undo must not remove a group whose native source was deleted."""
    import asyncio
    from unittest.mock import AsyncMock

    store = SmartGroupStore.__new__(SmartGroupStore)
    store._lock = asyncio.Lock()  # noqa: SLF001
    store._save = AsyncMock()  # noqa: SLF001
    store._data = {  # noqa: SLF001
        "settings": {"config_locked": False},
        "groups": [
            {
                "id": "takeover-1",
                "name": "Living Lights",
                "migration": {"takeover": True},
            }
        ],
        "snapshots": [
            {
                "created_at": "2026-08-22T00:00:00+00:00",
                "reason": "before_create",
                "groups": [],
            }
        ],
    }

    with pytest.raises(ValueError, match="cannot roll back a completed"):
        await store.async_undo_last()

    assert len(store._data["snapshots"]) == 1  # noqa: SLF001
    store._save.assert_not_awaited()  # noqa: SLF001


@pytest.mark.asyncio
async def test_restore_cannot_silently_remove_completed_takeover() -> None:
    """Replace restore must keep completed takeover groups unless explicitly deleted."""
    import asyncio
    from unittest.mock import AsyncMock

    store = SmartGroupStore.__new__(SmartGroupStore)
    store._lock = asyncio.Lock()  # noqa: SLF001
    store._save = AsyncMock()  # noqa: SLF001
    store._data = {  # noqa: SLF001
        "settings": {
            "config_locked": False,
            "snapshot_limit": 25,
            "hidden_members_owned": [],
        },
        "groups": [
            {
                "id": "takeover-1",
                "name": "Living Lights",
                "migration": {"takeover": True},
            }
        ],
        "templates": [],
        "snapshots": [],
    }

    with pytest.raises(ValueError, match="Restore would remove a completed"):
        await store.async_import(
            {"settings": {}, "groups": [], "templates": [], "snapshots": []},
            replace=True,
        )

    assert store._data["snapshots"] == []  # noqa: SLF001
    store._save.assert_not_awaited()  # noqa: SLF001


def test_continuous_enforcement_is_safe_opt_in() -> None:
    """Smart Groups must not fight external automations by default."""
    store = SmartGroupStore.__new__(SmartGroupStore)
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Living Lights",
            "kind": SMART_KIND_VIRTUAL,
            "members": [{"entity_id": "light.living_1"}],
        },
        keep_id=False,
    )
    assert group["behavior"]["auto_heal"] is True
    assert group["behavior"]["continuous_enforcement"] is False
    assert group["behavior"]["command_echo_ms"] == 5000


def test_contextless_command_echo_only_consumes_matching_state() -> None:
    """A matching cloud echo is ignored, while an opposite physical edge survives."""
    from collections import defaultdict, deque
    from time import monotonic

    from custom_components.eshtaya_multiway.smart_group_manager import SmartGroupManager

    manager = SmartGroupManager.__new__(SmartGroupManager)
    manager._pending_expected = defaultdict(deque)  # noqa: SLF001
    key = ("group-1", "light.living")
    manager._pending_expected[key].append(  # noqa: SLF001
        ("tx-1", "on", monotonic() + 5)
    )

    assert manager._consume_expected_echo("group-1", "light.living", "off") is False  # noqa: SLF001
    assert len(manager._pending_expected[key]) == 1  # noqa: SLF001
    assert manager._consume_expected_echo("group-1", "light.living", "on") is True  # noqa: SLF001
    assert key not in manager._pending_expected  # noqa: SLF001


def test_global_echo_guard_prevents_cross_group_feedback() -> None:
    """A command from one Smart Group must not drive another group sharing the member."""
    from collections import defaultdict, deque
    from time import monotonic

    from custom_components.eshtaya_multiway.smart_group_manager import SmartGroupManager

    manager = SmartGroupManager.__new__(SmartGroupManager)
    manager._global_expected = defaultdict(deque)  # noqa: SLF001
    manager._global_expected["light.shared"].append(("on", monotonic() + 5))  # noqa: SLF001

    assert manager._is_global_command_echo("light.shared", "on") is True  # noqa: SLF001
    assert manager._is_global_command_echo("light.shared", "off") is False  # noqa: SLF001
    assert "light.shared" not in manager._global_expected  # noqa: SLF001


def test_smart_group_enabled_defaults_true() -> None:
    """Smart Groups are enabled unless explicitly disabled."""
    store = SmartGroupStore.__new__(SmartGroupStore)
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Living",
            "kind": SMART_KIND_VIRTUAL,
            "members": [{"entity_id": "light.living"}],
        },
        keep_id=False,
    )
    assert group["enabled"] is True


@pytest.mark.asyncio
async def test_operational_enable_toggle_bypasses_config_lock() -> None:
    """Enable/disable remains available as a runtime safety control."""
    import asyncio
    from unittest.mock import AsyncMock

    store = SmartGroupStore.__new__(SmartGroupStore)
    store._lock = asyncio.Lock()  # noqa: SLF001
    store._save = AsyncMock()  # noqa: SLF001
    store._data = {  # noqa: SLF001
        "settings": {"config_locked": True},
        "groups": [{"id": "g1", "name": "Living", "enabled": True, "locked": True}],
    }

    updated = await store.async_set_enabled("g1", False)
    assert updated["enabled"] is False
    assert store._data["groups"][0]["enabled"] is False  # noqa: SLF001
    store._save.assert_awaited_once()


def test_domain_native_group_types_match_home_assistant_group_menu() -> None:
    """Smart Groups expose every current Home Assistant Group domain."""
    from custom_components.eshtaya_multiway.const import SMART_NATIVE_GROUP_TYPES

    assert SMART_NATIVE_GROUP_TYPES == {
        "binary_sensor",
        "button",
        "cover",
        "event",
        "fan",
        "light",
        "lock",
        "media_player",
        "notify",
        "sensor",
        "switch",
        "valve",
    }


def test_smart_group_rejects_cross_domain_member() -> None:
    """A domain-native group cannot silently mix entity domains."""
    from types import SimpleNamespace

    store = SmartGroupStore.__new__(SmartGroupStore)
    store.hass = SimpleNamespace(states=SimpleNamespace(get=lambda _entity_id: None))
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Living Covers",
            "kind": SMART_KIND_VIRTUAL,
            "group_type": "cover",
            "members": [
                {"entity_id": "cover.living_left"},
                {"entity_id": "switch.living_right"},
            ],
        },
        keep_id=False,
    )
    with pytest.raises(ValueError, match="this is a cover group"):
        store._validate(group)  # noqa: SLF001


def test_strict_cover_group_rejects_different_device_classes() -> None:
    """Strict compatibility keeps cover sub-types together."""
    from types import SimpleNamespace

    states = {
        "cover.left": SimpleNamespace(attributes={"device_class": "shutter"}),
        "cover.right": SimpleNamespace(attributes={"device_class": "garage"}),
    }
    store = SmartGroupStore.__new__(SmartGroupStore)
    store.hass = SimpleNamespace(states=SimpleNamespace(get=states.get))
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Mixed Covers",
            "kind": SMART_KIND_VIRTUAL,
            "group_type": "cover",
            "members": [{"entity_id": "cover.left"}, {"entity_id": "cover.right"}],
            "behavior": {"compatibility_mode": "strict"},
        },
        keep_id=False,
    )
    with pytest.raises(ValueError, match="not the same"):
        store._validate(group)  # noqa: SLF001


def test_domain_only_mode_allows_same_domain_different_subtypes() -> None:
    """Advanced Domain-only mode relaxes subtype matching but never domain matching."""
    from types import SimpleNamespace

    states = {
        "cover.left": SimpleNamespace(attributes={"device_class": "shutter"}),
        "cover.right": SimpleNamespace(attributes={"device_class": "garage"}),
    }
    store = SmartGroupStore.__new__(SmartGroupStore)
    store.hass = SimpleNamespace(states=SimpleNamespace(get=states.get))
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Intentional Covers",
            "kind": SMART_KIND_VIRTUAL,
            "group_type": "cover",
            "members": [{"entity_id": "cover.left"}, {"entity_id": "cover.right"}],
            "behavior": {"compatibility_mode": "domain_only"},
        },
        keep_id=False,
    )
    store._validate(group)  # noqa: SLF001


def test_strict_sensor_group_requires_same_measurement_semantics() -> None:
    """Strict sensor groups cannot combine unrelated units or device classes."""
    from types import SimpleNamespace

    states = {
        "sensor.a": SimpleNamespace(
            attributes={
                "device_class": "temperature",
                "unit_of_measurement": "°C",
                "state_class": "measurement",
            }
        ),
        "sensor.b": SimpleNamespace(
            attributes={
                "device_class": "humidity",
                "unit_of_measurement": "%",
                "state_class": "measurement",
            }
        ),
    }
    store = SmartGroupStore.__new__(SmartGroupStore)
    store.hass = SimpleNamespace(states=SimpleNamespace(get=states.get))
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Invalid Statistics",
            "kind": SMART_KIND_VIRTUAL,
            "group_type": "sensor",
            "members": [{"entity_id": "sensor.a"}, {"entity_id": "sensor.b"}],
        },
        keep_id=False,
    )
    with pytest.raises(ValueError, match="not the same"):
        store._validate(group)  # noqa: SLF001


def test_strict_sensor_group_allows_same_device_class_different_native_units() -> None:
    """Temperature sensors in convertible units are still the same sensor type."""
    from types import SimpleNamespace

    states = {
        "sensor.c": SimpleNamespace(
            attributes={
                "device_class": "temperature",
                "unit_of_measurement": "°C",
                "state_class": "measurement",
            }
        ),
        "sensor.f": SimpleNamespace(
            attributes={
                "device_class": "temperature",
                "unit_of_measurement": "°F",
                "state_class": "measurement",
            }
        ),
    }
    store = SmartGroupStore.__new__(SmartGroupStore)
    store.hass = SimpleNamespace(states=SimpleNamespace(get=states.get))
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Temperature Average",
            "kind": SMART_KIND_VIRTUAL,
            "group_type": "sensor",
            "members": [{"entity_id": "sensor.c"}, {"entity_id": "sensor.f"}],
        },
        keep_id=False,
    )
    store._validate(group)  # noqa: SLF001


def test_action_group_domains_are_supported_extensions() -> None:
    """Scene, script, and automation groups are valid Eshtaya Action Groups."""
    from custom_components.eshtaya_multiway.const import SMART_ACTION_TYPES, SMART_GROUP_TYPES

    assert SMART_ACTION_TYPES == {"scene", "script", "automation"}
    assert SMART_ACTION_TYPES <= SMART_GROUP_TYPES


def test_action_group_rejects_cross_domain_members() -> None:
    """Action Groups remain domain-pure just like native Smart Groups."""
    store = SmartGroupStore.__new__(SmartGroupStore)
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Evening actions",
            "kind": SMART_KIND_VIRTUAL,
            "group_type": "scene",
            "members": [
                {"entity_id": "scene.evening"},
                {"entity_id": "script.good_night"},
            ],
        },
        keep_id=False,
    )
    with pytest.raises(ValueError, match="this is a scene group"):
        store._validate(group)  # noqa: SLF001


def test_action_group_defaults_are_safe() -> None:
    """Action Groups default to parallel execution and guarded physical triggering."""
    store = SmartGroupStore.__new__(SmartGroupStore)
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Evening scenes",
            "kind": SMART_KIND_VIRTUAL,
            "group_type": "scene",
            "members": [{"entity_id": "scene.evening"}],
        },
        keep_id=False,
    )
    store._validate(group)  # noqa: SLF001
    assert group["behavior"]["action_execution"] == "parallel"
    assert group["behavior"]["action_cooldown_ms"] == 250


@pytest.mark.asyncio
async def test_verification_waits_for_cloud_convergence_before_faulting() -> None:
    """A slow member can converge inside the timeout without a false Repair issue."""
    from custom_components.eshtaya_multiway.smart_group_manager import SmartGroupManager

    manager = SmartGroupManager.__new__(SmartGroupManager)
    manager._groups = {  # noqa: SLF001
        "group-1": {
            "id": "group-1",
            "name": "Cloud Lights",
            "behavior": {
                "command_timeout": 0.5,
                "auto_heal": False,
                "max_retries": 0,
                "notify_on_fault": False,
            },
        }
    }
    manager._runtime = {  # noqa: SLF001
        "group-1": {
            "last_transaction_id": "tx-1",
            "verification_active": True,
            "last_error": None,
        }
    }

    checks = 0

    def mismatches(_group, _expected):
        nonlocal checks
        checks += 1
        return ["light.slow_cloud_member"] if checks < 3 else []

    issues: list[str] = []
    manager._mismatches = mismatches  # type: ignore[method-assign]  # noqa: SLF001
    manager._create_issue = lambda _group, message: issues.append(message)  # type: ignore[method-assign]  # noqa: SLF001
    manager._delete_issue = lambda _issue_id: None  # type: ignore[method-assign]  # noqa: SLF001
    manager._refresh_runtime = lambda _group_id: None  # type: ignore[method-assign]  # noqa: SLF001
    manager._notify = lambda _group_id: None  # type: ignore[method-assign]  # noqa: SLF001

    await manager._async_verify("group-1", "on", "tx-1")  # noqa: SLF001

    assert checks >= 3
    assert issues == []
    assert manager._runtime["group-1"]["last_error"] is None  # noqa: SLF001
    assert manager._runtime["group-1"]["verification_active"] is False  # noqa: SLF001


def test_action_controller_edge_modes() -> None:
    """Action Groups only fire on the configured physical-controller edge."""
    from custom_components.eshtaya_multiway.smart_group_manager import SmartGroupManager

    manager = SmartGroupManager.__new__(SmartGroupManager)
    group = {"behavior": {"controller_mode": "momentary_on"}}
    assert manager._action_controller_fired(group, "off", "on") is True  # noqa: SLF001
    assert manager._action_controller_fired(group, "on", "off") is False  # noqa: SLF001


def test_smart_onoff_source_reads_real_final_member_state() -> None:
    """Final convergence reads the actual source instead of a stale desired state."""
    from types import SimpleNamespace

    from custom_components.eshtaya_multiway.smart_group_manager import SmartGroupManager

    manager = SmartGroupManager.__new__(SmartGroupManager)
    manager.hass = SimpleNamespace(
        states=SimpleNamespace(get=lambda _entity_id: SimpleNamespace(state="off"))
    )
    group = {"behavior": {"controller_mode": "mirror", "invert_controller": False}}
    assert (
        manager._onoff_source_state(  # noqa: SLF001
            group, "switch.member", is_controller=False
        )
        == "off"
    )


@pytest.mark.asyncio
async def test_scene_action_group_dispatches_every_member() -> None:
    """A Scene Action Group runs all enabled scene members."""
    from types import SimpleNamespace
    from custom_components.eshtaya_multiway.smart_group_manager import SmartGroupManager

    calls: list[tuple[str, str, dict]] = []

    async def async_call(domain, service, data, **_kwargs):
        calls.append((domain, service, data))

    manager = SmartGroupManager.__new__(SmartGroupManager)
    manager.hass = SimpleNamespace(
        states=SimpleNamespace(get=lambda _entity_id: SimpleNamespace(state="scening")),
        services=SimpleNamespace(async_call=async_call),
    )
    manager._groups = {  # noqa: SLF001
        "g1": {
            "id": "g1",
            "name": "Evening",
            "kind": "virtual",
            "group_type": "scene",
            "enabled": True,
            "maintenance": False,
            "members": [
                {"entity_id": "scene.one", "enabled": True},
                {"entity_id": "scene.two", "enabled": True},
            ],
            "behavior": {
                "action_execution": "parallel",
                "action_cooldown_ms": 250,
                "scene_transition": 1.5,
                "action_data": {},
                "performance_mode": "instant",
                "failure_policy": "continue",
                "member_delay_ms": 0,
            },
        }
    }
    manager._runtime = {"g1": SmartGroupManager._new_runtime()}  # noqa: SLF001
    manager._action_last_run = {}  # noqa: SLF001
    manager._is_quarantined = lambda _gid, _entity: False  # type: ignore[method-assign]  # noqa: SLF001
    manager._metric = lambda *_args, **_kwargs: None  # type: ignore[method-assign]  # noqa: SLF001
    manager._add_activity = lambda *_args, **_kwargs: None  # type: ignore[method-assign]  # noqa: SLF001
    manager._refresh_runtime = lambda _gid: None  # type: ignore[method-assign]  # noqa: SLF001
    manager._notify = lambda _gid: None  # type: ignore[method-assign]  # noqa: SLF001

    assert await manager.async_run_action_group("g1") is True
    assert len(calls) == 2
    assert all(domain == "scene" and service == "turn_on" for domain, service, _ in calls)
    assert all(data["transition"] == 1.5 for _domain, _service, data in calls)


@pytest.mark.asyncio
async def test_automation_action_group_uses_trigger_not_turn_on() -> None:
    """Automation Action Groups execute actions via automation.trigger."""
    from types import SimpleNamespace

    from custom_components.eshtaya_multiway.smart_group_manager import SmartGroupManager

    calls: list[tuple[str, str, dict]] = []

    async def async_call(domain, service, data, **_kwargs):
        calls.append((domain, service, data))

    manager = SmartGroupManager.__new__(SmartGroupManager)
    manager.hass = SimpleNamespace(
        states=SimpleNamespace(get=lambda _entity_id: SimpleNamespace(state="on")),
        services=SimpleNamespace(async_call=async_call),
    )
    manager._groups = {  # noqa: SLF001
        "g1": {
            "id": "g1",
            "name": "Run automations",
            "kind": "virtual",
            "group_type": "automation",
            "enabled": True,
            "maintenance": False,
            "members": [{"entity_id": "automation.one", "enabled": True}],
            "behavior": {
                "action_execution": "parallel",
                "action_cooldown_ms": 250,
                "automation_skip_condition": False,
                "action_data": {},
                "performance_mode": "instant",
                "failure_policy": "continue",
                "member_delay_ms": 0,
            },
        }
    }
    manager._runtime = {"g1": SmartGroupManager._new_runtime()}  # noqa: SLF001
    manager._action_last_run = {}  # noqa: SLF001
    manager._is_quarantined = lambda _gid, _entity: False  # type: ignore[method-assign]  # noqa: SLF001
    manager._metric = lambda *_args, **_kwargs: None  # type: ignore[method-assign]  # noqa: SLF001
    manager._add_activity = lambda *_args, **_kwargs: None  # type: ignore[method-assign]  # noqa: SLF001
    manager._refresh_runtime = lambda _gid: None  # type: ignore[method-assign]  # noqa: SLF001
    manager._notify = lambda _gid: None  # type: ignore[method-assign]  # noqa: SLF001

    assert await manager.async_run_action_group("g1") is True
    assert calls == [
        ("automation", "trigger", {"entity_id": "automation.one", "skip_condition": False})
    ]
