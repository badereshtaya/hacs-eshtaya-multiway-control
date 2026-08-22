<p align="center">
  <img src="custom_components/eshtaya_multiway/brand/logo.png" alt="Eshtaya Multi-Way Control" width="560">
</p>

# Eshtaya Multi-Way Control

**Eshtaya Multi-Way Control** is a Home Assistant helper platform for professional software-defined wall-switch control and intelligent aggregate groups. It combines two independent engines in one local Control Center:

1. **Multi-Way** — reliable 2-way / 3-way / N-way control around one real load output and any number of secondary controllers.
2. **Smart Groups** — physical-controller or virtual groups that control multiple Home Assistant entities as one logical unit.

No YAML automations are required. The integration coordinates entities that already exist in Home Assistant; it does not talk directly to Tuya, Zigbee, KNX, Shelly, or vendor clouds.

> Domain: `eshtaya_multiway`  
> Repository: `badereshtaya/hacs-eshtaya-multiway-control`  
> Current release: **3.1.0**

## Requirements

- Home Assistant **2026.3.0+**.
- HACS is optional but recommended.
- Source entities must already be available in Home Assistant.

## Control Center

The bundled full-width admin panel is organized into:

- **Dashboard** — fleet health, quality and quick actions.
- **Multi-Way** — wall-switch groups and end-to-end testing.
- **Smart Groups** — physical-controller and virtual aggregate groups.
- **Commissioning** — Area-aware setup, native group discovery, auto-pair suggestions and templates.
- **Health & Diagnostics** — missing-entity repair, quality and latency visibility.
- **Activity** — merged transaction history from both engines.
- **Settings** — project/installer settings, configuration lock, undo and full backup/restore.

The management panel is admin-only. Normal operation is exposed through native Home Assistant entities and service actions.

## Multi-Way engine

A Multi-Way group contains:

```text
Living Room
├── Physical output: switch.living_main
├── Controller: switch.entrance
├── Controller: switch.sofa
└── Virtual entity: light.living_room_control
```

### Controller modes

- Mirror ON/OFF
- Toggle on every state edge
- Momentary ON
- Momentary OFF
- Event
- Follow output only
- Per-controller inversion
- Optional state reflection

### Rapid-input reliability

- Per-group FIFO edge queue.
- Opposite rapid edges are **never** discarded by debounce.
- Latest physical state wins.
- Home Assistant Context-aware echo suppression.
- Stale transactions cannot overwrite newer physical input.
- Trailing source reconciliation for delayed cloud/device reports.
- Source controller is not written back during its own transaction.
- Output-offline handling retains only the newest requested state.

### Performance profiles

- **Instant** — dispatch immediately, verify in the background.
- **Balanced** — fast dispatch with output confirmation.
- **Safe** — full output/follower confirmation.

### Advanced reliability

- Fallback output.
- Authority policy: Latest Physical or Output Authority.
- Startup protection.
- Automatic healing/watchdog.
- Adopt/enforce output recovery policy.
- Retries and configurable confirmation timeouts.
- Persistent desired state.
- No unnecessary service calls when an entity already matches.

### Learn and Test Center

- Learn the physical output from a real wall press.
- Learn each controller from a real wall press.
- Ranked candidates and suggested controller mode.
- Form draft never resets during live state updates.
- End-to-end Toggle/Press testing uses the real synchronization path.
- Rapid x4 stress test.
- Live transaction timeline, command counts, failures, engine latency and end-to-end latency.

## Smart Groups

Smart Groups are independent from the Multi-Way engine so large aggregate operations cannot block wall-switch synchronization.

### Physical Controller Group

A real entity controls a set of members:

```text
Physical controller: switch.floor_master
├── light.hall
├── switch.corridor
└── light.stairs
```

The controller can use mirror, toggle, momentary or event behavior. State can optionally be reflected back to a commandable controller.

### Virtual Group

Creates a native Home Assistant `light` or `switch` that controls all members:

```text
light.ground_floor_group
├── light.hall
├── light.living
└── light.kitchen
```

### Smart Group policies

