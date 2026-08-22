# Field Test Matrix

Run repository CI and field-test on a non-critical circuit before broad deployment.

## Multi-Way

| Scenario | Expected |
| --- | --- |
| Main OFF → ON | Group/followers end ON |
| Main ON → OFF | Group/followers end OFF |
| Secondary Mirror | Main and other followers match |
| Secondary ON → OFF rapidly | Final Main state is OFF; no stale ON wins |
| Repeated rapid alternating edges | FIFO order preserved; latest physical state wins |
| Toggle/momentary/event controller | Exactly one logical action per valid edge/pulse |
| Controller unavailable/restored | No false press; reflection heals on return |
| Main unavailable | Latest desired physical state retained, not a stale command queue |
| Fallback output configured | Fallback can carry output command per engine policy |
| HA restart | Startup guard prevents false toggles |
| Test Center Toggle/Press | Real end-to-end path runs and group follows |
| Rapid x4 | Final source/output state matches and test passes |

## Smart Groups

| Scenario | Expected |
| --- | --- |
| Virtual group ON/OFF | Every enabled non-quarantined member follows |
| Physical controller Mirror | Members follow controller state |
| Physical controller Toggle | Every valid controller edge toggles once |
| Any-ON policy | Aggregate state ON when at least one member ON |
| All-ON policy | Aggregate state ON only when all active members ON |
| Bidirectional member change | Group adopts member state and propagates safely |
| Rapid controller edges | FIFO queue preserves arrival order |
| Scene changes multiple members | Scene guard adopts resulting aggregate state |
| Member flapping | Member is quarantined; group remains controllable |
| Manual quarantine/release | Quarantined member excluded/restored as expected |
| Member offline | Health degrades; remaining members are not corrupted |
| Maintenance mode | Runtime fan-out is blocked without deleting config |
| Locked group | Destructive config changes are rejected until unlocked |
| Instant/Balanced/Safe | All modes reach correct final state |

## Commissioning / recovery

- Learn Main and every Multi-Way controller.
- Learn physical Smart Group controller and Smart Group members.
- Area quick-group creation includes only compatible commandable entities.
- Take over a UI-created native Light Group and verify the Eshtaya replacement has the exact same `light.*` entity ID before the original Config Entry is removed.
- Take over a UI-created native Switch Group and verify the exact `switch.*` entity ID is preserved.
- Verify Any/All state policy, member order, `hide_members`, Area, aliases, labels, icon and entity-registry visibility/disabled settings survive takeover.
- Force a takeover failure before source deletion and verify rollback restores the original entity ID and hidden-member state.
- Verify a taken-over Light Group still forwards brightness/color/effect/transition service data to its light members.
- Verify unsupported legacy/YAML/runtime or non-Light/Switch group types are displayed as read-only and cannot be destructively taken over.
- Clone physical group requires selecting a new physical controller.
- Template creates a clean editable draft.
- Missing entity appears in Repair Center and can be remapped.
- Undo restores ordinary Multi-Way/Smart configuration snapshots but refuses to erase a completed takeover whose native source helper has already been removed.
- Full restore refuses a backup that would silently remove a completed takeover absent from that backup.
- Full backup restores both engines and rejects malformed/future schema data.
- Configuration Lock blocks create/edit/delete/import/remap operations.
- Full System Test totals match actual available/offline entities.

## Repository CI

Every release candidate must pass:

- HACS validation
- Hassfest
- Ruff
- Pytest
- Release tag/version check
## Smart Group cloud convergence regression

- Issue a Smart Group ON/OFF command to cloud-backed members.
- Allow one or more members to report the requested state after an initial delay.
- Confirm no `Out of sync` Repair issue is raised while the configured convergence timeout is still active.
- Confirm only members still stale are retried, and only up to `max_retries`.
- Confirm a Repair issue is created only when mismatches remain after the complete convergence window.
- Confirm Continuous Enforcement remains opt-in and the watchdog does not fight later external automations.

