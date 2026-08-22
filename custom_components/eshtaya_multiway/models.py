"""Runtime models for Eshtaya Multi-Way Control."""
from __future__ import annotations

from dataclasses import dataclass, field
from time import monotonic
from typing import Any

from .const import HEALTH_HEALTHY


@dataclass(slots=True)
class PendingCommand:
    """A state change expected as a result of an integration command."""

    expected_state: str
    transaction_id: str
    expires: float

    @property
    def expired(self) -> bool:
        """Return whether the pending command expired."""
        return monotonic() >= self.expires


@dataclass(slots=True)
class GroupRuntime:
    """Runtime state for one multi-way group."""

    desired_state: str | None = None
    health: str = HEALTH_HEALTHY
    last_source: str | None = None
    last_action: str | None = None
    last_error: str | None = None
    last_latency_ms: int | None = None
    last_transaction_id: str | None = None
    last_changed: str | None = None
    consecutive_output_failures: int = 0
    recovering: bool = False
    pending: dict[str, PendingCommand] = field(default_factory=dict)
    last_input_time: dict[str, float] = field(default_factory=dict)
    suppressed_until: dict[str, float] = field(default_factory=dict)
    test_mode_until: float = 0.0

    def as_dict(self) -> dict[str, Any]:
        """Serialize public runtime state."""
        return {
            "desired_state": self.desired_state,
            "health": self.health,
            "last_source": self.last_source,
            "last_action": self.last_action,
            "last_error": self.last_error,
            "last_latency_ms": self.last_latency_ms,
            "last_transaction_id": self.last_transaction_id,
            "last_changed": self.last_changed,
            "consecutive_output_failures": self.consecutive_output_failures,
            "recovering": self.recovering,
            "pending_commands": len(self.pending),
        }
