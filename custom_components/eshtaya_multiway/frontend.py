"""Frontend panel registration for Eshtaya Multi-Way Control."""
from __future__ import annotations

from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import (
    DOMAIN,
    PANEL_ELEMENT,
    PANEL_ICON,
    PANEL_TITLE,
    PANEL_URL,
    STATIC_URL,
    VERSION,
)


async def async_register_static_assets(hass: HomeAssistant) -> None:
    """Serve the bundled management panel through Home Assistant HTTP."""
    frontend_dir = Path(__file__).parent / "frontend"
    await hass.http.async_register_static_paths(
        [StaticPathConfig(STATIC_URL, str(frontend_dir), False)]
    )


async def async_register_panel(hass: HomeAssistant) -> None:
    """Register a full-width admin-only sidebar panel."""
    if frontend.async_panel_exists(hass, PANEL_URL):
        return
    await panel_custom.async_register_panel(
        hass=hass,
        frontend_url_path=PANEL_URL,
        webcomponent_name=PANEL_ELEMENT,
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        module_url=f"{STATIC_URL}/panel.js?v={VERSION}",
        embed_iframe=False,
        require_admin=True,
        config_panel_domain=DOMAIN,
        handle_safe_area=True,
    )


def async_remove_panel(hass: HomeAssistant) -> None:
    """Remove the sidebar panel if registered."""
    if frontend.async_panel_exists(hass, PANEL_URL):
        frontend.async_remove_panel(hass, PANEL_URL)