- State policy: **Any ON** or **All ON**.
- Direction: controller-only or bidirectional.
- Instant / Balanced / Safe execution.
- Member verification and retries.
- Optional delay between members.
- Continue-on-failure or stop-on-first-failure.
- Physical-input priority window.
- Scene batch guard/adoption.
- Flapping detector.
- Automatic or manual member quarantine/release.
- Maintenance mode.
- Per-group lock.
- Favorites.
- Per-member command, failure, latency and quality metrics.
- Adaptive verification delay based on observed device response.
- Repair issue generation and optional persistent notification on repeated faults.

## Commissioning and project workflow

- Area-aware entity filtering.
- Quick virtual group creation from an Area.
- Auto-pair suggestions for Multi-Way commissioning.
- Discover existing Home Assistant native group helpers directly inside the **Smart Groups** section and Commissioning.
- **Take Over with Eshtaya** performs a transactional migration for UI-created Home Assistant Light Groups and Switch Groups.
- The replacement keeps the **exact same `entity_id`** so dashboards, automations, scenes, voice-assistant references and scripts that target that entity ID do not need to be rewritten.
- The original Home Assistant Group helper is deleted **only after** the Eshtaya replacement has claimed and verified the original entity ID.
- Takeover preserves the group name, ordered members, Any/All policy, `hide_members`, Area and user-facing Entity Registry metadata such as aliases, labels, icon, hidden/disabled state and custom name.
- Taken-over Light Groups forward brightness, color temperature, color, effect, flash and transition commands to compatible light members and aggregate the main light capabilities/state.
- If takeover fails before the original helper is removed, the migration rolls back to the original helper and entity ID instead of leaving a half-migrated group.
- Legacy/YAML/runtime groups and native group types that Eshtaya cannot yet reproduce with the same domain/behavior remain read-only and cannot be destructively taken over.
- Legacy V3.0.1 copy-import metadata remains readable for backward compatibility, but new migrations use Take Over rather than copy/import.
- Smart Group templates.
- Clone groups safely; physical clones intentionally require selecting a new controller.
- Full non-destructive system test.
- Downloadable commissioning/diagnostic report.
- Project name and Installer Mode.

## Safety and recovery

- Missing entity detection across Multi-Way and Smart Groups.
- Replacement/remap wizard from the Control Center.
- Automatic configuration snapshots before destructive changes.
- Undo for ordinary configuration changes; completed native-group takeovers are protected from generic Undo because the original Home Assistant helper has already been intentionally removed.
- Full platform backup/restore with rollback on failed import; restore is blocked if it would silently remove a completed takeover that is absent from the backup.
- Configuration Lock protects add/edit/delete/remap/import while runtime control remains available.
- Versioned storage schemas reject future unsupported data instead of silently rewriting it.
- Home Assistant Repairs, Diagnostics and System Health support.

## Native entities

### Multi-Way group

- Virtual `light` or `switch` control.
- Synchronization enable switch.
- Health sensor.
- In-sync binary sensor.
- Last source sensor (disabled by default).
- Latency sensor (disabled by default).
- Sync button.

### Smart Group

Virtual Smart Groups expose a control `light`/`switch`. All Smart Groups expose:

- Enabled switch.
- Health sensor.
- Quality sensor.
- Healthy binary sensor.
- Last source sensor (disabled by default).
- Latency sensor (disabled by default).
- Sync button.

## Installation with HACS

1. Open **HACS → Integrations → Custom repositories**.
2. Add:
   `https://github.com/badereshtaya/hacs-eshtaya-multiway-control`
3. Category: **Integration**.
4. Download **Eshtaya Multi-Way Control**.
5. Restart Home Assistant.
6. Open **Settings → Devices & services → Add Integration**.
7. Add **Eshtaya Multi-Way Control**.
8. Open **Eshtaya Control Center** from the sidebar.

## Updating

Releases are versioned with Git tags such as `v3.1.0`. HACS discovers the published GitHub Release and offers it as an update.

## Repository validation

GitHub Actions run:

- HACS validation
- Hassfest
- Ruff
- Pytest against a pinned Home Assistant test environment
- Release tag/version validation

## Privacy

The integration requires no external credentials and performs no direct external network calls. Diagnostics intentionally omit configured source entity IDs from recent activity where practical; always review diagnostics before sharing them publicly.

## License

MIT.
