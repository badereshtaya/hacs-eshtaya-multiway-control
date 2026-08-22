"""Constants for Eshtaya Multi-Way Control."""
from __future__ import annotations

from typing import Final

DOMAIN: Final = "eshtaya_multiway"
NAME: Final = "Eshtaya Multi-Way Control"
VERSION: Final = "2.0.0"
MANUFACTURER: Final = "Eshtaya Smart"
MODEL: Final = "Virtual Multi-Way Group"

DATA_RUNTIME: Final = "runtime"
STORAGE_KEY: Final = f"{DOMAIN}.groups"
# Keep Home Assistant Store envelope version stable; schema evolution is handled internally.
STORAGE_VERSION: Final = 1
SCHEMA_VERSION: Final = 2

PANEL_URL: Final = "eshtaya-multiway"
PANEL_ELEMENT: Final = "eshtaya-multiway-panel"
PANEL_TITLE: Final = "Multi-Way Control"
PANEL_ICON: Final = "mdi:electric-switch"
STATIC_URL: Final = f"/{DOMAIN}_static"

SIGNAL_GROUPS_UPDATED: Final = f"{DOMAIN}_groups_updated"
SIGNAL_RUNTIME_UPDATED: Final = f"{DOMAIN}_runtime_updated"
EVENT_TYPE: Final = f"{DOMAIN}_event"

VALID_STATES: Final = {"on", "off"}
UNAVAILABLE_STATES: Final = {"unavailable", "unknown"}

OUTPUT_DOMAINS: Final = {"switch", "light", "input_boolean", "fan"}
CONTROLLER_DOMAINS: Final = {
    "switch",
    "light",
    "input_boolean",
    "binary_sensor",
    "button",
    "input_button",
    "event",
}
COMMANDABLE_DOMAINS: Final = {"switch", "light", "input_boolean", "fan"}

MODE_MIRROR: Final = "mirror"
MODE_TOGGLE: Final = "toggle"
MODE_MOMENTARY_ON: Final = "momentary_on"
MODE_MOMENTARY_OFF: Final = "momentary_off"
MODE_EVENT: Final = "event"
MODE_FOLLOW: Final = "follow_output"
CONTROLLER_MODES: Final = {
    MODE_MIRROR,
    MODE_TOGGLE,
    MODE_MOMENTARY_ON,
    MODE_MOMENTARY_OFF,
    MODE_EVENT,
    MODE_FOLLOW,
}

VIRTUAL_LIGHT: Final = "light"
VIRTUAL_SWITCH: Final = "switch"
VIRTUAL_TYPES: Final = {VIRTUAL_LIGHT, VIRTUAL_SWITCH}

HEALTH_HEALTHY: Final = "healthy"
HEALTH_DEGRADED: Final = "degraded"
HEALTH_DISABLED: Final = "disabled"
HEALTH_OUTPUT_OFFLINE: Final = "output_offline"
HEALTH_MISSING_OUTPUT: Final = "missing_output"
HEALTH_OUT_OF_SYNC: Final = "out_of_sync"
HEALTH_RECOVERING: Final = "recovering"

DEFAULT_SETTINGS: Final = {
    "startup_delay": 12,
    "watchdog_interval": 30,
    "command_timeout": 4.0,
    "max_retries": 1,
    "history_size": 100,
    "repair_threshold": 3,
    "confirm_output": True,
}

DEFAULT_BEHAVIOR: Final = {
    "debounce_ms": 180,
    "auto_heal": True,
    "output_restore_policy": "adopt",
    "confirm_output": None,
    "command_timeout": None,
    "max_retries": None,
}

SERVICE_SYNC_GROUP: Final = "sync_group"
SERVICE_SYNC_ALL: Final = "sync_all"
SERVICE_ENABLE_GROUP: Final = "enable_group"
SERVICE_DISABLE_GROUP: Final = "disable_group"
SERVICE_SET_STATE: Final = "set_group_state"
SERVICE_TEST_GROUP: Final = "test_group"
