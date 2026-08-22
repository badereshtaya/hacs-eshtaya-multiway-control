<p align="center">
  <img src="custom_components/eshtaya_multiway/brand/logo.png" alt="Eshtaya Multi-Way Control" width="560">
</p>

<h1 align="center">Eshtaya Multi-Way Control</h1>

<p align="center">
  <strong>Professional Multi-Way switching, domain-native Smart Groups, commissioning, diagnostics and reliability tools for Home Assistant.</strong>
</p>

<p align="center">
  <a href="https://github.com/badereshtaya/hacs-eshtaya-multiway-control/releases"><img src="https://img.shields.io/github/v/release/badereshtaya/hacs-eshtaya-multiway-control?label=release" alt="GitHub release"></a>
  <a href="https://github.com/badereshtaya/hacs-eshtaya-multiway-control/actions"><img src="https://img.shields.io/github/actions/workflow/status/badereshtaya/hacs-eshtaya-multiway-control/tests.yml?label=tests" alt="Tests"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/Home%20Assistant-2026.3%2B-41BDF5" alt="Home Assistant 2026.3+">
</p>

> **Current release:** `3.2.1`  
> **Integration domain:** `eshtaya_multiway`  
> **Repository:** `badereshtaya/hacs-eshtaya-multiway-control`

---

## What is Eshtaya Multi-Way Control?

Eshtaya Multi-Way Control is a Home Assistant helper integration that turns existing Home Assistant entities into a professional control layer for wall switches and logical groups.

It contains **two independent engines**:

| Engine | Purpose | Typical example |
|---|---|---|
| **Multi-Way** | Software-defined 2-way / 3-way / N-way switching | One real living-room light output + wall switches at the entrance and sofa |
| **Smart Groups** | Control many same-domain entities as one intelligent group | All living-room lights, all shutters, all fans, all temperature sensors |

The integration does **not** connect directly to Tuya, Zigbee, KNX, Shelly or any vendor cloud. Your devices continue to be managed by their existing Home Assistant integrations; Eshtaya coordinates the entities that already exist in Home Assistant.

### Why use it?

- No YAML automation is required for normal setup.
- Create and manage everything from a full-width Control Center.
- Build reliable software-defined wall-switch behavior without electrical 2-way wiring.
- Create domain-native groups with the same type as their members.
- Learn real wall switches by pressing them instead of searching through hundreds of entity IDs.
- Detect latency, missing entities, out-of-sync members and unreliable devices.
- Commission a complete home from one management interface.
- Take over compatible Home Assistant Group helpers while keeping the same `entity_id`.

---

# Quick start examples

## Example 1 — Software 2-way wall switch

You have one switch physically connected to the living-room light and another smart wall switch that is not connected to a load.

```text
Living Room Multi-Way

Physical Output
└── switch.living_main

Controllers
├── switch.living_entrance
└── switch.living_sofa

Virtual Control
└── light.living_room_control
```

Result:

```text
Press Main ON       → light ON + all reflected controllers synchronized
Press Entrance OFF  → light OFF + group synchronized
Press Sofa ON       → light ON + group synchronized
```

Rapid presses are handled in order. If a controller changes `OFF → ON → OFF` quickly, the final physical state wins instead of an older transaction restoring the wrong state.

---

## Example 2 — Physical-controller Smart Group

You want one real wall switch to control several lights together.

```text
Controller
└── switch.living_all_button

Members
├── light.living_spots
├── light.living_tv_led
├── light.living_ceiling
└── light.living_wall
```

When the physical controller turns ON, the group sends ON to the members. When it turns OFF, the members turn OFF according to the selected group policy and reliability settings.

---

## Example 3 — Virtual Smart Group

You want one Home Assistant entity that represents all living-room shutters.

```text
cover.living_room_covers
├── cover.living_left
├── cover.living_right
└── cover.living_balcony
```

Because this is a native `cover` group, it is not reduced to ON/OFF. It keeps cover actions such as:

