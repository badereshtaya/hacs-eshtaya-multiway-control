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
