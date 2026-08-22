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
- Native Home Assistant group import produces a Smart Group while original stays unchanged.
- Clone physical group requires selecting a new physical controller.
- Template creates a clean editable draft.
- Missing entity appears in Repair Center and can be remapped.
- Undo restores the last Multi-Way/Smart configuration snapshot.
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
