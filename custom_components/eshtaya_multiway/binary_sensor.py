"""Binary sensors for Eshtaya Multi-Way Control."""
from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import DATA_RUNTIME, DOMAIN, HEALTH_HEALTHY, SIGNAL_GROUPS_UPDATED, SIGNAL_SMART_GROUPS_UPDATED
from .entity import MultiWayEntity
from .smart_entity import SmartGroupEntity

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback) -> None:
    known_multi:set[str]=set(); known_smart:set[str]=set()
    @callback
    def add_multi():
        store=hass.data[DOMAIN][DATA_RUNTIME]["store"]; entities=[]
        for group in store.groups():
            if group["id"] not in known_multi: known_multi.add(group["id"]); entities.append(MultiWayInSyncSensor(hass,group["id"]))
        if entities: async_add_entities(entities)
    @callback
    def add_smart():
        store=hass.data[DOMAIN][DATA_RUNTIME]["smart_store"]; entities=[]
        for group in store.groups():
            if group["id"] not in known_smart: known_smart.add(group["id"]); entities.append(SmartGroupHealthySensor(hass,group["id"]))
        if entities: async_add_entities(entities)
    add_multi(); add_smart()
    entry.async_on_unload(async_dispatcher_connect(hass,SIGNAL_GROUPS_UPDATED,add_multi))
    entry.async_on_unload(async_dispatcher_connect(hass,SIGNAL_SMART_GROUPS_UPDATED,add_smart))

class MultiWayInSyncSensor(MultiWayEntity,BinarySensorEntity):
    _attr_translation_key="in_sync"; _attr_entity_category=EntityCategory.DIAGNOSTIC
    def __init__(self,hass,group_id): super().__init__(hass,group_id,"in_sync")
    @property
    def is_on(self): return self.manager.status(self.group_id).get("health")==HEALTH_HEALTHY

class SmartGroupHealthySensor(SmartGroupEntity,BinarySensorEntity):
    _attr_translation_key="smart_group_healthy"; _attr_entity_category=EntityCategory.DIAGNOSTIC
    def __init__(self,hass,group_id): super().__init__(hass,group_id,"healthy")
    @property
    def is_on(self): return self.manager.status(self.group_id).get("health")=="healthy"
