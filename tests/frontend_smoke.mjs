import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../custom_components/eshtaya_multiway/frontend/panel.js', import.meta.url), 'utf8');

class FakeHTMLElement {
  attachShadow() {
    this.shadowRoot = {
      innerHTML: '',
      getElementById: () => null,
      querySelectorAll: () => [],
      querySelector: () => null,
    };
    return this.shadowRoot;
  }
}

const registry = new Map();
const sandbox = {
  console,
  HTMLElement: FakeHTMLElement,
  customElements: {
    get(name) { return registry.get(name); },
    define(name, klass) { registry.set(name, klass); },
  },
  setTimeout: () => 0,
  clearTimeout: () => {},
  queueMicrotask: () => {},
  Blob: class {},
  URL: { createObjectURL: () => '', revokeObjectURL: () => {} },
  document: { createElement: () => ({ click() {} }) },
};
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: 'panel.js' });
const Panel = registry.get('eshtaya-multiway-panel');
assert.ok(Panel, 'panel custom element must register');

function fakeForm(values) { return { _values: values }; }
sandbox.FormData = class {
  constructor(form) { this.values = form._values; }
  get(name) { return Object.prototype.hasOwnProperty.call(this.values, name) ? this.values[name] : null; }
};

const panel = new Panel();
panel._hass = { language: 'en', states: {} };
panel._entities = [
  { entity_id: 'light.kitchen' },
  { entity_id: 'scene.arrive_home' },
  { entity_id: 'scene.movie_time' },
  { entity_id: 'script.good_night' },
  { entity_id: 'automation.notify_family' },
];

// Regression: draft capture must not throw while changing to an Action Group.
panel._smartEditing = {
  id: null,
  name: 'Actions',
  kind: 'virtual',
  controller_entity: null,
  group_type: 'light',
  virtual_type: 'light',
  members: [{ entity_id: '', enabled: true }],
  behavior: {},
};
const form = fakeForm({
  name: 'Actions', group_type: 'scene', kind: 'virtual', area_id: '',
  compatibility_mode: 'strict', action_execution: 'parallel', action_cooldown_ms: '250',
  scene_transition: '0', action_data: '{}', performance_mode: 'instant', source_stable_ms: '220',
  command_echo_ms: '5000', command_timeout: '3', max_retries: '0', member_delay_ms: '0',
  failure_policy: 'continue', manual_priority_ms: '0', scene_guard_ms: '0', flap_threshold: '8',
  flap_window_sec: '10', quarantine_sec: '60', sensor_calc_type: 'mean'
});
const memberRow = {
  querySelector(selector) {
    if (selector.includes('entity_id')) return { value: '' };
    if (selector.includes('enabled')) return { checked: true };
    return null;
  }
};
panel.shadowRoot = {
  getElementById(id) { return id === 'smart-form' ? form : null; },
  querySelectorAll(selector) { return selector === '[data-smart-member-row]' ? [memberRow] : []; },
  querySelector() { return null; },
};
assert.doesNotThrow(() => panel._captureSmartDraft());
assert.equal(panel._smartEditing.group_type, 'scene');
assert.equal(panel._smartEditing.virtual_type, 'scene');

// Every supported Smart Group domain must render without runtime reference errors.
for (const domain of ['light','switch','fan','cover','lock','media_player','valve','button','scene','script','automation','binary_sensor','sensor','event','notify']) {
  panel._smartEditing = {
    id: null, name: `Test ${domain}`, kind: 'virtual', controller_entity: null,
    group_type: domain, virtual_type: domain, area_id: null, enabled: true,
    maintenance: false, locked: false, favorite: false, hide_members: false,
    members: [{ entity_id: '', enabled: true }], behavior: {}
  };
  assert.doesNotThrow(() => panel._renderSmartEditorDialog(), `${domain} editor render failed`);
}

// Regression: candidates must follow the selected domain rather than remaining Light-only.
assert.deepEqual(
  panel._smartMemberCandidates('scene', [{ entity_id: '', enabled: true }], 'strict').map(e => e.entity_id),
  ['scene.arrive_home', 'scene.movie_time']
);
assert.deepEqual(
  panel._smartMemberCandidates('script', [{ entity_id: '', enabled: true }], 'strict').map(e => e.entity_id),
  ['script.good_night']
);
assert.deepEqual(
  panel._smartMemberCandidates('automation', [{ entity_id: '', enabled: true }], 'strict').map(e => e.entity_id),
  ['automation.notify_family']
);

// Regression: Add Member must append a row when a compatible unused entity exists.
panel._render = () => {};
panel._toast = (message) => { throw new Error(`unexpected toast: ${message}`); };
panel._smartEditing.group_type = 'scene';
panel._smartEditing.virtual_type = 'scene';
panel._smartEditing.members = [{ entity_id: 'scene.arrive_home', enabled: true }];
panel.shadowRoot = {
  getElementById(id) { return id === 'smart-form' ? fakeForm({ name:'Actions', group_type:'scene', kind:'virtual', area_id:'', compatibility_mode:'strict', action_execution:'parallel', action_cooldown_ms:'250', scene_transition:'0', action_data:'{}', performance_mode:'instant', source_stable_ms:'220', command_echo_ms:'5000', command_timeout:'3', max_retries:'0', member_delay_ms:'0', failure_policy:'continue', manual_priority_ms:'0', scene_guard_ms:'0', flap_threshold:'8', flap_window_sec:'10', quarantine_sec:'60', sensor_calc_type:'mean' }) : null; },
  querySelectorAll(selector) {
    if (selector !== '[data-smart-member-row]') return [];
    return [{ querySelector(sel) { return sel.includes('entity_id') ? { value:'scene.arrive_home' } : { checked:true }; } }];
  },
  querySelector() { return null; },
};
await panel._action({ dataset: { action: 'smart-member-add' } });
assert.equal(panel._smartEditing.members.length, 2);
assert.equal(panel._smartEditing.members[1].entity_id, '');

// Catalog must merge registry + live states so YAML/state-only actions are selectable.
const catalogPanel = new Panel();
catalogPanel._hass = {
  states: {
    'scene.yaml_scene': { attributes: { friendly_name: 'YAML Scene' } },
    'script.yaml_script': { attributes: { friendly_name: 'YAML Script' } },
    'automation.yaml_auto': { attributes: { friendly_name: 'YAML Automation' } },
  },
  callWS: async ({ type }) => {
    if (type === 'config/entity_registry/list') return [{ entity_id:'light.registry_light', area_id:null, device_id:null }];
    if (type === 'config/area_registry/list') return [];
    if (type === 'config/device_registry/list') return [];
    throw new Error(type);
  },
};
await catalogPanel._loadCatalog();
const ids = new Set(catalogPanel._entities.map(e => e.entity_id));
for (const id of ['light.registry_light','scene.yaml_scene','script.yaml_script','automation.yaml_auto']) assert.ok(ids.has(id), `${id} missing from catalog`);

console.log('Frontend smoke tests passed');
