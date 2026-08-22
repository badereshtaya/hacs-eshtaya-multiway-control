"""WebSocket management API for Eshtaya Multi-Way Control."""
from __future__ import annotations

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er

from .const import (
    DATA_RUNTIME,
    DOMAIN,
    MODE_EVENT,
    MODE_FOLLOW,
    MODE_MIRROR,
    MODE_MOMENTARY_OFF,
    MODE_MOMENTARY_ON,
    MODE_TOGGLE,
    VIRTUAL_LIGHT,
    VIRTUAL_SWITCH,
    VERSION,
)

CONTROLLER_SCHEMA = vol.Schema(
    {
        vol.Required("entity_id"): str,
        vol.Optional("mode", default=MODE_MIRROR): vol.In(
            [
                MODE_MIRROR,
                MODE_TOGGLE,
                MODE_MOMENTARY_ON,
                MODE_MOMENTARY_OFF,
                MODE_EVENT,
                MODE_FOLLOW,
            ]
        ),
        vol.Optional("invert", default=False): bool,
        vol.Optional("reflect_state"): bool,
    },
    extra=vol.PREVENT_EXTRA,
)

GROUP_FIELDS = {
    vol.Required("name"): vol.All(str, vol.Length(min=1, max=100)),
    vol.Required("output"): str,
    vol.Required("controllers"): vol.All([CONTROLLER_SCHEMA], vol.Length(min=1)),
    vol.Optional("enabled", default=True): bool,
    vol.Optional("virtual_type", default=VIRTUAL_LIGHT): vol.In(
        [VIRTUAL_LIGHT, VIRTUAL_SWITCH]
    ),
    vol.Optional("area_id", default=None): vol.Any(None, str),
    vol.Optional("behavior", default={}): dict,
}


def _runtime(hass: HomeAssistant):
    data = hass.data.get(DOMAIN, {}).get(DATA_RUNTIME)
    if not data:
        raise ValueError("Eshtaya Multi-Way Control is not loaded")
    return data["store"], data["manager"]


def async_register_websocket_commands(hass: HomeAssistant) -> None:
    """Register the panel API."""
    for command in (
        ws_list,
        ws_create,
        ws_update,
        ws_delete,
        ws_set_enabled,
        ws_sync,
        ws_sync_all,
        ws_activity,
        ws_get_settings,
        ws_update_settings,
        ws_export,
        ws_import,
        ws_test,
    ):
        websocket_api.async_register_command(hass, command)


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/list"})
@callback
def ws_list(hass, connection, msg) -> None:
    """List groups with current runtime state."""
    try:
        store, manager = _runtime(hass)
        result = []
        for group in store.groups():
            item = dict(group)
            item["runtime"] = manager.status(group["id"])
            result.append(item)
        connection.send_result(
            msg["id"],
            {
                "version": VERSION,
                "groups": result,
                "summary": manager.summary(),
                "settings": store.settings(),
            },
        )
    except Exception as err:  # noqa: BLE001
        connection.send_error(msg["id"], "list_failed", str(err))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/create", **GROUP_FIELDS}
)
@websocket_api.async_response
async def ws_create(hass, connection, msg) -> None:
    """Create a group."""
    try:
        store, manager = _runtime(hass)
        payload = {key: value for key, value in msg.items() if key not in {"id", "type"}}
        group = await store.async_create(payload)
        await manager.async_reload(reconcile=True)
        connection.send_result(msg["id"], group)
    except Exception as err:  # noqa: BLE001
        connection.send_error(msg["id"], "create_failed", str(err))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/update",
        vol.Required("group_id"): str,
        **GROUP_FIELDS,
    }
)
@websocket_api.async_response
async def ws_update(hass, connection, msg) -> None:
    """Update a group."""
    try:
        store, manager = _runtime(hass)
        old = store.get(msg["group_id"])
        payload = {
            key: value
            for key, value in msg.items()
            if key not in {"id", "type", "group_id"}
        }
        group = await store.async_update(msg["group_id"], payload)
        if old and old["virtual_type"] != group["virtual_type"]:
            _remove_virtual_registry_entity(hass, group["id"], old["virtual_type"])
        await manager.async_reload(reconcile=True)
        connection.send_result(msg["id"], group)
    except Exception as err:  # noqa: BLE001
        connection.send_error(msg["id"], "update_failed", str(err))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/delete", vol.Required("group_id"): str}
)
@websocket_api.async_response
async def ws_delete(hass, connection, msg) -> None:
    """Delete a group and its virtual entity registry entries."""
    try:
        store, manager = _runtime(hass)
        await store.async_delete(msg["group_id"])
        _remove_group_registry_entities(hass, msg["group_id"])
        await manager.async_reload(reconcile=False)
        connection.send_result(msg["id"], {"ok": True})
    except Exception as err:  # noqa: BLE001
        connection.send_error(msg["id"], "delete_failed", str(err))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/set_enabled",
        vol.Required("group_id"): str,
        vol.Required("enabled"): bool,
    }
)
@websocket_api.async_response
async def ws_set_enabled(hass, connection, msg) -> None:
    try:
        _, manager = _runtime(hass)
        group = await manager.async_set_enabled(msg["group_id"], msg["enabled"])
        connection.send_result(msg["id"], group)
    except Exception as err:  # noqa: BLE001
        connection.send_error(msg["id"], "enable_failed", str(err))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/sync", vol.Required("group_id"): str}
)
@websocket_api.async_response
async def ws_sync(hass, connection, msg) -> None:
    try:
        _, manager = _runtime(hass)
        ok = await manager.async_sync_group(msg["group_id"])
        connection.send_result(msg["id"], {"ok": ok})
    except Exception as err:  # noqa: BLE001
        connection.send_error(msg["id"], "sync_failed", str(err))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/sync_all"})
