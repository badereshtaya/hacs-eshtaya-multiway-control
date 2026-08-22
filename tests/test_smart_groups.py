"""Smart Group data-model tests."""

import pytest

from custom_components.eshtaya_multiway.const import (
    MODE_EVENT,
    SMART_KIND_PHYSICAL,
    SMART_KIND_VIRTUAL,
)
from custom_components.eshtaya_multiway.smart_storage import SmartGroupStore


def test_virtual_group_normalizes_members_and_defaults() -> None:
    """A virtual group is normalized with safe defaults."""
    store = SmartGroupStore.__new__(SmartGroupStore)
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Ground Floor",
            "kind": SMART_KIND_VIRTUAL,
            "members": ["light.hall", "light.living", "light.hall"],
        },
        keep_id=False,
    )
    store._validate(group)  # noqa: SLF001
    assert [member["entity_id"] for member in group["members"]] == [
        "light.hall",
        "light.living",
    ]
    assert group["behavior"]["state_policy"] == "any"
    assert group["behavior"]["performance_mode"] == "instant"


def test_physical_button_controller_becomes_event_mode() -> None:
    """Event-style physical controllers cannot remain in mirror mode."""
    store = SmartGroupStore.__new__(SmartGroupStore)
    group = store._normalize(  # noqa: SLF001
        {
            "name": "All Lights",
            "kind": SMART_KIND_PHYSICAL,
            "controller_entity": "button.wall_scene",
            "members": [{"entity_id": "light.hall"}],
            "behavior": {"controller_mode": "mirror"},
        },
        keep_id=False,
    )
    store._validate(group)  # noqa: SLF001
    assert group["behavior"]["controller_mode"] == MODE_EVENT


def test_physical_controller_cannot_be_group_member() -> None:
    """A physical controller cannot simultaneously be a controlled member."""
    store = SmartGroupStore.__new__(SmartGroupStore)
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Bad Group",
            "kind": SMART_KIND_PHYSICAL,
            "controller_entity": "switch.master",
            "members": [{"entity_id": "switch.master"}],
        },
        keep_id=False,
    )
    with pytest.raises(ValueError, match="cannot also be a member"):
        store._validate(group)  # noqa: SLF001


def test_imported_source_group_is_preserved() -> None:
    """Imported native HA group identity survives normalization and future updates."""
    store = SmartGroupStore.__new__(SmartGroupStore)
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Living Lights",
            "kind": SMART_KIND_VIRTUAL,
            "members": [{"entity_id": "light.living_1"}],
            "source_group_entity": "light.living_group",
        },
        keep_id=False,
    )
    assert group["source_group_entity"] == "light.living_group"


def test_takeover_metadata_and_exact_entity_id_survive_normalization() -> None:
    """Takeover identity and original group behavior are persistent Smart Group data."""
    store = SmartGroupStore.__new__(SmartGroupStore)
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Living Lights",
            "kind": SMART_KIND_VIRTUAL,
            "members": [
                {"entity_id": "light.living_1"},
                {"entity_id": "light.living_2"},
            ],
            "virtual_type": "light",
            "preferred_entity_id": "light.living_group",
            "hide_members": True,
            "migration": {
                "takeover": True,
                "source_entity_id": "light.living_group",
                "source_group_type": "light",
            },
            "behavior": {"state_policy": "all"},
        },
        keep_id=False,
    )
    store._validate(group)  # noqa: SLF001
    assert group["preferred_entity_id"] == "light.living_group"
    assert group["hide_members"] is True
    assert group["migration"]["takeover"] is True
    assert group["behavior"]["state_policy"] == "all"


@pytest.mark.asyncio
async def test_undo_cannot_erase_completed_takeover() -> None:
    """Generic Undo must not remove a group whose native source was deleted."""
    import asyncio
    from unittest.mock import AsyncMock

    store = SmartGroupStore.__new__(SmartGroupStore)
    store._lock = asyncio.Lock()  # noqa: SLF001
    store._save = AsyncMock()  # noqa: SLF001
    store._data = {  # noqa: SLF001
        "settings": {"config_locked": False},
        "groups": [
            {
                "id": "takeover-1",
                "name": "Living Lights",
                "migration": {"takeover": True},
            }
        ],
        "snapshots": [
            {
                "created_at": "2026-08-22T00:00:00+00:00",
                "reason": "before_create",
                "groups": [],
            }
        ],
    }

    with pytest.raises(ValueError, match="cannot roll back a completed"):
        await store.async_undo_last()

    assert len(store._data["snapshots"]) == 1  # noqa: SLF001
    store._save.assert_not_awaited()  # noqa: SLF001


