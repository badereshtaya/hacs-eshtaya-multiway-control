"""Switch platform for Eshtaya Multi-Way Control."""
from __future__ import annotations

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import (
    DATA_RUNTIME,
    DOMAIN,
    SIGNAL_GROUPS_UPDATED,
    SIGNAL_SMART_GROUPS_UPDATED,
    SMART_KIND_VIRTUAL,
    VIRTUAL_SWITCH,
)
from .entity import MultiWayEntity
from .smart_entity import SmartGroupEntity


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback) -> None:
    known_control: set[str] = set()
    known_enabled: set[str] = set()
    known_smart_control: set[str] = set()
    known_smart_enabled: set[str] = set()

    @callback
    def add_multi() -> None:
        store = hass.data[DOMAIN][DATA_RUNTIME]["store"]
        entities = []
        for group in store.groups():
            gid = group["id"]
            if gid not in known_enabled:
                known_enabled.add(gid); entities.append(MultiWayEnabledSwitch(hass, gid))
            if group["virtual_type"] == VIRTUAL_SWITCH and gid not in known_control:
                known_control.add(gid); entities.append(MultiWayVirtualSwitch(hass, gid))
        if entities: async_add_entities(entities)

    @callback
    def add_smart() -> None:
        store = hass.data[DOMAIN][DATA_RUNTIME]["smart_store"]
        entities = []
        for group in store.groups():
            gid = group["id"]
            if gid not in known_smart_enabled:
                known_smart_enabled.add(gid); entities.append(SmartGroupEnabledSwitch(hass, gid))
            if group["kind"] == SMART_KIND_VIRTUAL and group["virtual_type"] == VIRTUAL_SWITCH and gid not in known_smart_control:
                known_smart_control.add(gid); entities.append(SmartGroupVirtualSwitch(hass, gid))
        if entities: async_add_entities(entities)

    add_multi(); add_smart()
    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_GROUPS_UPDATED, add_multi))
    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_SMART_GROUPS_UPDATED, add_smart))


class MultiWayVirtualSwitch(MultiWayEntity, SwitchEntity):
    _attr_translation_key = "group_control"
    def __init__(self, hass: HomeAssistant, group_id: str) -> None: super().__init__(hass, group_id, "control_switch")
    def _still_expected(self, group) -> bool: return group is not None and group["virtual_type"] == VIRTUAL_SWITCH
    @property
    def is_on(self) -> bool | None:
        state = self.manager.status(self.group_id).get("desired_state")
        return True if state == "on" else False if state == "off" else None
    async def async_turn_on(self, **kwargs) -> None: await self.manager.async_request_state(self.group_id, "on", source=self.entity_id or "virtual_switch", origin="virtual_entity")
    async def async_turn_off(self, **kwargs) -> None: await self.manager.async_request_state(self.group_id, "off", source=self.entity_id or "virtual_switch", origin="virtual_entity")


class MultiWayEnabledSwitch(MultiWayEntity, SwitchEntity):
    _attr_translation_key = "group_enabled"
    _attr_entity_category = EntityCategory.CONFIG
    def __init__(self, hass: HomeAssistant, group_id: str) -> None: super().__init__(hass, group_id, "enabled")
    @property
    def is_on(self) -> bool:
        group = self.group; return bool(group and group.get("enabled", True))
    async def async_turn_on(self, **kwargs) -> None: await self.manager.async_set_enabled(self.group_id, True)
    async def async_turn_off(self, **kwargs) -> None: await self.manager.async_set_enabled(self.group_id, False)


class SmartGroupVirtualSwitch(SmartGroupEntity, SwitchEntity):
    _attr_translation_key = "smart_group_control"
    def __init__(self, hass: HomeAssistant, group_id: str) -> None: super().__init__(hass, group_id, "control_switch")
    def _still_expected(self, group) -> bool: return bool(group and group["kind"] == SMART_KIND_VIRTUAL and group["virtual_type"] == VIRTUAL_SWITCH)
    @property
    def is_on(self) -> bool | None:
        status = self.manager.status(self.group_id); state = status.get("desired_state") or status.get("state")
        return True if state == "on" else False if state == "off" else None
    async def async_turn_on(self, **kwargs) -> None: await self.manager.async_set_state(self.group_id, "on", source=self.entity_id or "smart_group", origin="virtual")
    async def async_turn_off(self, **kwargs) -> None: await self.manager.async_set_state(self.group_id, "off", source=self.entity_id or "smart_group", origin="virtual")


class SmartGroupEnabledSwitch(SmartGroupEntity, SwitchEntity):
    _attr_translation_key = "smart_group_enabled"
    _attr_entity_category = EntityCategory.CONFIG
    def __init__(self, hass: HomeAssistant, group_id: str) -> None: super().__init__(hass, group_id, "enabled")
    @property
    def is_on(self) -> bool:
        group = self.group; return bool(group and group.get("enabled", True))
    async def async_turn_on(self, **kwargs) -> None:
        await self.store.async_update(self.group_id, {"enabled": True}); await self.manager.async_reload()
    async def async_turn_off(self, **kwargs) -> None:
        await self.store.async_update(self.group_id, {"enabled": False}); await self.manager.async_reload()
