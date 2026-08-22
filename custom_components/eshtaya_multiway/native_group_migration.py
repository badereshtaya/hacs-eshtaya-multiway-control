"""Safe takeover of Home Assistant Group helpers by Eshtaya Smart Groups."""
from __future__ import annotations

import asyncio
from copy import deepcopy
from typing import Any
from uuid import uuid4

from homeassistant.const import CONF_ENTITIES
from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar, entity_registry as er

from .const import (
    DOMAIN,
    SMART_DIRECTION_CONTROLLER,
    SMART_KIND_VIRTUAL,
    SMART_MEMBER_DOMAINS,
    SMART_STATE_ALL,
    SMART_STATE_ANY,
    VIRTUAL_LIGHT,
    VIRTUAL_SWITCH,
)

GROUP_DOMAIN = "group"
SUPPORTED_TAKEOVER_DOMAINS = {VIRTUAL_LIGHT, VIRTUAL_SWITCH}
CONF_HIDE_MEMBERS = "hide_members"
CONF_ALL = "all"
CONF_GROUP_TYPE = "group_type"


def _resolve_members(hass: HomeAssistant, values: list[str]) -> list[str]:
    registry = er.async_get(hass)
    result: list[str] = []
    seen: set[str] = set()
    for value in values:
        entity_id = er.async_resolve_entity_id(registry, value) or value
        if entity_id in seen:
            continue
        seen.add(entity_id)
        result.append(entity_id)
    return result


def native_group_entries(hass: HomeAssistant) -> list[dict[str, Any]]:
    """Return Home Assistant group helpers plus read-only legacy/runtime groups."""
    registry = er.async_get(hass)
    area_registry = ar.async_get(hass)
    rows: list[dict[str, Any]] = []
    seen: set[str] = set()

    # Config-entry Group helpers: these can be safely taken over transactionally.
    for config_entry in hass.config_entries.async_entries(GROUP_DOMAIN):
        options = dict(config_entry.options)
        group_type = str(options.get(CONF_GROUP_TYPE) or "")
        entries = er.async_entries_for_config_entry(registry, config_entry.entry_id)
        for entity_entry in entries:
            entity_id = entity_entry.entity_id
            domain = entity_id.split(".", 1)[0]
            state = hass.states.get(entity_id)
            raw_members = list(options.get(CONF_ENTITIES) or [])
            if not raw_members and state is not None:
                attrs_members = state.attributes.get("entity_id")
                if isinstance(attrs_members, (list, tuple)):
                    raw_members = list(attrs_members)
            members = _resolve_members(hass, raw_members)
            area_id = entity_entry.area_id
            area = area_registry.async_get_area(area_id) if area_id else None
            takeover_supported = (
                domain in SUPPORTED_TAKEOVER_DOMAINS
                and group_type in SUPPORTED_TAKEOVER_DOMAINS
                and bool(members)
            )
            reason = None
            if not takeover_supported:
                if domain not in SUPPORTED_TAKEOVER_DOMAINS:
                    reason = f"Exact entity-id takeover is not supported for the {domain} domain yet"
                elif group_type not in SUPPORTED_TAKEOVER_DOMAINS:
                    reason = f"Group type {group_type or 'unknown'} is not supported for takeover yet"
                elif not members:
                    reason = "The group has no members"
            rows.append(
                {
                    "entity_id": entity_id,
                    "name": options.get("name")
                    or (state.attributes.get("friendly_name") if state else None)
                    or entity_entry.name
                    or entity_entry.original_name
                    or entity_id,
                    "state": state.state if state else "unavailable",
                    "members": members,
                    "area_id": area_id,
                    "area_name": area.name if area else None,
                    "platform": entity_entry.platform,
                    "managed_helper": True,
                    "config_entry_id": config_entry.entry_id,
                    "group_type": group_type or domain,
                    "all": bool(options.get(CONF_ALL, False)),
                    "hide_members": bool(options.get(CONF_HIDE_MEMBERS, False)),
                    "takeover_supported": takeover_supported,
                    "takeover_reason": reason,
                }
            )
            seen.add(entity_id)

    # Legacy YAML/runtime groups remain visible, but cannot be deleted safely here.
    for state in hass.states.async_all():
        entity_id = state.entity_id
        if entity_id in seen:
            continue
        entity_entry = registry.async_get(entity_id)
        platform = getattr(entity_entry, "platform", None) if entity_entry else None
        members = state.attributes.get("entity_id")
        if not isinstance(members, (list, tuple)) or not members:
            continue
        if entity_id.split(".", 1)[0] != GROUP_DOMAIN and platform != GROUP_DOMAIN:
            continue
        area_id = getattr(entity_entry, "area_id", None) if entity_entry else None
        area = area_registry.async_get_area(area_id) if area_id else None
        rows.append(
            {
                "entity_id": entity_id,
                "name": state.attributes.get("friendly_name") or entity_id,
                "state": state.state,
                "members": list(members),
                "area_id": area_id,
                "area_name": area.name if area else None,
                "platform": platform,
                "managed_helper": False,
                "config_entry_id": None,
                "group_type": entity_id.split(".", 1)[0],
                "all": False,
                "hide_members": False,
                "takeover_supported": False,
                "takeover_reason": "Legacy/YAML/runtime groups cannot be safely deleted by a custom integration",
            }
        )
    return sorted(rows, key=lambda item: (str(item["name"]).casefold(), item["entity_id"]))


