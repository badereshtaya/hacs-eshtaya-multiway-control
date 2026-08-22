"""Virtual light platform for Eshtaya Multi-Way Control."""
from __future__ import annotations

from homeassistant.components.light import LightEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import DATA_RUNTIME, DOMAIN, SIGNAL_GROUPS_UPDATED, VIRTUAL_LIGHT
from .entity import MultiWayEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up virtual light entities and dynamically add new groups."""
    known: set[str] = set()

    @callback
    def add_missing() -> None:
        store = hass.data[DOMAIN][DATA_RUNTIME]["store"]
        entities = []
        for group in store.groups():
            if group["virtual_type"] != VIRTUAL_LIGHT or group["id"] in known:
                continue
            known.add(group["id"])
            entities.append(MultiWayVirtualLight(hass, group["id"]))
        if entities:
            async_add_entities(entities)

    add_missing()
    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_GROUPS_UPDATED, add_missing))


class MultiWayVirtualLight(MultiWayEntity, LightEntity):
    """Represent a complete multi-way group as one Home Assistant light."""

    _attr_translation_key = "group_control"

    def __init__(self, hass: HomeAssistant, group_id: str) -> None:
        super().__init__(hass, group_id, "control_light")

    def _still_expected(self, group) -> bool:
        return group is not None and group["virtual_type"] == VIRTUAL_LIGHT

    @property
    def is_on(self) -> bool | None:
        state = self.manager.status(self.group_id).get("desired_state")
        if state == "on":
            return True
        if state == "off":
            return False
        return None

    async def async_turn_on(self, **kwargs) -> None:
        await self.manager.async_request_state(
            self.group_id, "on", source=self.entity_id or "virtual_light", origin="virtual_entity"
        )

    async def async_turn_off(self, **kwargs) -> None:
        await self.manager.async_request_state(
            self.group_id, "off", source=self.entity_id or "virtual_light", origin="virtual_entity"
        )
