"""Storage schema migration tests."""
import pytest

from custom_components.eshtaya_multiway.const import MODE_MIRROR, SCHEMA_VERSION
from custom_components.eshtaya_multiway.storage import MultiWayStore


def test_v1_group_migrates_without_losing_entities():
    """Legacy main/secondaries become output/controllers."""
    store = MultiWayStore.__new__(MultiWayStore)
    data = {
        "groups": [
            {
                "id": "abc123",
                "name": "Living Room",
                "main": "switch.living_main",
                "secondaries": ["switch.living_second", "switch.living_third"],
                "enabled": True,
            }
        ]
    }
    migrated = store._migrate(data)
    assert migrated["schema_version"] == SCHEMA_VERSION
    group = migrated["groups"][0]
    assert group["id"] == "abc123"
    assert group["output"] == "switch.living_main"
    assert [c["entity_id"] for c in group["controllers"]] == [
        "switch.living_second",
        "switch.living_third",
    ]
    assert all(c["mode"] == MODE_MIRROR for c in group["controllers"])
    assert all(c["reflect_state"] for c in group["controllers"])


def test_event_like_controller_defaults_to_event_mode():
    """Buttons should become event controllers instead of impossible mirror controllers."""
    store = MultiWayStore.__new__(MultiWayStore)
    group = store._normalize_group(
        {
            "name": "Hall",
            "output": "light.hall",
            "controllers": [{"entity_id": "button.hall_wall", "mode": MODE_MIRROR}],
        },
        keep_id=False,
    )
    controller = group["controllers"][0]
    assert controller["mode"] == "event"
    assert controller["reflect_state"] is False
    store._validate_group(group)


def test_future_storage_schema_is_refused():
    """Never rewrite data created by a newer integration version."""
    store = MultiWayStore.__new__(MultiWayStore)
    with pytest.raises(ValueError, match="newer than supported"):
        store._migrate({"schema_version": SCHEMA_VERSION + 1, "groups": []})