@pytest.mark.asyncio
async def test_restore_cannot_silently_remove_completed_takeover() -> None:
    """Replace restore must keep completed takeover groups unless explicitly deleted."""
    import asyncio
    from unittest.mock import AsyncMock

    store = SmartGroupStore.__new__(SmartGroupStore)
    store._lock = asyncio.Lock()  # noqa: SLF001
    store._save = AsyncMock()  # noqa: SLF001
    store._data = {  # noqa: SLF001
        "settings": {
            "config_locked": False,
            "snapshot_limit": 25,
            "hidden_members_owned": [],
        },
        "groups": [
            {
                "id": "takeover-1",
                "name": "Living Lights",
                "migration": {"takeover": True},
            }
        ],
        "templates": [],
        "snapshots": [],
    }

    with pytest.raises(ValueError, match="Restore would remove a completed"):
        await store.async_import(
            {"settings": {}, "groups": [], "templates": [], "snapshots": []},
            replace=True,
        )

    assert store._data["snapshots"] == []  # noqa: SLF001
    store._save.assert_not_awaited()  # noqa: SLF001


def test_continuous_enforcement_is_safe_opt_in() -> None:
    """Smart Groups must not fight external automations by default."""
    store = SmartGroupStore.__new__(SmartGroupStore)
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Living Lights",
            "kind": SMART_KIND_VIRTUAL,
            "members": [{"entity_id": "light.living_1"}],
        },
        keep_id=False,
    )
    assert group["behavior"]["auto_heal"] is True
    assert group["behavior"]["continuous_enforcement"] is False
    assert group["behavior"]["command_echo_ms"] == 5000


def test_contextless_command_echo_only_consumes_matching_state() -> None:
    """A matching cloud echo is ignored, while an opposite physical edge survives."""
    from collections import defaultdict, deque
    from time import monotonic

    from custom_components.eshtaya_multiway.smart_group_manager import SmartGroupManager

    manager = SmartGroupManager.__new__(SmartGroupManager)
    manager._pending_expected = defaultdict(deque)  # noqa: SLF001
    key = ("group-1", "light.living")
    manager._pending_expected[key].append(  # noqa: SLF001
        ("tx-1", "on", monotonic() + 5)
    )

    assert manager._consume_expected_echo("group-1", "light.living", "off") is False  # noqa: SLF001
    assert len(manager._pending_expected[key]) == 1  # noqa: SLF001
    assert manager._consume_expected_echo("group-1", "light.living", "on") is True  # noqa: SLF001
    assert key not in manager._pending_expected  # noqa: SLF001


def test_global_echo_guard_prevents_cross_group_feedback() -> None:
    """A command from one Smart Group must not drive another group sharing the member."""
    from collections import defaultdict, deque
    from time import monotonic

    from custom_components.eshtaya_multiway.smart_group_manager import SmartGroupManager

    manager = SmartGroupManager.__new__(SmartGroupManager)
    manager._global_expected = defaultdict(deque)  # noqa: SLF001
    manager._global_expected["light.shared"].append(("on", monotonic() + 5))  # noqa: SLF001

    assert manager._is_global_command_echo("light.shared", "on") is True  # noqa: SLF001
    assert manager._is_global_command_echo("light.shared", "off") is False  # noqa: SLF001
    assert "light.shared" not in manager._global_expected  # noqa: SLF001


def test_smart_group_enabled_defaults_true() -> None:
    """Smart Groups are enabled unless explicitly disabled."""
    store = SmartGroupStore.__new__(SmartGroupStore)
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Living",
            "kind": SMART_KIND_VIRTUAL,
            "members": [{"entity_id": "light.living"}],
        },
        keep_id=False,
    )
    assert group["enabled"] is True


@pytest.mark.asyncio
async def test_operational_enable_toggle_bypasses_config_lock() -> None:
    """Enable/disable remains available as a runtime safety control."""
    import asyncio
    from unittest.mock import AsyncMock

    store = SmartGroupStore.__new__(SmartGroupStore)
    store._lock = asyncio.Lock()  # noqa: SLF001
    store._save = AsyncMock()  # noqa: SLF001
    store._data = {  # noqa: SLF001
        "settings": {"config_locked": True},
        "groups": [{"id": "g1", "name": "Living", "enabled": True, "locked": True}],
    }

    updated = await store.async_set_enabled("g1", False)
    assert updated["enabled"] is False
    assert store._data["groups"][0]["enabled"] is False  # noqa: SLF001
    store._save.assert_awaited_once()


def test_domain_native_group_types_match_home_assistant_group_menu() -> None:
    """Smart Groups expose every current Home Assistant Group domain."""
    from custom_components.eshtaya_multiway.const import SMART_GROUP_TYPES

    assert SMART_GROUP_TYPES == {
        "binary_sensor",
        "button",
        "cover",
        "event",
        "fan",
        "light",
        "lock",
        "media_player",
        "notify",
        "sensor",
        "switch",
        "valve",
    }


