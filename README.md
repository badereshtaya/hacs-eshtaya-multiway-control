<p align="center">
  <img src="custom_components/eshtaya_multiway/brand/logo.png" alt="Eshtaya Multi-Way Control" width="560">
</p>

# Eshtaya Multi-Way Control

A professional Home Assistant custom integration for software-defined **2-way, 3-way and multi-way wall switch control**. It turns one physical load output and multiple smart wall controls into a single reliable virtual light/switch, without YAML automations.

> Integration domain: `eshtaya_multiway`. Product name: **Eshtaya Multi-Way Control**.


## Requirements

- Home Assistant **2026.3.0 or newer**.
- HACS is optional but recommended for installation and updates.
- The source switch/light/button entities must already exist in Home Assistant through their own integrations.

## Core architecture

Each group contains:

- **Physical Output** — the relay/light actually connected to the load and treated as the physical authority.
- **Controllers** — one or more secondary smart switches/events.
- **Virtual Entity** — one Home Assistant `light` or `switch` representing the complete group.
- **Transaction Engine** — output-first command confirmation, loop suppression, retry and reconciliation logic.

Example:

```text
Living Room
├── Output: switch.living_main
├── Controller: switch.entrance      [Mirror]
├── Controller: switch.sofa          [Mirror]
└── Virtual: light.living_room_control
```

## Features

### Synchronization engine

- Dynamic 2-way / 3-way / N-way groups.
- Main/output-first transaction flow.
- Pending-command suppression prevents ping-pong loops.
- Per-group serialization protects against race conditions.
- Debounce protection for noisy wall switches.
- Command confirmation with configurable timeout/retries.
- No unnecessary service calls when an entity already matches the target state.
- Physical output changes immediately become authoritative and synchronize followers.

### Controller modes

- **Mirror ON/OFF** — controller state represents the same group state.
- **Toggle on change** — any valid controller transition toggles the group.
- **Momentary ON** — an ON pulse toggles the group.
- **Momentary OFF** — an OFF pulse toggles the group.
- **Event** — every event-state change toggles the group.
- **Follow output only** — controller never controls the group; it only follows output state.
- Optional per-controller state inversion.
- Optional per-controller state reflection.

### Reliability / recovery

- Startup protection window prevents false commands while integrations restore.
- Offline/unknown transitions never count as physical button presses.
- Controller recovery re-synchronizes to the desired group state.
- Output recovery can either:
  - adopt the physical output state, or
  - enforce the previously desired state.
- Event-driven control with a periodic watchdog as a safety net.
- Persistent last desired state with debounced disk writes.
- Automatic healing of missed controller updates.

### Home Assistant-native entities

Every group creates a virtual device with:

- `light.*` **or** `switch.*` — primary group control.
- `switch.*_synchronization` — enable/disable group synchronization.
- `sensor.*_health` — health state.
- `binary_sensor.*_in_sync` — synchronization status.
- `sensor.*_last_source` — last controller/output that initiated a change (disabled by default).
- `sensor.*_last_latency` — last transaction latency in milliseconds (disabled by default).
- `button.*_sync_now` — force reconciliation.

### Management panel

A full-width admin panel is added to the Home Assistant sidebar:

- KPI summary: groups, healthy/degraded status and controller count.
- Add/edit/delete/enable groups without YAML.
- Entity picker plus optional area metadata for organizing groups.
- Multiple controller modes per group.
- Health overview.
- Live activity / transaction history.
- Non-destructive readiness test.
- Global engine settings.
- JSON backup/export and import/restore.
- Arabic and English interface.
- Native Home Assistant light/dark theme variables.
- Responsive desktop/mobile layout.

### Diagnostics & Repairs

- Privacy-conscious Home Assistant diagnostics download.
- Home Assistant **System Health** integration.
- Repair issues for:
  - missing physical output entities,
  - missing controllers,
  - repeatedly unresponsive physical outputs.

### Service actions

```text
eshtaya_multiway.sync_group
eshtaya_multiway.sync_all
eshtaya_multiway.enable_group
eshtaya_multiway.disable_group
eshtaya_multiway.set_group_state
eshtaya_multiway.test_group
```

## Supported entities

### Physical output

- `switch.*`
- `light.*`
- `input_boolean.*`
- `fan.*`

### Controllers

- `switch.*`
- `light.*`
- `input_boolean.*`
- `binary_sensor.*`
- `button.*`
- `input_button.*`
- `event.*`

State reflection is only available for commandable controller domains.

## Installation with HACS

1. Open **HACS**.
2. Open **Integrations**.
3. Add this repository as a **Custom repository** using category **Integration**.
4. Download **Eshtaya Multi-Way Control**.
5. Restart Home Assistant.
6. Go to **Settings → Devices & services → Add integration**.
7. Search for **Eshtaya Multi-Way Control** and add it.
8. Open **Multi-Way Control** from the sidebar.

## Manual installation

Copy:

```text
custom_components/eshtaya_multiway/
```

to:

```text
/config/custom_components/eshtaya_multiway/
```

Restart Home Assistant and add the integration from **Settings → Devices & services**.

## Recommended wiring

The physical output should be the relay that really powers the lamp/load. Secondary wall switches should preferably have no connected load or use a vendor-provided detached/decoupled mode when available.

The integration is a software control layer; it is not a substitute for electrical protection or code-compliant wiring.

## Architecture & testing

- [Architecture](docs/ARCHITECTURE.md)
- [Field test matrix](docs/TESTING.md)

## Development / validation

The repository contains GitHub Actions for:

- HACS repository validation.
- Home Assistant Hassfest validation.
- Ruff correctness/lint checks.
- Automated tag-to-release packaging.
- Pytest tests using `pytest-homeassistant-custom-component`.

## Arabic summary

**Eshtaya Multi-Way Control** بخليك تعمل فكسل برمجي احترافي داخل Home Assistant بدون أوتوميشن لكل زر. بتحدد خرج رئيسي موصول فعلياً بالإنارة، وبتضيف أي عدد من الأزرار الفرعية، والتكامل يدير المزامنة، منع الـ loops، رجوع الأجهزة من Offline، فحص الصحة، والـ Virtual Entity من مكان واحد.

## License

MIT License. See [LICENSE](LICENSE).
