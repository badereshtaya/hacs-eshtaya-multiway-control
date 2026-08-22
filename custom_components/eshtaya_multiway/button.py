"""Button entities for Eshtaya Multi-Way Control."""
from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import DATA_RUNTIME, DOMAIN, SIGNAL_GROUPS_UPDATED, SIGNAL_SMART_GROUPS_UPDATED
from .entity import MultiWayEntity
from .smart_entity import SmartGroupEntity

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback) -> None:
    known_multi:set[str]=set(); known_smart:set[str]=set()
    @callback
    def add_multi():
        store=hass.data[DOMAIN][DATA_RUNTIME]["store"]; entities=[]
        for group in store.groups():
            if group["id"] not in known_multi: known_multi.add(group["id"]); entities.append(MultiWaySyncButton(hass,group["id"]))
        if entities: async_add_entities(entities)
    @callback
    def add_smart():
        store=hass.data[DOMAIN][DATA_RUNTIME]["smart_store"]; entities=[]
        for group in store.groups():
            if group["id"] not in known_smart: known_smart.add(group["id"]); entities.append(SmartGroupSyncButton(hass,group["id"]))
        if entities: async_add_entities(entities)
    add_multi(); add_smart()
    entry.async_on_unload(async_dispatcher_connect(hass,SIGNAL_GROUPS_UPDATED,add_multi))
    entry.async_on_unload(async_dispatcher_connect(hass,SIGNAL_SMART_GROUPS_UPDATED,add_smart))

class MultiWaySyncButton(MultiWayEntity,ButtonEntity):
    _attr_translation_key="sync_now"; _attr_entity_category=EntityCategory.CONFIG
    def __init__(self,hass,group_id): super().__init__(hass,group_id,"sync")
    async def async_press(self): await self.manager.async_sync_group(self.group_id)

class SmartGroupSyncButton(SmartGroupEntity,ButtonEntity):
    _attr_translation_key="smart_group_sync"; _attr_entity_category=EntityCategory.CONFIG
    def __init__(self,hass,group_id): super().__init__(hass,group_id,"sync")
    async def async_press(self): await self.manager.async_sync(self.group_id)