- Open
- Close
- Stop
- Set position
- Tilt, when supported by the members

The same idea applies to Fan, Light, Lock, Media Player, Valve and other supported domains.

---

# Eshtaya Control Center

The integration adds a full-width administration panel designed for both daily use and professional installation.

| Section | What it is for |
|---|---|
| **Dashboard** | Overall health, favorite groups, quick status and shortcuts |
| **Multi-Way** | Create and manage software 2-way / 3-way / N-way wall-switch groups |
| **Smart Groups** | Create domain-native physical or virtual groups |
| **Commissioning** | Area-aware setup, Learn, group discovery, templates and system testing |
| **Health & Diagnostics** | Missing entities, synchronization problems, quality and repair tools |
| **Activity** | Recent transactions, commands, retries and timing information |
| **Settings** | Global behavior, installer options, configuration lock, backup and restore |

The management panel is intended for administrators. Runtime control is still available through normal Home Assistant entities, dashboards, scripts, automations and voice assistants.

---

# Multi-Way engine

Multi-Way is designed for software-defined wall switching around one real output.

## Group structure

Each Multi-Way group can contain:

- One **Physical Output** — the actual relay/light that controls the electrical load.
- Any number of **Controllers** — secondary switches, buttons or events.
- One **Virtual Entity** — a normal Home Assistant `light` or `switch` that represents the complete group.
- Optional **Fallback Output**.

## Controller modes

Each controller can use its own behavior:

| Mode | Behavior |
|---|---|
| **Mirror** | Controller ON means group ON, controller OFF means group OFF |
| **Toggle** | Every state edge toggles the group |
| **Momentary ON** | An activation sends ON |
| **Momentary OFF** | An activation sends OFF |
| **Event** | Event-style controller input |
| **Follow Output** | Controller follows the output but does not drive it |

Additional controller options include inversion and optional state reflection.

## Learn Mode

Instead of manually searching for the entity:

1. Click **Learn** next to the Physical Output or a Controller.
2. Press the real wall switch.
3. Eshtaya watches Home Assistant state changes.
4. Candidate entities are ranked.
5. Select the detected entity.
6. A suitable controller mode is suggested automatically when possible.

The setup form keeps its draft while live Home Assistant updates continue in the background.

## Rapid-input reliability

Multi-Way is designed to handle quick human input correctly:

- Per-group FIFO edge queue.
- Opposite edges are never removed by debounce.
- `ON → OFF` and `OFF → ON` are processed in order.
- Latest physical state wins.
- Old verification tasks cannot overwrite a newer command.
- Home Assistant Context-aware echo protection.
- State-aware cloud echo protection for delayed cloud devices.
- Trailing source reconciliation.
- The source controller is not written back during its own transaction.
- When the output is offline, only the newest desired state is retained.

### Example

```text
Secondary: OFF → ON → OFF quickly

TX 101: ON   → becomes stale
TX 102: OFF  → newest authoritative state

Final Main state: OFF
```

## Performance profiles

| Profile | Best for | Behavior |
|---|---|---|
| **Instant** | Wall switches and normal lighting | Dispatch immediately; verification runs in the background |
| **Balanced** | Devices that need confirmation but should still feel fast | Fast dispatch with main-output confirmation |
| **Safe** | Slow or unreliable devices where certainty is more important than speed | Full output and follower confirmation |

## Authority and recovery

Advanced groups can configure:

- Latest Physical authority.
- Output authority.
- Fallback output.
- Startup protection.
- Retry count and confirmation timeout.
- Output recovery policy.
- Persistent desired state.
- Watchdog / bounded auto-heal.
- No-op suppression when the entity already has the required state.

## End-to-end Test Center

Testing uses the **real group path**, not an isolated fake test.

For each device you can:

- Toggle it.
- Press it when it is a button-style entity.
- Run rapid-toggle stress tests.
- See PASS / FAIL.
- See engine latency and end-to-end latency.
- Inspect recent commands and failures.
- Follow a live transaction timeline.

