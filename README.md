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
> Current release: **3.2.0**

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

Smart Groups are independent from the Multi-Way engine so large aggregate operations cannot block wall-switch synchronization. V3.2 is **domain-native**: a virtual group is created as the same Home Assistant domain it represents and inherits the native Group behavior for that domain.

### Supported Home Assistant Group domains

- `binary_sensor`
- `button`
- `cover`
- `event`
- `fan`
- `light`
- `lock`
- `media_player`
- `notify`
- `sensor`
- `switch`
- `valve`

For rich domains, Eshtaya uses Home Assistant's own Group entity implementations as the behavioral base. That means Cover groups keep position/tilt/stop support, Fan groups keep percentage/direction/oscillation, Media Player groups keep their supported media/volume features, Valve groups keep position/stop support, Notify groups keep native message delivery, and Event/Sensor/Binary Sensor groups aggregate state using their native semantics.

### Intelligent member filtering

The selected **Group domain is authoritative**. A `cover` Smart Group can contain only `cover.*` members, a `fan` group only `fan.*`, and so on. This is enforced twice: in the Control Center picker and again in the backend API.

The default **Strict compatibility** mode additionally keeps matching sub-types together:

- domains that expose a `device_class` are checked for matching device class;
- Sensor groups require matching `device_class`, `unit_of_measurement`, and `state_class`;
- domains such as Light and Fan rely on Home Assistant's native feature aggregation so compatible capabilities can be combined safely.

An Advanced **Domain only** mode is available when an installer intentionally wants to combine different sub-types inside the same domain. It never permits cross-domain members.

### Physical Controller Group

A real wall/button entity controls a set of same-domain members. Supported commandable group types map the controller to native actions; for example Cover maps ON/OFF to Open/Close, Valve to Open/Close, Lock to Unlock/Lock, Media Player to Turn on/Turn off, and Button edges to Press. Rich domain service behavior remains native rather than being reduced to generic ON/OFF.

### Virtual Group

Creates a Home Assistant entity in the selected native domain. Examples:

```text
cover.living_covers
├── cover.left_shutter
└── cover.right_shutter

fan.all_bedroom_fans
├── fan.bedroom_1
└── fan.bedroom_2
```

### Smart Group policies

- Native domain-aware state and service behavior.
- Any/All policy where Home Assistant supports it (Light, Switch, Binary Sensor).
- Sensor statistic modes: last, first available, min, max, mean, median, product, range, standard deviation, and sum.
- Strict subtype compatibility or Advanced Domain-only compatibility.
- Controller-only / bidirectional behavior for ON/OFF-capable groups.
- Instant / Balanced / Safe execution for the reliability engine.
- Bounded member verification and retries; continuous enforcement remains opt-in.
- Physical-input priority, scene guard, flapping detector and quarantine.
- Maintenance mode, enable/disable, per-group lock and favorites.
- Per-member command, failure, latency and quality metrics.
- Repair issue generation and diagnostics.

## Commissioning and project workflow

- Area-aware entity filtering.
- Quick virtual group creation from an Area.
- Auto-pair suggestions for Multi-Way commissioning.
- Discover existing Home Assistant native group helpers directly inside the **Smart Groups** section and Commissioning.
- **Take Over with Eshtaya** performs a transactional migration for compatible UI-created Home Assistant groups across all supported native Group domains.
- The replacement keeps the **exact same `entity_id`** so dashboards, automations, scenes, voice-assistant references and scripts that target that entity ID do not need to be rewritten.
- The original Home Assistant Group helper is deleted **only after** the Eshtaya replacement has claimed and verified the original entity ID.
- Takeover preserves the group name, ordered members, Any/All policy, `hide_members`, Area and user-facing Entity Registry metadata such as aliases, labels, icon, hidden/disabled state and custom name.
- Taken-over groups are recreated in the same native domain and preserve Home Assistant Group behavior; Light/Cover/Fan/Lock/Media Player/Valve/Button/Notify/Event/Binary Sensor/Sensor/Switch groups keep their domain-specific semantics.
- If takeover fails before the original helper is removed, the migration rolls back to the original helper and entity ID instead of leaving a half-migrated group.
- Legacy/YAML/runtime groups remain read-only. UI-created groups are takeover-capable only when their members satisfy Eshtaya same-domain and compatibility rules; incompatible groups remain untouched with an explicit reason.
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

Virtual Smart Groups expose a control entity in the selected native domain. All Smart Groups expose:

- Enabled switch.
- Health sensor.
- Quality sensor.
- Healthy binary sensor.
- Last source sensor (disabled by default).
- Latency sensor (disabled by default).
- Sync button.


### Smart Group anti-oscillation safety

Smart Groups use bounded verification after a group command. They **do not continuously
force every member back to the last requested state by default**, so a device, automation,
or person controlling an individual member cannot enter an ON/OFF fight with the watchdog.
Cloud-backed integrations are additionally protected by a state-aware command echo guard
that does not depend solely on Home Assistant Context propagation. Continuous enforcement
remains available as an explicit Advanced opt-in.

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

Releases are versioned with Git tags such as `v3.2.0`. HACS discovers the published GitHub Release and offers it as an update.

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
