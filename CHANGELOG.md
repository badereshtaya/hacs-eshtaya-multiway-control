# Changelog

## 3.2.0 - 2026-08-22

### Domain-native Smart Groups
- Expanded Smart Groups from Light/Switch-only virtual controls to every current Home Assistant Group domain: Binary Sensor, Button, Cover, Event, Fan, Light, Lock, Media Player, Notify, Sensor, Switch and Valve.
- Virtual Smart Groups now create an entity in the selected native domain instead of reducing rich domains to generic ON/OFF.
- Reused Home Assistant Core Group entity implementations as the behavior layer so Cover position/tilt/stop, Fan percentage/direction/oscillation, Media Player features, Valve positioning, Notify delivery, Event propagation and Sensor statistics retain native semantics.
- Added domain-aware Control Center actions and Area commissioning for all supported group domains.
- Added strict same-domain backend validation and filtered entity pickers.
- Added Strict compatibility filtering by device class and, for Sensor groups, by device class + unit + state class. Added Advanced Domain-only mode for intentional same-domain subtype mixing.
- Expanded transactional Take Over to compatible UI-created Home Assistant groups in all supported domains while preserving the exact original entity ID and registry metadata.
- Added safe read-only handling for legacy/YAML groups and official Sensor groups that mix `sensor`, `number`, or `input_number` members, because Eshtaya V3.2 intentionally enforces the selected domain on every member.
- Added native-platform modules for Cover, Fan, Lock, Media Player, Valve, Event and Notify plus native Smart Group entities for Binary Sensor, Sensor and Button.
- Rich-domain physical-controller groups now dispatch native actions instead of passing through the ON/OFF synchronization engine.
- Added regression coverage for the complete domain list, cross-domain rejection, cover subtype compatibility, Domain-only override and Sensor measurement compatibility.

## 3.1.2 - 2026-08-22

### Added
- Added a one-click **Enable / Disable** control to every managed Smart Group card and favorite Smart Group card.
- Disabling a Smart Group now stops queued edges, verification/retry tasks, scene-settle tasks, and clears its out-of-sync Repair issue without changing any physical member state.
- Re-enabling a Smart Group adopts the current aggregate member state and never sends an automatic ON/OFF command.
- The existing `Smart Group Enabled` entity now uses the same backend safety path as the Control Center button.
- Enable/disable remains available even when a group or project configuration is locked because it is an operational safety control, not structural editing.

## 3.1.1 - 2026-08-22

### Smart Group stability hotfix
- Fixed Smart Groups entering ON/OFF oscillation when a member reported delayed or contextless cloud state updates.
- Added state-aware command echo suppression for cloud integrations that do not preserve Home Assistant Context.
- Changed Auto Heal to bounded post-command verification/retry instead of permanent watchdog enforcement.
- Added explicit `continuous_enforcement` Advanced option, disabled by default.
- Smart Group virtual light/switch state now reflects the actual aggregate member state instead of stale desired state.
- Out-of-sync Repair issues clear automatically after members converge.
- Added regression tests for safe enforcement defaults and contextless echo handling.

## 3.1.0 - 2026-08-22

- Replaced copy-style Home Assistant group import with transactional **Take Over** migration.
- Preserves the original Light/Switch Group `entity_id` exactly, so dashboards, automations, scenes, and voice integrations keep working without entity-ID edits.
- Preserves group name, ordered members, Any/All policy, hide-members behavior, Area, icon, labels, aliases, and Entity Registry overrides.
- Verifies the Eshtaya replacement before deleting the original Home Assistant Group helper.
- Adds best-effort rollback if takeover fails before source deletion and late-cleanup protection if Home Assistant removes the source entry but raises during cleanup.
- UI-created Home Assistant Light/Switch Groups are takeover-capable; unsupported legacy/YAML or other group domains remain visible as read-only with an explicit reason.
- Smart Groups now persist preferred entity IDs, takeover metadata, and managed hide-members ownership.
- Taken-over Light Groups preserve aggregate brightness/color/effect capabilities and forward brightness, color, effect, flash and transition service data to member lights.
- Attribute-only light updates refresh the aggregate entity without being counted as control edges or flapping.
- Generic Smart Group Undo and full-restore replacement are guarded so they cannot accidentally erase a completed destructive takeover whose original Home Assistant helper has already been removed.
- The retired V3.0.1 copy-import WebSocket endpoint now refuses destructive work, protecting stale cached frontends from triggering an unconfirmed takeover.

## 3.0.1 - 2026-08-22

### Fixed

- Fixed Smart Group editor crash `domains.has is not a function` by accepting both Array and Set domain collections in entity datalists.
- Existing Home Assistant groups are now shown directly inside the Smart Groups section instead of being discoverable only from Commissioning.
- Imported Home Assistant groups are tracked by source entity to prevent accidental duplicate imports.

### Added

- Imported Smart Groups show their original Home Assistant group source.
- Added **Refresh from Home Assistant** to update an imported Smart Group's member list while preserving Smart Group behavior, enabled-member choices for unchanged members, and the original Home Assistant group.
- Clear read-only labels and import semantics for native Home Assistant groups.

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
- Ruff/CI compliance for entity platforms and WebSocket repair helpers; the Ruff action is pinned to a Node 24-compatible release.

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
