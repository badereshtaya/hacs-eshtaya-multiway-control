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
    allGood: "All configured groups are healthy.", live: "Live state", refresh: "Refresh",
    performance: "Response mode", perfInstant: "Instant", perfBalanced: "Balanced", perfSafe: "Safe",
    perfInstantHint: "Fastest: dispatch immediately, verify the physical output in the background.",
    perfBalancedHint: "Fast: confirm the physical output before updating followers.",
    perfSafeHint: "Maximum confirmation: wait for the output and every follower.",
    testHint: "Real end-to-end test: toggling any member must propagate through the whole group exactly like a physical press.",
    toggle: "Toggle", press: "Press", resync: "Restore sync", testing: "Testing…", draftSafe: "Live updates will not reset this form",
    learn: "Learn", learnMain: "Learn main output", learnController: "Learn controller", learnWaiting: "Learning… press the physical switch now",
    learnCapturing: "Switch detected — collecting related changes…", learnCandidates: "Detected candidates", learnTimeout: "No switch detected. Try again.",
    useEntity: "Use", cancelLearn: "Cancel learning", rapidTest: "Rapid x4", rapidWarn: "Rapid test physically toggles this circuit four times.",
    endToEnd: "End-to-end", finalSync: "Final sync", engineDelay: "Engine", latestWins: "Latest physical state wins",
    commands: "Commands", failures: "Failures", timeline: "Live transaction timeline", noActivity: "No test activity yet",
    stepGeneral: "General", stepMain: "Main output", stepControllers: "Controllers", stepBehavior: "Performance", next: "Next", back: "Back"
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
    addController: "إضافة زر فرعي", behavior: "إعدادات متقدمة", debounce: "فلترة التكرار فقط (ms)", authorityWindow: "مدة أولوية آخر زر فعلي (ms)",
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
    allGood: "كل مجموعات الفكسل تعمل بشكل سليم.", live: "الحالة المباشرة", refresh: "تحديث",
    performance: "سرعة الاستجابة", perfInstant: "لحظي", perfBalanced: "متوازن", perfSafe: "آمن",
    perfInstantHint: "الأسرع: يرسل الأمر فوراً ويتأكد من الخرج الحقيقي بالخلفية.",
    perfBalancedHint: "سريع: يتأكد من الخرج الرئيسي قبل مزامنة باقي الأزرار.",
    perfSafeHint: "أعلى تأكيد: ينتظر الخرج الرئيسي وكل الأزرار الفرعية.",
    testHint: "اختبار حقيقي End-to-End: أي Toggle هنا لازم يشغّل الفكسل كامل مثل الكبسة الفعلية تماماً.",
    toggle: "توجل", press: "ضغط", resync: "إرجاع المزامنة", testing: "جاري الاختبار…", draftSafe: "التحديثات المباشرة لن تمسح البيانات التي أدخلتها",
    learn: "تعلم", learnMain: "تعلم الزر الرئيسي", learnController: "تعلم الزر الفرعي", learnWaiting: "وضع التعلم فعال… اكبس الزر الحقيقي الآن",
    learnCapturing: "تم اكتشاف الزر — جاري جمع التغييرات المرتبطة…", learnCandidates: "الكيانات المكتشفة", learnTimeout: "لم يتم اكتشاف زر. حاول مرة ثانية.",
    useEntity: "استخدم", cancelLearn: "إلغاء التعلم", rapidTest: "سريع ×4", rapidWarn: "الاختبار السريع سيبدّل الدارة فعلياً أربع مرات.",
    endToEnd: "اختبار فعلي", finalSync: "التزامن النهائي", engineDelay: "المحرك", latestWins: "آخر حالة فعلية تربح دائماً",
    commands: "الأوامر", failures: "الفشل", timeline: "سجل المعاملات المباشر", noActivity: "لا يوجد نشاط اختبار بعد",
    stepGeneral: "الأساسيات", stepMain: "الزر الرئيسي", stepControllers: "الأزرار الفرعية", stepBehavior: "الأداء", next: "التالي", back: "السابق"
  }
};