@websocket_api.async_response
async def ws_sync_all(hass, connection, msg) -> None:
    try:
        _, manager = _runtime(hass)
        result = await manager.async_sync_all()
        connection.send_result(msg["id"], result)
    except Exception as err:  # noqa: BLE001
        connection.send_error(msg["id"], "sync_all_failed", str(err))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/activity",
        vol.Optional("limit", default=100): vol.All(vol.Coerce(int), vol.Range(min=1, max=1000)),
    }
)
@callback
def ws_activity(hass, connection, msg) -> None:
    try:
        _, manager = _runtime(hass)
        connection.send_result(msg["id"], {"activity": manager.activity(msg["limit"])})
    except Exception as err:  # noqa: BLE001
        connection.send_error(msg["id"], "activity_failed", str(err))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/settings"})
@callback
def ws_get_settings(hass, connection, msg) -> None:
    try:
        store, _ = _runtime(hass)
        connection.send_result(msg["id"], store.settings())
    except Exception as err:  # noqa: BLE001
        connection.send_error(msg["id"], "settings_failed", str(err))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/update_settings",
        vol.Required("settings"): dict,
    }
)
@websocket_api.async_response
async def ws_update_settings(hass, connection, msg) -> None:
    try:
        store, manager = _runtime(hass)
        settings = await store.async_update_settings(msg["settings"])
        await manager.async_reload(reconcile=False)
        connection.send_result(msg["id"], settings)
    except Exception as err:  # noqa: BLE001
        connection.send_error(msg["id"], "settings_update_failed", str(err))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/export"})
@callback
def ws_export(hass, connection, msg) -> None:
    try:
        store, _ = _runtime(hass)
        connection.send_result(msg["id"], store.export_data())
    except Exception as err:  # noqa: BLE001
        connection.send_error(msg["id"], "export_failed", str(err))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/import",
        vol.Required("data"): dict,
        vol.Optional("replace", default=False): bool,
    }
)
@websocket_api.async_response
async def ws_import(hass, connection, msg) -> None:
    try:
        store, manager = _runtime(hass)
        old_ids = {group["id"] for group in store.groups()} if msg["replace"] else set()
        result = await store.async_import_data(msg["data"], msg["replace"])
        if msg["replace"]:
            new_ids = {group["id"] for group in store.groups()}
            for group_id in old_ids - new_ids:
                _remove_group_registry_entities(hass, group_id)
        await manager.async_reload(reconcile=True)
        connection.send_result(msg["id"], result)
    except Exception as err:  # noqa: BLE001
        connection.send_error(msg["id"], "import_failed", str(err))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/test", vol.Required("group_id"): str}
)
@callback
def ws_test(hass, connection, msg) -> None:
    try:
        _, manager = _runtime(hass)
        connection.send_result(msg["id"], manager.test_group(msg["group_id"]))
    except Exception as err:  # noqa: BLE001
        connection.send_error(msg["id"], "test_failed", str(err))


def _remove_virtual_registry_entity(hass: HomeAssistant, group_id: str, virtual_type: str) -> None:
    registry = er.async_get(hass)
    platform = Platform.LIGHT if virtual_type == VIRTUAL_LIGHT else Platform.SWITCH
    unique_id = f"{group_id}_control_{virtual_type}"
    entity_id = registry.async_get_entity_id(platform, DOMAIN, unique_id)
    if entity_id:
        registry.async_remove(entity_id)


def _remove_group_registry_entities(hass: HomeAssistant, group_id: str) -> None:
    registry = er.async_get(hass)
    pairs = [
        (Platform.LIGHT, f"{group_id}_control_light"),
        (Platform.SWITCH, f"{group_id}_control_switch"),
        (Platform.SWITCH, f"{group_id}_enabled"),
        (Platform.SENSOR, f"{group_id}_health"),
        (Platform.SENSOR, f"{group_id}_last_source"),
        (Platform.SENSOR, f"{group_id}_last_latency"),
        (Platform.BINARY_SENSOR, f"{group_id}_in_sync"),
        (Platform.BUTTON, f"{group_id}_sync"),
    ]
    for platform, unique_id in pairs:
        entity_id = registry.async_get_entity_id(platform, DOMAIN, unique_id)
        if entity_id:
            registry.async_remove(entity_id)
