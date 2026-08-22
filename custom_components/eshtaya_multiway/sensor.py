"""Diagnostic sensors for Eshtaya Multi-Way Control."""
from __future__ import annotations

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory, UnitOfTime
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import DATA_RUNTIME, DOMAIN, SIGNAL_GROUPS_UPDATED
from .entity import MultiWayEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up diagnostic sensors dynamically."""
    known: set[str] = set()

    @callback
    def add_missing() -> None:
        store = hass.data[DOMAIN][DATA_RUNTIME]["store"]
        entities = []
        for group in store.groups():
            if group["id"] in known:
                continue
            known.add(group["id"])
            entities.extend(
                [
                    MultiWayHealthSensor(hass, group["id"]),
                    MultiWayLastSourceSensor(hass, group["id"]),
                    MultiWayLatencySensor(hass, group["id"]),
                ]
            )
        if entities:
            async_add_entities(entities)

    add_missing()
    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_GROUPS_UPDATED, add_missing))


class _DiagnosticSensor(MultiWayEntity, SensorEntity):
    _attr_entity_category = EntityCategory.DIAGNOSTIC


class MultiWayHealthSensor(_DiagnosticSensor):
    _attr_translation_key = "health"

    def __init__(self, hass: HomeAssistant, group_id: str) -> None:
        super().__init__(hass, group_id, "health")

    @property
    def native_value(self):
        return self.manager.status(self.group_id).get("health")


class MultiWayLastSourceSensor(_DiagnosticSensor):
    _attr_translation_key = "last_source"
    _attr_entity_registry_enabled_default = False

    def __init__(self, hass: HomeAssistant, group_id: str) -> None:
        super().__init__(hass, group_id, "last_source")

    @property
    def native_value(self):
        return self.manager.status(self.group_id).get("last_source") or "none"


class MultiWayLatencySensor(_DiagnosticSensor):
    _attr_translation_key = "last_latency"
    _attr_native_unit_of_measurement = UnitOfTime.MILLISECONDS
    _attr_entity_registry_enabled_default = False

    def __init__(self, hass: HomeAssistant, group_id: str) -> None:
        super().__init__(hass, group_id, "last_latency")

    @property
    def native_value(self):
        return self.manager.status(self.group_id).get("last_latency_ms")
