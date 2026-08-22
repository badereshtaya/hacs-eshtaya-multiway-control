"""Tests for rapid edge handling."""

from custom_components.eshtaya_multiway.manager import MultiWayManager
from custom_components.eshtaya_multiway.models import GroupRuntime


def test_opposite_edges_are_never_debounced() -> None:
    """A fast ON -> OFF transition must preserve both physical edges."""
    group = {"behavior": {"debounce_ms": 5000}}
    runtime = GroupRuntime()

    assert MultiWayManager._debounced(group, runtime, "switch.secondary", "on") is False
    assert MultiWayManager._debounced(group, runtime, "switch.secondary", "off") is False
    assert runtime.rapid_edges_seen == 1
    assert runtime.authority_source == "switch.secondary"
    assert runtime.authority_state == "off"
    assert runtime.authority_until > 0


def test_duplicate_semantic_edge_is_debounced() -> None:
    """Duplicate reports for the same semantic state may still be suppressed."""
    group = {"behavior": {"debounce_ms": 5000}}
    runtime = GroupRuntime()

    assert MultiWayManager._debounced(group, runtime, "switch.secondary", "on") is False
    assert MultiWayManager._debounced(group, runtime, "switch.secondary", "on") is True