const EXTRA_I18N = {
  en: {
    controlCenter:"Control Center", dashboard:"Dashboard", multiway:"Multi-Way", smartGroups:"Smart Groups", commissioning:"Commissioning", healthDiag:"Health & Diagnostics",
    project:"Project", addSmart:"Add Smart Group", addMulti:"Add Multi-Way", fullTest:"Full system test", avgQuality:"Average quality", members:"Members", physical:"Physical controller", virtual:"Virtual group",
    smartEmpty:"No Smart Groups yet.", smartEmptyHint:"Create a physical-controller group or a virtual aggregate entity.", kind:"Group type", statePolicy:"State policy", anyOn:"ON when any member is ON", allOn:"ON only when all members are ON",
    direction:"Control direction", controllerOnly:"Controller controls members", bidirectional:"Members may control the group", physicalController:"Physical controller", member:"Member", addMember:"Add member", maintenance:"Maintenance mode", favorite:"Favorite",
    clone:"Clone", template:"Save template", quarantine:"Quarantine", release:"Release", quality:"Quality", response:"Response", fast:"Fast", moderate:"Moderate", cloudLimited:"Cloud/device limited", topology:"Topology",
    installerMode:"Installer mode", configLock:"Lock configuration", unlock:"Unlock", snapshots:"Snapshots", undoMulti:"Undo Multi-Way change", undoSmart:"Undo Smart Group change", backupAll:"Full backup", restoreAll:"Restore full backup",
    nativeGroups:"Home Assistant groups", importAsSmart:"Take over with Eshtaya", originalSafe:"The original Home Assistant helper is removed only after the replacement is verified.", nativeReadonly:"Home Assistant · Ready for takeover", importedFrom:"Migrated from", refreshFromHa:"Refresh from Home Assistant", alreadyImported:"Already managed", nativeGroupsHint:"Take Over migrates a compatible Home Assistant Light/Switch Group into Eshtaya, preserves the exact entity ID and settings, verifies the replacement, then removes the original helper.", takeoverConfirm:"Take over this Home Assistant group? The original helper will be removed only after Eshtaya successfully claims the same entity ID.", takeoverUnsupported:"Takeover unavailable", hideMembers:"Hide group members", sameEntityId:"Same entity ID", managedTakeover:"Managed takeover", areaSetup:"Area commissioning", areaHint:"Prioritize entities by Area and create groups quickly.", groupArea:"Create virtual group from area",
    autoPair:"Auto-pair suggestion", useSuggestion:"Use suggestion", noSuggestion:"Not enough compatible entities in this area.", repairCenter:"Repair Center", replacement:"Replacement entity", applyRepair:"Apply repair", noMissing:"No missing entities.", systemReport:"System test report",
    testPass:"PASS", testFail:"FAIL", destructiveTest:"Toggle + restore test", on:"ON", off:"OFF", groupState:"Group state", lockGroup:"Lock group", reflectController:"Reflect state to controller", sceneGuard:"Scene protection", autoHealSmart:"Auto heal", verifyMembers:"Verify members",
    manualPriority:"Physical priority (ms)", flapThreshold:"Flap threshold", flapWindow:"Flap window (sec)", quarantineSeconds:"Quarantine duration (sec)", failurePolicy:"Failure policy", continuePolicy:"Continue on member failure", stopPolicy:"Stop on first failure", memberDelay:"Delay between members (ms)", notifyFault:"Notify on repeated fault",
    sourcePolicy:"Authority policy", latestPhysical:"Latest physical input wins", outputAuthority:"Output authority", fallbackOutput:"Fallback output", noFallback:"No fallback", native:"Native", importGroup:"Import", saveTemplate:"Save template", locked:"Locked",
    configLockedBanner:"Configuration is locked. Runtime controls still work, but add/edit/delete actions are protected.", diagnosticBundle:"Diagnostics bundle", downloadReport:"Download report", commissioningReport:"Commissioning report"
  },
  ar: {
    controlCenter:"مركز التحكم", dashboard:"الرئيسية", multiway:"الفكسلات Multi-Way", smartGroups:"الجروبات الذكية", commissioning:"التركيب والتجهيز", healthDiag:"الصحة والتشخيص",
    project:"المشروع", addSmart:"إضافة Smart Group", addMulti:"إضافة فكسل", fullTest:"فحص النظام كامل", avgQuality:"متوسط الجودة", members:"الأعضاء", physical:"زر حقيقي متحكم", virtual:"جروب وهمي",
    smartEmpty:"لا يوجد Smart Groups بعد.", smartEmptyHint:"أنشئ جروب يتحكم به زر حقيقي أو كيان وهمي يتحكم بمجموعة أجهزة.", kind:"نوع الجروب", statePolicy:"طريقة حساب الحالة", anyOn:"يعتبر ON إذا أي عضو شغال", allOn:"يعتبر ON فقط إذا كل الأعضاء شغالين",
    direction:"اتجاه التحكم", controllerOnly:"الزر المتحكم يشغل الأعضاء", bidirectional:"الأعضاء كمان يغيروا حالة الجروب", physicalController:"الزر الحقيقي المتحكم", member:"عضو", addMember:"إضافة عضو", maintenance:"وضع الصيانة", favorite:"مفضلة",
    clone:"نسخ", template:"حفظ كقالب", quarantine:"عزل", release:"إرجاع", quality:"الجودة", response:"الاستجابة", fast:"سريعة", moderate:"متوسطة", cloudLimited:"محدودة بالسحابة/الجهاز", topology:"مخطط الربط",
    installerMode:"وضع الفني", configLock:"قفل الإعدادات", unlock:"فك القفل", snapshots:"نسخ التراجع", undoMulti:"تراجع عن آخر تعديل فكسل", undoSmart:"تراجع عن آخر تعديل Smart Group", backupAll:"نسخة احتياطية كاملة", restoreAll:"استرجاع نسخة كاملة",
    nativeGroups:"جروبات Home Assistant الموجودة", importAsSmart:"استلام الجروب بالكامل", originalSafe:"الجروب الرسمي القديم ينحذف فقط بعد ما نظام Eshtaya يستلم نفس الـ Entity ID ويتأكد أنه اشتغل.", nativeReadonly:"Home Assistant · جاهز للترحيل", importedFrom:"تم ترحيله من", refreshFromHa:"تحديث من Home Assistant", alreadyImported:"تحت إدارة النظام", nativeGroupsHint:"استلام الجروب ينقل Light/Switch Group الرسمي بالكامل إلى Eshtaya، يحافظ على نفس Entity ID والإعدادات، يتأكد من البديل، وبعدها يحذف الـ Helper القديم.", takeoverConfirm:"متأكد بدك نظام Eshtaya يستلم هذا الجروب بالكامل؟ الجروب الرسمي القديم رح ينحذف فقط بعد نجاح إنشاء البديل بنفس Entity ID.", takeoverUnsupported:"الترحيل غير متاح", hideMembers:"إخفاء أعضاء الجروب", sameEntityId:"نفس Entity ID", managedTakeover:"ترحيل مُدار", areaSetup:"تجهيز حسب المنطقة", areaHint:"رتّب الأجهزة حسب Area وأنشئ الجروبات بسرعة.", groupArea:"إنشاء جروب وهمي من المنطقة",
    autoPair:"اقتراح ربط تلقائي", useSuggestion:"استخدم الاقتراح", noSuggestion:"لا يوجد عدد كافٍ من الكيانات المناسبة في هذه المنطقة.", repairCenter:"مركز الإصلاح", replacement:"الكيان البديل", applyRepair:"تطبيق الإصلاح", noMissing:"لا يوجد كيانات مفقودة.", systemReport:"تقرير فحص النظام",
    testPass:"ناجح", testFail:"فشل", destructiveTest:"اختبار تشغيل/إطفاء وإرجاع", on:"تشغيل", off:"إطفاء", groupState:"حالة الجروب", lockGroup:"قفل الجروب", reflectController:"مزامنة حالة الزر المتحكم", sceneGuard:"حماية المشاهد", autoHealSmart:"إصلاح تلقائي", verifyMembers:"تأكيد الأعضاء",
    manualPriority:"أولوية الزر الحقيقي (ms)", flapThreshold:"حد التقلب السريع", flapWindow:"نافذة رصد التقلب (ثانية)", quarantineSeconds:"مدة العزل (ثانية)", failurePolicy:"سياسة الفشل", continuePolicy:"كمل لو عضو فشل", stopPolicy:"توقف عند أول فشل", memberDelay:"تأخير بين الأعضاء (ms)", notifyFault:"إشعار عند تكرار الفشل",
    sourcePolicy:"سياسة المرجع", latestPhysical:"آخر زر فعلي يربح", outputAuthority:"الخرج الرئيسي هو المرجع", fallbackOutput:"خرج احتياطي", noFallback:"بدون", native:"رسمي", importGroup:"استيراد", saveTemplate:"حفظ قالب", locked:"مقفول",
    configLockedBanner:"الإعدادات مقفولة. التحكم بالحالات يعمل، لكن الإضافة والتعديل والحذف محمية.", diagnosticBundle:"حزمة التشخيص", downloadReport:"تحميل التقرير", commissioningReport:"تقرير التسليم والفحص"
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
    this._tab = "dashboard";
    this._search = "";
    this._editing = null;
    this._testResult = null;
    this._testBusy = null;
    this._testResults = {};
    this._rapidBusy = null;
    this._learning = null;
    this._learnPollTimer = null;
    this._advancedOpen = false;
    this._editorStep = 1;
    this._editorScrollTop = 0;
    this._settingsDirty = false;
    this._backupDraft = "";
    this._replaceImport = false;
    this._smart = {groups:[],summary:{},settings:{},templates:[],snapshots:[]};
    this._nativeGroups = [];
    this._missing = [];
    this._smartEditing = null;
    this._smartLearning = null;
    this._smartLearnTimer = null;
    this._smartSearch = "";
    this._commissionArea = "";
    this._systemReport = null;
    this._smartActivity = [];
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
  t(key) { return EXTRA_I18N[this.lang]?.[key] || I18N[this.lang]?.[key] || EXTRA_I18N.en[key] || I18N.en[key] || key; }
  esc(value) {
    return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  }

  async _bootstrap() {
    try {
      await Promise.all([this._loadCatalog(), this._loadNativeGroups(), this._refresh(true)]);
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

  async _loadNativeGroups() {
    if (!this._hass) return;
    try {
      const result = await this._hass.callWS({type:`${DOMAIN}/smart/ha_groups`});
      this._nativeGroups = result.groups || [];
    } catch (_) { this._nativeGroups = []; }
  }

  async _refresh(includeActivity = false) {
    if (!this._hass) return;
    try {
      const [data, smart, missing] = await Promise.all([
        this._hass.callWS({ type: `${DOMAIN}/list` }),
        this._hass.callWS({ type: `${DOMAIN}/smart/list` }),
        this._hass.callWS({ type: `${DOMAIN}/repair/missing` })
      ]);
      this._data = data;
      this._smart = smart;
      this._missing = missing.missing || [];
      if (includeActivity || this._tab === "activity") {
        const [result, smartDiag] = await Promise.all([
          this._hass.callWS({ type: `${DOMAIN}/activity`, limit: 200 }),
          this._hass.callWS({ type: `${DOMAIN}/smart/diagnostics` })
        ]);
        this._activity = result.activity || [];
        this._smartActivity = smartDiag.activity || [];
      }
      if (!this._loading && !this._editing && !this._smartEditing && !this._testResult && !this._settingsDirty) this._render();
    } catch (err) {
      this._toast(err.message || this.t("failed"), "error");
    }
  }

  _render() {
    const rtl = this.lang === "ar";
    const ms = this._data.summary || {};
    const ss = this._smart.summary || {};
    const totalGroups=(ms.groups||0)+(ss.groups||0);
    const healthy=(ms.healthy||0)+(ss.healthy||0);
    const degraded=(ms.degraded||0)+(ss.degraded||0);
    const configLocked=!!this._smart.settings?.config_locked;
    this.shadowRoot.innerHTML = `
      <style>${this._styles()}.native-groups-card{margin-top:18px}.native-title-line{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.native-readonly{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;border:1px solid var(--divider-color);border-radius:999px;padding:4px 7px;color:var(--secondary-text-color)}.native-main{min-width:0}.native-main code{display:block;margin-top:4px;font-size:10px;overflow:hidden;text-overflow:ellipsis}.compact-empty{padding:38px 20px;margin-bottom:18px}</style>
      <main class="app" dir="${rtl ? "rtl" : "ltr"}">
        <header class="hero control-hero">
          <div><div class="eyebrow">ESHTAYA SMART · v${this.esc(this._data.version || "3.1.0")}</div><h1>${this.t("controlCenter")}</h1><p>${this.t("subtitle")}</p></div>
          <div class="hero-actions">
            <button class="secondary" data-action="refresh"><ha-icon icon="mdi:refresh"></ha-icon>${this.t("refresh")}</button>
            <button class="secondary" data-action="full-test"><ha-icon icon="mdi:clipboard-check-outline"></ha-icon>${this.t("fullTest")}</button>
            <button class="primary" data-action="add" ${configLocked?"disabled":""}><ha-icon icon="mdi:plus"></ha-icon>${this.t("addMulti")}</button>
            <button class="primary smart-primary" data-action="smart-add" ${configLocked?"disabled":""}><ha-icon icon="mdi:lightbulb-group"></ha-icon>${this.t("addSmart")}</button>
          </div>
        </header>
        ${configLocked?`<div class="lock-banner"><ha-icon icon="mdi:lock"></ha-icon><span>${this.t("configLockedBanner")}</span></div>`:""}
        <section class="stats">
          ${this._statCard("mdi:vector-link", totalGroups, this.t("groups"), "neutral")}
          ${this._statCard("mdi:check-decagram", healthy, this.t("healthy"), "good")}
          ${this._statCard("mdi:alert-circle-outline", degraded, this.t("degraded"), degraded?"warn":"good")}
          ${this._statCard("mdi:signal", `${ss.average_quality ?? 100}%`, this.t("avgQuality"), "neutral")}
        </section>
        <nav class="tabs wide-tabs">
          ${[
            ["dashboard","mdi:view-dashboard-outline"],["multiway","mdi:electric-switch"],["smart","mdi:lightbulb-group-outline"],
            ["commissioning","mdi:tools"],["health","mdi:heart-pulse"],["activity","mdi:history"],["settings","mdi:cog-outline"]
          ].map(([tab,icon])=>`<button class="tab ${this._tab===tab?"active":""}" data-tab="${tab}"><ha-icon icon="${icon}"></ha-icon>${this.t(tab==="smart"?"smartGroups":tab==="health"?"healthDiag":tab)}</button>`).join("")}
        </nav>
        <section class="content">${this._loading?`<div class="loading"><span></span></div>`:this._renderTab()}</section>
        ${this._renderEditorDialog()}
        ${this._renderSmartEditorDialog()}
        ${this._renderTestDialog()}
        <div id="toast" class="toast"></div>
      </main>`;
    this._bind();
  }

  _renderTab() {
    if (this._tab === "dashboard") return this._renderDashboard();
    if (this._tab === "multiway") return this._renderGroups();
    if (this._tab === "smart") return this._renderSmartGroups();
    if (this._tab === "commissioning") return this._renderCommissioning();
    if (this._tab === "health") return this._renderHealthV3();
    if (this._tab === "activity") return this._renderActivityV3();
    if (this._tab === "settings") return this._renderSettingsV3();
    return this._renderDashboard();
  }

  _statCard(icon, value, label, tone) {
    return `<article class="stat ${tone}"><div class="stat-icon"><ha-icon icon="${icon}"></ha-icon></div><div><strong>${value}</strong><span>${label}</span></div></article>`;
  }

  _renderDashboard() {
    const favorites=(this._smart.groups||[]).filter(g=>g.favorite);
    const ms=this._data.summary||{}, ss=this._smart.summary||{};
    return `<div class="dashboard-grid">
      <section class="dash-main settings-card">
        <div class="section-head"><div><h2>${this.t("controlCenter")}</h2><p>${this._smart.settings?.project_name?this.esc(this._smart.settings.project_name):"Eshtaya Smart"}</p></div><span class="version-chip">v${this.esc(this._data.version||"3.1.0")}</span></div>
        <div class="quick-grid">
          <button class="quick-card" data-action="add"><ha-icon icon="mdi:electric-switch"></ha-icon><b>${this.t("addMulti")}</b><small>${ms.groups||0} ${this.t("groups")}</small></button>
          <button class="quick-card" data-action="smart-add"><ha-icon icon="mdi:lightbulb-group"></ha-icon><b>${this.t("addSmart")}</b><small>${ss.groups||0} ${this.t("groups")}</small></button>
          <button class="quick-card" data-tab-go="commissioning"><ha-icon icon="mdi:tools"></ha-icon><b>${this.t("commissioning")}</b><small>${this.t("areaHint")}</small></button>
          <button class="quick-card" data-action="full-test"><ha-icon icon="mdi:clipboard-check-outline"></ha-icon><b>${this.t("fullTest")}</b><small>${this._missing.length?`${this._missing.length} ${this.t("missing")}`:this.t("allGood")}</small></button>
        </div>
      </section>
      <section class="settings-card"><div class="section-head"><div><h2>${this.t("healthDiag")}</h2><p>${this.t("live")}</p></div></div>
        <div class="health-stack">
          <div class="health-row"><span>${this.t("multiway")}</span><b>${ms.healthy||0}/${ms.groups||0}</b></div>
          <div class="health-row"><span>${this.t("smartGroups")}</span><b>${ss.healthy||0}/${ss.groups||0}</b></div>
          <div class="health-row"><span>${this.t("avgQuality")}</span><b>${ss.average_quality??100}%</b></div>
          <div class="health-row"><span>${this.t("repairCenter")}</span><b class="${this._missing.length?'warn-text':'good-text'}">${this._missing.length}</b></div>
        </div>
      </section>
      <section class="settings-card full-span"><div class="section-head"><div><h2>${this.t("favorite")}</h2><p>${this.t("smartGroups")}</p></div></div>
        ${favorites.length?`<div class="favorite-grid">${favorites.map(g=>this._favoriteSmartCard(g)).join("")}</div>`:`<div class="muted-pad">${this.t("smartEmpty")}</div>`}
      </section>
      ${this._systemReport?`<section class="settings-card full-span">${this._renderSystemReport()}</section>`:""}
    </div>`;
  }

  _favoriteSmartCard(g){const r=g.runtime||{}; const state=r.desired_state||r.state||"off";return `<article class="fav-card"><div><b>${this.esc(g.name)}</b><small>${this.esc(g.kind)} · ${r.quality_score??100}%</small></div><div class="seg-control"><button class="${state==='on'?'active':''}" data-action="smart-state" data-id="${g.id}" data-state="on">ON</button><button class="${state==='off'?'active':''}" data-action="smart-state" data-id="${g.id}" data-state="off">OFF</button></div></article>`;}

  _renderSmartGroups(){
    const q=this._smartSearch.trim().toLowerCase();
    const groups=(this._smart.groups||[]).filter(g=>!q||[g.name,g.controller_entity,...g.members.map(m=>m.entity_id)].join(" ").toLowerCase().includes(q));
    const native=(this._nativeGroups||[]).filter(g=>!q||[g.name,g.entity_id,...(g.members||[])].join(" ").toLowerCase().includes(q));
    const managedSection=groups.length
      ? `<div class="group-grid">${groups.map(g=>this._smartGroupCard(g)).join("")}</div>`
      : `<div class="empty compact-empty"><ha-icon icon="mdi:lightbulb-group-outline"></ha-icon><h2>${this.t("smartEmpty")}</h2><p>${this.t("smartEmptyHint")}</p><button class="primary" data-action="smart-add">${this.t("addSmart")}</button></div>`;
    const nativeSection=`<section class="settings-card native-groups-card"><div class="section-head"><div><h2>${this.t('nativeGroups')}</h2><p>${this.t('nativeGroupsHint')}</p></div><span class="badge"><span></span>${native.length}</span></div>${native.length?`<div class="native-list">${native.map(g=>`<div class="native-row"><div class="native-main"><div class="native-title-line"><b>${this.esc(g.name)}</b><span class="native-readonly">${g.takeover_supported?this.t('nativeReadonly'):this.t('takeoverUnsupported')}</span></div><code>${this.esc(g.entity_id)}</code><small>${(g.members||[]).length} ${this.t('members')} · ${this.esc(g.group_type||'group')}${g.all?' · ALL':' · ANY'}${g.hide_members?' · hidden members':''}${g.area_name?` · ${this.esc(g.area_name)}`:''}</small>${!g.takeover_supported&&g.takeover_reason?`<small class="danger-text">${this.esc(g.takeover_reason)}</small>`:''}</div><div class="row-actions">${g.takeover_supported?`<button class="primary" data-action="native-takeover" data-entity="${this.esc(g.entity_id)}"><ha-icon icon="mdi:swap-horizontal-bold"></ha-icon>${this.t('importAsSmart')}</button>`:`<button disabled><ha-icon icon="mdi:lock-alert-outline"></ha-icon>${this.t('takeoverUnsupported')}</button>`}</div></div>`).join('')}</div>`:`<div class="muted-pad">${this.t('noGroups')}</div>`}</section>`;
    return `<div class="toolbar"><label class="search"><ha-icon icon="mdi:magnify"></ha-icon><input id="smart-search" value="${this.esc(this._smartSearch)}" placeholder="${this.t("search")}"></label><button class="primary" data-action="smart-add"><ha-icon icon="mdi:plus"></ha-icon>${this.t("addSmart")}</button></div>${managedSection}${nativeSection}`;
  }

  _smartGroupCard(g){
    const r=g.runtime||{}, state=r.desired_state||r.state||"off", controller=r.controller;
    return `<article class="group-card ${g.enabled?'':'disabled-card'}">
      <div class="card-head"><div class="group-title"><div class="group-icon"><ha-icon icon="${g.kind==='physical'?'mdi:gesture-tap-button':'mdi:lightbulb-group'}"></ha-icon></div><div><h3>${this.esc(g.name)} ${g.favorite?'★':''}</h3><small>${g.kind==='physical'?this.t('physical'):this.t('virtual')} · ${g.members.length} ${this.t('members')}</small></div></div><span class="badge health-${this.esc(r.health||'healthy')}"><span></span>${this._smartHealthLabel(r.health)}</span></div>
      <div class="state-line"><div><small>${this.t('groupState')}</small><strong class="state-${state}">${String(state).toUpperCase()}</strong></div><div><small>${this.t('quality')}</small><strong>${r.quality_score??100}%</strong></div><div><small>${this.t('latency')}</small><strong>${r.average_member_latency_ms==null?'—':`${r.average_member_latency_ms} ms`}</strong></div></div>
      ${g.kind==='physical'?`<div class="output-box"><span>${this.t('physicalController')}</span><code>${this.esc(g.controller_entity||'—')}</code><b class="dot ${this._stateTone(controller?.state)}"></b></div>`:''}
      <div class="controllers"><div class="section-label">${this.t('members')} · ${g.members.length}</div>${(r.members||[]).slice(0,6).map(m=>`<div class="member smart-member-card"><span class="dot ${this._stateTone(m.state)}"></span><code>${this.esc(m.entity_id)}</code><span class="mode">${m.quality_score??100}% · ${m.avg_latency_ms??0}ms</span><button class="mini-action ${m.quarantined?'warn-action':''}" data-action="smart-quarantine" data-id="${g.id}" data-entity="${this.esc(m.entity_id)}" data-enabled="${m.quarantined?'false':'true'}">${m.quarantined?this.t('release'):this.t('quarantine')}</button></div>`).join('')}${g.members.length>6?`<div class="muted">+${g.members.length-6}</div>`:''}</div>
      <div class="topology-mini"><span class="node source-node">${g.kind==='physical'?this.t('physicalController'):this.t('virtual')}</span><span class="topology-line"></span><div class="node-bucket">${g.members.slice(0,5).map(()=>`<i></i>`).join('')}</div></div>
      <div class="meta"><span><ha-icon icon="mdi:source-branch"></ha-icon>${this.t('lastSource')}: <b>${this.esc(r.last_source||'—')}</b></span><span>${this.t('response')}: <b>${this._responseLabel(r.response_class)}</b></span>${g.preferred_entity_id?`<span><ha-icon icon="mdi:identifier"></ha-icon>${this.t('sameEntityId')}: <b>${this.esc(g.preferred_entity_id)}</b></span>`:g.source_group_entity?`<span><ha-icon icon="mdi:database-import-outline"></ha-icon>${this.t('importedFrom')}: <b>${this.esc(g.source_group_entity)}</b></span>`:''}</div>
      <div class="card-actions">${g.source_group_entity?`<button data-action="smart-refresh-source" data-id="${g.id}"><ha-icon icon="mdi:refresh"></ha-icon>${this.t('refreshFromHa')}</button>`:''}<button data-action="smart-state" data-id="${g.id}" data-state="on"><ha-icon icon="mdi:power"></ha-icon>ON</button><button data-action="smart-state" data-id="${g.id}" data-state="off"><ha-icon icon="mdi:power-off"></ha-icon>OFF</button><button data-action="smart-sync" data-id="${g.id}"><ha-icon icon="mdi:sync"></ha-icon>${this.t('sync')}</button><button data-action="smart-test" data-id="${g.id}"><ha-icon icon="mdi:test-tube"></ha-icon>${this.t('test')}</button><button data-action="smart-edit" data-id="${g.id}"><ha-icon icon="mdi:pencil"></ha-icon>${this.t('edit')}</button><button data-action="smart-clone" data-id="${g.id}"><ha-icon icon="mdi:content-copy"></ha-icon>${this.t('clone')}</button><button data-action="smart-template" data-id="${g.id}"><ha-icon icon="mdi:content-save-outline"></ha-icon>${this.t('template')}</button><button class="danger-link" data-action="smart-delete" data-id="${g.id}"><ha-icon icon="mdi:delete-outline"></ha-icon>${this.t('del')}</button></div>
    </article>`;
  }

  _renderCommissioning(){
    const area=this._commissionArea; const areaEntities=this._entities.filter(e=>!area||e.area_id===area); const commandable=areaEntities.filter(e=>['switch','light','input_boolean','fan'].includes((e.entity_id||'').split('.')[0])); const controllers=areaEntities.filter(e=>['switch','light','input_boolean','binary_sensor','button','input_button','event'].includes((e.entity_id||'').split('.')[0])); const suggestion=commandable.length&&controllers.find(e=>e.entity_id!==commandable[0].entity_id)?[commandable[0],controllers.find(e=>e.entity_id!==commandable[0].entity_id)]:null;
    return `<div class="panel-section commissioning-grid">
      <section class="settings-card"><div class="section-head"><div><h2>${this.t('areaSetup')}</h2><p>${this.t('areaHint')}</p></div></div><label class="field"><span>${this.t('area')}</span><select id="commission-area"><option value="">${this.t('none')}</option>${this._areas.map(a=>`<option value="${a.area_id}" ${area===a.area_id?'selected':''}>${this.esc(a.name)}</option>`).join('')}</select></label>
        <div class="commission-actions"><button class="secondary" data-action="commission-group-area" ${commandable.length?'':'disabled'}><ha-icon icon="mdi:lightbulb-group"></ha-icon>${this.t('groupArea')} (${commandable.length})</button></div>
        <div class="suggestion-box"><div><b>${this.t('autoPair')}</b><small>${suggestion?`${this.esc(suggestion[0].entity_id)} + ${this.esc(suggestion[1].entity_id)}`:this.t('noSuggestion')}</small></div>${suggestion?`<button data-action="commission-pair" data-main="${this.esc(suggestion[0].entity_id)}" data-controller="${this.esc(suggestion[1].entity_id)}">${this.t('useSuggestion')}</button>`:''}</div>
        <div class="entity-cloud">${areaEntities.slice(0,30).map(e=>`<code>${this.esc(e.entity_id)}</code>`).join('')}</div>
      </section>
      <section class="settings-card"><div class="section-head"><div><h2>${this.t('nativeGroups')}</h2><p>${this.t('originalSafe')}</p></div></div>${this._nativeGroups.length?`<div class="native-list">${this._nativeGroups.map(g=>`<div class="native-row"><div><b>${this.esc(g.name)}</b><code>${this.esc(g.entity_id)}</code><small>${g.members.length} ${this.t('members')} · ${this.esc(g.group_type||'group')}${g.all?' · ALL':' · ANY'}${g.hide_members?' · hidden members':''}</small>${!g.takeover_supported&&g.takeover_reason?`<small class="danger-text">${this.esc(g.takeover_reason)}</small>`:''}</div>${g.takeover_supported?`<button class="primary" data-action="native-takeover" data-entity="${this.esc(g.entity_id)}"><ha-icon icon="mdi:swap-horizontal-bold"></ha-icon>${this.t('importAsSmart')}</button>`:`<button disabled><ha-icon icon="mdi:lock-alert-outline"></ha-icon>${this.t('takeoverUnsupported')}</button>`}</div>`).join('')}</div>`:`<div class="muted-pad">${this.t('noGroups')}</div>`}</section>
      <section class="settings-card"><div class="section-head"><div><h2>${this.t('template')}</h2><p>${this.t('smartGroups')}</p></div></div>${(this._smart.templates||[]).length?`<div class="native-list">${this._smart.templates.map(t=>`<div class="native-row"><div><b>${this.esc(t.name)}</b><small>${this.esc(t.payload?.kind||'virtual')} · ${this.esc(t.payload?.virtual_type||'light')}</small></div><div class="row-actions"><button data-action="template-use" data-id="${t.id}">${this.t('useSuggestion')}</button><button class="danger-link" data-action="template-delete" data-id="${t.id}">${this.t('del')}</button></div></div>`).join('')}</div>`:`<div class="muted-pad">${this.t('noGroups')}</div>`}</section>
      <section class="settings-card full-span"><div class="section-head"><div><h2>${this.t('commissioningReport')}</h2><p>${this.t('fullTest')}</p></div><button class="primary" data-action="full-test">${this.t('fullTest')}</button></div>${this._systemReport?this._renderSystemReport():`<div class="muted-pad">${this.t('noActivity')}</div>`}</section>
    </div>`;
  }

  _renderHealthV3(){
    return `<div class="panel-section"><div class="health-tabs-grid"><section class="settings-card"><div class="section-head"><div><h2>${this.t('multiway')}</h2></div><b>${this._data.summary?.healthy||0}/${this._data.summary?.groups||0}</b></div>${(this._data.groups||[]).map(g=>this._compactHealth(g.name,g.runtime?.health,g.runtime?.last_latency_ms)).join('')}</section><section class="settings-card"><div class="section-head"><div><h2>${this.t('smartGroups')}</h2></div><b>${this._smart.summary?.healthy||0}/${this._smart.summary?.groups||0}</b></div>${(this._smart.groups||[]).map(g=>this._compactHealth(g.name,g.runtime?.health,g.runtime?.average_member_latency_ms,g.runtime?.quality_score)).join('')}</section></div>
      <section class="settings-card repair-card"><div class="section-head"><div><h2>${this.t('repairCenter')}</h2><p>${this._missing.length?`${this._missing.length} ${this.t('missing')}`:this.t('noMissing')}</p></div></div>${this._missing.length?this._missing.map((m,i)=>this._repairRow(m,i)).join(''):`<div class="success-banner"><ha-icon icon="mdi:check-decagram"></ha-icon><strong>${this.t('noMissing')}</strong></div>`}</section>
      ${this._systemReport?`<section class="settings-card">${this._renderSystemReport()}</section>`:''}</div>`;
  }

  _compactHealth(name,health,latency,quality){return `<div class="health-row"><div><b>${this.esc(name)}</b><small>${this._smartHealthLabel(health)}</small></div><div>${quality==null?'':`${quality}% · `}${latency==null?'—':`${latency} ms`}</div></div>`;}
  _repairRow(m,i){const candidates=this._entities.filter(e=>(e.entity_id||'').split('.')[0]===m.domain).sort((a,b)=>(a.area_id===m.area_id?-1:0)-(b.area_id===m.area_id?-1:0));return `<div class="repair-row"><div><b>${this.esc(m.group_name)}</b><code>${this.esc(m.entity_id)}</code><small>${this.esc(m.engine)} · ${this.esc(m.role)}</small></div><select data-repair-select="${i}"><option value="">${this.t('replacement')}</option>${candidates.slice(0,100).map(e=>`<option value="${this.esc(e.entity_id)}">${this.esc(e.entity_id)}</option>`).join('')}</select><button data-action="repair-apply" data-index="${i}">${this.t('applyRepair')}</button></div>`;}

  _renderActivityV3(){
    const merged=[...(this._activity||[]).map(x=>({...x,engine:'Multi-Way'})),...(this._smartActivity||[]).map(x=>({...x,engine:'Smart'}))].sort((a,b)=>String(b.timestamp||'').localeCompare(String(a.timestamp||''))).slice(0,300);
    return `<div class="panel-section"><div class="section-head"><div><h2>${this.t('activity')}</h2><p>${this.t('live')}</p></div><button class="secondary" data-action="refresh-activity"><ha-icon icon="mdi:refresh"></ha-icon>${this.t('refresh')}</button></div><div class="table-wrap"><table><thead><tr><th>Engine</th><th>${this.t('time')}</th><th>${this.t('event')}</th><th>${this.t('lastSource')}</th><th>${this.t('state')}</th><th>${this.t('result')}</th><th>${this.t('latency')}</th></tr></thead><tbody>${merged.length?merged.map(a=>`<tr><td>${a.engine}</td><td>${this._fmtTime(a.timestamp)}</td><td>${this.esc(a.event||'—')}</td><td><code>${this.esc(a.source||'—')}</code></td><td>${this.esc(a.action||'—')}</td><td class="result result-${this.esc(a.result||'')}">${this.esc(a.result||'—')}</td><td>${a.latency_ms==null?'—':`${a.latency_ms} ms`}</td></tr>`).join(''):`<tr><td colspan="7" class="muted">${this.t('noActivity')}</td></tr>`}</tbody></table></div></div>`;
  }

  _renderSettingsV3(){
    const st=this._smart.settings||{};
    return `<div class="settings-grid"><section class="settings-card"><div class="section-head"><div><h2>${this.t('project')}</h2><p>${this.t('installerMode')}</p></div></div><form id="platform-settings" class="form-grid"><label class="field"><span>${this.t('project')}</span><input name="project_name" value="${this.esc(st.project_name||'')}"></label><label class="check-row"><input type="checkbox" name="installer_mode" ${st.installer_mode!==false?'checked':''}><div><b>${this.t('installerMode')}</b><small>${this.t('commissioning')}</small></div></label><label class="check-row"><input type="checkbox" name="config_locked" ${st.config_locked?'checked':''}><div><b>${this.t('configLock')}</b><small>${this.t('configLockedBanner')}</small></div></label><label class="field"><span>${this.t('snapshots')}</span><input type="number" min="5" max="100" name="snapshot_limit" value="${st.snapshot_limit||25}"></label><div class="form-actions"><button class="primary" type="submit">${this.t('saveSettings')}</button></div></form><div class="card-actions"><button data-action="undo-multi">${this.t('undoMulti')}</button><button data-action="undo-smart">${this.t('undoSmart')}</button></div></section>
      <section class="settings-card"><div class="section-head"><div><h2>${this.t('backupAll')}</h2><p>${this.t('version')} ${this.esc(this._data.version||'')}</p></div></div><textarea id="full-backup-data" placeholder="JSON">${this.esc(this._backupDraft)}</textarea><div class="form-actions"><button data-action="full-export">${this.t('backupAll')}</button><button class="primary" data-action="full-import">${this.t('restoreAll')}</button></div></section></div>
      <div class="v3-old-settings">${this._renderSettings()}</div>`;
  }

  _renderSystemReport(){const r=this._systemReport;if(!r)return''; const total=(r.multiway?.total||0)+(r.smart?.total||0), passed=(r.multiway?.passed||0)+(r.smart?.passed||0);return `<div class="section-head"><div><h2>${this.t('systemReport')}</h2><p>${this._fmtTime(r.created_at)}</p></div><span class="badge ${passed===total?'health-healthy':'health-degraded'}"><span></span>${passed}/${total} ${passed===total?this.t('testPass'):this.t('testFail')}</span></div><div class="report-grid"><div><strong>${r.multiway?.passed||0}/${r.multiway?.total||0}</strong><span>${this.t('multiway')}</span></div><div><strong>${r.smart?.passed||0}/${r.smart?.total||0}</strong><span>${this.t('smartGroups')}</span></div><div><strong>${this._missing.length}</strong><span>${this.t('missing')}</span></div></div><div class="form-actions"><button data-action="download-report">${this.t('downloadReport')}</button></div>`;}

  _renderSmartEditorDialog(){
    if(!this._smartEditing)return''; const g=this._smartEditing,b=g.behavior||{}, physical=g.kind==='physical';
    return `<dialog id="smart-editor" class="modal"><form id="smart-form"><div class="modal-head"><div><h2>${g.id?this.t('edit'):this.t('addSmart')}</h2><p>${this.t('draftSafe')}</p></div><button type="button" class="icon-btn" data-action="smart-close"><ha-icon icon="mdi:close"></ha-icon></button></div><div class="modal-body"><div class="draft-safe"><ha-icon icon="mdi:shield-check"></ha-icon>${this.t('draftSafe')}</div>
      <div class="form-grid two"><label class="field"><span>${this.t('groupName')}</span><input name="name" value="${this.esc(g.name||'')}" required></label><label class="field"><span>${this.t('kind')}</span><select name="kind"><option value="virtual" ${!physical?'selected':''}>${this.t('virtual')}</option><option value="physical" ${physical?'selected':''}>${this.t('physical')}</option></select></label><label class="field"><span>${this.t('virtualType')}</span><select name="virtual_type"><option value="light" ${g.virtual_type==='light'?'selected':''}>${this.t('light')}</option><option value="switch" ${g.virtual_type==='switch'?'selected':''}>${this.t('sw')}</option></select></label><label class="field"><span>${this.t('area')}</span><select name="area_id"><option value="">${this.t('none')}</option>${this._areas.map(a=>`<option value="${a.area_id}" ${g.area_id===a.area_id?'selected':''}>${this.esc(a.name)}</option>`).join('')}</select></label></div>
      ${physical?`<div class="controllers-editor"><div class="section-label">${this.t('physicalController')}</div><div class="entity-pick-row"><input list="smart-controller-list" name="controller_entity" value="${this.esc(g.controller_entity||'')}" placeholder="switch.xxx"><button type="button" class="learn-btn" data-action="smart-learn-controller"><ha-icon icon="mdi:radar"></ha-icon>${this.t('learn')}</button></div>${this._entityDatalist('smart-controller-list',['switch','light','input_boolean','binary_sensor','button','input_button','event'])}</div>`:''}
      ${this._renderSmartLearnPanel()}
      <div class="controllers-editor"><div class="section-head"><div><h3>${this.t('members')}</h3></div><button type="button" data-action="smart-member-add"><ha-icon icon="mdi:plus"></ha-icon>${this.t('addMember')}</button></div>${(g.members||[]).map((m,i)=>this._smartMemberRow(m,i)).join('')}${this._entityDatalist('smart-member-list',['switch','light','input_boolean','fan'])}</div>
      <details class="advanced" open><summary><ha-icon icon="mdi:tune"></ha-icon>${this.t('behavior')}</summary><div class="advanced-body form-grid two"><label class="field"><span>${this.t('statePolicy')}</span><select name="state_policy"><option value="any" ${b.state_policy!=='all'?'selected':''}>${this.t('anyOn')}</option><option value="all" ${b.state_policy==='all'?'selected':''}>${this.t('allOn')}</option></select></label><label class="check-row"><input type="checkbox" name="hide_members" ${g.hide_members?'checked':''}><div><b>${this.t('hideMembers')}</b><small>${this.t('originalSafe')}</small></div></label><label class="field"><span>${this.t('direction')}</span><select name="direction"><option value="controller_only" ${b.direction!=='bidirectional'?'selected':''}>${this.t('controllerOnly')}</option><option value="bidirectional" ${b.direction==='bidirectional'?'selected':''}>${this.t('bidirectional')}</option></select></label>${physical?`<label class="field"><span>${this.t('mode')}</span><select name="controller_mode"><option value="mirror" ${b.controller_mode==='mirror'?'selected':''}>${this.t('modeMirror')}</option><option value="toggle" ${b.controller_mode==='toggle'?'selected':''}>${this.t('modeToggle')}</option><option value="momentary_on" ${b.controller_mode==='momentary_on'?'selected':''}>${this.t('modeMomentaryOn')}</option><option value="momentary_off" ${b.controller_mode==='momentary_off'?'selected':''}>${this.t('modeMomentaryOff')}</option><option value="event" ${b.controller_mode==='event'?'selected':''}>${this.t('modeEvent')}</option></select></label><label class="check-row compact-check"><input type="checkbox" name="invert_controller" ${b.invert_controller?'checked':''}><div><b>${this.t('invert')}</b></div></label>`:''}<label class="field"><span>${this.t('performance')}</span><select name="performance_mode"><option value="instant" ${b.performance_mode==='instant'?'selected':''}>${this.t('perfInstant')}</option><option value="balanced" ${b.performance_mode==='balanced'?'selected':''}>${this.t('perfBalanced')}</option><option value="safe" ${b.performance_mode==='safe'?'selected':''}>${this.t('perfSafe')}</option></select></label><label class="field"><span>${this.t('manualPriority')}</span><input type="number" name="manual_priority_ms" min="0" max="10000" value="${b.manual_priority_ms??2500}"></label><label class="field"><span>${this.t('memberDelay')}</span><input type="number" name="member_delay_ms" min="0" max="5000" value="${b.member_delay_ms??0}"></label><label class="field"><span>${this.t('sceneGuard')}</span><input type="number" name="scene_guard_ms" min="0" max="10000" value="${b.scene_guard_ms??800}"></label><label class="field"><span>${this.t('flapThreshold')}</span><input type="number" name="flap_threshold" min="3" max="50" value="${b.flap_threshold??8}"></label><label class="field"><span>${this.t('flapWindow')}</span><input type="number" name="flap_window_sec" min="1" max="120" value="${b.flap_window_sec??10}"></label><label class="field"><span>${this.t('quarantineSeconds')}</span><input type="number" name="quarantine_sec" min="5" max="3600" value="${b.quarantine_sec??60}"></label><label class="field"><span>${this.t('commandTimeout')}</span><input type="number" step="0.25" name="command_timeout" min="0.25" max="30" value="${b.command_timeout??3}"></label><label class="field"><span>${this.t('maxRetries')}</span><input type="number" name="max_retries" min="0" max="5" value="${b.max_retries??1}"></label><label class="field"><span>${this.t('failurePolicy')}</span><select name="failure_policy"><option value="continue" ${b.failure_policy!=='stop'?'selected':''}>${this.t('continuePolicy')}</option><option value="stop" ${b.failure_policy==='stop'?'selected':''}>${this.t('stopPolicy')}</option></select></label></div></details>
      <div class="checks-grid"><label class="check-row"><input type="checkbox" name="auto_heal" ${b.auto_heal!==false?'checked':''}><div><b>${this.t('autoHealSmart')}</b></div></label><label class="check-row"><input type="checkbox" name="verify_members" ${b.verify_members!==false?'checked':''}><div><b>${this.t('verifyMembers')}</b></div></label>${physical?`<label class="check-row"><input type="checkbox" name="reflect_controller" ${b.reflect_controller!==false?'checked':''}><div><b>${this.t('reflectController')}</b></div></label>`:''}<label class="check-row"><input type="checkbox" name="notify_on_fault" ${b.notify_on_fault?'checked':''}><div><b>${this.t('notifyFault')}</b></div></label><label class="check-row"><input type="checkbox" name="favorite" ${g.favorite?'checked':''}><div><b>${this.t('favorite')}</b></div></label><label class="check-row"><input type="checkbox" name="maintenance" ${g.maintenance?'checked':''}><div><b>${this.t('maintenance')}</b></div></label><label class="check-row"><input type="checkbox" name="locked" ${g.locked?'checked':''}><div><b>${this.t('lockGroup')}</b></div></label></div>
      </div><div class="modal-actions"><button type="button" data-action="smart-close">${this.t('cancel')}</button><button type="submit" class="primary">${this.t('save')}</button></div></form></dialog>`;
  }

  _smartMemberRow(m,i){return `<div class="controller-row smart-member-row" data-smart-member-row><div class="controller-index">${i+1}</div><label class="field"><span>${this.t('member')}</span><div class="entity-pick-row"><input list="smart-member-list" data-field="entity_id" value="${this.esc(m.entity_id||'')}" placeholder="light.xxx"><button type="button" class="learn-btn compact" data-action="smart-learn-member" data-index="${i}"><ha-icon icon="mdi:radar"></ha-icon></button></div></label><label class="mini-check"><input type="checkbox" data-field="enabled" ${m.enabled!==false?'checked':''}>${this.t('enabled')}</label><button type="button" class="icon-btn danger-link" data-action="smart-member-remove" data-index="${i}"><ha-icon icon="mdi:delete-outline"></ha-icon></button></div>`;}

  _renderSmartLearnPanel(){if(!this._smartLearning)return'';const l=this._smartLearning;return `<div class="learn-panel"><div class="learn-head"><ha-icon icon="mdi:radar"></ha-icon><div><b>${l.status==='timeout'?this.t('learnTimeout'):l.status==='capturing'?this.t('learnCapturing'):this.t('learnWaiting')}</b><small>${this.t('learnCandidates')}</small></div><span class="learn-pulse"></span><button type="button" data-action="smart-learn-cancel">${this.t('cancelLearn')}</button></div>${(l.candidates||[]).length?`<div class="learn-candidates">${l.candidates.map((c,i)=>`<button type="button" class="learn-candidate" data-action="smart-learn-use" data-entity="${this.esc(c.entity_id)}" data-mode="${this.esc(c.suggested_mode||'mirror')}"><span class="candidate-rank">${i+1}</span><div><code>${this.esc(c.entity_id)}</code><small>${this.esc(c.friendly_name||'')}</small></div><b>${c.score||0}%</b><span>${this.t('useEntity')}</span></button>`).join('')}</div>`:''}</div>`;}

  _smartHealthLabel(h){return ({healthy:this.t('healthy'),degraded:this.t('degraded'),maintenance:this.t('maintenance'),missing:this.t('missing'),quarantined:this.t('quarantine'),out_of_sync:this.t('outOfSync'),disabled:this.t('disabled')}[h]||h||'—');}
  _responseLabel(r){return ({fast:this.t('fast'),moderate:this.t('moderate'),cloud_or_device_limited:this.t('cloudLimited')}[r]||r||'—');}

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
        <div class="group-title"><div class="group-icon"><ha-icon icon="${g.virtual_type === "switch" ? "mdi:electric-switch" : "mdi:light-switch"}"></ha-icon></div><div><h3>${this.esc(g.name)}</h3><small>${this.esc(g.id.slice(0,10))} · ${g.virtual_type} · <span class="perf-mini perf-${this.esc(g.behavior?.performance_mode||"instant")}">${this._performanceLabel(g.behavior?.performance_mode)}</span></small></div></div>
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
        <textarea id="backup-data" rows="14" placeholder="${this.t("importData")}">${this.esc(this._backupDraft)}</textarea>
        <label class="check-row"><input id="replace-import" type="checkbox" ${this._replaceImport?"checked":""}><span><b>${this.t("replace")}</b><small>Use with care</small></span></label>
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
    const behavior = { debounce_ms:120, authority_window_ms:1800, performance_mode:"instant", auto_heal:true, output_restore_policy:"adopt", command_timeout:null, max_retries:null, fallback_output:null, source_policy:"latest_physical", ...(g.behavior||{}) };
    return `<dialog id="editor" class="modal"><form id="group-form" method="dialog" novalidate>
      <div class="modal-head"><div><h2>${g.id ? this.t("edit") : this.t("add")}</h2><p>${g.id ? this.esc(g.name) : "Virtual Multi-Way Group"}</p></div><button type="button" class="icon-btn" data-action="close-editor"><ha-icon icon="mdi:close"></ha-icon></button></div>
      <div class="modal-body">
        <div class="draft-safe"><ha-icon icon="mdi:content-save-check-outline"></ha-icon><span>${this.t("draftSafe")} · ${this.t("latestWins")}</span></div>
        ${this._renderLearnPanel()}
        <nav class="wizard-steps">${[[1,"stepGeneral","mdi:format-list-bulleted"],[2,"stepMain","mdi:electric-switch"],[3,"stepControllers","mdi:source-branch"],[4,"stepBehavior","mdi:speedometer"]].map(([n,k,icon])=>`<button type="button" data-action="editor-step" data-step="${n}" class="wizard-step ${this._editorStep===n?"active":""} ${this._editorStep>n?"done":""}"><span>${this._editorStep>n?'<ha-icon icon="mdi:check"></ha-icon>':n}</span><ha-icon icon="${icon}"></ha-icon><b>${this.t(k)}</b></button>`).join("")}</nav>
        <section class="wizard-section ${this._editorStep===1?"active":""}"><div class="section-kicker">01 · ${this.t("stepGeneral")}</div><div class="form-grid two"><label class="field"><span>${this.t("groupName")}</span><input name="name" value="${this.esc(g.name||"")}" required maxlength="100"></label>
        <label class="field"><span>${this.t("virtualType")}</span><select name="virtual_type"><option value="light" ${g.virtual_type!=="switch"?"selected":""}>${this.t("light")}</option><option value="switch" ${g.virtual_type==="switch"?"selected":""}>${this.t("sw")}</option></select></label></div></section>
        <section class="wizard-section ${this._editorStep===2?"active":""}"><div class="section-kicker">02 · ${this.t("stepMain")}</div><div class="form-grid two"><div class="field"><span>${this.t("output")}</span><div class="entity-pick-row"><input name="output" list="output-entities" value="${this.esc(g.output||"")}" required placeholder="switch.living_main"><button type="button" class="learn-btn" data-action="learn-output" title="${this.t("learnMain")}"><ha-icon icon="mdi:radar"></ha-icon>${this.t("learn")}</button></div></div>
        <label class="field"><span>${this.t("area")}</span><select name="area_id"><option value="">${this.t("none")}</option>${this._areas.map(a=>`<option value="${this.esc(a.area_id)}" ${g.area_id===a.area_id?"selected":""}>${this.esc(a.name)}</option>`).join("")}</select></label></div>
        ${this._entityDatalist("output-entities", new Set(["switch","light","input_boolean","fan"]))}
        ${this._entityDatalist("controller-entities", new Set(["switch","light","input_boolean","binary_sensor","button","input_button","event"]))}</section>
        <section class="wizard-section ${this._editorStep===3?"active":""}"><div class="section-kicker">03 · ${this.t("stepControllers")}</div><div class="controllers-editor"><div class="section-head"><div><h3>${this.t("controllers")}</h3><p>Mirror, toggle, pulse, event or follower modes</p></div><button type="button" class="secondary small" data-action="add-controller"><ha-icon icon="mdi:plus"></ha-icon>${this.t("addController")}</button></div>
        <div id="controller-rows">${(g.controllers||[]).map((c,i)=>this._controllerRow(c,i)).join("")}</div></div></section>
        <section class="wizard-section ${this._editorStep===4?"active":""}"><div class="section-kicker">04 · ${this.t("stepBehavior")}</div><details class="advanced" ${this._editorStep===4||this._advancedOpen?"open":""}><summary><ha-icon icon="mdi:tune-variant"></ha-icon>${this.t("behavior")}</summary><div class="advanced-body">
          <div class="performance-box"><label class="field"><span>${this.t("performance")}</span><select id="performance-mode" name="performance_mode"><option value="instant" ${behavior.performance_mode==="instant"?"selected":""}>${this.t("perfInstant")}</option><option value="balanced" ${behavior.performance_mode==="balanced"?"selected":""}>${this.t("perfBalanced")}</option><option value="safe" ${behavior.performance_mode==="safe"?"selected":""}>${this.t("perfSafe")}</option></select></label><small id="performance-hint">${behavior.performance_mode==="safe"?this.t("perfSafeHint"):behavior.performance_mode==="balanced"?this.t("perfBalancedHint"):this.t("perfInstantHint")}</small></div>
          <div class="form-grid two"><label class="field"><span>${this.t("debounce")}</span><input name="debounce_ms" type="number" min="0" max="5000" step="10" value="${this.esc(behavior.debounce_ms)}"></label>
          <label class="field"><span>${this.t("authorityWindow")}</span><input name="authority_window_ms" type="number" min="0" max="10000" step="100" value="${this.esc(behavior.authority_window_ms)}"></label></div>
          <div class="form-grid two"><label class="field"><span>${this.t("restorePolicy")}</span><select name="output_restore_policy"><option value="adopt" ${behavior.output_restore_policy!=="enforce"?"selected":""}>${this.t("adopt")}</option><option value="enforce" ${behavior.output_restore_policy==="enforce"?"selected":""}>${this.t("enforce")}</option></select></label><label class="field"><span>${this.t("sourcePolicy")}</span><select name="source_policy"><option value="latest_physical" ${behavior.source_policy!=="output_authority"?"selected":""}>${this.t("latestPhysical")}</option><option value="output_authority" ${behavior.source_policy==="output_authority"?"selected":""}>${this.t("outputAuthority")}</option></select></label><label class="field"><span>${this.t("fallbackOutput")}</span><input name="fallback_output" list="output-entities" value="${this.esc(behavior.fallback_output||"")}" placeholder="${this.t("noFallback")}"></label></div>
          <div class="form-grid two"><label class="field"><span>${this.t("timeout")}</span><input name="command_timeout" type="number" min="0.5" max="30" step="0.5" value="${behavior.command_timeout ?? ""}" placeholder="${this.t("inherit")}"></label>
          <label class="field"><span>${this.t("retries")}</span><input name="max_retries" type="number" min="0" max="5" step="1" value="${behavior.max_retries ?? ""}" placeholder="${this.t("inherit")}"></label></div>
          <label class="check-row"><input name="auto_heal" type="checkbox" ${behavior.auto_heal!==false?"checked":""}><span><b>${this.t("autoHeal")}</b><small>Periodic safety reconciliation</small></span></label>
        </div></details></section>
      </div>
      <div class="modal-actions wizard-actions"><button type="button" class="secondary" data-action="close-editor">${this.t("cancel")}</button><div class="wizard-nav">${this._editorStep>1?`<button type="button" class="secondary" data-action="editor-back"><ha-icon icon="mdi:arrow-left"></ha-icon>${this.t("back")}</button>`:""}${this._editorStep<4?`<button type="button" class="primary" data-action="editor-next">${this.t("next")}<ha-icon icon="mdi:arrow-right"></ha-icon></button>`:`<button type="submit" class="primary"><ha-icon icon="mdi:content-save-check"></ha-icon>${this.t("save")}</button>`}</div></div>
    </form></dialog>`;
  }

  _renderLearnPanel() {
    const l=this._learning; if(!l)return "";
    const status=l.status||"waiting";
    const text=status==="capturing"?this.t("learnCapturing"):status==="timeout"?this.t("learnTimeout"):status==="detected"?this.t("learnCandidates"):this.t("learnWaiting");
    const candidates=(l.candidates||[]).map((c,i)=>`<button type="button" class="learn-candidate" data-action="learn-use" data-entity="${this.esc(c.entity_id)}" data-mode="${this.esc(c.recommended_mode||"mirror")}"><span class="candidate-rank">${i+1}</span><span><code>${this.esc(c.entity_id)}</code><small>${this.esc(c.old_state??"—")} → ${this.esc(c.new_state??"—")} · ${this.esc(c.recommended_mode||"")}</small></span><b>${c.score}%</b><ha-icon icon="mdi:check-circle-outline"></ha-icon></button>`).join("");
    return `<section class="learn-panel ${status}"><div class="learn-head"><ha-icon icon="mdi:radar"></ha-icon><div><b>${text}</b><small>${l.role==="output"?this.t("learnMain"):this.t("learnController")}</small></div>${status==="waiting"||status==="capturing"?'<span class="learn-pulse"></span>':''}<button type="button" class="icon-btn" data-action="learn-cancel" title="${this.t("cancelLearn")}"><ha-icon icon="mdi:close"></ha-icon></button></div>${status==="detected"?`<div class="learn-candidates">${candidates}</div>`:""}${status==="timeout"?`<button type="button" class="secondary" data-action="learn-retry"><ha-icon icon="mdi:refresh"></ha-icon>${this.t("learn")}</button>`:""}</section>`;
  }

  _controllerRow(c,i) {
    return `<div class="controller-row" data-controller-row>
      <div class="controller-index">${i+1}</div><div class="field grow"><span>${this.t("controller")}</span><div class="entity-pick-row"><input data-field="entity_id" list="controller-entities" value="${this.esc(c.entity_id||"")}" required placeholder="switch.living_secondary"><button type="button" class="learn-btn compact" data-action="learn-controller" data-index="${i}" title="${this.t("learnController")}"><ha-icon icon="mdi:radar"></ha-icon><span>${this.t("learn")}</span></button></div></div>
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
    const allowedDomains = domains instanceof Set ? domains : new Set(domains || []);
    return `<datalist id="${id}">${this._entities.filter(e=>allowedDomains.has((e.entity_id||"").split(".")[0])).map(e=>`<option value="${this.esc(e.entity_id)}">${this.esc(e.name || e.original_name || "")}</option>`).join("")}</datalist>`;
  }

  _renderTestDialog() {
    const r = this._testResult;
    if (!r) return `<dialog id="test-dialog"></dialog>`;
    const rows=r.entities.map(e=>{
      const busy=this._testBusy===e.entity_id||this._rapidBusy===e.entity_id;
      const label=e.test_action==="press"?this.t("press"):this.t("toggle");
      const last=this._testResults[e.entity_id]; const m=e.metrics||{};
      const details=last?` · <b class="${last.ok?"test-ok":"test-fail"}">${last.latency_ms} ms</b>${last.engine_latency_ms!=null?` · ${this.t("engineDelay")}: ${last.engine_latency_ms} ms`:""}`:"";
      const metricText=m.commands!=null?` · ${this.t("commands")}: ${m.commands} · ${this.t("failures")}: ${m.failures||0}${m.last_latency_ms!=null?` · ${m.last_latency_ms} ms`:""}`:"";
      const rapid=e.test_action==="toggle"?`<button type="button" class="ghost test-rapid" data-action="rapid-test" data-id="${this.esc(r.group_id)}" data-entity="${this.esc(e.entity_id)}" ${busy?"disabled":""} title="${this.t("rapidWarn")}"><ha-icon icon="mdi:swap-horizontal-bold"></ha-icon>${this.t("rapidTest")}</button>`:"";
      return `<div class="test-row"><span class="dot ${this._stateTone(e.state)}"></span><div class="test-entity"><code>${this.esc(e.entity_id)}</code><small>${this.esc(e.role)} · ${this.esc(e.domain||"")} · ${e.commandable?this.t("endToEnd"):"read-only"}${details}${metricText}</small></div><span class="state-chip state-${this.esc(e.state)}">${this.esc(e.state)}</span><div class="test-buttons">${e.test_action?`<button type="button" class="secondary test-action" data-action="test-entity" data-id="${this.esc(r.group_id)}" data-entity="${this.esc(e.entity_id)}" ${busy?"disabled":""}><ha-icon icon="mdi:${e.test_action==="press"?"gesture-tap-button":"toggle-switch"}"></ha-icon>${busy?this.t("testing"):label}</button>`:`<button type="button" class="secondary test-action" disabled>—</button>`}${rapid}</div></div>`;
    }).join("");
    const timeline=(r.activity||[]).slice(0,8).map(a=>`<div class="timeline-row"><span class="timeline-dot result-${this.esc(a.result||"info")}"></span><code>${this.esc((a.timestamp||"").slice(11,23))}</code><b>${this.esc(a.event||"")}</b><span>${this.esc(a.source||"—")}</span><em>${this.esc(a.action||"")}${a.latency_ms!=null?` · ${a.latency_ms} ms`:""}</em></div>`).join("")||`<div class="timeline-empty">${this.t("noActivity")}</div>`;
    return `<dialog id="test-dialog" class="modal test-modal"><div class="modal-head"><div><h2>${this.t("testTitle")}</h2><p>${this.esc(r.name)}</p></div><button type="button" class="icon-btn" data-action="close-test"><ha-icon icon="mdi:close"></ha-icon></button></div><div class="modal-body"><div class="test-intro"><ha-icon icon="mdi:transit-connection-variant"></ha-icon><div><b>${this.t("endToEnd")}</b><span>${this.t("testHint")}</span></div><div class="test-health badge health-${this.esc(r.health)}">${this._healthLabel(r.health)}</div></div><div class="test-list">${rows}</div><section class="timeline"><div class="section-head"><div><h3>${this.t("timeline")}</h3><p>${this.t("latestWins")}</p></div></div><div class="timeline-list">${timeline}</div></section></div><div class="modal-actions test-actions"><button class="secondary" type="button" data-action="test-resync" data-id="${this.esc(r.group_id)}"><ha-icon icon="mdi:sync"></ha-icon>${this.t("resync")}</button><button class="primary" type="button" data-action="close-test">${this.t("close")}</button></div></dialog>`;
  }

  _bind() {
    this.shadowRoot.querySelectorAll("[data-tab]").forEach(btn=>btn.addEventListener("click", async()=>{
      this._tab = btn.dataset.tab; if (this._tab === "activity") await this._refresh(true); else this._render();
    }));
    this.shadowRoot.querySelectorAll("[data-action]").forEach(btn=>btn.addEventListener("click", e=>this._action(e.currentTarget)));
    const search = this.shadowRoot.getElementById("search");
    if (search) search.addEventListener("input", e=>{ this._search=e.target.value; const pos=e.target.selectionStart; this._render(); const n=this.shadowRoot.getElementById("search"); if(n){n.focus();n.setSelectionRange(pos,pos);} });
    const settingsForm = this.shadowRoot.getElementById("settings-form");
    if (settingsForm) {
      settingsForm.addEventListener("submit", e=>{e.preventDefault();this._saveSettings(settingsForm);});
      settingsForm.addEventListener("input", ()=>{this._settingsDirty=true;});
      settingsForm.addEventListener("change", ()=>{this._settingsDirty=true;});
    }
    const backupData=this.shadowRoot.getElementById("backup-data");
    if(backupData) backupData.addEventListener("input",()=>{this._backupDraft=backupData.value;this._settingsDirty=true;});
    const replaceImport=this.shadowRoot.getElementById("replace-import");
    if(replaceImport) replaceImport.addEventListener("change",()=>{this._replaceImport=replaceImport.checked;this._settingsDirty=true;});
    const groupForm = this.shadowRoot.getElementById("group-form");
    if (groupForm) {
      groupForm.addEventListener("submit", e=>{e.preventDefault();this._saveGroup(groupForm);});
      groupForm.addEventListener("input", ()=>this._captureDraft());
      groupForm.addEventListener("change", ()=>this._captureDraft());
    }
    const smartSearch = this.shadowRoot.getElementById("smart-search");
    if (smartSearch) smartSearch.addEventListener("input", e=>{ this._smartSearch=e.target.value; const pos=e.target.selectionStart; this._render(); const n=this.shadowRoot.getElementById("smart-search"); if(n){n.focus();n.setSelectionRange(pos,pos);} });
    const smartForm = this.shadowRoot.getElementById("smart-form");
    if (smartForm) {
      smartForm.addEventListener("submit", e=>{e.preventDefault();this._saveSmartGroup();});
      smartForm.addEventListener("input", ()=>this._captureSmartDraft());
      smartForm.addEventListener("change", e=>{this._captureSmartDraft(); if(e.target?.name==="kind") this._render();});
    }
    const platformSettings=this.shadowRoot.getElementById("platform-settings");
    if(platformSettings) platformSettings.addEventListener("submit",e=>{e.preventDefault();this._savePlatformSettings(platformSettings);});
    const commissionArea=this.shadowRoot.getElementById("commission-area");
    if(commissionArea) commissionArea.addEventListener("change",e=>{this._commissionArea=e.target.value;this._render();});
    const fullBackup=this.shadowRoot.getElementById("full-backup-data");
    if(fullBackup) fullBackup.addEventListener("input",()=>{this._backupDraft=fullBackup.value;});
    this.shadowRoot.querySelectorAll("[data-tab-go]").forEach(btn=>btn.addEventListener("click",()=>{this._tab=btn.dataset.tabGo;this._render();}));
    const advanced = this.shadowRoot.querySelector("details.advanced");
    if (advanced) advanced.addEventListener("toggle", ()=>{this._advancedOpen=advanced.open;});
    const performanceMode=this.shadowRoot.getElementById("performance-mode");
    if(performanceMode) performanceMode.addEventListener("change", ()=>{const h=this.shadowRoot.getElementById("performance-hint");if(h)h.textContent=performanceMode.value==="safe"?this.t("perfSafeHint"):performanceMode.value==="balanced"?this.t("perfBalancedHint"):this.t("perfInstantHint");});
    if (this._editing) queueMicrotask(()=>{const d=this.shadowRoot.getElementById("editor");d?.showModal();const b=d?.querySelector(".modal-body");if(b)b.scrollTop=this._editorScrollTop||0;});
    if (this._smartEditing) queueMicrotask(()=>this.shadowRoot.getElementById("smart-editor")?.showModal());
    if (this._testResult) queueMicrotask(()=>this.shadowRoot.getElementById("test-dialog")?.showModal());
  }

  async _action(btn) {
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    try {
      if (action === "add") return this._openEditor(null);
      if (action === "edit") return this._openEditor((this._data.groups||[]).find(g=>g.id===id));
      if (action === "editor-step") { this._captureDraft(); this._editorStep=Math.max(1,Math.min(4,Number(btn.dataset.step)||1)); return this._render(); }
      if (action === "editor-next") { this._captureDraft(); if(!this._validateEditorStep(this._editorStep))return; this._editorStep=Math.min(4,this._editorStep+1); return this._render(); }
      if (action === "editor-back") { this._captureDraft(); this._editorStep=Math.max(1,this._editorStep-1); return this._render(); }
      if (action === "close-editor") { await this._cancelLearn(false); this._editing=null; this._advancedOpen=false; this._editorScrollTop=0; return this._render(); }
      if (action === "close-test") {
        this._testBusy=null; this._rapidBusy=null; this._testResult=null; this._testResults={}; await this._refresh(false); return this._render();
      }
      if (action === "refresh") return await this._refresh(this._tab==="activity");
      if (action === "refresh-activity") return await this._refresh(true);
      if (action === "sync-all") { await this._hass.callWS({type:`${DOMAIN}/sync_all`}); this._toast(this.t("saved")); return await this._refresh(false); }
      if (action === "sync") { await this._hass.callWS({type:`${DOMAIN}/sync`,group_id:id}); this._toast(this.t("saved")); return await this._refresh(false); }
      if (action === "test") { this._testResult=await this._hass.callWS({type:`${DOMAIN}/test`,group_id:id}); this._testBusy=null; this._testResults={}; return this._render(); }
      if (action === "test-entity") {
        const entity=btn.dataset.entity; if(!entity||this._testBusy)return; this._testBusy=entity; this._render();
        try { const result=await this._hass.callWS({type:`${DOMAIN}/test_entity_action`,group_id:id,entity_id:entity}); this._testResult=result.group; this._testResults[entity]=result; this._toast(`${entity}: ${result.ok?"OK":"FAILED"} · ${result.latency_ms} ms`,result.ok?"success":"error"); } finally { this._testBusy=null; this._render(); }
        return;
      }
      if (action === "test-resync") { await this._hass.callWS({type:`${DOMAIN}/sync`,group_id:id}); this._testResult=await this._hass.callWS({type:`${DOMAIN}/test`,group_id:id}); this._toast(this.t("saved")); return this._render(); }
      if (action === "rapid-test") {
        const entity=btn.dataset.entity; if(!entity||this._rapidBusy)return; this._rapidBusy=entity; this._render();
        try { const result=await this._hass.callWS({type:`${DOMAIN}/rapid_toggle_test`,group_id:id,entity_id:entity,count:4,interval_ms:120}); this._testResult=result.group; this._testResults[entity]=result; this._toast(`${this.t("rapidTest")}: ${result.ok?"PASS":"FAIL"} · ${result.latency_ms} ms`,result.ok?"success":"error"); } finally { this._rapidBusy=null; this._render(); }
        return;
      }
      if (action === "learn-output") { this._captureDraft(); return await this._startLearn("output",null); }
      if (action === "learn-controller") { this._captureDraft(); return await this._startLearn("controller",Number(btn.dataset.index)); }
      if (action === "learn-cancel") return await this._cancelLearn();
      if (action === "learn-retry") { const role=this._learning?.role||"controller",index=this._learning?.index??null; await this._cancelLearn(false); return await this._startLearn(role,index); }
      if (action === "learn-use") return await this._applyLearn(btn.dataset.entity,btn.dataset.mode);
      if (action === "toggle-enabled") { await this._hass.callWS({type:`${DOMAIN}/set_enabled`,group_id:id,enabled:btn.dataset.enabled!=="true"}); return await this._refresh(false); }
      if (action === "delete") { if(confirm(this.t("confirmDelete"))){await this._hass.callWS({type:`${DOMAIN}/delete`,group_id:id});this._toast(this.t("saved"));await this._refresh(false);} return; }
      if (action === "add-controller") return this._modifyControllers("add");
      if (action === "remove-controller") return this._modifyControllers("remove", Number(btn.dataset.index));
      if (action === "smart-add") return this._openSmartEditor(null);
      if (action === "smart-edit") return this._openSmartEditor((this._smart.groups||[]).find(g=>g.id===id));
      if (action === "smart-close") { await this._cancelSmartLearn(false); this._smartEditing=null; return this._render(); }
      if (action === "smart-member-add") { this._captureSmartDraft(); this._smartEditing.members.push({entity_id:"",enabled:true}); return this._render(); }
      if (action === "smart-member-remove") { this._captureSmartDraft(); if(this._smartEditing.members.length>1)this._smartEditing.members.splice(Number(btn.dataset.index),1); return this._render(); }
      if (action === "smart-state") { await this._hass.callWS({type:`${DOMAIN}/smart/set_state`,group_id:id,state:btn.dataset.state}); this._toast(this.t("saved")); return await this._refresh(false); }
      if (action === "smart-sync") { await this._hass.callWS({type:`${DOMAIN}/smart/sync`,group_id:id}); this._toast(this.t("saved")); return await this._refresh(false); }
      if (action === "smart-test") { const r=await this._hass.callWS({type:`${DOMAIN}/smart/test`,group_id:id,destructive:false}); this._toast(`${r.name}: ${r.passed?this.t("testPass"):this.t("testFail")} · ${r.quality_score??100}%`,r.passed?"success":"error"); return await this._refresh(false); }
      if (action === "smart-quarantine") { await this._hass.callWS({type:`${DOMAIN}/smart/quarantine`,group_id:id,entity_id:btn.dataset.entity,enabled:btn.dataset.enabled==="true"}); this._toast(this.t("saved")); return await this._refresh(false); }
      if (action === "template-use") { const t=(this._smart.templates||[]).find(x=>x.id===id); if(t){const payload=JSON.parse(JSON.stringify(t.payload||{}));this._openSmartEditor({id:null,name:`${t.name} Group`,kind:payload.kind||"virtual",controller_entity:null,members:[{entity_id:"",enabled:true}],virtual_type:payload.virtual_type||"light",area_id:payload.area_id||this._commissionArea||null,enabled:true,maintenance:false,locked:false,favorite:false,behavior:payload.behavior||{}});} return; }
      if (action === "template-delete") { if(confirm(this.t("confirmDelete"))){await this._hass.callWS({type:`${DOMAIN}/smart/template_delete`,template_id:id});this._toast(this.t("saved"));return await this._refresh(false);} return; }
      if (action === "smart-clone") { const src=(this._smart.groups||[]).find(g=>g.id===id); if(src){const clone=JSON.parse(JSON.stringify(src));delete clone.id;clone.name=`${clone.name} Copy`;clone.locked=false;if(clone.kind==="physical")clone.controller_entity="";this._openSmartEditor(clone);} return; }
      if (action === "smart-template") { const name=prompt(this.t("saveTemplate"),(this._smart.groups||[]).find(g=>g.id===id)?.name||""); if(name){await this._hass.callWS({type:`${DOMAIN}/smart/template_save`,group_id:id,name});this._toast(this.t("saved"));await this._refresh(false);} return; }
      if (action === "smart-delete") { if(confirm(this.t("confirmDelete"))){await this._hass.callWS({type:`${DOMAIN}/smart/delete`,group_id:id});this._toast(this.t("saved"));await this._refresh(false);} return; }
      if (action === "smart-learn-controller") { this._captureSmartDraft(); return await this._startSmartLearn("controller",null); }
      if (action === "smart-learn-member") { this._captureSmartDraft(); return await this._startSmartLearn("member",Number(btn.dataset.index)); }
      if (action === "smart-learn-cancel") return await this._cancelSmartLearn();
      if (action === "smart-learn-use") return await this._applySmartLearn(btn.dataset.entity,btn.dataset.mode);
      if (action === "native-takeover") { const entity=btn.dataset.entity;if(!confirm(`${this.t("takeoverConfirm")}\n\n${entity}`))return;btn.disabled=true;try{await this._hass.callWS({type:`${DOMAIN}/smart/takeover_ha_group`,entity_id:entity});this._toast(this.t("saved"));await this._loadNativeGroups();return await this._refresh(false);}catch(err){btn.disabled=false;return this._toast(err.message||this.t("failed"),"error");} }
      if (action === "smart-refresh-source") { await this._hass.callWS({type:`${DOMAIN}/smart/refresh_ha_group`,group_id:id});this._toast(this.t("saved"));await this._loadNativeGroups();return await this._refresh(false); }
      if (action === "commission-group-area") return await this._commissionGroupArea();
      if (action === "commission-pair") { const main=btn.dataset.main, controller=btn.dataset.controller; const area=this._areas.find(a=>a.area_id===this._commissionArea); this._openEditor({id:null,name:`${area?.name||"Area"} Multi-Way`,output:main,controllers:[{entity_id:controller,mode:"mirror",invert:false,reflect_state:true}],enabled:true,virtual_type:"light",area_id:this._commissionArea||null,behavior:{debounce_ms:120,authority_window_ms:1800,performance_mode:"instant",auto_heal:true,output_restore_policy:"adopt",command_timeout:null,max_retries:null,fallback_output:null,source_policy:"latest_physical"}}); return; }
      if (action === "full-test") return await this._runFullSystemTest();
      if (action === "repair-apply") { const index=Number(btn.dataset.index), item=this._missing[index], sel=this.shadowRoot.querySelector(`[data-repair-select="${index}"]`), replacement=sel?.value; if(item&&replacement){await this._hass.callWS({type:`${DOMAIN}/repair/remap`,mapping:{[item.entity_id]:replacement}});this._toast(this.t("saved"));return await this._refresh(false);} return; }
      if (action === "undo-multi") { await this._hass.callWS({type:`${DOMAIN}/multiway/undo`});this._toast(this.t("saved"));return await this._refresh(false); }
      if (action === "undo-smart") { await this._hass.callWS({type:`${DOMAIN}/smart/undo`});this._toast(this.t("saved"));return await this._refresh(false); }
      if (action === "full-export") return await this._fullExport();
      if (action === "full-import") return await this._fullImport();
      if (action === "download-report") return this._downloadSystemReport();
      if (action === "export") return await this._export();
      if (action === "import") return await this._import();
    } catch (err) { this._toast(err.message || this.t("failed"), "error"); }
  }

  _openEditor(group) {
    this._advancedOpen=false; this._editorScrollTop=0; this._editorStep=1; this._learning=null; clearTimeout(this._learnPollTimer);
    this._editing = group ? JSON.parse(JSON.stringify(group)) : {
      id:null,name:"",output:"",controllers:[{entity_id:"",mode:"mirror",invert:false,reflect_state:true}],enabled:true,virtual_type:"light",area_id:null,
      behavior:{debounce_ms:120,authority_window_ms:1800,performance_mode:"instant",auto_heal:true,output_restore_policy:"adopt",command_timeout:null,max_retries:null,fallback_output:null,source_policy:"latest_physical"}
    };
    this._render();
  }

  _captureDraft() {
    const form=this.shadowRoot.getElementById("group-form"); if(!form||!this._editing)return;
    const fd=new FormData(form);
    this._editing.name=fd.get("name")||""; this._editing.output=fd.get("output")||""; this._editing.virtual_type=fd.get("virtual_type")||"light"; this._editing.area_id=fd.get("area_id")||null;
    this._editing.controllers=[...this.shadowRoot.querySelectorAll("[data-controller-row]")].map(row=>({entity_id:row.querySelector('[data-field="entity_id"]').value,mode:row.querySelector('[data-field="mode"]').value,invert:row.querySelector('[data-field="invert"]').checked,reflect_state:row.querySelector('[data-field="reflect_state"]').checked}));
    this._editing.behavior={debounce_ms:Number(fd.get("debounce_ms")||120),authority_window_ms:Number(fd.get("authority_window_ms")||1800),performance_mode:fd.get("performance_mode")||"instant",auto_heal:fd.get("auto_heal")==="on",output_restore_policy:fd.get("output_restore_policy")||"adopt",source_policy:fd.get("source_policy")||"latest_physical",fallback_output:(fd.get("fallback_output")||"").trim()||null,command_timeout:fd.get("command_timeout")===""?null:Number(fd.get("command_timeout")),max_retries:fd.get("max_retries")===""?null:Number(fd.get("max_retries"))};
    const details=this.shadowRoot.querySelector("details.advanced"); if(details)this._advancedOpen=details.open;
  }

  _validateEditorStep(step) {
    if(!this._editing)return false;
    let message="";
    if(step===1&&!String(this._editing.name||"").trim())message=this.t("groupName");
    if(step===2&&!String(this._editing.output||"").trim())message=this.t("output");
    if(step===3&&(!(this._editing.controllers||[]).length||this._editing.controllers.some(c=>!String(c.entity_id||"").trim())))message=this.t("controller");
    if(message){this._toast(`${message}: ${this.t("failed")}`,"error");return false;}
    return true;
  }

  _modifyControllers(kind,index) {
    const body=this.shadowRoot.querySelector("#editor .modal-body"); this._editorScrollTop=body?.scrollTop||0;
    this._captureDraft();
    this._editorStep=3;
    if(kind==="add") this._editing.controllers.push({entity_id:"",mode:"mirror",invert:false,reflect_state:true});
    else if(this._editing.controllers.length>1) this._editing.controllers.splice(index,1);
    this._render();
  }

  async _saveGroup(form) {
    this._captureDraft();
    for(const step of [1,2,3]){if(!this._validateEditorStep(step)){this._editorStep=step;this._render();return;}}
    const payload={name:this._editing.name.trim(),output:this._editing.output.trim(),controllers:this._editing.controllers.map(c=>({...c,entity_id:c.entity_id.trim()})),enabled:this._editing.enabled!==false,virtual_type:this._editing.virtual_type,area_id:this._editing.area_id,behavior:this._editing.behavior};
    try {
      await this._cancelLearn(false);
      if(this._editing.id) await this._hass.callWS({type:`${DOMAIN}/update`,group_id:this._editing.id,...payload}); else await this._hass.callWS({type:`${DOMAIN}/create`,...payload});
      this._editing=null; this._advancedOpen=false; this._editorScrollTop=0; this._toast(this.t("saved")); await this._refresh(false);
    } catch(err){this._toast(err.message||this.t("failed"),"error");}
  }

  async _startLearn(role,index) {
    if(!this._editing)return;
    this._editorStep=role==="output"?2:3;
    const body=this.shadowRoot.querySelector("#editor .modal-body"); this._editorScrollTop=body?.scrollTop||0;
    await this._cancelLearn(false);
    const started=await this._hass.callWS({type:`${DOMAIN}/learn_start`,role,timeout:12});
    this._learning={session_id:started.session_id,role,index,status:"waiting",candidates:[]};
    this._render();
    this._pollLearn(started.session_id);
  }

  async _pollLearn(sessionId) {
    clearTimeout(this._learnPollTimer);
    if(!this._learning||this._learning.session_id!==sessionId)return;
    try {
      const status=await this._hass.callWS({type:`${DOMAIN}/learn_status`,session_id:sessionId});
      if(!this._learning||this._learning.session_id!==sessionId)return;
      this._learning={...this._learning,...status}; this._render();
      if(status.status==="waiting"||status.status==="capturing") this._learnPollTimer=setTimeout(()=>this._pollLearn(sessionId),300);
    } catch(err){ this._learning={...this._learning,status:"timeout",candidates:[]}; this._render(); }
  }

  async _cancelLearn(render=true) {
    clearTimeout(this._learnPollTimer); this._learnPollTimer=null;
    const session=this._learning?.session_id;
    if(session&&this._hass){try{await this._hass.callWS({type:`${DOMAIN}/learn_cancel`,session_id:session});}catch(_){}}
    this._learning=null; if(render&&this._editing)this._render();
  }

  async _applyLearn(entity,mode) {
    if(!this._editing||!this._learning||!entity)return;
    const role=this._learning.role,index=this._learning.index;
    if(role==="output") this._editing.output=entity;
    else if(Number.isInteger(index)&&this._editing.controllers[index]) {
      this._editing.controllers[index].entity_id=entity;
      this._editing.controllers[index].mode=mode||"mirror";
      const domain=entity.split(".")[0];
      this._editing.controllers[index].reflect_state=["switch","light","input_boolean"].includes(domain)&&this._editing.controllers[index].mode==="mirror";
    }
    await this._cancelLearn(false); this._render();
  }

  _openSmartEditor(group) {
    this._smartLearning=null; clearTimeout(this._smartLearnTimer);
    const defaults={state_policy:"any",direction:"controller_only",controller_mode:"mirror",invert_controller:false,reflect_controller:true,performance_mode:"instant",auto_heal:true,verify_members:true,command_timeout:3,max_retries:1,member_delay_ms:0,failure_policy:"continue",manual_priority_ms:2500,scene_guard_ms:800,flap_threshold:8,flap_window_sec:10,quarantine_sec:60,notify_on_fault:false};
    this._smartEditing=group?JSON.parse(JSON.stringify(group)):{id:null,name:"",kind:"virtual",controller_entity:null,members:[{entity_id:"",enabled:true}],virtual_type:"light",area_id:this._commissionArea||null,enabled:true,maintenance:false,locked:false,favorite:false,behavior:{...defaults}};
    this._smartEditing.behavior={...defaults,...(this._smartEditing.behavior||{})};
    if(!this._smartEditing.members?.length)this._smartEditing.members=[{entity_id:"",enabled:true}];
    this._render();
  }

  _captureSmartDraft() {
    const form=this.shadowRoot.getElementById("smart-form"); if(!form||!this._smartEditing)return;
    const fd=new FormData(form), g=this._smartEditing, b=g.behavior||{};
    g.name=fd.get("name")||""; g.kind=fd.get("kind")||"virtual"; g.virtual_type=fd.get("virtual_type")||"light"; g.area_id=fd.get("area_id")||null;
    g.controller_entity=g.kind==="physical"?(fd.get("controller_entity")||""):null;
    g.members=[...this.shadowRoot.querySelectorAll("[data-smart-member-row]")].map(row=>({entity_id:row.querySelector('[data-field="entity_id"]').value,enabled:row.querySelector('[data-field="enabled"]').checked}));
    g.favorite=fd.get("favorite")==="on"; g.maintenance=fd.get("maintenance")==="on"; g.locked=fd.get("locked")==="on"; g.hide_members=fd.get("hide_members")==="on";
    g.behavior={...b,state_policy:fd.get("state_policy")||"any",direction:fd.get("direction")||"controller_only",controller_mode:fd.get("controller_mode")||b.controller_mode||"mirror",invert_controller:fd.get("invert_controller")==="on",reflect_controller:g.kind==="physical"&&fd.get("reflect_controller")==="on",performance_mode:fd.get("performance_mode")||"instant",auto_heal:fd.get("auto_heal")==="on",verify_members:fd.get("verify_members")==="on",command_timeout:Number(fd.get("command_timeout")||3),max_retries:Number(fd.get("max_retries")||0),member_delay_ms:Number(fd.get("member_delay_ms")||0),failure_policy:fd.get("failure_policy")||"continue",manual_priority_ms:Number(fd.get("manual_priority_ms")||0),scene_guard_ms:Number(fd.get("scene_guard_ms")||0),flap_threshold:Number(fd.get("flap_threshold")||8),flap_window_sec:Number(fd.get("flap_window_sec")||10),quarantine_sec:Number(fd.get("quarantine_sec")||60),notify_on_fault:fd.get("notify_on_fault")==="on"};
  }

  async _saveSmartGroup() {
    this._captureSmartDraft(); const g=this._smartEditing;if(!g)return;
    if(!String(g.name||"").trim())return this._toast(this.t("groupName"),"error");
    if(g.kind==="physical"&&!String(g.controller_entity||"").trim())return this._toast(this.t("physicalController"),"error");
    if(!g.members?.length||g.members.some(m=>!String(m.entity_id||"").trim()))return this._toast(this.t("member"),"error");
    const payload={name:g.name.trim(),kind:g.kind,controller_entity:g.kind==="physical"?g.controller_entity.trim():null,members:g.members.map(m=>({entity_id:m.entity_id.trim(),enabled:m.enabled!==false})),virtual_type:g.virtual_type,area_id:g.area_id||null,enabled:g.enabled!==false,maintenance:!!g.maintenance,locked:!!g.locked,favorite:!!g.favorite,hide_members:!!g.hide_members,behavior:g.behavior};
    try{await this._cancelSmartLearn(false);if(g.id)await this._hass.callWS({type:`${DOMAIN}/smart/update`,group_id:g.id,...payload});else await this._hass.callWS({type:`${DOMAIN}/smart/create`,...payload});this._smartEditing=null;this._toast(this.t("saved"));await this._refresh(false);}catch(err){this._toast(err.message||this.t("failed"),"error");}
  }

  async _startSmartLearn(role,index) {
    if(!this._smartEditing)return; await this._cancelSmartLearn(false);
    const baseRole=role==="member"?"output":"controller";
    const started=await this._hass.callWS({type:`${DOMAIN}/learn_start`,role:baseRole,timeout:12});
    this._smartLearning={session_id:started.session_id,role,index,status:"waiting",candidates:[]};this._render();this._pollSmartLearn(started.session_id);
  }

  async _pollSmartLearn(sessionId) {
    clearTimeout(this._smartLearnTimer);if(!this._smartLearning||this._smartLearning.session_id!==sessionId)return;
    try{const status=await this._hass.callWS({type:`${DOMAIN}/learn_status`,session_id:sessionId});if(!this._smartLearning||this._smartLearning.session_id!==sessionId)return;this._smartLearning={...this._smartLearning,...status};this._render();if(status.status==="waiting"||status.status==="capturing")this._smartLearnTimer=setTimeout(()=>this._pollSmartLearn(sessionId),300);}catch(_){this._smartLearning={...this._smartLearning,status:"timeout",candidates:[]};this._render();}
  }

  async _cancelSmartLearn(render=true) {
    clearTimeout(this._smartLearnTimer);this._smartLearnTimer=null;const sid=this._smartLearning?.session_id;if(sid&&this._hass){try{await this._hass.callWS({type:`${DOMAIN}/learn_cancel`,session_id:sid});}catch(_){}}
    this._smartLearning=null;if(render&&this._smartEditing)this._render();
  }

  async _applySmartLearn(entity,mode) {
    if(!this._smartEditing||!this._smartLearning||!entity)return;const {role,index}=this._smartLearning;
    if(role==="controller"){this._smartEditing.controller_entity=entity;this._smartEditing.kind="physical";this._smartEditing.behavior.controller_mode=mode||"mirror";}
    else if(Number.isInteger(index)&&this._smartEditing.members[index])this._smartEditing.members[index].entity_id=entity;
    await this._cancelSmartLearn(false);this._render();
  }

  async _commissionGroupArea() {
    const members=this._entities.filter(e=>(!this._commissionArea||e.area_id===this._commissionArea)&&["switch","light","input_boolean","fan"].includes((e.entity_id||"").split(".")[0])).map(e=>({entity_id:e.entity_id,enabled:true}));
    if(!members.length)return this._toast(this.t("noSuggestion"),"error");const area=this._areas.find(a=>a.area_id===this._commissionArea);const onlyLights=members.every(m=>m.entity_id.startsWith("light."));
    this._openSmartEditor({id:null,name:`${area?.name||"Area"} Group`,kind:"virtual",controller_entity:null,members,virtual_type:onlyLights?"light":"switch",area_id:this._commissionArea||null,enabled:true,maintenance:false,locked:false,favorite:false,behavior:{state_policy:"any",direction:"controller_only",controller_mode:"mirror",invert_controller:false,reflect_controller:false,performance_mode:"instant",auto_heal:true,verify_members:true,command_timeout:3,max_retries:1,member_delay_ms:0,failure_policy:"continue",manual_priority_ms:2500,scene_guard_ms:800,flap_threshold:8,flap_window_sec:10,quarantine_sec:60,notify_on_fault:false}});
  }

  async _runFullSystemTest() {
    const multiResults=await Promise.all((this._data.groups||[]).map(g=>this._hass.callWS({type:`${DOMAIN}/test`,group_id:g.id}).catch(err=>({group_id:g.id,name:g.name,passed:false,error:err.message}))));
    const smart=await this._hass.callWS({type:`${DOMAIN}/smart/test_all`});
    const multiPassed=multiResults.filter(r=>Array.isArray(r.entities)&&r.entities.every(e=>e.exists&&!['unavailable','unknown','missing'].includes(e.state))).length;
    this._systemReport={created_at:new Date().toISOString(),multiway:{total:multiResults.length,passed:multiPassed,failed:multiResults.length-multiPassed,results:multiResults},smart};
    this._toast(`${this.t("fullTest")}: ${(this._systemReport.multiway.passed||0)+(smart.passed||0)}/${multiResults.length+(smart.total||0)}`,((this._systemReport.multiway.passed||0)+(smart.passed||0))===multiResults.length+(smart.total||0)?"success":"error");this._render();
  }

  async _savePlatformSettings(form) {
    const fd=new FormData(form);const settings={project_name:String(fd.get("project_name")||"").trim(),installer_mode:fd.get("installer_mode")==="on",config_locked:fd.get("config_locked")==="on",snapshot_limit:Number(fd.get("snapshot_limit")||25)};
    try{await this._hass.callWS({type:`${DOMAIN}/smart/settings`,settings});this._toast(this.t("saved"));await this._refresh(false);this._render();}catch(err){this._toast(err.message||this.t("failed"),"error");}
  }

  async _fullExport() {
    const data=await this._hass.callWS({type:`${DOMAIN}/backup/full_export`});const text=JSON.stringify(data,null,2);this._backupDraft=text;const area=this.shadowRoot.getElementById("full-backup-data");if(area)area.value=text;const blob=new Blob([text],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`eshtaya-control-center-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);this._toast(this.t("copied"));
  }

  async _fullImport() {
    const area=this.shadowRoot.getElementById("full-backup-data"),text=(area?.value||this._backupDraft||"").trim();if(!text)return;let data;try{data=JSON.parse(text);}catch(_){return this._toast("Invalid JSON","error");}if(!confirm(this.t("restoreAll")))return;await this._hass.callWS({type:`${DOMAIN}/backup/full_import`,data});this._backupDraft=text;this._toast(this.t("saved"));await this._refresh(true);this._render();
  }

  _downloadSystemReport() {
    if(!this._systemReport)return;const payload={product:"Eshtaya Multi-Way Control",version:this._data.version,project:this._smart.settings?.project_name||null,...this._systemReport,missing_entities:this._missing};const text=JSON.stringify(payload,null,2),blob=new Blob([text],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`eshtaya-commissioning-report-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }

  async _saveSettings(form) {
    const fd=new FormData(form);
    const settings={startup_delay:Number(fd.get("startup_delay")),watchdog_interval:Number(fd.get("watchdog_interval")),command_timeout:Number(fd.get("command_timeout")),max_retries:Number(fd.get("max_retries")),history_size:Number(fd.get("history_size")),repair_threshold:Number(fd.get("repair_threshold")),confirm_output:fd.get("confirm_output")==="on"};
    try{await this._hass.callWS({type:`${DOMAIN}/update_settings`,settings});this._settingsDirty=false;this._toast(this.t("saved"));await this._refresh(false);this._render();}catch(err){this._toast(err.message||this.t("failed"),"error");}
  }

  async _export() {
    const data=await this._hass.callWS({type:`${DOMAIN}/export`});
    const text=JSON.stringify(data,null,2); this._backupDraft=text; const area=this.shadowRoot.getElementById("backup-data"); if(area)area.value=text;
    const blob=new Blob([text],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`eshtaya-multiway-backup-${new Date().toISOString().slice(0,10)}.json`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); this._toast(this.t("copied"));
  }

  async _import() {
    const area=this.shadowRoot.getElementById("backup-data"); const text=area?.value?.trim(); if(!text)return;
    let data; try{data=JSON.parse(text);}catch(_){return this._toast("Invalid JSON","error");}
    const replace=this.shadowRoot.getElementById("replace-import")?.checked||false; this._replaceImport=replace;
    if(replace&&!confirm(this.t("replace")))return;
    await this._hass.callWS({type:`${DOMAIN}/import`,data,replace}); this._settingsDirty=false; this._toast(this.t("saved")); await this._refresh(false); this._render();
  }

  _performanceLabel(p) { return ({instant:this.t("perfInstant"),balanced:this.t("perfBalanced"),safe:this.t("perfSafe")})[p]||this.t("perfInstant"); }
  _healthLabel(h) { return ({healthy:this.t("healthy"),degraded:this.t("degraded"),disabled:this.t("disabled"),output_offline:this.t("offline"),missing_output:this.t("missing"),out_of_sync:this.t("outOfSync"),recovering:this.t("recovering")})[h] || h || "—"; }
  _stateTone(s) { if(s==="on")return "on"; if(s==="off")return "off"; if(s==="unavailable"||s==="unknown")return "offline"; return "missing"; }
  _modeLabel(m) { return ({mirror:this.t("modeMirror"),toggle:this.t("modeToggle"),momentary_on:this.t("modeMomentaryOn"),momentary_off:this.t("modeMomentaryOff"),event:this.t("modeEvent"),follow_output:this.t("modeFollow")})[m]||m; }
  _fmtTime(ts) { try{return new Intl.DateTimeFormat(this.lang,{dateStyle:"short",timeStyle:"medium"}).format(new Date(ts));}catch(_){return ts||"—";} }
  _toast(message,type="success") { const t=this.shadowRoot?.getElementById("toast"); if(!t)return; clearTimeout(this._toastTimer); t.textContent=message; t.className=`toast show ${type}`; this._toastTimer=setTimeout(()=>{t.className="toast";},3500); }

  _styles() { return `
    :host{display:block;min-height:100%;background:var(--primary-background-color);color:var(--primary-text-color);font-family:var(--paper-font-body1_-_font-family,system-ui,-apple-system,sans-serif)}*{box-sizing:border-box}.app{padding:26px 28px 50px;max-width:1800px;margin:auto}.hero{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:24px}.eyebrow{font-size:11px;font-weight:800;letter-spacing:.16em;color:var(--primary-color);margin-bottom:8px}.hero h1{font-size:32px;line-height:1.1;margin:0 0 8px;font-weight:800}.hero p{margin:0;color:var(--secondary-text-color);font-size:14px}.hero-actions,.card-actions,.form-actions{display:flex;gap:9px;flex-wrap:wrap}button{font:inherit;border:0;cursor:pointer;min-height:40px;padding:0 14px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;gap:7px;font-weight:650;background:var(--secondary-background-color);color:var(--primary-text-color);transition:.15s ease}button:hover{filter:brightness(.97)}button.primary{background:var(--primary-color);color:var(--text-primary-color,#fff)}button.secondary{border:1px solid var(--divider-color);background:var(--card-background-color)}button.small{min-height:34px;padding:0 10px;font-size:12px}.danger-link{color:var(--error-color)!important}.icon-btn{width:40px;padding:0;border-radius:50%;background:transparent}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:20px}.stat{background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:14px;padding:16px;display:flex;align-items:center;gap:13px}.stat-icon{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:var(--secondary-background-color)}.stat.good .stat-icon{color:var(--success-color,#2eaf6d)}.stat.warn .stat-icon{color:var(--warning-color,#f4a62a)}.stat strong{font-size:24px;display:block;line-height:1}.stat span{display:block;color:var(--secondary-text-color);font-size:12px;margin-top:5px}.tabs{display:flex;gap:4px;border-bottom:1px solid var(--divider-color);margin-bottom:18px;overflow:auto}.tab{background:transparent;border-radius:0;padding:0 18px;min-height:46px;color:var(--secondary-text-color);white-space:nowrap;border-bottom:2px solid transparent}.tab.active{color:var(--primary-color);border-color:var(--primary-color)}.toolbar{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:16px}.search{height:42px;min-width:min(520px,100%);display:flex;align-items:center;gap:8px;padding:0 12px;border:1px solid var(--divider-color);border-radius:11px;background:var(--card-background-color)}.search input{border:0!important;background:transparent!important;padding:0!important;outline:0;width:100%;color:var(--primary-text-color);font-size:14px}.engine{display:inline-flex;align-items:center;gap:7px;font-size:12px;color:var(--secondary-text-color)}.engine span,.badge span,.dot{width:8px;height:8px;border-radius:50%;display:inline-block;background:var(--disabled-text-color)}.engine.ready span,.health-healthy span,.dot.on{background:var(--success-color,#2eaf6d)}.engine.waiting span,.health-recovering span{background:var(--warning-color,#f4a62a)}.group-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(390px,1fr));gap:14px}.group-card{background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:16px;padding:17px;min-width:0}.disabled-card{opacity:.72}.card-head,.section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.group-title{display:flex;align-items:center;gap:11px;min-width:0}.group-icon{width:42px;height:42px;border-radius:12px;background:color-mix(in srgb,var(--primary-color) 12%,transparent);color:var(--primary-color);display:grid;place-items:center;flex:0 0 auto}.group-title h3{margin:0;font-size:16px;overflow:hidden;text-overflow:ellipsis}.group-title small,.section-head p{display:block;color:var(--secondary-text-color);margin-top:4px;font-size:11px}.badge{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--divider-color);border-radius:999px;padding:6px 9px;font-size:11px;white-space:nowrap}.health-healthy{color:var(--success-color,#2eaf6d)}.health-degraded,.health-out_of_sync,.health-output_offline,.health-missing_output{color:var(--warning-color,#f4a62a)}.health-disabled{color:var(--secondary-text-color)}.state-line{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:16px 0}.state-line>div{background:var(--secondary-background-color);border-radius:10px;padding:10px}.state-line small{display:block;color:var(--secondary-text-color);font-size:10px;margin-bottom:4px}.state-line strong{font-size:13px}.state-on{color:var(--success-color,#2eaf6d)}.state-off{color:var(--secondary-text-color)}.output-box{display:grid;grid-template-columns:auto 1fr auto;gap:9px;align-items:center;border:1px solid var(--divider-color);border-radius:10px;padding:10px 11px}.output-box span,.section-label{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--secondary-text-color);font-weight:700}.output-box code,.member code{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px}.dot.off{background:var(--secondary-text-color)}.dot.offline{background:var(--warning-color,#f4a62a)}.dot.missing{background:var(--error-color)}.controllers{padding:13px 0 8px}.section-label{margin-bottom:7px}.member{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:8px;align-items:center;padding:5px 2px}.mode{font-size:9px;color:var(--secondary-text-color);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.meta{border-top:1px solid var(--divider-color);padding:10px 0;color:var(--secondary-text-color);font-size:10px}.meta span{display:flex;align-items:center;gap:6px;min-width:0}.meta b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.card-actions{border-top:1px solid var(--divider-color);padding-top:12px}.card-actions button{font-size:11px;min-height:34px;padding:0 9px}.empty{text-align:center;padding:70px 20px;border:1px dashed var(--divider-color);border-radius:16px;background:var(--card-background-color)}.empty>ha-icon{--mdc-icon-size:46px;color:var(--secondary-text-color)}.empty h2{margin:12px 0 5px}.empty p{color:var(--secondary-text-color);margin:0 auto 18px;max-width:540px}.success-banner{display:flex;align-items:center;gap:13px;padding:16px;border:1px solid color-mix(in srgb,var(--success-color,#2eaf6d) 35%,var(--divider-color));background:color-mix(in srgb,var(--success-color,#2eaf6d) 8%,var(--card-background-color));border-radius:14px;margin-bottom:15px;color:var(--success-color,#2eaf6d)}.success-banner span{display:block;color:var(--secondary-text-color);font-size:11px;margin-top:3px}.table-wrap{overflow:auto;background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:14px}table{border-collapse:collapse;width:100%;min-width:820px}th,td{text-align:start;border-bottom:1px solid var(--divider-color);padding:12px 14px;font-size:12px}th{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--secondary-text-color);background:var(--secondary-background-color)}td small{display:block;color:var(--secondary-text-color);margin-top:3px}.result{font-weight:700}.result-success{color:var(--success-color,#2eaf6d)}.result-failed{color:var(--error-color)}.result-partial,.result-warning{color:var(--warning-color,#f4a62a)}.muted{color:var(--secondary-text-color);text-align:center}.settings-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(320px,.8fr);gap:14px}.settings-card{background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:16px;padding:18px}.settings-card h2,.section-head h2,.section-head h3{margin:0}.version-chip{font-size:11px;border:1px solid var(--divider-color);padding:6px 9px;border-radius:999px}.form-grid{display:grid;gap:12px;margin-top:15px}.form-grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}.field{display:flex;flex-direction:column;gap:6px;min-width:0}.field>span{font-size:11px;color:var(--secondary-text-color);font-weight:650}.field input,.field select,textarea{width:100%;min-height:42px;border:1px solid var(--divider-color);border-radius:9px;padding:8px 10px;background:var(--primary-background-color);color:var(--primary-text-color);font:inherit;font-size:13px;outline:none}.field input:focus,.field select:focus,textarea:focus{border-color:var(--primary-color)}textarea{resize:vertical;margin-top:15px;min-height:220px}.check-row{display:flex;align-items:flex-start;gap:10px;margin-top:15px;padding:11px;border:1px solid var(--divider-color);border-radius:10px}.check-row input{width:18px;height:18px}.check-row b,.check-row small{display:block}.check-row b{font-size:12px}.check-row small{font-size:10px;color:var(--secondary-text-color);margin-top:3px}.form-actions{justify-content:flex-end;margin-top:17px}.form-actions.split{justify-content:space-between}.modal{border:0;padding:0;border-radius:18px;background:var(--card-background-color);color:var(--primary-text-color);width:min(1040px,calc(100% - 28px));max-height:calc(100% - 28px);box-shadow:0 18px 60px rgba(0,0,0,.35)}.modal::backdrop{background:rgba(0,0,0,.58)}.small-modal{width:min(720px,calc(100% - 28px))}.modal-head{display:flex;justify-content:space-between;align-items:center;padding:17px 20px;border-bottom:1px solid var(--divider-color)}.modal-head h2{margin:0;font-size:20px}.modal-head p{margin:3px 0 0;color:var(--secondary-text-color);font-size:11px}.modal-body{padding:20px;overflow:auto;max-height:calc(100vh - 190px)}.modal-actions{display:flex;justify-content:flex-end;gap:9px;padding:14px 20px;border-top:1px solid var(--divider-color)}.controllers-editor{margin-top:18px;border-top:1px solid var(--divider-color);padding-top:16px}.controller-row{display:grid;grid-template-columns:32px minmax(190px,1.6fr) minmax(170px,1fr) auto auto 40px;gap:8px;align-items:end;padding:10px 0;border-bottom:1px solid var(--divider-color)}.controller-index{width:28px;height:28px;border-radius:50%;background:var(--secondary-background-color);display:grid;place-items:center;font-size:11px;margin-bottom:7px}.mini-check{display:flex;align-items:center;gap:5px;min-height:42px;font-size:10px;color:var(--secondary-text-color);white-space:nowrap}.mini-check input{width:16px;height:16px}.advanced{margin-top:18px;border:1px solid var(--divider-color);border-radius:12px}.advanced summary{cursor:pointer;padding:13px;display:flex;align-items:center;gap:7px;font-weight:700;font-size:12px}.advanced-body{padding:0 13px 13px}.draft-safe{display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid color-mix(in srgb,var(--success-color,#2eaf6d) 28%,var(--divider-color));background:color-mix(in srgb,var(--success-color,#2eaf6d) 6%,var(--card-background-color));border-radius:11px;color:var(--secondary-text-color);font-size:11px}.draft-safe ha-icon{color:var(--success-color,#2eaf6d)}.performance-box{margin-top:14px;padding:13px;border:1px solid var(--divider-color);border-radius:11px;background:var(--secondary-background-color)}.performance-box small{display:block;margin-top:7px;color:var(--secondary-text-color);font-size:10px;line-height:1.45}.perf-mini{font-weight:750}.perf-instant{color:var(--success-color,#2eaf6d)}.perf-balanced{color:var(--primary-color)}.perf-safe{color:var(--warning-color,#f4a62a)}.test-modal{width:min(900px,calc(100% - 28px))}.test-intro{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:12px;padding:13px;border:1px solid var(--divider-color);border-radius:12px;background:var(--secondary-background-color);margin-bottom:12px}.test-intro>ha-icon{color:var(--primary-color)}.test-intro b,.test-intro span{display:block}.test-intro span{font-size:10px;color:var(--secondary-text-color);margin-top:3px}.test-list{border:1px solid var(--divider-color);border-radius:12px;overflow:hidden}.test-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto minmax(180px,auto);gap:10px;align-items:center;padding:11px 12px;border-bottom:1px solid var(--divider-color)}.test-row:last-child{border-bottom:0}.test-entity{min-width:0}.test-entity code{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px}.test-entity small{display:block;color:var(--secondary-text-color);font-size:9px;margin-top:3px}.test-ok{color:var(--success-color,#2eaf6d)}.test-fail{color:var(--error-color)}.state-chip{font-size:10px;font-weight:800;text-transform:uppercase;border:1px solid var(--divider-color);border-radius:999px;padding:5px 8px}.state-chip.state-on{color:var(--success-color,#2eaf6d)}.test-action{min-width:92px}.test-action:disabled{opacity:.55;cursor:not-allowed}.test-actions{justify-content:space-between}.toast{position:fixed;inset:auto 24px 24px auto;background:var(--card-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);border-radius:11px;padding:12px 16px;box-shadow:0 8px 30px rgba(0,0,0,.25);opacity:0;transform:translateY(12px);pointer-events:none;transition:.2s;z-index:9999;max-width:420px}.toast.show{opacity:1;transform:none}.toast.error{border-color:var(--error-color);color:var(--error-color)}.loading{height:160px;display:grid;place-items:center}.loading span{width:32px;height:32px;border:3px solid var(--divider-color);border-top-color:var(--primary-color);border-radius:50%;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
    .control-hero{background:linear-gradient(135deg,color-mix(in srgb,var(--primary-color) 9%,var(--card-background-color)),var(--card-background-color));border:1px solid color-mix(in srgb,var(--primary-color) 18%,var(--divider-color))}.wide-tabs{overflow:auto;display:flex;scrollbar-width:thin}.wide-tabs .tab{min-width:max-content;display:inline-flex;align-items:center;gap:7px}.lock-banner,.success-banner{display:flex;align-items:center;gap:9px;border-radius:12px;padding:11px 14px;margin:0 0 14px;border:1px solid var(--warning-color,#f4a62a);background:color-mix(in srgb,var(--warning-color,#f4a62a) 7%,var(--card-background-color))}.success-banner{border-color:var(--success-color,#2eaf6d);background:color-mix(in srgb,var(--success-color,#2eaf6d) 7%,var(--card-background-color))}.dashboard-grid,.commissioning-grid,.health-tabs-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.full-span{grid-column:1/-1}.quick-grid,.favorite-grid,.report-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.quick-card,.fav-card{border:1px solid var(--divider-color);border-radius:13px;background:var(--secondary-background-color);padding:14px;color:var(--primary-text-color)}button.quick-card{text-align:start;cursor:pointer;display:grid;gap:8px}.quick-card ha-icon{color:var(--primary-color)}.quick-card b,.fav-card b{font-size:12px}.quick-card small,.fav-card small{font-size:10px;color:var(--secondary-text-color)}.fav-card{display:grid;gap:10px}.seg-control{display:grid;grid-template-columns:1fr 1fr;gap:4px}.seg-control button{min-height:34px}.seg-control button.active{background:var(--primary-color);color:var(--text-primary-color,#fff);border-color:var(--primary-color)}.health-stack{display:grid;gap:7px}.health-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid var(--divider-color)}.health-row:last-child{border-bottom:0}.health-row>div{display:grid;gap:2px}.health-row small{color:var(--secondary-text-color)}.good-text{color:var(--success-color,#2eaf6d)}.warn-text{color:var(--warning-color,#f4a62a)}.topology-mini{display:flex;align-items:center;gap:8px;padding:9px 0}.node{font-size:9px;border:1px solid var(--divider-color);padding:5px 7px;border-radius:999px}.source-node{border-color:color-mix(in srgb,var(--primary-color) 45%,var(--divider-color));color:var(--primary-color)}.topology-line{height:1px;flex:1;background:var(--divider-color)}.node-bucket{display:flex;gap:4px}.node-bucket i{width:8px;height:8px;border-radius:50%;background:var(--success-color,#2eaf6d)}.commission-actions{display:flex;gap:8px;margin:12px 0}.suggestion-box,.native-row,.repair-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;border:1px solid var(--divider-color);border-radius:11px;padding:11px;margin-top:10px}.suggestion-box small,.native-row small,.repair-row small,.native-row code,.repair-row code{display:block;color:var(--secondary-text-color);font-size:9px;margin-top:3px}.entity-cloud{display:flex;gap:5px;flex-wrap:wrap;margin-top:12px}.entity-cloud code{padding:5px 7px;border-radius:7px;background:var(--secondary-background-color);font-size:9px}.native-list{display:grid;gap:7px}.repair-card{margin-top:14px}.repair-row{grid-template-columns:minmax(0,1.2fr) minmax(180px,1fr) auto}.report-grid>div{display:grid;gap:3px;padding:12px;border:1px solid var(--divider-color);border-radius:11px;background:var(--secondary-background-color)}.report-grid strong{font-size:22px}.report-grid span{font-size:10px;color:var(--secondary-text-color)}.smart-primary{background:color-mix(in srgb,var(--primary-color) 88%,#000)}.smart-member-row{grid-template-columns:32px minmax(220px,1fr) auto 40px}.smart-member-card{grid-template-columns:auto minmax(0,1fr) auto auto!important}.mini-action{min-height:28px;padding:3px 7px;font-size:9px;border:1px solid var(--divider-color);border-radius:7px;background:transparent;color:var(--secondary-text-color);cursor:pointer}.warn-action{color:var(--warning-color,#f4a62a);border-color:color-mix(in srgb,var(--warning-color,#f4a62a) 45%,var(--divider-color))}.row-actions{display:flex;gap:6px;flex-wrap:wrap}.compact-check{align-self:end}.muted-pad{padding:18px;color:var(--secondary-text-color);text-align:center}.v3-old-settings{margin-top:14px}.v3-old-settings .settings-grid{margin-top:0}
    .wizard-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:14px 0 18px}.wizard-step{min-height:58px;border:1px solid var(--divider-color);border-radius:11px;background:var(--secondary-background-color);color:var(--secondary-text-color);display:grid;grid-template-columns:auto auto minmax(0,1fr);gap:7px;align-items:center;text-align:start;padding:9px;cursor:pointer}.wizard-step>span{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:var(--card-background-color);font-size:10px;font-weight:800}.wizard-step>span ha-icon{--mdc-icon-size:14px}.wizard-step>ha-icon{--mdc-icon-size:18px}.wizard-step b{font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.wizard-step.active{border-color:var(--primary-color);color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 8%,var(--card-background-color))}.wizard-step.done>span{background:var(--success-color,#2eaf6d);color:#fff}.wizard-section{display:none;min-height:245px}.wizard-section.active{display:block}.section-kicker{font-size:10px;text-transform:uppercase;letter-spacing:.09em;color:var(--primary-color);font-weight:850;margin:4px 0 12px}.wizard-actions{justify-content:space-between}.wizard-nav{display:flex;gap:8px}.wizard-nav button{display:inline-flex;align-items:center;gap:6px}.timeline{margin-top:14px;border:1px solid var(--divider-color);border-radius:12px;padding:12px}.timeline-list{display:grid;gap:5px;margin-top:9px}.timeline-row{display:grid;grid-template-columns:auto 76px minmax(90px,.7fr) minmax(120px,1fr) auto;gap:8px;align-items:center;padding:7px 8px;border-radius:8px;background:var(--secondary-background-color);font-size:10px}.timeline-row code{font-size:9px}.timeline-row span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.timeline-row em{font-style:normal;color:var(--secondary-text-color);white-space:nowrap}.timeline-dot{width:7px;height:7px;border-radius:50%;background:var(--secondary-text-color)}.timeline-dot.result-success{background:var(--success-color,#2eaf6d)}.timeline-dot.result-failed{background:var(--error-color)}.timeline-dot.result-partial,.timeline-dot.result-warning{background:var(--warning-color,#f4a62a)}.timeline-empty{padding:18px;text-align:center;color:var(--secondary-text-color);font-size:11px}.entity-pick-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;align-items:center}.learn-btn{min-height:42px;border:1px solid color-mix(in srgb,var(--primary-color) 45%,var(--divider-color));background:color-mix(in srgb,var(--primary-color) 8%,var(--card-background-color));color:var(--primary-color);border-radius:9px;padding:0 11px;display:inline-flex;align-items:center;gap:6px;font-weight:750;cursor:pointer}.learn-btn.compact{padding:0 9px}.learn-panel{margin:12px 0 16px;padding:13px;border:1px solid color-mix(in srgb,var(--primary-color) 38%,var(--divider-color));border-radius:13px;background:color-mix(in srgb,var(--primary-color) 6%,var(--card-background-color))}.learn-head{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;gap:10px;align-items:center}.learn-head>ha-icon{color:var(--primary-color)}.learn-head b,.learn-head small{display:block}.learn-head small{font-size:10px;color:var(--secondary-text-color);margin-top:3px}.learn-pulse{width:10px;height:10px;border-radius:50%;background:var(--primary-color);animation:learnPulse 1s ease-in-out infinite}.learn-candidates{display:grid;gap:7px;margin-top:12px}.learn-candidate{width:100%;display:grid;grid-template-columns:26px minmax(0,1fr) auto auto;gap:9px;align-items:center;text-align:start;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color);border-radius:10px;padding:10px;cursor:pointer}.learn-candidate:hover{border-color:var(--primary-color)}.learn-candidate code,.learn-candidate small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.learn-candidate small{color:var(--secondary-text-color);font-size:9px;margin-top:3px}.learn-candidate b{color:var(--primary-color)}.candidate-rank{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:var(--secondary-background-color);font-size:10px;font-weight:800}.test-buttons{display:flex;gap:6px;align-items:center;justify-content:flex-end}.test-rapid{min-height:36px;padding:0 8px;font-size:10px}.ghost{border:1px solid var(--divider-color);background:transparent;color:var(--secondary-text-color);border-radius:8px;display:inline-flex;align-items:center;gap:5px;cursor:pointer}.ghost:hover{color:var(--primary-color);border-color:var(--primary-color)}@keyframes learnPulse{0%,100%{opacity:.35;transform:scale(.8)}50%{opacity:1;transform:scale(1.25)}}@media(max-width:900px){.dashboard-grid,.commissioning-grid,.health-tabs-grid{grid-template-columns:1fr}.quick-grid,.favorite-grid,.report-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.repair-row{grid-template-columns:1fr}.wizard-steps{grid-template-columns:repeat(2,1fr)}.app{padding:18px 14px 38px}.hero{align-items:flex-start;flex-direction:column}.hero-actions{width:100%}.hero-actions button{flex:1}.stats{grid-template-columns:repeat(2,1fr)}.group-grid{grid-template-columns:1fr}.settings-grid{grid-template-columns:1fr}.controller-row{grid-template-columns:28px 1fr 40px}.controller-row .mode-field{grid-column:2/3}.mini-check{grid-column:auto}.form-grid.two{grid-template-columns:1fr}.toolbar{align-items:stretch;flex-direction:column}.search{min-width:0;width:100%}}@media(max-width:520px){.quick-grid,.favorite-grid,.report-grid{grid-template-columns:1fr}.wizard-step b{font-size:9px}.wizard-actions{align-items:stretch}.wizard-nav{flex:1;justify-content:flex-end}.test-intro{grid-template-columns:auto 1fr}.test-intro .test-health{grid-column:1/3}.test-row{grid-template-columns:auto minmax(0,1fr) auto}.test-buttons{grid-column:2/4;width:100%;justify-content:stretch}.test-buttons button{flex:1}.test-action{width:100%}.hero h1{font-size:25px}.stats{grid-template-columns:1fr 1fr}.stat{padding:12px}.state-line{grid-template-columns:1fr}.card-actions button{flex:1}.controller-row{grid-template-columns:28px minmax(0,1fr) 40px}.mini-check{grid-column:2/3}.modal-body{padding:14px}.modal-head,.modal-actions{padding:13px 14px}.toast{inset:auto 12px 12px 12px}.tabs .tab{padding:0 13px}}
  `; }
}

if (!customElements.get("eshtaya-multiway-panel")) {
  customElements.define("eshtaya-multiway-panel", EshtayaMultiWayPanel);
}
