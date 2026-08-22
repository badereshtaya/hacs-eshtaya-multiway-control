"""Tests for the config flow."""
from homeassistant import config_entries
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.eshtaya_multiway.const import DOMAIN, NAME


async def test_user_flow(hass):
    """The integration can be added through the UI."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is config_entries.ConfigFlowResultType.FORM
    assert result["step_id"] == "user"

    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    assert result["type"] is config_entries.ConfigFlowResultType.CREATE_ENTRY
    assert result["title"] == NAME


async def test_single_instance(hass):
    """A second instance is rejected."""
    entry = MockConfigEntry(domain=DOMAIN, title=NAME, data={})
    entry.add_to_hass(hass)
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is config_entries.ConfigFlowResultType.ABORT
    assert result["reason"] == "single_instance_allowed"