Example:

```text
19:41:12.081  Entrance → OFF
19:41:12.086  Transaction created
19:41:12.091  Main OFF dispatched
19:41:12.318  Main confirmed OFF

End-to-end: 237 ms
Result: PASS
```

---

# Smart Groups

Smart Groups are a separate engine from Multi-Way. Large group operations therefore do not block the latency-sensitive Multi-Way engine.

A Smart Group can be either:

1. **Physical Controller Group** — a real controller drives a group of entities.
2. **Virtual Group** — Eshtaya creates a new native Home Assistant group entity.

## Supported native group domains

V3.2+ supports the Home Assistant group domains below:

| Domain | Example | Native behavior |
|---|---|---|
| `binary_sensor` | Motion/door status group | Aggregated binary state |
| `button` | Group of button actions | Press members |
| `cover` | Shutters / blinds / doors | Open, close, stop, position, tilt where supported |
| `event` | Event entity group | Native event-group semantics |
| `fan` | Room fan group | On/off, percentage, direction, oscillation where supported |
| `light` | Room lighting group | On/off, brightness, color, color temperature, effects and transition where supported |
| `lock` | Door lock group | Lock / unlock |
| `media_player` | Media-player group | Native media-player group capabilities |
| `notify` | Notification targets | Native notification delivery |
| `sensor` | Temperature / power / other sensor group | Aggregate/statistical sensor behavior |
| `switch` | Relay / switch group | On/off |
| `valve` | Water/gas/other valve group | Open, close, stop and position where supported |

Eshtaya uses Home Assistant's native Group behavior as the base for rich domains, then adds Eshtaya management, health, commissioning and reliability features on top.

## Domain-aware entity filtering

The selected group domain is authoritative.

If you choose:

```text
Domain: cover
```

then the member picker shows only:

```text
cover.*
```

A `cover` member cannot be added to a `fan` group, and a `light` cannot be added to a `switch` group. The same validation is enforced by the backend, so invalid combinations cannot be inserted by bypassing the UI.

## Compatibility modes

### Strict — recommended

In addition to requiring the same domain, Eshtaya checks subtype compatibility where relevant.

Examples:

- `cover` → compatible `device_class` values are kept together.
- `switch`, `lock`, `binary_sensor`, `button`, `media_player`, etc. → device class is considered when available.
- `sensor` → device class and state class are considered; units are handled according to the measurement type instead of blindly mixing unrelated sensors.

### Domain only — advanced

Allows different subtypes inside the **same domain** when you intentionally want that behavior.

It still never allows cross-domain members.

---

# Smart Group behavior and reliability

Depending on the domain, Smart Groups can use:

- Native domain-aware commands.
- Any / All state policy where applicable.
- Controller-only or bidirectional control for suitable ON/OFF-capable groups.
- Instant / Balanced / Safe execution.
- Bounded member verification and retries.
- Physical-input priority.
- Scene Guard.
- Flapping detection.
- Automatic and manual quarantine.
- Per-member command count, failure count and latency.
- Group quality score.
- Maintenance mode.
- Enable / Disable per group.
- Configuration lock.
- Favorites.

## Safe Enable / Disable

Every managed group has a clear Enable / Disable control.

Disabling a group:

```text
Does NOT turn devices off
Does NOT turn devices on
Stops synchronization
Stops retries / auto-heal
Stops queued group processing
```

Re-enabling a group adopts the current member state and resumes monitoring. It does not blindly replay an old requested state.

## Anti-oscillation protection

Smart Groups do not continuously force all members back to the last command by default.

After a group command:

```text
Send command
→ verify members
→ retry for a bounded period if configured
→ report remaining mismatch
→ stop enforcing
```

This prevents a device, automation or person from entering an endless ON/OFF fight with the group watchdog.

Continuous enforcement remains available only as an explicit advanced option.

### Cloud Echo Guard

