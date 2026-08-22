/* Eshtaya Multi-Way Control - self-contained Home Assistant management panel. */
const DOMAIN = "eshtaya_multiway";

const I18N = {
  en: {
    title: "Multi-Way Control",
    subtitle: "Professional virtual 2-way / 3-way / multi-way synchronization",
    groups: "Groups", health: "Health", activity: "Activity", settings: "Settings",
    add: "Add group", syncAll: "Sync all", search: "Search groups or entities…",
    healthy: "Healthy", degraded: "Degraded", controllers: "Controllers", enabled: "Enabled",
    output: "Physical output", desired: "Desired", lastSource: "Last source", latency: "Latency",
    sync: "Sync", test: "Test", edit: "Edit", disable: "Disable", enable: "Enable", del: "Delete",
    noGroups: "No multi-way groups yet.", noGroupsHint: "Create your first group and select one physical output plus one or more controllers.",
    groupName: "Group name", virtualType: "Virtual entity type", area: "Area", none: "None",
    controller: "Controller", mode: "Mode", invert: "Invert", reflect: "Mirror state", remove: "Remove",
    addController: "Add controller", behavior: "Advanced behavior", debounce: "Input debounce (ms)",
    autoHeal: "Automatic healing", restorePolicy: "Output restore policy", adopt: "Adopt physical output state", enforce: "Enforce last desired state",
    timeout: "Command timeout override (seconds)", retries: "Retry override", inherit: "Use global setting",
    save: "Save", cancel: "Cancel", export: "Export backup", import: "Import backup", replace: "Replace all existing groups",
    importData: "Paste exported JSON here", globalSettings: "Global engine settings", startup: "Startup protection (seconds)",
    watchdog: "Safety watchdog interval (seconds)", commandTimeout: "Command confirmation timeout (seconds)", maxRetries: "Command retries",
    historySize: "Activity history size", repairThreshold: "Failures before Repair issue", confirmOutput: "Confirm output state before syncing followers",
    saveSettings: "Save settings", version: "Version", ready: "Engine ready", status: "Status", entity: "Entity",
    role: "Role", state: "State", result: "Result", event: "Event", time: "Time", transaction: "Transaction",
    modeMirror: "Mirror ON/OFF", modeToggle: "Toggle on every change", modeMomentaryOn: "Toggle on ON pulse",
    modeMomentaryOff: "Toggle on OFF pulse", modeEvent: "Toggle on event change", modeFollow: "Follow output only",
    light: "Light", sw: "Switch", confirmDelete: "Delete this group permanently?", testTitle: "Readiness test",
    close: "Close", copied: "Backup generated", saved: "Saved successfully", failed: "Operation failed",
    missing: "Missing", offline: "Offline", outOfSync: "Out of sync", recovering: "Recovering", disabled: "Disabled",
    allGood: "All configured groups are healthy.", live: "Live state", refresh: "Refresh"
  },
  ar: {
    title: "التحكم بالفكسل Multi-Way",
    subtitle: "نظام احترافي للفكسل البرمجي 2-Way / 3-Way / Multi-Way",
    groups: "المجموعات", health: "الصحة", activity: "السجل", settings: "الإعدادات",
    add: "إضافة فكسل", syncAll: "مزامنة الكل", search: "ابحث بالاسم أو الكيان…",
    healthy: "سليم", degraded: "بحاجة انتباه", controllers: "الأزرار الفرعية", enabled: "مفعّل",
    output: "الخرج الرئيسي", desired: "الحالة المطلوبة", lastSource: "آخر مصدر", latency: "زمن الاستجابة",
    sync: "مزامنة", test: "فحص", edit: "تعديل", disable: "تعطيل", enable: "تفعيل", del: "حذف",
    noGroups: "لا يوجد مجموعات فكسل بعد.", noGroupsHint: "أنشئ أول مجموعة وحدد الخرج الفعلي وزر فرعي واحد أو أكثر.",
    groupName: "اسم المجموعة", virtualType: "نوع الكيان الافتراضي", area: "المنطقة", none: "بدون",
    controller: "الزر الفرعي", mode: "النمط", invert: "عكس الحالة", reflect: "مزامنة الحالة", remove: "حذف",
    addController: "إضافة زر فرعي", behavior: "إعدادات متقدمة", debounce: "منع الاهتزاز (ms)",
    autoHeal: "إصلاح تلقائي", restorePolicy: "سياسة رجوع الخرج", adopt: "اعتماد الحالة الفعلية للخرج", enforce: "فرض آخر حالة مطلوبة",
    timeout: "مهلة الأمر الخاصة بالمجموعة (ثانية)", retries: "إعادة المحاولة الخاصة", inherit: "استخدام الإعداد العام",
    save: "حفظ", cancel: "إلغاء", export: "تصدير نسخة احتياطية", import: "استيراد نسخة", replace: "استبدال كل المجموعات الحالية",
    importData: "الصق JSON المصدر هنا", globalSettings: "إعدادات المحرك العامة", startup: "حماية بدء التشغيل (ثانية)",
    watchdog: "فترة فحص الأمان (ثانية)", commandTimeout: "مهلة تأكيد الأمر (ثانية)", maxRetries: "عدد إعادة المحاولة",
    historySize: "حجم سجل النشاط", repairThreshold: "عدد الفشل قبل إنشاء Repair", confirmOutput: "تأكيد حالة الخرج قبل مزامنة الأزرار",
    saveSettings: "حفظ الإعدادات", version: "الإصدار", ready: "المحرك جاهز", status: "الحالة", entity: "الكيان",
    role: "الدور", state: "الحالة", result: "النتيجة", event: "الحدث", time: "الوقت", transaction: "المعاملة",
    modeMirror: "نسخ ON/OFF", modeToggle: "Toggle مع كل تغيير", modeMomentaryOn: "Toggle عند نبضة ON",
    modeMomentaryOff: "Toggle عند نبضة OFF", modeEvent: "Toggle عند تغير Event", modeFollow: "يتبع الخرج فقط",
    light: "إضاءة", sw: "زر", confirmDelete: "حذف هذه المجموعة نهائياً؟", testTitle: "فحص الجاهزية",
    close: "إغلاق", copied: "تم تجهيز النسخة", saved: "تم الحفظ بنجاح", failed: "فشلت العملية",
    missing: "مفقود", offline: "أوفلاين", outOfSync: "غير متزامن", recovering: "يستعيد الاتصال", disabled: "معطل",
    allGood: "كل مجموعات الفكسل تعمل بشكل سليم.", live: "الحالة المباشرة", refresh: "تحديث"
  }
};

class EshtayaMultiWayPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._initialized = false;
    this._loading = true;
    this._data = { groups: [], summary: {}, settings: {}, version: "" };
    this._activity = [];
    this._entities = [];
    this._areas = [];
    this._tab = "groups";
    this._search = "";
    this._editing = null;
    this._testResult = null;
    this._toastTimer = null;
  }

  set hass(value) {
    this._hass = value;
    if (!this._initialized) {
      this._initialized = true;
      this._bootstrap();
    }
  }
  get hass() { return this._hass; }
  set panel(value) { this._panel = value; }
  set narrow(value) { this._narrow = value; }

  get lang() {
    const lang = (this._hass?.language || this._hass?.locale?.language || "en").toLowerCase();
    return lang.startsWith("ar") ? "ar" : "en";
  }
  t(key) { return I18N[this.lang][key] || I18N.en[key] || key; }
  esc(value) {
    return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  }

  async _bootstrap() {
    try {
      await Promise.all([this._loadCatalog(), this._refresh(true)]);
      try {
        this._unsubscribe = await this._hass.connection.subscribeEvents(() => this._refresh(false), `${DOMAIN}_event`);
      } catch (_) { /* polling-free fallback: manual refresh remains available */ }
    } finally {
      this._loading = false;
      this._render();
    }
  }

  async _loadCatalog() {
    try {
      const [entities, areas] = await Promise.all([
        this._hass.callWS({ type: "config/entity_registry/list" }),
        this._hass.callWS({ type: "config/area_registry/list" })
      ]);
      const allowed = new Set(["switch", "light", "input_boolean", "fan", "binary_sensor", "button", "input_button", "event"]);
      this._entities = entities
        .filter(e => allowed.has((e.entity_id || "").split(".")[0]))
        .sort((a,b) => (a.entity_id || "").localeCompare(b.entity_id || ""));
      this._areas = (areas || []).sort((a,b) => (a.name || "").localeCompare(b.name || ""));
    } catch (_) {
      this._entities = Object.keys(this._hass.states || {}).map(entity_id => ({ entity_id })).sort((a,b)=>a.entity_id.localeCompare(b.entity_id));
      this._areas = [];
    }
  }

  async _refresh(includeActivity = false) {
    if (!this._hass) return;
    try {
      const data = await this._hass.callWS({ type: `${DOMAIN}/list` });
      this._data = data;
      if (includeActivity || this._tab === "activity") {
        const result = await this._hass.callWS({ type: `${DOMAIN}/activity`, limit: 200 });
        this._activity = result.activity || [];
      }
      if (!this._loading) this._render();
    } catch (err) {
      this._toast(err.message || this.t("failed"), "error");
    }
  }

  _render() {
    const rtl = this.lang === "ar";
    const summary = this._data.summary || {};
    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style>
      <main class="app" dir="${rtl ? "rtl" : "ltr"}">
        <header class="hero">
          <div>
            <div class="eyebrow">ESHTAYA SMART · v${this.esc(this._data.version || "2.0.0")}</div>
            <h1>${this.t("title")}</h1>
            <p>${this.t("subtitle")}</p>
          </div>
          <div class="hero-actions">
            <button class="secondary" data-action="refresh"><ha-icon icon="mdi:refresh"></ha-icon>${this.t("refresh")}</button>
            <button class="secondary" data-action="sync-all"><ha-icon icon="mdi:sync"></ha-icon>${this.t("syncAll")}</button>
            <button class="primary" data-action="add"><ha-icon icon="mdi:plus"></ha-icon>${this.t("add")}</button>
          </div>
        </header>

        <section class="stats">
          ${this._statCard("mdi:electric-switch", summary.groups ?? 0, this.t("groups"), "neutral")}
          ${this._statCard("mdi:check-decagram", summary.healthy ?? 0, this.t("healthy"), "good")}
          ${this._statCard("mdi:alert-circle-outline", summary.degraded ?? 0, this.t("degraded"), (summary.degraded||0) ? "warn" : "good")}
          ${this._statCard("mdi:gesture-tap-button", summary.controllers ?? 0, this.t("controllers"), "neutral")}
        </section>

        <nav class="tabs">
          ${["groups","health","activity","settings"].map(tab => `<button class="tab ${this._tab===tab?"active":""}" data-tab="${tab}">${this.t(tab)}</button>`).join("")}
        </nav>

        <section class="content">
          ${this._loading ? `<div class="loading"><span></span></div>` : this._renderTab()}
        </section>

        ${this._renderEditorDialog()}
        ${this._renderTestDialog()}
        <div id="toast" class="toast"></div>
      </main>`;
    this._bind();
  }

  _renderTab() {
    if (this._tab === "health") return this._renderHealth();
    if (this._tab === "activity") return this._renderActivity();
    if (this._tab === "settings") return this._renderSettings();
    return this._renderGroups();
  }

  _statCard(icon, value, label, tone) {
    return `<article class="stat ${tone}"><div class="stat-icon"><ha-icon icon="${icon}"></ha-icon></div><div><strong>${value}</strong><span>${label}</span></div></article>`;
  }

  _renderGroups() {
    const q = this._search.trim().toLowerCase();
    const groups = (this._data.groups || []).filter(g => !q || [g.name,g.output,...g.controllers.map(c=>c.entity_id)].join(" ").toLowerCase().includes(q));
    return `
      <div class="toolbar">
        <label class="search"><ha-icon icon="mdi:magnify"></ha-icon><input id="search" value="${this.esc(this._search)}" placeholder="${this.t("search")}"></label>
        <span class="engine ${this._data.summary?.ready ? "ready" : "waiting"}"><span></span>${this.t("ready")}: ${this._data.summary?.ready ? "YES" : "NO"}</span>
      </div>
      ${groups.length ? `<div class="group-grid">${groups.map(g=>this._groupCard(g)).join("")}</div>` : `<div class="empty"><ha-icon icon="mdi:electric-switch-closed"></ha-icon><h2>${this.t("noGroups")}</h2><p>${this.t("noGroupsHint")}</p><button class="primary" data-action="add">${this.t("add")}</button></div>`}
    `;
  }

  _groupCard(g) {
    const r = g.runtime || {};
    const health = r.health || "unknown";
    const healthLabel = this._healthLabel(health);
    const desired = r.desired_state || "—";
    const outputMember = (r.members || []).find(m=>m.role === "output");
    return `<article class="group-card ${g.enabled ? "" : "disabled-card"}">
      <div class="card-head">
        <div class="group-title"><div class="group-icon"><ha-icon icon="${g.virtual_type === "switch" ? "mdi:electric-switch" : "mdi:light-switch"}"></ha-icon></div><div><h3>${this.esc(g.name)}</h3><small>${this.esc(g.id.slice(0,10))} · ${g.virtual_type}</small></div></div>
        <span class="badge health-${this.esc(health)}"><span></span>${healthLabel}</span>
      </div>
      <div class="state-line">
        <div><small>${this.t("desired")}</small><strong class="state-${desired}">${desired.toUpperCase()}</strong></div>
        <div><small>${this.t("output")}</small><strong>${this.esc(outputMember?.state || "missing")}</strong></div>
        <div><small>${this.t("latency")}</small><strong>${r.last_latency_ms == null ? "—" : `${r.last_latency_ms} ms`}</strong></div>
      </div>
      <div class="output-box"><span>${this.t("output")}</span><code>${this.esc(g.output)}</code><b class="dot ${this._stateTone(outputMember?.state)}"></b></div>
      <div class="controllers"><div class="section-label">${this.t("controllers")} · ${g.controllers.length}</div>${g.controllers.map(c=>{
        const m=(r.members||[]).find(x=>x.entity_id===c.entity_id); return `<div class="member"><span class="dot ${this._stateTone(m?.state)}"></span><code>${this.esc(c.entity_id)}</code><span class="mode">${this._modeLabel(c.mode)}</span></div>`;
      }).join("")}</div>
      <div class="meta"><span><ha-icon icon="mdi:gesture-tap-button"></ha-icon>${this.t("lastSource")}: <b>${this.esc(r.last_source || "—")}</b></span></div>
      <div class="card-actions">
        <button data-action="sync" data-id="${g.id}"><ha-icon icon="mdi:sync"></ha-icon>${this.t("sync")}</button>
        <button data-action="test" data-id="${g.id}"><ha-icon icon="mdi:stethoscope"></ha-icon>${this.t("test")}</button>
        <button data-action="edit" data-id="${g.id}"><ha-icon icon="mdi:pencil"></ha-icon>${this.t("edit")}</button>
        <button data-action="toggle-enabled" data-id="${g.id}" data-enabled="${g.enabled}"><ha-icon icon="mdi:${g.enabled?"pause":"play"}"></ha-icon>${g.enabled?this.t("disable"):this.t("enable")}</button>
        <button class="danger-link" data-action="delete" data-id="${g.id}"><ha-icon icon="mdi:delete-outline"></ha-icon>${this.t("del")}</button>
      </div>
    </article>`;
  }

  _renderHealth() {
    const groups = this._data.groups || [];
    const unhealthy = groups.filter(g => g.runtime?.health !== "healthy" && g.runtime?.health !== "disabled");
    return `<div class="panel-section">
      ${unhealthy.length === 0 ? `<div class="success-banner"><ha-icon icon="mdi:check-decagram"></ha-icon><div><strong>${this.t("allGood")}</strong><span>${groups.length} ${this.t("groups")}</span></div></div>` : ""}
      <div class="table-wrap"><table><thead><tr><th>${this.t("groups")}</th><th>${this.t("status")}</th><th>${this.t("output")}</th><th>${this.t("controllers")}</th><th>${this.t("lastSource")}</th><th>${this.t("latency")}</th></tr></thead><tbody>
      ${groups.map(g=>`<tr><td><b>${this.esc(g.name)}</b><small>${this.esc(g.id.slice(0,10))}</small></td><td><span class="badge health-${this.esc(g.runtime?.health)}"><span></span>${this._healthLabel(g.runtime?.health)}</span></td><td><code>${this.esc(g.output)}</code></td><td>${g.controllers.length}</td><td><code>${this.esc(g.runtime?.last_source || "—")}</code></td><td>${g.runtime?.last_latency_ms == null ? "—" : `${g.runtime.last_latency_ms} ms`}</td></tr>`).join("")}
      </tbody></table></div>
    </div>`;
  }

  _renderActivity() {
    return `<div class="panel-section"><div class="section-head"><div><h2>${this.t("activity")}</h2><p>${this.t("live")}</p></div><button class="secondary" data-action="refresh-activity"><ha-icon icon="mdi:refresh"></ha-icon>${this.t("refresh")}</button></div>
      <div class="table-wrap"><table><thead><tr><th>${this.t("time")}</th><th>${this.t("groups")}</th><th>${this.t("event")}</th><th>${this.t("lastSource")}</th><th>${this.t("state")}</th><th>${this.t("result")}</th><th>${this.t("latency")}</th><th>${this.t("transaction")}</th></tr></thead><tbody>
      ${(this._activity||[]).map(a=>{const g=(this._data.groups||[]).find(x=>x.id===a.group_id); return `<tr><td>${this._fmtTime(a.timestamp)}</td><td>${this.esc(g?.name || "—")}</td><td>${this.esc(a.event)}</td><td><code>${this.esc(a.source || "—")}</code></td><td>${this.esc(a.action || "—")}</td><td><span class="result result-${this.esc(a.result)}">${this.esc(a.result)}</span></td><td>${a.latency_ms == null ? "—" : `${a.latency_ms} ms`}</td><td><code>${this.esc(a.transaction_id || "—")}</code></td></tr>`}).join("") || `<tr><td colspan="8" class="muted">—</td></tr>`}
      </tbody></table></div></div>`;
  }

  _renderSettings() {
    const s = this._data.settings || {};
    return `<div class="settings-grid">
      <form id="settings-form" class="settings-card">
        <div class="section-head"><div><h2>${this.t("globalSettings")}</h2><p>Transaction engine · watchdog · recovery</p></div><span class="version-chip">${this.t("version")} ${this.esc(this._data.version)}</span></div>
        <div class="form-grid two">
          ${this._numberField("startup_delay", this.t("startup"), s.startup_delay, 0, 120, 1)}
          ${this._numberField("watchdog_interval", this.t("watchdog"), s.watchdog_interval, 10, 3600, 1)}
          ${this._numberField("command_timeout", this.t("commandTimeout"), s.command_timeout, .5, 30, .5)}
          ${this._numberField("max_retries", this.t("maxRetries"), s.max_retries, 0, 5, 1)}
          ${this._numberField("history_size", this.t("historySize"), s.history_size, 20, 1000, 10)}
          ${this._numberField("repair_threshold", this.t("repairThreshold"), s.repair_threshold, 1, 20, 1)}
        </div>
        <label class="check-row"><input name="confirm_output" type="checkbox" ${s.confirm_output?"checked":""}><span><b>${this.t("confirmOutput")}</b><small>Main-first transaction safety</small></span></label>
        <div class="form-actions"><button class="primary" type="submit">${this.t("saveSettings")}</button></div>
      </form>
      <section class="settings-card">
        <div class="section-head"><div><h2>Backup / Restore</h2><p>Portable JSON configuration</p></div></div>
        <textarea id="backup-data" rows="14" placeholder="${this.t("importData")}"></textarea>
        <label class="check-row"><input id="replace-import" type="checkbox"><span><b>${this.t("replace")}</b><small>Use with care</small></span></label>
        <div class="form-actions split"><button class="secondary" data-action="export" type="button"><ha-icon icon="mdi:download"></ha-icon>${this.t("export")}</button><button class="primary" data-action="import" type="button"><ha-icon icon="mdi:upload"></ha-icon>${this.t("import")}</button></div>
      </section>
    </div>`;
  }

  _numberField(name,label,value,min,max,step) {
    return `<label class="field"><span>${label}</span><input name="${name}" type="number" value="${this.esc(value)}" min="${min}" max="${max}" step="${step}" required></label>`;
  }

  _renderEditorDialog() {
    const g = this._editing;
    if (!g) return `<dialog id="editor"></dialog>`;
    const behavior = { debounce_ms:180, auto_heal:true, output_restore_policy:"adopt", command_timeout:null, max_retries:null, ...(g.behavior||{}) };
    return `<dialog id="editor" class="modal"><form id="group-form" method="dialog">
      <div class="modal-head"><div><h2>${g.id ? this.t("edit") : this.t("add")}</h2><p>${g.id ? this.esc(g.name) : "Virtual Multi-Way Group"}</p></div><button type="button" class="icon-btn" data-action="close-editor"><ha-icon icon="mdi:close"></ha-icon></button></div>
      <div class="modal-body">
        <div class="form-grid two"><label class="field"><span>${this.t("groupName")}</span><input name="name" value="${this.esc(g.name||"")}" required maxlength="100"></label>
        <label class="field"><span>${this.t("virtualType")}</span><select name="virtual_type"><option value="light" ${g.virtual_type!=="switch"?"selected":""}>${this.t("light")}</option><option value="switch" ${g.virtual_type==="switch"?"selected":""}>${this.t("sw")}</option></select></label></div>
        <div class="form-grid two"><label class="field"><span>${this.t("output")}</span><input name="output" list="output-entities" value="${this.esc(g.output||"")}" required placeholder="switch.living_main"></label>
        <label class="field"><span>${this.t("area")}</span><select name="area_id"><option value="">${this.t("none")}</option>${this._areas.map(a=>`<option value="${this.esc(a.area_id)}" ${g.area_id===a.area_id?"selected":""}>${this.esc(a.name)}</option>`).join("")}</select></label></div>
        ${this._entityDatalist("output-entities", new Set(["switch","light","input_boolean","fan"]))}
        ${this._entityDatalist("controller-entities", new Set(["switch","light","input_boolean","binary_sensor","button","input_button","event"]))}
        <div class="controllers-editor"><div class="section-head"><div><h3>${this.t("controllers")}</h3><p>Mirror, toggle, pulse, event or follower modes</p></div><button type="button" class="secondary small" data-action="add-controller"><ha-icon icon="mdi:plus"></ha-icon>${this.t("addController")}</button></div>
        <div id="controller-rows">${(g.controllers||[]).map((c,i)=>this._controllerRow(c,i)).join("")}</div></div>
        <details class="advanced"><summary><ha-icon icon="mdi:tune-variant"></ha-icon>${this.t("behavior")}</summary><div class="advanced-body">
          <div class="form-grid two"><label class="field"><span>${this.t("debounce")}</span><input name="debounce_ms" type="number" min="0" max="5000" step="10" value="${this.esc(behavior.debounce_ms)}"></label>
          <label class="field"><span>${this.t("restorePolicy")}</span><select name="output_restore_policy"><option value="adopt" ${behavior.output_restore_policy!=="enforce"?"selected":""}>${this.t("adopt")}</option><option value="enforce" ${behavior.output_restore_policy==="enforce"?"selected":""}>${this.t("enforce")}</option></select></label></div>
          <div class="form-grid two"><label class="field"><span>${this.t("timeout")}</span><input name="command_timeout" type="number" min="0.5" max="30" step="0.5" value="${behavior.command_timeout ?? ""}" placeholder="${this.t("inherit")}"></label>
          <label class="field"><span>${this.t("retries")}</span><input name="max_retries" type="number" min="0" max="5" step="1" value="${behavior.max_retries ?? ""}" placeholder="${this.t("inherit")}"></label></div>
          <label class="check-row"><input name="auto_heal" type="checkbox" ${behavior.auto_heal!==false?"checked":""}><span><b>${this.t("autoHeal")}</b><small>Periodic safety reconciliation</small></span></label>
        </div></details>
      </div>
      <div class="modal-actions"><button type="button" class="secondary" data-action="close-editor">${this.t("cancel")}</button><button type="submit" class="primary">${this.t("save")}</button></div>
    </form></dialog>`;
  }

  _controllerRow(c,i) {
    return `<div class="controller-row" data-controller-row>
      <div class="controller-index">${i+1}</div><label class="field grow"><span>${this.t("controller")}</span><input data-field="entity_id" list="controller-entities" value="${this.esc(c.entity_id||"")}" required placeholder="switch.living_secondary"></label>
      <label class="field mode-field"><span>${this.t("mode")}</span><select data-field="mode">${this._modeOptions(c.mode)}</select></label>
      <label class="mini-check" title="${this.t("invert")}"><input data-field="invert" type="checkbox" ${c.invert?"checked":""}><span>${this.t("invert")}</span></label>
      <label class="mini-check" title="${this.t("reflect")}"><input data-field="reflect_state" type="checkbox" ${c.reflect_state?"checked":""}><span>${this.t("reflect")}</span></label>
      <button type="button" class="icon-btn danger-link" data-action="remove-controller" data-index="${i}"><ha-icon icon="mdi:delete-outline"></ha-icon></button>
    </div>`;
  }

  _modeOptions(selected) {
    const modes = [
      ["mirror",this.t("modeMirror")],["toggle",this.t("modeToggle")],["momentary_on",this.t("modeMomentaryOn")],
      ["momentary_off",this.t("modeMomentaryOff")],["event",this.t("modeEvent")],["follow_output",this.t("modeFollow")]
    ];
    return modes.map(([v,l])=>`<option value="${v}" ${selected===v?"selected":""}>${l}</option>`).join("");
  }

  _entityDatalist(id, domains) {
    return `<datalist id="${id}">${this._entities.filter(e=>domains.has((e.entity_id||"").split(".")[0])).map(e=>`<option value="${this.esc(e.entity_id)}">${this.esc(e.name || e.original_name || "")}</option>`).join("")}</datalist>`;
  }

  _renderTestDialog() {
    const r = this._testResult;
    if (!r) return `<dialog id="test-dialog"></dialog>`;
    return `<dialog id="test-dialog" class="modal small-modal"><div class="modal-head"><div><h2>${this.t("testTitle")}</h2><p>${this.esc(r.name)}</p></div><button type="button" class="icon-btn" data-action="close-test"><ha-icon icon="mdi:close"></ha-icon></button></div><div class="modal-body"><div class="test-health badge health-${this.esc(r.health)}">${this._healthLabel(r.health)}</div><div class="test-list">${r.entities.map(e=>`<div><span class="dot ${this._stateTone(e.state)}"></span><code>${this.esc(e.entity_id)}</code><b>${this.esc(e.state)}</b><small>${this.esc(e.role)} · ${e.commandable?"commandable":"read-only"}</small></div>`).join("")}</div></div><div class="modal-actions"><button class="primary" data-action="close-test">${this.t("close")}</button></div></dialog>`;
  }

  _bind() {
    this.shadowRoot.querySelectorAll("[data-tab]").forEach(btn=>btn.addEventListener("click", async()=>{
      this._tab = btn.dataset.tab; if (this._tab === "activity") await this._refresh(true); else this._render();
    }));
    this.shadowRoot.querySelectorAll("[data-action]").forEach(btn=>btn.addEventListener("click", e=>this._action(e.currentTarget)));
    const search = this.shadowRoot.getElementById("search");
    if (search) search.addEventListener("input", e=>{ this._search=e.target.value; const pos=e.target.selectionStart; this._render(); const n=this.shadowRoot.getElementById("search"); if(n){n.focus();n.setSelectionRange(pos,pos);} });
    const settingsForm = this.shadowRoot.getElementById("settings-form");
    if (settingsForm) settingsForm.addEventListener("submit", e=>{e.preventDefault();this._saveSettings(settingsForm);});
    const groupForm = this.shadowRoot.getElementById("group-form");
    if (groupForm) groupForm.addEventListener("submit", e=>{e.preventDefault();this._saveGroup(groupForm);});
    if (this._editing) queueMicrotask(()=>this.shadowRoot.getElementById("editor")?.showModal());
    if (this._testResult) queueMicrotask(()=>this.shadowRoot.getElementById("test-dialog")?.showModal());
  }

  async _action(btn) {
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    try {
      if (action === "add") return this._openEditor(null);
      if (action === "edit") return this._openEditor((this._data.groups||[]).find(g=>g.id===id));
      if (action === "close-editor") { this._editing=null; return this._render(); }
      if (action === "close-test") { this._testResult=null; return this._render(); }
      if (action === "refresh") return await this._refresh(this._tab==="activity");
      if (action === "refresh-activity") return await this._refresh(true);
      if (action === "sync-all") { await this._hass.callWS({type:`${DOMAIN}/sync_all`}); this._toast(this.t("saved")); return await this._refresh(false); }
      if (action === "sync") { await this._hass.callWS({type:`${DOMAIN}/sync`,group_id:id}); this._toast(this.t("saved")); return await this._refresh(false); }
      if (action === "test") { this._testResult=await this._hass.callWS({type:`${DOMAIN}/test`,group_id:id}); return this._render(); }
      if (action === "toggle-enabled") { await this._hass.callWS({type:`${DOMAIN}/set_enabled`,group_id:id,enabled:btn.dataset.enabled!=="true"}); return await this._refresh(false); }
      if (action === "delete") { if(confirm(this.t("confirmDelete"))){await this._hass.callWS({type:`${DOMAIN}/delete`,group_id:id});this._toast(this.t("saved"));await this._refresh(false);} return; }
      if (action === "add-controller") return this._modifyControllers("add");
      if (action === "remove-controller") return this._modifyControllers("remove", Number(btn.dataset.index));
      if (action === "export") return await this._export();
      if (action === "import") return await this._import();
    } catch (err) { this._toast(err.message || this.t("failed"), "error"); }
  }

  _openEditor(group) {
    this._editing = group ? JSON.parse(JSON.stringify(group)) : {
      id:null,name:"",output:"",controllers:[{entity_id:"",mode:"mirror",invert:false,reflect_state:true}],enabled:true,virtual_type:"light",area_id:null,
      behavior:{debounce_ms:180,auto_heal:true,output_restore_policy:"adopt",command_timeout:null,max_retries:null}
    };
    this._render();
  }

  _captureDraft() {
    const form=this.shadowRoot.getElementById("group-form"); if(!form||!this._editing)return;
    const fd=new FormData(form);
    this._editing.name=fd.get("name")||""; this._editing.output=fd.get("output")||""; this._editing.virtual_type=fd.get("virtual_type")||"light"; this._editing.area_id=fd.get("area_id")||null;
    this._editing.controllers=[...this.shadowRoot.querySelectorAll("[data-controller-row]")].map(row=>({entity_id:row.querySelector('[data-field="entity_id"]').value,mode:row.querySelector('[data-field="mode"]').value,invert:row.querySelector('[data-field="invert"]').checked,reflect_state:row.querySelector('[data-field="reflect_state"]').checked}));
    this._editing.behavior={debounce_ms:Number(fd.get("debounce_ms")||180),auto_heal:fd.get("auto_heal")==="on",output_restore_policy:fd.get("output_restore_policy")||"adopt",command_timeout:fd.get("command_timeout")===""?null:Number(fd.get("command_timeout")),max_retries:fd.get("max_retries")===""?null:Number(fd.get("max_retries"))};
  }

  _modifyControllers(kind,index) {
    this._captureDraft();
    if(kind==="add") this._editing.controllers.push({entity_id:"",mode:"mirror",invert:false,reflect_state:true});
    else if(this._editing.controllers.length>1) this._editing.controllers.splice(index,1);
    this._render();
  }

  async _saveGroup(form) {
    if(!form.reportValidity())return;
    this._captureDraft();
    const payload={name:this._editing.name.trim(),output:this._editing.output.trim(),controllers:this._editing.controllers.map(c=>({...c,entity_id:c.entity_id.trim()})),enabled:this._editing.enabled!==false,virtual_type:this._editing.virtual_type,area_id:this._editing.area_id,behavior:this._editing.behavior};
    try {
      if(this._editing.id) await this._hass.callWS({type:`${DOMAIN}/update`,group_id:this._editing.id,...payload}); else await this._hass.callWS({type:`${DOMAIN}/create`,...payload});
      this._editing=null; this._toast(this.t("saved")); await this._refresh(false);
    } catch(err){this._toast(err.message||this.t("failed"),"error");}
  }

  async _saveSettings(form) {
    const fd=new FormData(form);
    const settings={startup_delay:Number(fd.get("startup_delay")),watchdog_interval:Number(fd.get("watchdog_interval")),command_timeout:Number(fd.get("command_timeout")),max_retries:Number(fd.get("max_retries")),history_size:Number(fd.get("history_size")),repair_threshold:Number(fd.get("repair_threshold")),confirm_output:fd.get("confirm_output")==="on"};
    try{await this._hass.callWS({type:`${DOMAIN}/update_settings`,settings});this._toast(this.t("saved"));await this._refresh(false);}catch(err){this._toast(err.message||this.t("failed"),"error");}
  }

  async _export() {
    const data=await this._hass.callWS({type:`${DOMAIN}/export`});
    const text=JSON.stringify(data,null,2); const area=this.shadowRoot.getElementById("backup-data"); if(area)area.value=text;
    const blob=new Blob([text],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`eshtaya-multiway-backup-${new Date().toISOString().slice(0,10)}.json`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); this._toast(this.t("copied"));
  }

  async _import() {
    const area=this.shadowRoot.getElementById("backup-data"); const text=area?.value?.trim(); if(!text)return;
    let data; try{data=JSON.parse(text);}catch(_){return this._toast("Invalid JSON","error");}
    const replace=this.shadowRoot.getElementById("replace-import")?.checked||false;
    if(replace&&!confirm(this.t("replace")))return;
    await this._hass.callWS({type:`${DOMAIN}/import`,data,replace}); this._toast(this.t("saved")); await this._refresh(false);
  }

  _healthLabel(h) { return ({healthy:this.t("healthy"),degraded:this.t("degraded"),disabled:this.t("disabled"),output_offline:this.t("offline"),missing_output:this.t("missing"),out_of_sync:this.t("outOfSync"),recovering:this.t("recovering")})[h] || h || "—"; }
  _stateTone(s) { if(s==="on")return "on"; if(s==="off")return "off"; if(s==="unavailable"||s==="unknown")return "offline"; return "missing"; }
  _modeLabel(m) { return ({mirror:this.t("modeMirror"),toggle:this.t("modeToggle"),momentary_on:this.t("modeMomentaryOn"),momentary_off:this.t("modeMomentaryOff"),event:this.t("modeEvent"),follow_output:this.t("modeFollow")})[m]||m; }
  _fmtTime(ts) { try{return new Intl.DateTimeFormat(this.lang,{dateStyle:"short",timeStyle:"medium"}).format(new Date(ts));}catch(_){return ts||"—";} }
  _toast(message,type="success") { const t=this.shadowRoot?.getElementById("toast"); if(!t)return; clearTimeout(this._toastTimer); t.textContent=message; t.className=`toast show ${type}`; this._toastTimer=setTimeout(()=>{t.className="toast";},3500); }

  _styles() { return `
    :host{display:block;min-height:100%;background:var(--primary-background-color);color:var(--primary-text-color);font-family:var(--paper-font-body1_-_font-family,system-ui,-apple-system,sans-serif)}*{box-sizing:border-box}.app{padding:26px 28px 50px;max-width:1800px;margin:auto}.hero{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:24px}.eyebrow{font-size:11px;font-weight:800;letter-spacing:.16em;color:var(--primary-color);margin-bottom:8px}.hero h1{font-size:32px;line-height:1.1;margin:0 0 8px;font-weight:800}.hero p{margin:0;color:var(--secondary-text-color);font-size:14px}.hero-actions,.card-actions,.form-actions{display:flex;gap:9px;flex-wrap:wrap}button{font:inherit;border:0;cursor:pointer;min-height:40px;padding:0 14px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;gap:7px;font-weight:650;background:var(--secondary-background-color);color:var(--primary-text-color);transition:.15s ease}button:hover{filter:brightness(.97)}button.primary{background:var(--primary-color);color:var(--text-primary-color,#fff)}button.secondary{border:1px solid var(--divider-color);background:var(--card-background-color)}button.small{min-height:34px;padding:0 10px;font-size:12px}.danger-link{color:var(--error-color)!important}.icon-btn{width:40px;padding:0;border-radius:50%;background:transparent}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:20px}.stat{background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:14px;padding:16px;display:flex;align-items:center;gap:13px}.stat-icon{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:var(--secondary-background-color)}.stat.good .stat-icon{color:var(--success-color,#2eaf6d)}.stat.warn .stat-icon{color:var(--warning-color,#f4a62a)}.stat strong{font-size:24px;display:block;line-height:1}.stat span{display:block;color:var(--secondary-text-color);font-size:12px;margin-top:5px}.tabs{display:flex;gap:4px;border-bottom:1px solid var(--divider-color);margin-bottom:18px;overflow:auto}.tab{background:transparent;border-radius:0;padding:0 18px;min-height:46px;color:var(--secondary-text-color);white-space:nowrap;border-bottom:2px solid transparent}.tab.active{color:var(--primary-color);border-color:var(--primary-color)}.toolbar{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:16px}.search{height:42px;min-width:min(520px,100%);display:flex;align-items:center;gap:8px;padding:0 12px;border:1px solid var(--divider-color);border-radius:11px;background:var(--card-background-color)}.search input{border:0!important;background:transparent!important;padding:0!important;outline:0;width:100%;color:var(--primary-text-color);font-size:14px}.engine{display:inline-flex;align-items:center;gap:7px;font-size:12px;color:var(--secondary-text-color)}.engine span,.badge span,.dot{width:8px;height:8px;border-radius:50%;display:inline-block;background:var(--disabled-text-color)}.engine.ready span,.health-healthy span,.dot.on{background:var(--success-color,#2eaf6d)}.engine.waiting span,.health-recovering span{background:var(--warning-color,#f4a62a)}.group-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(390px,1fr));gap:14px}.group-card{background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:16px;padding:17px;min-width:0}.disabled-card{opacity:.72}.card-head,.section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.group-title{display:flex;align-items:center;gap:11px;min-width:0}.group-icon{width:42px;height:42px;border-radius:12px;background:color-mix(in srgb,var(--primary-color) 12%,transparent);color:var(--primary-color);display:grid;place-items:center;flex:0 0 auto}.group-title h3{margin:0;font-size:16px;overflow:hidden;text-overflow:ellipsis}.group-title small,.section-head p{display:block;color:var(--secondary-text-color);margin-top:4px;font-size:11px}.badge{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--divider-color);border-radius:999px;padding:6px 9px;font-size:11px;white-space:nowrap}.health-healthy{color:var(--success-color,#2eaf6d)}.health-degraded,.health-out_of_sync,.health-output_offline,.health-missing_output{color:var(--warning-color,#f4a62a)}.health-disabled{color:var(--secondary-text-color)}.state-line{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:16px 0}.state-line>div{background:var(--secondary-background-color);border-radius:10px;padding:10px}.state-line small{display:block;color:var(--secondary-text-color);font-size:10px;margin-bottom:4px}.state-line strong{font-size:13px}.state-on{color:var(--success-color,#2eaf6d)}.state-off{color:var(--secondary-text-color)}.output-box{display:grid;grid-template-columns:auto 1fr auto;gap:9px;align-items:center;border:1px solid var(--divider-color);border-radius:10px;padding:10px 11px}.output-box span,.section-label{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--secondary-text-color);font-weight:700}.output-box code,.member code{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px}.dot.off{background:var(--secondary-text-color)}.dot.offline{background:var(--warning-color,#f4a62a)}.dot.missing{background:var(--error-color)}.controllers{padding:13px 0 8px}.section-label{margin-bottom:7px}.member{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:8px;align-items:center;padding:5px 2px}.mode{font-size:9px;color:var(--secondary-text-color);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.meta{border-top:1px solid var(--divider-color);padding:10px 0;color:var(--secondary-text-color);font-size:10px}.meta span{display:flex;align-items:center;gap:6px;min-width:0}.meta b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.card-actions{border-top:1px solid var(--divider-color);padding-top:12px}.card-actions button{font-size:11px;min-height:34px;padding:0 9px}.empty{text-align:center;padding:70px 20px;border:1px dashed var(--divider-color);border-radius:16px;background:var(--card-background-color)}.empty>ha-icon{--mdc-icon-size:46px;color:var(--secondary-text-color)}.empty h2{margin:12px 0 5px}.empty p{color:var(--secondary-text-color);margin:0 auto 18px;max-width:540px}.success-banner{display:flex;align-items:center;gap:13px;padding:16px;border:1px solid color-mix(in srgb,var(--success-color,#2eaf6d) 35%,var(--divider-color));background:color-mix(in srgb,var(--success-color,#2eaf6d) 8%,var(--card-background-color));border-radius:14px;margin-bottom:15px;color:var(--success-color,#2eaf6d)}.success-banner span{display:block;color:var(--secondary-text-color);font-size:11px;margin-top:3px}.table-wrap{overflow:auto;background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:14px}table{border-collapse:collapse;width:100%;min-width:820px}th,td{text-align:start;border-bottom:1px solid var(--divider-color);padding:12px 14px;font-size:12px}th{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--secondary-text-color);background:var(--secondary-background-color)}td small{display:block;color:var(--secondary-text-color);margin-top:3px}.result{font-weight:700}.result-success{color:var(--success-color,#2eaf6d)}.result-failed{color:var(--error-color)}.result-partial,.result-warning{color:var(--warning-color,#f4a62a)}.muted{color:var(--secondary-text-color);text-align:center}.settings-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(320px,.8fr);gap:14px}.settings-card{background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:16px;padding:18px}.settings-card h2,.section-head h2,.section-head h3{margin:0}.version-chip{font-size:11px;border:1px solid var(--divider-color);padding:6px 9px;border-radius:999px}.form-grid{display:grid;gap:12px;margin-top:15px}.form-grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}.field{display:flex;flex-direction:column;gap:6px;min-width:0}.field>span{font-size:11px;color:var(--secondary-text-color);font-weight:650}.field input,.field select,textarea{width:100%;min-height:42px;border:1px solid var(--divider-color);border-radius:9px;padding:8px 10px;background:var(--primary-background-color);color:var(--primary-text-color);font:inherit;font-size:13px;outline:none}.field input:focus,.field select:focus,textarea:focus{border-color:var(--primary-color)}textarea{resize:vertical;margin-top:15px;min-height:220px}.check-row{display:flex;align-items:flex-start;gap:10px;margin-top:15px;padding:11px;border:1px solid var(--divider-color);border-radius:10px}.check-row input{width:18px;height:18px}.check-row b,.check-row small{display:block}.check-row b{font-size:12px}.check-row small{font-size:10px;color:var(--secondary-text-color);margin-top:3px}.form-actions{justify-content:flex-end;margin-top:17px}.form-actions.split{justify-content:space-between}.modal{border:0;padding:0;border-radius:18px;background:var(--card-background-color);color:var(--primary-text-color);width:min(1040px,calc(100% - 28px));max-height:calc(100% - 28px);box-shadow:0 18px 60px rgba(0,0,0,.35)}.modal::backdrop{background:rgba(0,0,0,.58)}.small-modal{width:min(720px,calc(100% - 28px))}.modal-head{display:flex;justify-content:space-between;align-items:center;padding:17px 20px;border-bottom:1px solid var(--divider-color)}.modal-head h2{margin:0;font-size:20px}.modal-head p{margin:3px 0 0;color:var(--secondary-text-color);font-size:11px}.modal-body{padding:20px;overflow:auto;max-height:calc(100vh - 190px)}.modal-actions{display:flex;justify-content:flex-end;gap:9px;padding:14px 20px;border-top:1px solid var(--divider-color)}.controllers-editor{margin-top:18px;border-top:1px solid var(--divider-color);padding-top:16px}.controller-row{display:grid;grid-template-columns:32px minmax(190px,1.6fr) minmax(170px,1fr) auto auto 40px;gap:8px;align-items:end;padding:10px 0;border-bottom:1px solid var(--divider-color)}.controller-index{width:28px;height:28px;border-radius:50%;background:var(--secondary-background-color);display:grid;place-items:center;font-size:11px;margin-bottom:7px}.mini-check{display:flex;align-items:center;gap:5px;min-height:42px;font-size:10px;color:var(--secondary-text-color);white-space:nowrap}.mini-check input{width:16px;height:16px}.advanced{margin-top:18px;border:1px solid var(--divider-color);border-radius:12px}.advanced summary{cursor:pointer;padding:13px;display:flex;align-items:center;gap:7px;font-weight:700;font-size:12px}.advanced-body{padding:0 13px 13px}.test-health{margin-bottom:12px}.test-list>div{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:8px;align-items:center;padding:10px;border-bottom:1px solid var(--divider-color)}.test-list small{grid-column:2/4;color:var(--secondary-text-color);font-size:10px}.toast{position:fixed;inset:auto 24px 24px auto;background:var(--card-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);border-radius:11px;padding:12px 16px;box-shadow:0 8px 30px rgba(0,0,0,.25);opacity:0;transform:translateY(12px);pointer-events:none;transition:.2s;z-index:9999;max-width:420px}.toast.show{opacity:1;transform:none}.toast.error{border-color:var(--error-color);color:var(--error-color)}.loading{height:160px;display:grid;place-items:center}.loading span{width:32px;height:32px;border:3px solid var(--divider-color);border-top-color:var(--primary-color);border-radius:50%;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
    @media(max-width:900px){.app{padding:18px 14px 38px}.hero{align-items:flex-start;flex-direction:column}.hero-actions{width:100%}.hero-actions button{flex:1}.stats{grid-template-columns:repeat(2,1fr)}.group-grid{grid-template-columns:1fr}.settings-grid{grid-template-columns:1fr}.controller-row{grid-template-columns:28px 1fr 40px}.controller-row .mode-field{grid-column:2/3}.mini-check{grid-column:auto}.form-grid.two{grid-template-columns:1fr}.toolbar{align-items:stretch;flex-direction:column}.search{min-width:0;width:100%}}@media(max-width:520px){.hero h1{font-size:25px}.stats{grid-template-columns:1fr 1fr}.stat{padding:12px}.state-line{grid-template-columns:1fr}.card-actions button{flex:1}.controller-row{grid-template-columns:28px minmax(0,1fr) 40px}.mini-check{grid-column:2/3}.modal-body{padding:14px}.modal-head,.modal-actions{padding:13px 14px}.toast{inset:auto 12px 12px 12px}.tabs .tab{padding:0 13px}}
  `; }
}

if (!customElements.get("eshtaya-multiway-panel")) {
  customElements.define("eshtaya-multiway-panel", EshtayaMultiWayPanel);
}
