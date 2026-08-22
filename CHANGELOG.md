# Changelog

## 3.0.0 - 2026-08-22

### Added

- New **Eshtaya Control Center** dashboard with separate Multi-Way, Smart Groups, Commissioning, Health & Diagnostics, Activity and Settings sections.
- Independent high-reliability **Smart Groups** engine.
- Physical-controller Smart Groups and virtual aggregate `light`/`switch` groups.
- Any-ON / All-ON state policy and controller-only / bidirectional direction policy.
- Smart Group Instant, Balanced and Safe execution profiles.
- Smart Group member verification, retry, failure policy and optional staggered dispatch.
- Scene batch protection/adoption.
- Flapping detection plus automatic and manual member quarantine/release.
- Per-member quality score, command/failure counters and adaptive latency metrics.
- Smart Group maintenance mode, favorites and per-group configuration lock.
- Area-aware commissioning, quick Area group creation and Multi-Way auto-pair suggestions.
- Discovery and safe import of native Home Assistant group helpers without modifying the originals.
- Smart Group templates and safe cloning workflow.
- Full-system non-destructive commissioning test and downloadable report.
- Unified missing-entity Repair Center and cross-engine entity remapping.
- Automatic snapshots and Undo for both engines.
- Unified full backup/restore with transactional rollback.
- Project/Installer settings and global Configuration Lock.
- Multi-Way fallback output and source-authority policy exposed in the UI.
- Smart Group FIFO edge queue so rapid controller/member changes preserve Home Assistant arrival order.
- Privacy-conscious diagnostics and combined System Health summary.

### Fixed

- Smart Group UI actions are fully connected to the backend instead of being presentation-only.
- Changing a Smart Group virtual control type removes only the obsolete control entity and preserves diagnostic/config entities.
- Full-system Multi-Way readiness now validates actual member availability instead of treating every returned snapshot as a pass.
- Smart Group editor drafts survive live runtime updates, member changes and Learn sessions.

### Changed

- Product scope expands from Multi-Way synchronization into a full switch/group commissioning and reliability platform.
- Management panel remains admin-only; runtime control remains available through native entities and service actions.

## 2.2.0 - 2026-08-22

### Added

- Learn Mode beside the physical output and every controller field.
- Ranked learn candidates with automatic controller-mode recommendation.
- Per-group FIFO Edge Queue so rapid physical transitions are processed in exact arrival order.
- Latest Physical State Wins reconciliation for mirror controllers.
- Configurable rapid-source authority window to reject stale Main echoes only after fast opposite edges.
- Home Assistant Context-aware command echo tracking to discard stale integration-generated echoes.
- Real end-to-end Test Center: Toggle/Press now propagates through the complete multi-way group.
- Rapid x4 physical stress test with final-state verification.
- Four-step group setup wizard with persistent draft state and inline Learn Mode.
- Per-member command/failure/latency diagnostics and a live transaction timeline in Test Center.
- Offline-Main latest-state queue: only the newest requested physical state is retained and applied on recovery.
- Engine-delay and end-to-end latency diagnostics in Test Center/runtime data.
- Rapid-edge/stale-transaction diagnostic counters.

### Fixed

- Opposite rapid edges such as `OFF -> ON -> OFF` are never discarded by debounce.
- An older background confirmation or retry cannot override a newer physical state.
- The source controller is no longer written back during its own transaction.
- Stale command echoes carrying an older Home Assistant Context cannot become new physical input.
- Closing Test Center no longer performs an implicit output-authority sync that could overwrite a just-tested final state.

### Changed

- Debounce now suppresses duplicate semantic input only; opposite ON/OFF edges always pass.
- Test Center exercises the same runtime path as a real wall-switch change instead of isolation mode.
- Learn Mode keeps the group editor draft and scroll position intact.

## 2.1.0 - 2026-08-22

### Added

- Isolated Test Center controls for every testable group member:
  - `Toggle` for switch/light/input_boolean/fan entities.
  - `Press` for button/input_button entities.
  - One-click group re-sync after testing.
- Three per-group response profiles:
  - **Instant**: immediate non-blocking dispatch with background output verification.
  - **Balanced**: fast dispatch, confirm the physical output, then update followers.
  - **Safe**: fully confirmed output and follower synchronization.
- Background confirmation/retry for Instant mode with stale-transaction protection.
- Test-isolation suppression so test actions are not interpreted as real multi-way presses.
- Automatic re-sync when the Test Center is closed.
- Response-profile indicator on every group card.

### Fixed

- Group editor no longer resets, closes, jumps to the start, or loses entered values when live WebSocket/runtime events arrive.
- Adding/removing controllers preserves the editor draft, advanced-settings state, and scroll position.
- Settings/backup drafts are protected from live refreshes while being edited.
- Rapid consecutive presses can no longer be blocked behind a long fully-confirmed transaction in Instant mode.

### Changed

- New groups default to **Instant** response mode.
- New-group debounce default reduced from 180 ms to 120 ms; existing explicitly saved debounce values are preserved.
- Non-safe service dispatch uses Home Assistant's non-blocking async service path; verification is decoupled from the initial physical command.
- Physical-output changes synchronize followers asynchronously in Instant/Balanced modes.

## 2.0.0 - 2026-08-22

### Added

- Clean integration domain `eshtaya_multiway`.
- Versioned storage schema with safe legacy-shape normalization.
- Output-first transaction engine with confirmation, retries, and per-group locks.
- Six controller modes: mirror, toggle, momentary-on, momentary-off, event, and follow-output.
- Controller inversion and optional state reflection.
- Startup protection and recovery policies.
- Event-driven synchronization plus safety watchdog.
- Persistent desired state with debounced writes.
- Virtual light/switch devices and diagnostic/config entities.
- Full-width bilingual management panel with health/activity/settings tabs.
- Backup/export/import.
- Home Assistant service actions.
- Diagnostics and System Health.
- Home Assistant Repair issues for missing/unresponsive entities.
- Local brand assets for Home Assistant 2026.3+.
- HACS/Hassfest/Ruff/test GitHub Actions.
- Automatic GitHub Release workflow with tag/version verification.
- Home Assistant-native translated service actions and `icons.json`.
- Event-style `button.*` and `input_button.*` controller support.
- Safe cleanup of persistent storage and Repair issues when the config entry is removed.
- Architecture documentation and release field-test matrix.

### Fixed

- Pytest module discovery and deterministic Home Assistant frontend test dependencies.
- Config-flow typing/tests updated to current Home Assistant APIs.

### Changed

- Physical output is explicitly treated as the load authority.
- Secondary updates generated by the integration are tracked as pending commands and never interpreted as new user presses.
