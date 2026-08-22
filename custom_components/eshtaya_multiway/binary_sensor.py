"""Binary sensors for Eshtaya Multi-Way Control."""
from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import DATA_RUNTIME, DOMAIN, HEALTH_HEALTHY, SIGNAL_GROUPS_UPDATED
from .entity import MultiWayEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up in-sync sensors dynamically."""
    known: set[str] = set()

    @callback
    def add_missing() -> None:
        store = hass.data[DOMAIN][DATA_RUNTIME]["store"]
        entities = []
        for group in store.groups():
            if group["id"] not in known:
                known.add(group["id"])
                entities.append(MultiWayInSyncSensor(hass, group["id"]))
        if entities:
            async_add_entities(entities)

    add_missing()
    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_GROUPS_UPDATED, add_missing))


class MultiWayInSyncSensor(MultiWayEntity, BinarySensorEntity):
    """True when the group is fully healthy and synchronized."""

    _attr_translation_key = "in_sync"
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, hass: HomeAssistant, group_id: str) -> None:
        super().__init__(hass, group_id, "in_sync")

    @property
    def is_on(self) -> bool:
        return self.manager.status(self.group_id).get("health") == HEALTH_HEALTHY