def _source_metadata(hass: HomeAssistant, source_entity_id: str) -> dict[str, Any]:
    registry = er.async_get(hass)
    source = registry.async_get(source_entity_id)
    if source is None:
        raise ValueError("Home Assistant group entity is not registered")
    config_entry_id = source.config_entry_id
    if not config_entry_id:
        raise ValueError("This group is not a UI-created Home Assistant Group helper")
    config_entry = hass.config_entries.async_get_entry(config_entry_id)
    if config_entry is None or config_entry.domain != GROUP_DOMAIN:
        raise ValueError("The source entity is not owned by the Home Assistant Group helper")

    options = dict(config_entry.options)
    group_type = str(options.get(CONF_GROUP_TYPE) or source_entity_id.split(".", 1)[0])
    source_domain = source_entity_id.split(".", 1)[0]
    if source_domain not in SUPPORTED_TAKEOVER_DOMAINS or group_type not in SUPPORTED_TAKEOVER_DOMAINS:
        raise ValueError(
            "Exact takeover currently supports Home Assistant Light Groups and Switch Groups only"
        )
    members = _resolve_members(hass, list(options.get(CONF_ENTITIES) or []))
    if not members:
        state = hass.states.get(source_entity_id)
        attrs_members = state.attributes.get("entity_id") if state else None
        if isinstance(attrs_members, (list, tuple)):
            members = _resolve_members(hass, list(attrs_members))
    members = [m for m in members if m.split(".", 1)[0] in SMART_MEMBER_DOMAINS]
    if not members:
        raise ValueError("The Home Assistant group has no compatible commandable members")

    return {
        "entity_id": source_entity_id,
        "config_entry_id": config_entry_id,
        "config_entry_title": config_entry.title,
        "options": options,
        "group_type": group_type,
        "members": members,
        "name": str(options.get("name") or config_entry.title or source_entity_id),
        "area_id": source.area_id,
        "aliases": list(source.aliases),
        "categories": dict(source.categories),
        "hidden_by": source.hidden_by,
        "disabled_by": source.disabled_by,
        "icon": source.icon,
        "labels": set(source.labels),
        "name_override": source.name,
        "hide_members": bool(options.get(CONF_HIDE_MEMBERS, False)),
        "all": bool(options.get(CONF_ALL, False)),
    }


