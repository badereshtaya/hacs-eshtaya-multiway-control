"""Diagnostic sensors for Eshtaya Multi-Way Control."""
from __future__ import annotations

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory, UnitOfTime
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import DATA_RUNTIME, DOMAIN, SIGNAL_GROUPS_UPDATED, SIGNAL_SMART_GROUPS_UPDATED
from .entity import MultiWayEntity
from .smart_entity import SmartGroupEntity


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback) -> None:
    known_multi: set[str] = set(); known_smart: set[str] = set()

    @callback
    def add_multi() -> None:
        store = hass.data[DOMAIN][DATA_RUNTIME]["store"]; entities=[]
        for group in store.groups():
            gid=group["id"]
            if gid in known_multi: continue
            known_multi.add(gid)
            entities += [MultiWayHealthSensor(hass,gid), MultiWayLastSourceSensor(hass,gid), MultiWayLatencySensor(hass,gid)]
        if entities: async_add_entities(entities)

    @callback
    def add_smart() -> None:
        store = hass.data[DOMAIN][DATA_RUNTIME]["smart_store"]; entities=[]
        for group in store.groups():
            gid=group["id"]
            if gid in known_smart: continue
            known_smart.add(gid)
            entities += [SmartGroupHealthSensor(hass,gid), SmartGroupQualitySensor(hass,gid), SmartGroupLastSourceSensor(hass,gid), SmartGroupLatencySensor(hass,gid)]
        if entities: async_add_entities(entities)

    add_multi(); add_smart()
    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_GROUPS_UPDATED, add_multi))
    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_SMART_GROUPS_UPDATED, add_smart))


class _DiagnosticSensor(MultiWayEntity, SensorEntity): _attr_entity_category = EntityCategory.DIAGNOSTIC
class MultiWayHealthSensor(_DiagnosticSensor):
    _attr_translation_key="health"
    def __init__(self,hass,group_id): super().__init__(hass,group_id,"health")
    @property
    def native_value(self): return self.manager.status(self.group_id).get("health")
class MultiWayLastSourceSensor(_DiagnosticSensor):
    _attr_translation_key="last_source"; _attr_entity_registry_enabled_default=False
    def __init__(self,hass,group_id): super().__init__(hass,group_id,"last_source")
    @property
    def native_value(self): return self.manager.status(self.group_id).get("last_source") or "none"
class MultiWayLatencySensor(_DiagnosticSensor):
    _attr_translation_key="last_latency"; _attr_native_unit_of_measurement=UnitOfTime.MILLISECONDS; _attr_entity_registry_enabled_default=False
    def __init__(self,hass,group_id): super().__init__(hass,group_id,"last_latency")
    @property
    def native_value(self): return self.manager.status(self.group_id).get("last_latency_ms")


class _SmartDiagnosticSensor(SmartGroupEntity, SensorEntity): _attr_entity_category=EntityCategory.DIAGNOSTIC
class SmartGroupHealthSensor(_SmartDiagnosticSensor):
    _attr_translation_key="smart_group_health"
    def __init__(self,hass,group_id): super().__init__(hass,group_id,"health")
    @property
    def native_value(self): return self.manager.status(self.group_id).get("health")
class SmartGroupQualitySensor(_SmartDiagnosticSensor):
    _attr_translation_key="smart_group_quality"
    def __init__(self,hass,group_id): super().__init__(hass,group_id,"quality")
    @property
    def native_value(self): return self.manager.status(self.group_id).get("quality_score")
    @property
    def extra_state_attributes(self):
        base=super().extra_state_attributes; status=self.manager.status(self.group_id)
        base.update({"response_class":status.get("response_class"),"average_member_latency_ms":status.get("average_member_latency_ms")}); return base
class SmartGroupLastSourceSensor(_SmartDiagnosticSensor):
    _attr_translation_key="smart_group_last_source"; _attr_entity_registry_enabled_default=False
    def __init__(self,hass,group_id): super().__init__(hass,group_id,"last_source")
    @property
    def native_value(self): return self.manager.status(self.group_id).get("last_source") or "none"
class SmartGroupLatencySensor(_SmartDiagnosticSensor):
    _attr_translation_key="smart_group_latency"; _attr_native_unit_of_measurement=UnitOfTime.MILLISECONDS; _attr_entity_registry_enabled_default=False
    def __init__(self,hass,group_id): super().__init__(hass,group_id,"last_latency")
    @property
    def native_value(self): return self.manager.status(self.group_id).get("last_latency_ms")
