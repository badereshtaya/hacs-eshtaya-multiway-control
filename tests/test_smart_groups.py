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