Some cloud integrations can return a delayed state report without preserving the original Home Assistant Context.

Eshtaya therefore tracks recent expected states at the entity level:

```text
Entity + Expected State + Expiry
```

A delayed report matching Eshtaya's own command is treated as an echo rather than new physical input. An opposite edge is still treated as authoritative input instead of being swallowed.

This protection also reduces feedback when the same entity appears in multiple Smart Groups.

---

# Home Assistant Group Take Over

Compatible Home Assistant Group helpers can be migrated completely into Eshtaya management.

This is **not a copy/import**. It is a transactional takeover.

## Example

Before:

```text
light.living_all
└── Home Assistant Group helper
```

After Take Over:

```text
light.living_all
└── Eshtaya Smart Group
```

The `entity_id` remains the same, so references such as:

```yaml
entity_id: light.living_all
```

continue to work in dashboards, automations, scripts, scenes and voice-assistant integrations.

## Take Over process

```text
1. Read original helper configuration and members
2. Snapshot metadata
3. Reserve the original entity_id
4. Create the Eshtaya native-domain replacement
5. Verify that Eshtaya owns the original entity_id
6. Restore supported registry metadata
7. Delete the original Home Assistant helper
```

If migration fails before the original helper is removed, Eshtaya rolls back instead of leaving a half-migrated group.

Where supported, Take Over preserves details such as:

- Entity ID.
- Name.
- Member order.
- Group policy.
- `hide_members`.
- Area.
- Icon.
- Aliases.
- Labels.
- Custom display name.
- Hidden / disabled state.

Legacy/YAML/runtime groups remain read-only when safe transactional removal is not available.

---

# Commissioning tools

The Commissioning section is designed for installers and larger projects.

## Area-aware setup

Select a Home Assistant Area and Eshtaya prioritizes entities from that room/area instead of showing the entire installation first.

## Auto-pair suggestions

During Multi-Way commissioning, recent compatible physical activity can be used to suggest likely controller/output pairs.

## Templates

Save common group settings as templates, for example:

```text
Template: Tuya Lighting Multi-Way
Performance: Instant
Retry: 1
Authority: Latest Physical
Echo Guard: Enabled
```

Reuse the template in other rooms without rebuilding all advanced settings.

## Clone

Clone an existing group as a starting point. Physical groups intentionally require a new controller instead of silently reusing the old one.

## Full System Test

Run a non-destructive installation-wide test and review group health, missing members and runtime diagnostics from one place.

---

# Health, diagnostics and repair

Eshtaya continuously exposes useful health information instead of hiding problems inside log files.

Possible group states include:

```text
Healthy
Degraded
Out of sync
Main / controller unavailable
Member unavailable
Recovering
Disabled
Maintenance
```

## Missing Entity Repair

If an entity is renamed or removed:

1. The affected group is identified.
2. Health & Diagnostics shows the missing entity.
3. Use the remap/repair workflow.
4. Select the replacement entity.
5. The group configuration is updated without rebuilding the group from scratch.

## Quality and latency

Per-device diagnostics can include:

```text
Commands:       1420
Failures:       2
Last latency:   271 ms
Average quality: 99.8%
Last action:    19:41:12
```

This helps distinguish an Eshtaya engine delay from a slow local device or cloud-backed integration.

---

# Backups, Undo and configuration safety

- Automatic configuration snapshots before destructive changes.
- Undo for normal configuration changes.
- Full platform backup and restore.
- Rollback on failed import/restore.
- Configuration Lock for delivered projects.
- Versioned storage schemas.
- Future unsupported schemas are rejected instead of silently rewritten.
- Completed native-group takeovers are protected from generic Undo/Restore operations that would silently remove the replacement after the original helper has already been intentionally deleted.

---

# Native Home Assistant entities

## Multi-Way group entities

A Multi-Way group can expose:

- Virtual `light` or `switch` control.
- Enabled / synchronization switch.
- Health sensor.
- In-sync binary sensor.
- Last source sensor — disabled by default.
- Latency sensor — disabled by default.
- Sync button.

## Smart Group entities

A Virtual Smart Group exposes a control entity in its selected native domain.

All managed Smart Groups can additionally expose:

- Enabled switch.
- Health sensor.
- Quality sensor.
- Healthy binary sensor.
- Last source sensor — disabled by default.
- Latency sensor — disabled by default.
- Sync button where applicable.

These entities can be used in normal Home Assistant dashboards and automations.

---

# Home Assistant actions

The integration registers actions for automation/script use, including:

```text
eshtaya_multiway.sync_group
eshtaya_multiway.sync_all
eshtaya_multiway.enable_group
eshtaya_multiway.disable_group
eshtaya_multiway.set_group_state
eshtaya_multiway.test_group

eshtaya_multiway.set_smart_group_state
eshtaya_multiway.sync_smart_group
eshtaya_multiway.test_smart_group
```

Most day-to-day control should still use the virtual Home Assistant entities directly. The actions are useful for maintenance, testing and advanced automation flows.

---

# Installation with HACS

## Custom repository

1. Open **HACS → Integrations**.
2. Open the menu and choose **Custom repositories**.
3. Add:

```text
https://github.com/badereshtaya/hacs-eshtaya-multiway-control
```

4. Category: **Integration**.
5. Find **Eshtaya Multi-Way Control**.
6. Download the latest release.
7. Restart Home Assistant.
8. Open **Settings → Devices & services → Add Integration**.
9. Search for **Eshtaya Multi-Way Control**.
10. Add it once.
11. Open **Eshtaya Control Center** from the sidebar.

## Requirements

- Home Assistant **2026.3.0 or newer**.
- HACS is recommended for installation and updates.
- The source entities must already exist in Home Assistant.

---

# Updating

Published versions use GitHub Releases and semantic version tags such as:

```text
v3.2.1
```

After a new GitHub Release is published, HACS can offer it as an update.

---

# Development and repository validation

The repository includes GitHub Actions for:

- HACS validation.
- Hassfest.
- Ruff.
- Pytest with a pinned Home Assistant test environment.
- Release tag/version validation.

Before publishing a release, all validation jobs should be green.

---

# Privacy

Eshtaya Multi-Way Control:

- Requires no Eshtaya cloud account.
- Requires no external API key.
- Makes no direct vendor-cloud connection itself.
- Operates on Home Assistant entities that are already present in your installation.

Always review diagnostics before sharing them publicly, especially if your entity names contain private room, person or project information.

---

# العربية — شرح مبسط

## شو بتعمل الإضافة؟

**Eshtaya Multi-Way Control** هي أداة إدارة متقدمة داخل Home Assistant لشيئين رئيسيين:

### 1. الفكسل البرمجي Multi-Way

إذا عندك زر رئيسي موصول فعليًا بالإنارة، وعندك زر ثاني أو ثالث Smart في أماكن مختلفة، بتقدر تخليهم كلهم يتحكموا بنفس الإنارة مثل فكسل كهرباء حقيقي.

مثال:

```text
إنارة المعيشة

الزر الرئيسي:
switch.living_main

الأزرار الفرعية:
switch.living_entrance
switch.living_sofa
```

إذا كبست أي زر، حالة المجموعة تتغير، والنظام يحافظ على المزامنة ويحمي من الـ loops ومن مشكلة الكبسات السريعة.

مثلاً إذا عملت بسرعة:

```text
تشغيل → إطفاء
```

النظام لازم يعتمد **آخر حالة فعلية**، وما يخلي أمر تشغيل قديم يرجع يشغل الإنارة بعد ما أنت طفيتها.

### 2. Smart Groups

بتقدر تعمل مجموعة من أجهزة من **نفس النوع** وتتحكم فيهم كأنهم جهاز واحد.

مثال إنارة:

```text
light.all_living_room
├── light.living_spots
├── light.living_led
└── light.living_ceiling
```