def test_smart_group_rejects_cross_domain_member() -> None:
    """A domain-native group cannot silently mix entity domains."""
    from types import SimpleNamespace

    store = SmartGroupStore.__new__(SmartGroupStore)
    store.hass = SimpleNamespace(states=SimpleNamespace(get=lambda _entity_id: None))
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Living Covers",
            "kind": SMART_KIND_VIRTUAL,
            "group_type": "cover",
            "members": [
                {"entity_id": "cover.living_left"},
                {"entity_id": "switch.living_right"},
            ],
        },
        keep_id=False,
    )
    with pytest.raises(ValueError, match="this is a cover group"):
        store._validate(group)  # noqa: SLF001


def test_strict_cover_group_rejects_different_device_classes() -> None:
    """Strict compatibility keeps cover sub-types together."""
    from types import SimpleNamespace

    states = {
        "cover.left": SimpleNamespace(attributes={"device_class": "shutter"}),
        "cover.right": SimpleNamespace(attributes={"device_class": "garage"}),
    }
    store = SmartGroupStore.__new__(SmartGroupStore)
    store.hass = SimpleNamespace(states=SimpleNamespace(get=states.get))
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Mixed Covers",
            "kind": SMART_KIND_VIRTUAL,
            "group_type": "cover",
            "members": [{"entity_id": "cover.left"}, {"entity_id": "cover.right"}],
            "behavior": {"compatibility_mode": "strict"},
        },
        keep_id=False,
    )
    with pytest.raises(ValueError, match="not the same"):
        store._validate(group)  # noqa: SLF001


def test_domain_only_mode_allows_same_domain_different_subtypes() -> None:
    """Advanced Domain-only mode relaxes subtype matching but never domain matching."""
    from types import SimpleNamespace

    states = {
        "cover.left": SimpleNamespace(attributes={"device_class": "shutter"}),
        "cover.right": SimpleNamespace(attributes={"device_class": "garage"}),
    }
    store = SmartGroupStore.__new__(SmartGroupStore)
    store.hass = SimpleNamespace(states=SimpleNamespace(get=states.get))
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Intentional Covers",
            "kind": SMART_KIND_VIRTUAL,
            "group_type": "cover",
            "members": [{"entity_id": "cover.left"}, {"entity_id": "cover.right"}],
            "behavior": {"compatibility_mode": "domain_only"},
        },
        keep_id=False,
    )
    store._validate(group)  # noqa: SLF001


def test_strict_sensor_group_requires_same_measurement_semantics() -> None:
    """Strict sensor groups cannot combine unrelated units or device classes."""
    from types import SimpleNamespace

    states = {
        "sensor.a": SimpleNamespace(
            attributes={
                "device_class": "temperature",
                "unit_of_measurement": "°C",
                "state_class": "measurement",
            }
        ),
        "sensor.b": SimpleNamespace(
            attributes={
                "device_class": "humidity",
                "unit_of_measurement": "%",
                "state_class": "measurement",
            }
        ),
    }
    store = SmartGroupStore.__new__(SmartGroupStore)
    store.hass = SimpleNamespace(states=SimpleNamespace(get=states.get))
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Invalid Statistics",
            "kind": SMART_KIND_VIRTUAL,
            "group_type": "sensor",
            "members": [{"entity_id": "sensor.a"}, {"entity_id": "sensor.b"}],
        },
        keep_id=False,
    )
    with pytest.raises(ValueError, match="not the same"):
        store._validate(group)  # noqa: SLF001


def test_strict_sensor_group_allows_same_device_class_different_native_units() -> None:
    """Temperature sensors in convertible units are still the same sensor type."""
    from types import SimpleNamespace

    states = {
        "sensor.c": SimpleNamespace(
            attributes={
                "device_class": "temperature",
                "unit_of_measurement": "°C",
                "state_class": "measurement",
            }
        ),
        "sensor.f": SimpleNamespace(
            attributes={
                "device_class": "temperature",
                "unit_of_measurement": "°F",
                "state_class": "measurement",
            }
        ),
    }
    store = SmartGroupStore.__new__(SmartGroupStore)
    store.hass = SimpleNamespace(states=SimpleNamespace(get=states.get))
    group = store._normalize(  # noqa: SLF001
        {
            "name": "Temperature Average",
            "kind": SMART_KIND_VIRTUAL,
            "group_type": "sensor",
            "members": [{"entity_id": "sensor.c"}, {"entity_id": "sensor.f"}],
        },
        keep_id=False,
    )
    store._validate(group)  # noqa: SLF001
