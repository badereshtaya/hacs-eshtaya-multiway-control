"""Button entities for Eshtaya Multi-Way Control."""
from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
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
    """Set up force-sync buttons dynamically."""
    known: set[str] = set()

    @callback
    def add_missing() -> None:
        store = hass.data[DOMAIN][DATA_RUNTIME]["store"]
        entities = []
        for group in store.groups():
            if group["id"] not in known:
                known.add(group["id"])
                entities.append(MultiWaySyncButton(hass, group["id"]))
        if entities:
            async_add_entities(entities)

    add_missing()
    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_GROUPS_UPDATED, add_missing))


class MultiWaySyncButton(MultiWayEntity, ButtonEntity):
    """Force an immediate group reconciliation."""

    _attr_translation_key = "sync_now"
    _attr_entity_category = EntityCategory.CONFIG

    def __init__(self, hass: HomeAssistant, group_id: str) -> None:
        super().__init__(hass, group_id, "sync")

    async def async_press(self) -> None:
        await self.manager.async_sync_group(self.group_id)