مثال أباجورات / Covers:

```text
cover.living_room_covers
├── cover.left
├── cover.right
└── cover.balcony
```

مثال مراوح:

```text
fan.bedroom_fans
├── fan.bedroom_1
└── fan.bedroom_2
```

الجروب مش مجرد تشغيل وإطفاء لكل الأنواع؛ النظام يحافظ على خصائص الدومين نفسه. يعني Cover يضل عنده فتح/إغلاق/إيقاف/Position، وFan يضل عنده خصائص المروحة، وLight يضل عنده Brightness/Color وغيرها حسب الأجهزة.

---

## شو أنواع الجروبات المدعومة؟

النظام يدعم:

```text
binary_sensor
button
cover
 event
fan
light
lock
media_player
notify
sensor
switch
valve
```

لما تختار نوع الجروب، الأداة **بتفلتر لحالها** وبتعرضلك فقط الأجهزة المناسبة لنفس الـ domain.

مثلاً إذا اخترت:

```text
Cover
```

ما رح يظهرلك Light أو Switch؛ رح يظهر فقط:

```text
cover.*
```

وفي وضع **Strict** كمان بتحاول الأداة تجمع نفس النوع الفرعي المتوافق، حتى ما تخلط أجهزة غير منطقية مع بعض بالغلط.

---

## نوعين Smart Group

### Virtual Group

الأداة تنشئ Entity جديدة وهمية داخل Home Assistant.

مثلاً:

```text
light.all_living_room
```

لما تشغلها، تشغل أعضاء الجروب. ولما تطفيها، تطفيهم حسب إعدادات الجروب.

### Physical Controller Group

بتحدد زر حقيقي يكون هو المتحكم بالجروب.

مثلاً:

```text
الزر الحقيقي:
switch.living_all_button

الأعضاء:
light.living_1
light.living_2
light.living_3
```

لما تكبس الزر الحقيقي، المجموعة كلها تتصرف حسب إعداداتك.

---

## Learn — تعلم الزر بدون البحث عن Entity ID

جنب الزر الرئيسي أو أي Controller بتضغط:

```text
تعلم
```

بعدها بتروح بتكبس الزر الحقيقي على الحيط.

الأداة تراقب التغييرات وتعرضلك أفضل Entity اكتشفتها، وبتقدر تختارها مباشرة بدون ما تدور بين مئات الـ entities.

---

## Test Center

الاختبار مش وهمي.

لما تعمل Toggle من Test Center، الأمر يمر من **نفس مسار التشغيل الحقيقي** للجروب.

يعني تقدر تتأكد إنه:

```text
الزر الفرعي → الرئيسي → باقي المجموعة
```

كلهم اشتغلوا صح.

وبتشوف كمان:

- PASS / FAIL.
- زمن الاستجابة.
- عدد الأوامر.
- عدد الأخطاء.
- Timeline للعملية.
- Rapid Toggle Test للكبسات السريعة.

---

## سرعة الاستجابة

في 3 أوضاع:

### Instant

الأسرع، ومناسب غالبًا للإنارة وأزرار الحيط.

### Balanced

سريع لكن ينتظر تأكيد أساسي قبل إكمال بعض خطوات المزامنة.

### Safe

أبطأ شوي، لكنه يعمل تأكيدات أكثر ومناسب للأجهزة البطيئة أو غير المستقرة.

> إذا الجهاز نفسه شغال عن طريق Cloud مثل بعض أجهزة Tuya، ممكن جزء من التأخير يكون قبل ما Home Assistant يستقبل التغيير أصلًا. Test Center بساعدك تفرق بين تأخير الجهاز وتأخير محرك Eshtaya.

---

## حماية من التشغيل والإطفاء المتكرر

النظام فيه حماية من مشكلة إن الأجهزة تدخل بحرب:

```text
ON → OFF → ON → OFF
```

بسبب Cloud Echo أو Auto Heal أو Automation ثانية.