async def _wait_until(predicate, timeout: float = 5.0) -> Any:
    end = asyncio.get_running_loop().time() + timeout
    while asyncio.get_running_loop().time() < end:
        value = predicate()
        if value:
            return value
        await asyncio.sleep(0.05)
    return None


def _control_unique_id(group_id: str, virtual_type: str) -> str:
    suffix = "control_light" if virtual_type == VIRTUAL_LIGHT else "control_switch"
    return f"smart_{group_id}_{suffix}"


def _find_control_registry_entry(
    hass: HomeAssistant, group_id: str, virtual_type: str
) -> er.RegistryEntry | None:
    registry = er.async_get(hass)
    unique_id = _control_unique_id(group_id, virtual_type)
    for entry in registry.entities.values():
        if entry.platform == DOMAIN and entry.unique_id == unique_id:
            return entry
    return None


async def async_take_over_group(
    hass: HomeAssistant,
    smart_store,
    smart_manager,
    source_entity_id: str,
) -> dict[str, Any]:
    """Replace a UI Group helper with a managed Smart Group using the exact entity_id."""
    meta = _source_metadata(hass, source_entity_id)
    registry = er.async_get(hass)
    source_entry = registry.async_get(source_entity_id)
    if source_entry is None:
        raise ValueError("Source entity disappeared before takeover")

    # Existing V3.0.1 copy imports must not collide with a real takeover.
    for group in smart_store.groups():
        if group.get("preferred_entity_id") == source_entity_id:
            raise ValueError("This entity ID is already owned by an Eshtaya Smart Group")
        if group.get("source_group_entity") == source_entity_id:
            raise ValueError(
                "This group was previously imported as a copy. Delete that Smart Group first, then run Take Over."
            )

    source_domain = source_entity_id.split(".", 1)[0]
    virtual_type = VIRTUAL_LIGHT if source_domain == VIRTUAL_LIGHT else VIRTUAL_SWITCH
    temp_source_id = f"{source_domain}.eshtaya_takeover_source_{uuid4().hex[:10]}"
    created_group: dict[str, Any] | None = None
    source_moved = False

    try:
        # Step 1: move the old helper out of the way, keeping it alive for rollback.
        registry.async_update_entity(source_entity_id, new_entity_id=temp_source_id)
        source_moved = True
        freed = await _wait_until(lambda: registry.async_get(source_entity_id) is None, 3.0)
        if not freed:
            raise RuntimeError("Could not reserve the original entity ID for takeover")
        state_moved = await _wait_until(
            lambda: hass.states.get(source_entity_id) is None
            or hass.states.get(temp_source_id) is not None,
            3.0,
        )
        if not state_moved:
            raise RuntimeError(
                "The original group state did not release its entity ID in time"
            )

        # Step 2: create our Smart Group with the exact preferred entity ID.
        created_group = await smart_store.async_create(
            {
                "name": meta["name"],
                "kind": SMART_KIND_VIRTUAL,
                "controller_entity": None,
                "members": [
                    {"entity_id": entity_id, "enabled": True}
                    for entity_id in meta["members"]
                ],
                "virtual_type": virtual_type,
                "area_id": meta["area_id"],
                "hide_members": meta["hide_members"],
                "preferred_entity_id": source_entity_id,
                "migration": {
                    "takeover": True,
                    "source_entity_id": source_entity_id,
                    "source_config_entry_id": meta["config_entry_id"],
                    "source_group_type": meta["group_type"],
                    "source_options": deepcopy(meta["options"]),
                },
                "behavior": {
                    "state_policy": SMART_STATE_ALL if meta["all"] else SMART_STATE_ANY,
                    "direction": SMART_DIRECTION_CONTROLLER,
                },
            }
        )
        await smart_manager.async_reload()

        control = await _wait_until(
            lambda: _find_control_registry_entry(hass, created_group["id"], virtual_type),
            5.0,
        )
        if control is None:
            raise RuntimeError("The Eshtaya replacement entity was not created")
        if control.entity_id != source_entity_id:
            if registry.async_get(source_entity_id) is not None:
                raise RuntimeError("The original entity ID is no longer available")
            control = registry.async_update_entity(
                control.entity_id, new_entity_id=source_entity_id
            )

        # Preserve user-facing registry metadata from the original helper.
        registry.async_update_entity(
            source_entity_id,
            aliases=meta["aliases"],
            area_id=meta["area_id"],
            categories=meta["categories"],
            hidden_by=meta["hidden_by"],
            disabled_by=meta["disabled_by"],
            icon=meta["icon"],
            labels=meta["labels"],
            name=meta["name_override"],
        )
        replacement = registry.async_get(source_entity_id)
        if replacement is None or replacement.platform != DOMAIN:
            raise RuntimeError("Replacement entity did not claim the original entity ID")

        # Step 3: only after the replacement exists, delete the old HA Group helper.
        await hass.config_entries.async_remove(meta["config_entry_id"])
        if hass.config_entries.async_get_entry(meta["config_entry_id"]) is not None:
            raise RuntimeError("Home Assistant did not remove the original Group helper")
        stale_source = registry.async_get(temp_source_id)
        if stale_source and stale_source.config_entry_id == meta["config_entry_id"]:
            registry.async_remove(temp_source_id)

        # The group helper unhides members during removal; our manager re-applies
        # hide_members ownership if it was part of the original configuration.
        await smart_manager.async_reload()
        return {
            "group": smart_store.get(created_group["id"]),
            "old_entity_id": source_entity_id,
            "new_entity_id": source_entity_id,
            "removed_config_entry_id": meta["config_entry_id"],
            "members": meta["members"],
            "preserved": {
                "name": meta["name"],
                "entity_id": source_entity_id,
                "group_type": meta["group_type"],
                "all": meta["all"],
                "hide_members": meta["hide_members"],
                "area_id": meta["area_id"],
                "icon": meta["icon"],
                "labels": sorted(meta["labels"]),
            },
        }
    except Exception as err:
        source_config_still_exists = (
            hass.config_entries.async_get_entry(meta["config_entry_id"]) is not None
        )
        # If HA already removed the original helper, never destroy the verified
        # replacement just because late cleanup raised an exception.
        if not source_config_still_exists and created_group is not None:
            stale_source = registry.async_get(temp_source_id)
            if stale_source and stale_source.config_entry_id == meta["config_entry_id"]:
                registry.async_remove(temp_source_id)
            await smart_manager.async_reload()
            return {
                "group": smart_store.get(created_group["id"]),
                "old_entity_id": source_entity_id,
                "new_entity_id": source_entity_id,
                "removed_config_entry_id": meta["config_entry_id"],
                "members": meta["members"],
                "warning": str(err),
                "cleanup_warning": True,
            }

        # Best-effort rollback while the source helper still exists.
        if created_group is not None:
            try:
                current = smart_store.get(created_group["id"])
                if current:
                    await smart_store.async_delete(created_group["id"])
                    await smart_manager.async_reload()
                    await _wait_until(lambda: registry.async_get(source_entity_id) is None, 3.0)
            except Exception:  # noqa: BLE001
                pass
        if source_moved and source_config_still_exists:
            try:
                current_source = registry.async_get(temp_source_id)
                if current_source and registry.async_get(source_entity_id) is None:
                    registry.async_update_entity(
                        temp_source_id, new_entity_id=source_entity_id
                    )
                if meta["hide_members"]:
                    for member_entity_id in meta["members"]:
                        member_entry = registry.async_get(member_entity_id)
                        if member_entry and member_entry.hidden_by is None:
                            registry.async_update_entity(
                                member_entity_id,
                                hidden_by=er.RegistryEntryHider.INTEGRATION,
                            )
            except Exception:  # noqa: BLE001
                pass
        raise
