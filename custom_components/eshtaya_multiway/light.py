"""Light platform for Eshtaya Multi-Way Control."""
from __future__ import annotations

from homeassistant.components.light import LightEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import (
    DATA_RUNTIME,
    DOMAIN,
    SIGNAL_GROUPS_UPDATED,
    SIGNAL_SMART_GROUPS_UPDATED,
    SMART_KIND_VIRTUAL,
    VIRTUAL_LIGHT,
)
from .entity import MultiWayEntity
from .smart_entity import SmartGroupEntity


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback) -> None:
    """Set up virtual light entities dynamically."""
    known_multi: set[str] = set()
    known_smart: set[str] = set()

    @callback
    def add_multi() -> None:
        store = hass.data[DOMAIN][DATA_RUNTIME]["store"]
        entities = []
        for group in store.groups():
            if group["virtual_type"] == VIRTUAL_LIGHT and group["id"] not in known_multi:
                known_multi.add(group["id"])
                entities.append(MultiWayVirtualLight(hass, group["id"]))
        if entities:
            async_add_entities(entities)

    @callback
    def add_smart() -> None:
        store = hass.data[DOMAIN][DATA_RUNTIME]["smart_store"]
        entities = []
        for group in store.groups():
            if (
                group["kind"] == SMART_KIND_VIRTUAL
                and group["virtual_type"] == VIRTUAL_LIGHT
                and group["id"] not in known_smart
            ):
                known_smart.add(group["id"])
                entities.append(SmartGroupVirtualLight(hass, group["id"]))
        if entities:
            async_add_entities(entities)

    add_multi()
    add_smart()
    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_GROUPS_UPDATED, add_multi))
    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_SMART_GROUPS_UPDATED, add_smart))


class MultiWayVirtualLight(MultiWayEntity, LightEntity):
    _attr_translation_key = "group_control"

    def __init__(self, hass: HomeAssistant, group_id: str) -> None:
        super().__init__(hass, group_id, "control_light")

    def _still_expected(self, group) -> bool:
        return group is not None and group["virtual_type"] == VIRTUAL_LIGHT

    @property
    def is_on(self) -> bool | None:
        state = self.manager.status(self.group_id).get("desired_state")
        return True if state == "on" else False if state == "off" else None

    async def async_turn_on(self, **kwargs) -> None:
        await self.manager.async_request_state(self.group_id, "on", source=self.entity_id or "virtual_light", origin="virtual_entity")

    async def async_turn_off(self, **kwargs) -> None:
        await self.manager.async_request_state(self.group_id, "off", source=self.entity_id or "virtual_light", origin="virtual_entity")


class SmartGroupVirtualLight(SmartGroupEntity, LightEntity):
    """Represent a virtual Smart Group as a native Home Assistant light."""

    _attr_translation_key = "smart_group_control"

    def __init__(self, hass: HomeAssistant, group_id: str) -> None:
        super().__init__(hass, group_id, "control_light")

    def _still_expected(self, group) -> bool:
        return bool(group and group["kind"] == SMART_KIND_VIRTUAL and group["virtual_type"] == VIRTUAL_LIGHT)

    @property
    def is_on(self) -> bool | None:
        status = self.manager.status(self.group_id)
        state = status.get("desired_state") or status.get("state")
        return True if state == "on" else False if state == "off" else None

    async def async_turn_on(self, **kwargs) -> None:
        await self.manager.async_set_state(self.group_id, "on", source=self.entity_id or "smart_group", origin="virtual")

    async def async_turn_off(self, **kwargs) -> None:
        await self.manager.async_set_state(self.group_id, "off", source=self.entity_id or "smart_group", origin="virtual")