الوضع الافتراضي يعمل Verify/Retry لفترة محدودة فقط، وبعدها إذا عضو ظل مختلف يعطيك Warning بدل ما يضل يشغله ويطفيه للأبد.

وفي خيار Advanced اسمه Continuous Enforcement إذا أنت فعلًا بدك تجبر الأعضاء يضلوا مطابقين باستمرار.

---

## تعطيل وتفعيل أي جروب

كل جروب فيه:

```text
تعطيل / تفعيل
```

لما تعطله:

- ما بطفي الأجهزة.
- ما بشغل الأجهزة.
- بس بوقف المزامنة والتحكم التلقائي للجروب.

ولما تفعله مرة ثانية، يقرأ الحالة الحالية ويرجع يراقب بدون ما يفرض حالة قديمة مباشرة.

---

## Take Over لجروبات Home Assistant القديمة

إذا عندك Group معمول أصلًا من Home Assistant، بتقدر تعمل له:

```text
Take Over with Eshtaya
```

إذا الجروب قابل للترحيل، النظام يحاول يحافظ على **نفس Entity ID**.

مثلاً قبل:

```text
light.all_living_room
Home Assistant Group
```

بعد:

```text
light.all_living_room
Eshtaya Smart Group
```

يعني الأوتوميشنز والداشبوردات اللي تستخدم نفس الـ Entity ID ما تحتاج تعدلها فقط لأن إدارة الجروب انتقلت إلى Eshtaya.

العملية معمولة كترحيل آمن: النظام ما بحذف الجروب القديم أول خطوة؛ أولًا يجهز البديل ويتأكد من الاستلام، وبعدها يكمل الحذف.

---

## Commissioning للمشاريع

قسم Commissioning معمول للفني أو لتركيب بيت كامل:

- فلترة حسب الغرفة / Area.
- Learn للأزرار.
- اقتراح أزواج Multi-Way.
- Templates.
- Clone.
- اكتشاف جروبات Home Assistant.
- Full System Test.
- Health overview.

الهدف إنك تقدر تجهز عدد كبير من الغرف والجروبات من مكان واحد بدل ما تعمل Automation منفصلة لكل زر.

---

## Health & Diagnostics

إذا صار عندك جهاز:

```text
unavailable
```

أو Entity انحذفت أو تغير اسمها، الأداة بتوضح أي جروب متأثر.

ومن Repair Center بتقدر تستبدل الـ Entity القديمة بالجديدة بدل ما تحذف الجروب وتعمله من الصفر.

كمان بتشوف معلومات مثل:

```text
Health
Quality
Latency
Last source
Commands
Failures
Out of sync members
```

---

## Backup وUndo

الأداة تعمل Snapshots قبل تغييرات مهمة، وتوفر:

- Undo للتعديلات العادية.
- Backup كامل لإعدادات المنصة.
- Restore.
- Configuration Lock بعد تسليم المشروع.
- حماية من Restore قديم يمسح Take Over مكتمل بالغلط.

---

## الخلاصة بالعربي

إذا بدنا نختصر الأداة بجملة:

> **Eshtaya Multi-Way Control بتحول Home Assistant من مجرد أجهزة منفصلة إلى نظام احترافي لإدارة الفكسلات والجروبات، مع تعلم، اختبار، حماية، تشخيص، وتركيب مركزي للمشاريع.**

للاستخدام اليومي بتتعامل مع Entities طبيعية في Home Assistant. وللإعداد والصيانة بتستخدم **Eshtaya Control Center**.

---

# Support and issues

If you find a reproducible problem, open an issue and include:

- Home Assistant version.
- Eshtaya Multi-Way Control version.
- Group type/domain.
- Relevant entity types.
- A short description of what you expected and what happened.
- Diagnostics or transaction details when safe to share.

Issues: https://github.com/badereshtaya/hacs-eshtaya-multiway-control/issues

---

# License

MIT.
