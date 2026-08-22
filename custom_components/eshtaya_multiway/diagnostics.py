"""Diagnostics for Eshtaya Multi-Way Control."""
from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DATA_RUNTIME, DOMAIN, VERSION


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    """Return privacy-conscious diagnostics for troubleshooting."""
    runtime = hass.data[DOMAIN][DATA_RUNTIME]
    store = runtime["store"]
    manager = runtime["manager"]
    groups = store.groups()
    return {
        "version": VERSION,
        "entry_id": entry.entry_id,
        "settings": store.settings(),
        "summary": manager.summary(),
        "groups": [
            {
                "group_id": group["id"][:10],
                "enabled": group["enabled"],
                "virtual_type": group["virtual_type"],
                "controller_count": len(group["controllers"]),
                "controller_modes": [c["mode"] for c in group["controllers"]],
                "behavior": group["behavior"],
                "runtime": {
                    key: value
                    for key, value in manager.status(group["id"]).items()
                    if key != "members"
                },
            }
            for group in groups
        ],
        "recent_activity": [
            {
                key: value
                for key, value in event.items()
                if key not in {"source", "message"}
            }
            for event in manager.activity(25)
        ],
    }
