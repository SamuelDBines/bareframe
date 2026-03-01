import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const componentsFile = path.join(root, 'all-components.md');
const examplesDir = path.join(root, 'public');

function slugify(value) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function categoryForSlug(slug) {
	const tokens = slug.split('-');
	const has = (value) => tokens.includes(value);
	const hasAny = (...values) => values.some((value) => has(value));

	if (hasAny('code', 'editor', 'textarea')) {
		return 'editor';
	}
	if (hasAny('calendar', 'date', 'countdown', 'timeline')) {
		return 'date-time';
	}
	if (
		hasAny(
			'input',
			'field',
			'textarea',
			'search',
			'select',
			'combobox',
			'autocomplete',
			'color',
			'number',
			'otp',
			'checkbox',
			'radio',
			'switch',
			'slider',
			'rating',
			'range',
			'toggle',
			'upload',
			'file',
			'range',
		)
	) {
		return 'forms';
	}
	if (
		hasAny(
			'chart',
			'graph',
			'heatmap',
			'sparkline',
			'gantt',
			'treemap',
			'gauge',
			'donut',
			'pie',
		)
	) {
		return 'charts';
	}
	if (
		hasAny(
			'dialog',
			'modal',
			'drawer',
			'sheet',
			'bottom',
			'popover',
			'tooltip',
			'toast',
			'expanded',
			'error',
		)
	) {
		return 'feedback';
	}
	if (hasAny('nav', 'menu', 'breadcrumb', 'tab', 'pagination', 'toolbar', 'action', 'quick', 'navigation', 'link', 'anchor')) {
		return 'navigation';
	}
	if (hasAny('table', 'data', 'grid', 'list', 'tree', 'key', 'value', 'filter')) {
		return 'collections';
	}
	if (hasAny('canvas')) {
		return 'canvas';
	}
	if (hasAny('avatar', 'icon', 'image', 'video', 'carousel', 'map')) {
		return 'media';
	}
	return 'base';
}

function relatedByCategory(category) {
	if (category === 'base') {
		return ['bf-card', 'bf-edge', 'bf-nav'];
	}
	if (category === 'forms') {
		return ['bf-form-field', 'bf-input', 'bf-button'];
	}
	if (category === 'date-time') {
		return ['bf-calendar', 'bf-date-picker', 'bf-date-range-picker'];
	}
	if (category === 'charts') {
		return ['bf-card', 'bf-filter-bar', 'bf-segmented-control'];
	}
	if (category === 'editor') {
		return ['bf-editor', 'bf-input', 'bf-card'];
	}
	if (category === 'feedback') {
		return ['bf-button', 'bf-toast', 'bf-dialog'];
	}
	if (category === 'navigation') {
		return ['bf-nav', 'bf-breadcrumb', 'bf-menu'];
	}
	if (category === 'collections') {
		return ['bf-search', 'bf-pagination', 'bf-tag'];
	}
	if (category === 'canvas') {
		return ['bf-canvas', 'bf-toolbar', 'bf-dialog'];
	}
	if (category === 'media') {
		return ['bf-avatar', 'bf-image', 'bf-video-player'];
	}
	return ['bf-card', 'bf-edge', 'bf-nav'];
}

function primaryDemo(tag, name, slug, category) {
	if (slug === 'accordion') {
		return `
<div class="stack">
  <div class="demo-row">
    <bf-button bf-open="docs-accordion:intro">Open Intro</bf-button>
    <bf-button variant="secondary" bf-toggle="docs-accordion:api">Toggle API</bf-button>
  </div>
  <bf-accordion id="docs-accordion">
    <section id="intro" title="Introduction">
      <p>Reusable component composition block.</p>
    </section>
    <section id="api" title="API">
      <p>Open/close sections by id for deterministic tests.</p>
    </section>
  </bf-accordion>
</div>`.trim();
	}
	if (slug === 'avatar') {
		return `
<div class="stack">
  <div class="demo-row">
    <bf-avatar name="Samuel Bines" size="sm" status="online"></bf-avatar>
    <bf-avatar name="Morgan Lee" size="md" status="away"></bf-avatar>
    <bf-avatar name="Iris Chen" size="lg" status="busy"></bf-avatar>
    <bf-avatar name="Taylor Jordan" size="xl" status="offline"></bf-avatar>
  </div>
  <p class="hint">Avatar supports image, initials fallback, size, and status.</p>
</div>`.trim();
	}
	if (slug === 'breadcrumb') {
		return `
<div class="stack">
  <bf-breadcrumb variant="default" separator="chevron">
    <a href="#">Home</a>
    <a href="#">Projects</a>
    <a href="#">Bareframe</a>
    <span current>UI Kit</span>
  </bf-breadcrumb>

  <bf-breadcrumb variant="minimal" separator="slash">
    <a href="#">Workspace</a>
    <a href="#">Settings</a>
    <span current>Theme</span>
  </bf-breadcrumb>

  <bf-breadcrumb variant="minimal" separator="|">
    <a href="#">Docs</a>
    <a href="#">Design</a>
    <span current>Tokens</span>
  </bf-breadcrumb>

  <bf-breadcrumb variant="pills" separator-icon="→" max="4">
    <a href="#">Company</a>
    <a href="#">Products</a>
    <a href="#">Web</a>
    <a href="#">Components</a>
    <a href="#">Navigation</a>
    <span current>Breadcrumbs</span>
  </bf-breadcrumb>
</div>`.trim();
	}
	if (slug === 'autocomplete') {
		return `
<div class="stack">
  <${tag}
    placeholder="Search components..."
    options='["Accordion","Alert","Autocomplete","Button","Card","Data Grid","Dialog","Dropdown","Modal","Table","Tabs","Toast","Tooltip","Typography"]'
  ></${tag}>
  <p class="hint">Try typing: <code>to</code>, <code>tab</code>, <code>auto</code>. Use arrow keys + Enter to select.</p>
</div>`.trim();
	}
	if (slug === 'dropdown') {
		return `
<bf-dropdown>
  <bf-button slot="trigger">Actions</bf-button>
  <button slot="content" item value="profile">Edit profile</button>
  <button slot="content" item value="team">Team settings</button>
  <button slot="content" item value="audit">Audit log</button>
  <button slot="content" item value="signout">Sign out</button>
</bf-dropdown>`.trim();
	}
	if (slug === 'editor') {
		return `
<div class="stack">
  <p class="hint">Unified editor with <code>code</code> and <code>richtext</code> modes.</p>
  <div row>
    <div col="6">
      <bf-editor code value="function greet(name) {\n  return 'Hello ' + name;\n}\n\nconsole.log(greet('Bareframe'));" placeholder="Write code..."></bf-editor>
    </div>
    <div col="6">
      <bf-editor richtext value="<h3>Release Notes</h3><p>Editor now supports <strong>rich text</strong> mode.</p><ul><li>Bold</li><li>Italic</li><li>Lists</li></ul>"></bf-editor>
    </div>
  </div>
</div>`.trim();
	}
	if (slug === 'menu') {
		return `
<div class="stack">
  <bf-menu>
    <div item value="open">Open</div>
    <div item value="rename">Rename</div>
    <div item value="archive">Archive</div>
  </bf-menu>

  <div id="context-zone" style="min-height: 80px; border: 1px dashed var(--bf-theme-border-1, #cbd5e1); border-radius: 8px; padding: 0.8rem;">
    Right-click in this area
  </div>
  <bf-menu context for="context-zone">
    <div item value="copy">Copy</div>
    <div item value="paste">Paste</div>
    <div item value="delete">Delete</div>
  </bf-menu>
</div>`.trim();
	}
	if (slug === 'dialog') {
		return `
<div class="stack">
  <div class="demo-row">
    <bf-button bf-open="dialog-sheet" variant="secondary">Open Sheet</bf-button>
    <bf-button bf-open="dialog-panel" variant="secondary">Open Panel</bf-button>
  </div>

  <bf-dialog id="dialog-sheet" variant="bottom-sheet" label="Bottom sheet">
    <p>Bottom sheet variant from the bottom edge.</p>
    <bf-button bf-close="dialog-sheet">Close</bf-button>
  </bf-dialog>

  <bf-dialog id="dialog-panel" variant="panel" position="right" label="Panel">
    <p>Panel variant anchored right.</p>
    <bf-button bf-close="dialog-panel">Close</bf-button>
  </bf-dialog>

  <bf-dialog variant="popover" position="top-right">Popover-style content</bf-dialog>
  <bf-dialog variant="tooltip" position="bottom-left">Tooltip-style hint</bf-dialog>
</div>`.trim();
	}
	if (slug === 'canvas') {
		return `
<bf-canvas>
  <div class="stack">
    <div class="demo-row">
      <bf-button variant="secondary">Select</bf-button>
      <bf-button variant="secondary">Line</bf-button>
      <bf-button variant="secondary">Rectangle</bf-button>
      <bf-button variant="secondary">Text</bf-button>
      <bf-button variant="secondary">Export</bf-button>
    </div>
    <div style="min-height: 180px; border: 1px dashed var(--bf-theme-border-1, #cbd5e1); border-radius: 10px; background: repeating-linear-gradient(0deg, rgba(148,163,184,0.08), rgba(148,163,184,0.08) 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, rgba(148,163,184,0.08), rgba(148,163,184,0.08) 1px, transparent 1px, transparent 24px);"></div>
    <p class="hint">Canvas is intended as a drawing workspace (diagram/flow editor style).</p>
  </div>
</bf-canvas>`.trim();
	}
	if (slug === 'modal') {
		return `
<div class="stack">
  <div class="demo-row">
    <bf-button bf-open="demo-modal">Open Modal</bf-button>
    <bf-button variant="secondary" bf-toggle="demo-modal">Toggle Modal</bf-button>
  </div>
  <bf-modal id="demo-modal" label="Project settings">
    <div class="stack">
      <h3 style="margin: 0;">Project Settings</h3>
      <p>Centered modal with backdrop and close controls.</p>
      <div class="demo-row">
        <bf-button bf-close="demo-modal">Save</bf-button>
        <bf-button variant="secondary" bf-close="demo-modal">Cancel</bf-button>
      </div>
    </div>
  </bf-modal>
</div>`.trim();
	}
	if (slug === 'drawer') {
		return `
<div class="stack">
  <div class="demo-row">
    <bf-button bf-open="drawer-right">Right Drawer</bf-button>
    <bf-button variant="secondary" bf-open="drawer-left">Left Drawer</bf-button>
    <bf-button variant="secondary" bf-open="drawer-bottom">Bottom Drawer</bf-button>
  </div>

  <bf-drawer id="drawer-right" side="right" label="Filters">
    <h3 style="margin-top: 0;">Filters</h3>
    <p>Right-side navigation/tools drawer.</p>
    <bf-button bf-close="drawer-right">Done</bf-button>
  </bf-drawer>

  <bf-drawer id="drawer-left" side="left" label="Navigation">
    <h3 style="margin-top: 0;">Navigation</h3>
    <p>Left-side app navigation drawer.</p>
    <bf-button bf-close="drawer-left">Close</bf-button>
  </bf-drawer>

  <bf-drawer id="drawer-bottom" side="bottom" label="Actions">
    <h3 style="margin-top: 0;">Quick Actions</h3>
    <p>Bottom drawer for contextual actions.</p>
    <bf-button bf-close="drawer-bottom">Close</bf-button>
  </bf-drawer>
</div>`.trim();
	}
	if (slug === 'wizard') {
		return `
<div class="stack">
  <bf-wizard step="2" steps="Account, Plan, Team, Review"></bf-wizard>

  <bf-wizard stepper step="3" steps="Draft, Review, Approve, Publish"></bf-wizard>

  <bf-wizard id="onboarding" step="1">
    <section title="Profile">
      <p>Add your workspace profile details.</p>
    </section>
    <section title="Preferences">
      <p>Set theme, notifications, and privacy preferences.</p>
    </section>
    <section title="Invite Team">
      <p>Invite teammates to collaborate.</p>
    </section>
  </bf-wizard>
</div>`.trim();
	}
	if (slug === 'stack') {
		return `
<div stack="lg">
  <div stack>
    <strong>Global Stack Utility</strong>
    <p class="hint">Use <code>stack</code> on any element, not just <code>bf-stack</code>.</p>
  </div>

  <div stack="sm">
    <bf-button>Save</bf-button>
    <bf-button variant="secondary">Preview</bf-button>
    <bf-button variant="secondary">Cancel</bf-button>
  </div>

  <bf-card>
    <div stack="md">
      <h3 style="margin: 0;">Card Content</h3>
      <p class="hint">This uses a plain <code>div stack</code> inside <code>bf-card</code>.</p>
      <div row>
        <div col="6"><bf-input placeholder="First name"></bf-input></div>
        <div col="6"><bf-input placeholder="Last name"></bf-input></div>
      </div>
    </div>
  </bf-card>
</div>`.trim();
	}
	if (slug === 'chart') {
		return `
<div stack="lg">
  <p class="hint">Unified chart component using <code>variant</code> (or shorthand attributes) to switch renderer style.</p>
  <div row>
    <div col="6"><bf-chart variant="bar">Revenue by month</bf-chart></div>
    <div col="6"><bf-chart variant="line">Conversion trend</bf-chart></div>
  </div>
  <div row>
    <div col="4"><bf-chart variant="pie">Traffic split</bf-chart></div>
    <div col="4"><bf-chart variant="donut">Plan share</bf-chart></div>
    <div col="4"><bf-chart variant="gauge">SLA health</bf-chart></div>
  </div>
  <div row>
    <div col="4"><bf-chart variant="heatmap">Weekly activity</bf-chart></div>
    <div col="4"><bf-chart variant="treemap">Storage map</bf-chart></div>
    <div col="4"><bf-chart variant="graph">Dependency graph</bf-chart></div>
  </div>
  <div row>
    <div col="6"><bf-chart variant="gantt">Release plan</bf-chart></div>
    <div col="6"><bf-chart variant="sparkline">Request latency</bf-chart></div>
  </div>
</div>`.trim();
	}
	if (slug === 'divider') {
		return `
<div stack="lg">
  <p class="hint">Divider defaults to horizontal. Use <code>vertical</code> and <code>thickness</code> to control orientation and weight.</p>

  <div stack="sm">
    <strong>Horizontal</strong>
    <bf-divider></bf-divider>
    <bf-divider thickness="2"></bf-divider>
    <bf-divider thickness="6"></bf-divider>
  </div>

  <div stack="sm">
    <strong>Vertical</strong>
    <div class="demo-row" style="height: 72px; align-items: stretch;">
      <span>Left</span>
      <bf-divider vertical></bf-divider>
      <span>Middle</span>
      <bf-divider vertical thickness="4"></bf-divider>
      <span>Right</span>
    </div>
  </div>
</div>`.trim();
	}
	if (slug === 'calendar') {
		return `
<bf-calendar>
  <div class="stack">
    <div class="demo-row">
      <bf-button variant="secondary">Previous</bf-button>
      <strong>March 2026</strong>
      <bf-button variant="secondary">Next</bf-button>
    </div>
    <div class="tableish" style="grid-template-columns: repeat(7, minmax(2rem, 1fr)); text-align: center;">
      <div><strong>Mo</strong></div><div><strong>Tu</strong></div><div><strong>We</strong></div><div><strong>Th</strong></div><div><strong>Fr</strong></div><div><strong>Sa</strong></div><div><strong>Su</strong></div>
      <div></div><div></div><div></div><div>1</div><div>2</div><div>3</div><div>4</div>
      <div>5</div><div>6</div><div>7</div><div style="font-weight:700;">8</div><div>9</div><div>10</div><div>11</div>
    </div>
    <p class="hint">Use calendar for month/week grid selection, events, and visual scheduling context.</p>
  </div>
</bf-calendar>`.trim();
	}
	if (slug === 'date-picker') {
		return `
<bf-date-picker>
  <div class="stack" style="max-width: 24rem;">
    <bf-form-field>
      <label class="label">Invoice Date</label>
      <bf-input type="date" value="2026-03-08"></bf-input>
    </bf-form-field>
    <div class="demo-row">
      <bf-button variant="secondary">Today</bf-button>
      <bf-button variant="secondary">Clear</bf-button>
    </div>
    <p class="hint">Date picker is ideal for single-date forms with validation and locale formatting.</p>
  </div>
</bf-date-picker>`.trim();
	}
	if (slug === 'date-range-picker') {
		return `
<bf-date-range-picker>
  <div class="stack" style="max-width: 30rem;">
    <div class="demo-row">
      <bf-form-field>
        <label class="label">Start</label>
        <bf-input type="date" value="2026-03-01"></bf-input>
      </bf-form-field>
      <bf-form-field>
        <label class="label">End</label>
        <bf-input type="date" value="2026-03-15"></bf-input>
      </bf-form-field>
    </div>
    <div class="demo-row">
      <bf-button variant="secondary">Last 7 days</bf-button>
      <bf-button variant="secondary">This month</bf-button>
      <bf-button variant="secondary">Quarter to date</bf-button>
    </div>
    <p class="hint">Range picker works best for reporting and analytics windows.</p>
  </div>
</bf-date-range-picker>`.trim();
	}
	if (slug === 'countdown') {
		return `
<bf-countdown>
  <div class="stack">
    <p><strong>Launch Window</strong> ends in <strong>12d 06h 11m</strong></p>
    <bf-progress value="68" max="100" striped primary>Completion <value /></bf-progress>
    <div class="demo-row">
      <bf-tag>Target: 2026-03-20</bf-tag>
      <bf-tag>Timezone: UTC</bf-tag>
    </div>
  </div>
</bf-countdown>`.trim();
	}
	if (slug === 'timeline') {
		return `
<bf-timeline>
  <div class="stack">
    <div class="tableish" style="grid-template-columns: 7rem 1fr;">
      <div><strong>2026-02-01</strong></div><div>Requirements locked</div>
      <div><strong>2026-02-12</strong></div><div>Alpha release to internal users</div>
      <div><strong>2026-02-25</strong></div><div>Public beta rollout</div>
      <div><strong>2026-03-10</strong></div><div>GA launch with onboarding docs</div>
    </div>
    <p class="hint">Use timeline for milestone history, audits, and roadmaps.</p>
  </div>
</bf-timeline>`.trim();
	}
	if (slug === 'progress') {
		return `
<div class="stack">
  <bf-progress value="28" max="100" variant="linear">Linear <value /></bf-progress>
  <bf-progress id="striped" value="62" max="100" striped primary>Striped Primary <value /></bf-progress>
  <bf-progress value="74" max="100" circular secondary size="lg">Circular Secondary <value /></bf-progress>
  <bf-progress value="0" max="100" loading loading-variant="stripe" primary>Loading Stripe <value /></bf-progress>
  <bf-progress value="0" max="100" loading loading-variant="pulse" secondary>Loading Pulse <value /></bf-progress>
  <bf-progress value="0" max="100" circular loading loading-variant="spin">Loading Spin <value /></bf-progress>
</div>`.trim();
	}
	if (slug === 'range') {
		return `
<div class="stack">
  <bf-range slider min="0" max="100" value="42" label="Single slider"></bf-range>
  <bf-range range min="0" max="100" low="20" high="78" label="Range slider"></bf-range>
  <bf-range rating count="5" value="4" label="Rating"></bf-range>
</div>`.trim();
	}
	if (slug === 'toast') {
		return `
<div class="stack">
  <bf-toast banner info open>Banner notice for account-wide maintenance.</bf-toast>
  <bf-toast toast info open>Default Toast</bf-toast>
  <bf-toast alert warning open top right>Alert Toast (top-right)</bf-toast>
  <bf-toast notification success open position="bottom-left">Notification Toast (bottom-left)</bf-toast>
  <bf-toast snackbar open duration="2800">Snackbar (bottom-center default)</bf-toast>
  <bf-toast error open duration="2200" position="top-center">Auto-hide Error (2.2s)</bf-toast>
</div>`.trim();
	}
	if (slug === 'input') {
		return `
<div class="stack">
  <bf-input type="email" placeholder="name@company.com" label="Email"></bf-input>
  <bf-input type="password" placeholder="Password" label="Password"></bf-input>
  <bf-input type="number" min="0" max="100" step="5" value="35" label="Quantity"></bf-input>
  <bf-input type="color" value="#2563eb" hex right label="Brand color"></bf-input>
  <bf-input type="color" value="rgba(15, 23, 42, 0.85)" hex rgba left label="Overlay color"></bf-input>
</div>`.trim();
	}
	if (slug === 'file-upload') {
		return `
<div class="stack">
  <p class="hint">Single component for file input and dropzone flows.</p>
  <div row>
    <div col="6">
      <bf-file-upload label="Single file (input)" accept=".pdf,.doc,.docx"></bf-file-upload>
    </div>
    <div col="6">
      <bf-file-upload multiple label="Multiple files (input)" accept="image/*,.pdf"></bf-file-upload>
    </div>
  </div>
  <div row>
    <div col="6">
      <bf-file-upload dropzone dotted label="Dropzone single"></bf-file-upload>
    </div>
    <div col="6">
      <bf-file-upload dropzone multiple dashed label="Dropzone multiple"></bf-file-upload>
    </div>
  </div>
  <p class="hint">Use <code>dropzone</code>, <code>multiple</code>, and border style attrs <code>dotted</code>/<code>dashed</code>.</p>
</div>`.trim();
	}
	if (slug === 'toggle') {
		return `
<div class="stack">
  <div class="demo-row">
    <bf-toggle checked>Feature Flag</bf-toggle>
    <bf-toggle>Read-only Mode</bf-toggle>
  </div>
  <div class="demo-row">
    <bf-toggle switch checked label="Notifications">Notifications</bf-toggle>
    <bf-toggle switch label="Auto Save">Auto Save</bf-toggle>
  </div>
</div>`.trim();
	}
	if (slug === 'tag') {
		return `
<div class="stack">
  <p class="hint">Single token component. Use <code>variant</code> or shorthand attrs: <code>badge</code>, <code>chip</code>, <code>pill</code>.</p>
  <div class="demo-row">
    <bf-tag>Default Tag</bf-tag>
    <bf-tag pill>Rounded Pill</bf-tag>
    <bf-tag chip>Design Token</bf-tag>
    <bf-tag badge>7</bf-tag>
  </div>
  <div class="demo-row">
    <bf-tag variant="badge" size="sm">12</bf-tag>
    <bf-tag variant="pill" size="md">Stable</bf-tag>
    <bf-tag variant="chip" size="lg">API Ready</bf-tag>
  </div>
</div>`.trim();
	}
	if (slug === 'select') {
		return `
<div class="stack">
  <bf-select label="Plan">
    <option value="">Choose a plan</option>
    <option value="starter">Starter</option>
    <option value="pro" selected>Pro</option>
    <option value="enterprise">Enterprise</option>
  </bf-select>
  <bf-select label="Team Access" multi="2">
    <option value="analytics" selected>Analytics</option>
    <option value="billing">Billing</option>
    <option value="deployments" selected>Deployments</option>
    <option value="settings">Settings</option>
  </bf-select>
  <p class="hint">Use <code>multi</code> for multi-select. Set <code>multi="2"</code> to cap selections.</p>
</div>`.trim();
	}
	if (slug === 'edge') {
		return `
<div class="stack">
  <bf-edge header>Top Edge</bf-edge>
  <bf-edge sticky header>Sticky Top Edge</bf-edge>
  <bf-edge fixed footer>Fixed Bottom Edge</bf-edge>
</div>`.trim();
	}
	if (slug === 'skeleton') {
		return `
<div class="stack">
  <p class="hint">Use <code>skeleton</code> on any element/component. Add a time like <code>skeleton="1400"</code> or <code>skeleton="1.4s"</code> to auto-reveal.</p>
  <div class="demo-row">
    <bf-button id="skeletonReplay" variant="secondary">Replay Loading</bf-button>
  </div>
  <div row>
    <div col="6">
      <bf-card id="sk-card" skeleton="1800">
        <div stack="sm">
          <img alt="" src="https://picsum.photos/seed/bf/640/360" style="width: 100%; border-radius: 12px;" />
          <div class="demo-row" style="align-items: center;">
            <bf-avatar name="Alex Rivera"></bf-avatar>
            <div stack>
              <strong>Async Content Card</strong>
              <span class="hint">Loaded after 1.8s</span>
            </div>
          </div>
          <p class="hint">Skeleton utility overlays this entire card while waiting for data.</p>
          <bf-button>Open</bf-button>
        </div>
      </bf-card>
    </div>
    <div col="6">
      <bf-card>
        <div stack="sm">
          <strong>List Loading Utility</strong>
          <div stack="sm">
            <div id="sk-row-1" class="demo-row" style="align-items: center;" skeleton="1200">
              <bf-avatar name="Taylor"></bf-avatar>
              <div stack style="flex: 1;">
                <strong>Taylor</strong>
                <span class="hint">Design System</span>
              </div>
            </div>
            <div id="sk-row-2" class="demo-row" style="align-items: center;" skeleton="1700">
              <bf-avatar name="Jordan"></bf-avatar>
              <div stack style="flex: 1;">
                <strong>Jordan</strong>
                <span class="hint">Frontend Platform</span>
              </div>
            </div>
            <div id="sk-row-3" class="demo-row" style="align-items: center;" skeleton="2.2s">
              <bf-avatar name="Morgan"></bf-avatar>
              <div stack style="flex: 1;">
                <strong>Morgan</strong>
                <span class="hint">Infra Team</span>
              </div>
            </div>
          </div>
        </div>
      </bf-card>
    </div>
  </div>
  <script>
    document.getElementById('skeletonReplay')?.addEventListener('click', () => {
      const targets = ['sk-card', 'sk-row-1', 'sk-row-2', 'sk-row-3']
        .map((id) => document.getElementById(id))
        .filter(Boolean);
      targets.forEach((node) => node.removeAttribute('skeleton'));
      requestAnimationFrame(() => {
        document.getElementById('sk-card')?.setAttribute('skeleton', '1800');
        document.getElementById('sk-row-1')?.setAttribute('skeleton', '1200');
        document.getElementById('sk-row-2')?.setAttribute('skeleton', '1700');
        document.getElementById('sk-row-3')?.setAttribute('skeleton', '2.2s');
      });
    });
  </script>
</div>`.trim();
	}
	if (slug === 'splitter') {
		return `
<div class="stack">
  <p class="hint">Splitter sits between two panels. In production this would be draggable.</p>
  <div class="demo-row" style="align-items: stretch; min-height: 150px;">
    <bf-card style="flex: 1;">
      <div stack><strong>Left Panel</strong><p class="hint">Navigation / files</p></div>
    </bf-card>
    <bf-splitter style="width: 10px; min-width: 10px;">&nbsp;</bf-splitter>
    <bf-card style="flex: 2;">
      <div stack><strong>Right Panel</strong><p class="hint">Editor / content</p></div>
    </bf-card>
  </div>
</div>`.trim();
	}
	if (slug === 'split-button') {
		return `
<div class="stack">
  <p class="hint">Split button combines a primary action with secondary actions menu.</p>
  <bf-split-button>
    <div class="demo-row">
      <bf-button>Deploy</bf-button>
      <bf-dropdown>
        <bf-button variant="secondary">More</bf-button>
        <div stack style="min-width: 180px;">
          <a href="#">Deploy to staging</a>
          <a href="#">Deploy to production</a>
          <a href="#">Schedule deploy</a>
        </div>
      </bf-dropdown>
    </div>
  </bf-split-button>
</div>`.trim();
	}
	if (slug === 'link') {
		return `
<div class="stack" style="gap: 0.9rem;">
  <div class="stack" style="gap: 0.35rem;">
    <span class="label">Inline</span>
    <bf-link variant="inline">
      <a href="#">Overview</a>
      <a href="#" aria-current="page">Projects</a>
      <a href="#">Settings</a>
      <a href="#">Billing</a>
    </bf-link>
  </div>

  <div class="stack" style="gap: 0.35rem;">
    <span class="label">Pill</span>
    <bf-link variant="pill">
      <a href="#">Dashboard</a>
      <a href="#" aria-current="page">Usage</a>
      <a href="#">Security</a>
      <a href="#">Integrations</a>
    </bf-link>
  </div>

  <div class="stack" style="gap: 0.35rem;">
    <span class="label">Nav</span>
    <bf-link variant="nav">
      <a href="#">Home</a>
      <a href="#">Components</a>
      <a href="#" aria-current="page">Link</a>
      <a href="#">Tokens</a>
    </bf-link>
  </div>

  <div class="stack" style="gap: 0.35rem;">
    <span class="label">Vertical Nav</span>
    <bf-link variant="nav" vertical>
      <a href="#">General</a>
      <a href="#" aria-current="page">Appearance</a>
      <a href="#">Security</a>
      <a href="#">Billing</a>
    </bf-link>
  </div>
</div>`.trim();
	}
	if (slug === 'table') {
		return `
<div class="stack">
  <p class="hint">Straightforward table structure using utility attributes.</p>
  <div table>
    <div thead>
      <div tr>
        <div th>ID</div>
        <div th>Project</div>
        <div th>Status</div>
        <div th>Owner</div>
      </div>
    </div>
    <div tbody>
      <div tr><div td>#1021</div><div td>Marketing Site</div><div td>Active</div><div td>Alex</div></div>
      <div tr><div td>#1022</div><div td>Billing Revamp</div><div td>Review</div><div td>Jordan</div></div>
      <div tr><div td>#1023</div><div td>Admin Dashboard</div><div td>Blocked</div><div td>Morgan</div></div>
    </div>
  </div>
</div>`.trim();
	}
	if (slug === 'data-grid') {
		return `
<div class="stack">
  <p class="hint">Data-grid style table with utility attrs, dense spacing, and controls.</p>
  <div row="right">
    <bf-input placeholder="Filter rows..."></bf-input>
    <bf-button variant="secondary">Export</bf-button>
  </div>
  <div table dense>
    <div thead>
      <div tr>
        <div th>Account</div>
        <div th>Region</div>
        <div th>MRR</div>
        <div th>Risk</div>
      </div>
    </div>
    <div tbody>
      <div tr><div td>Acme</div><div td>US</div><div td>$12,400</div><div td>Low</div></div>
      <div tr><div td>Northwind</div><div td>EU</div><div td>$9,180</div><div td>Medium</div></div>
      <div tr><div td>Globex</div><div td>APAC</div><div td>$15,920</div><div td>Low</div></div>
      <div tr><div td>Initech</div><div td>US</div><div td>$5,640</div><div td>High</div></div>
    </div>
  </div>
</div>`.trim();
	}
	if (category === 'forms') {
		return `
<div class="stack">
  <label class="label">${name} Input</label>
  <${tag}>Value</${tag}>
  <p class="hint">Use this for reusable form flows with consistent validation styling.</p>
</div>`.trim();
	}
	if (category === 'charts') {
		return `
<${tag}>
  <div class="viz">
    <div style="height: 30%"></div>
    <div style="height: 62%"></div>
    <div style="height: 44%"></div>
    <div style="height: 84%"></div>
    <div style="height: 58%"></div>
  </div>
</${tag}>`.trim();
	}
	if (category === 'feedback') {
		return `
<${tag}>
  <p><strong>${name}</strong> for contextual messages and focused interactions.</p>
  <div class="demo-row">
    <bf-button>Confirm</bf-button>
    <bf-button variant="secondary">Cancel</bf-button>
  </div>
</${tag}>`.trim();
	}
	if (category === 'navigation') {
		return `
<${tag}>
  <div class="demo-row">
    <a href="#">Overview</a>
    <a href="#">Projects</a>
    <a href="#">Settings</a>
    <a href="#">Billing</a>
  </div>
</${tag}>`.trim();
	}
	if (category === 'collections') {
		return `
<${tag}>
  <div class="tableish">
    <div><strong>Name</strong></div><div><strong>Status</strong></div>
    <div>Alpha</div><div>Active</div>
    <div>Bravo</div><div>Pending</div>
    <div>Charlie</div><div>Disabled</div>
  </div>
</${tag}>`.trim();
	}
	if (category === 'base') {
		return `
<div class="demo-row">
  <${tag}>Primary</${tag}>
  <${tag}>Secondary</${tag}>
  <${tag}>Tertiary</${tag}>
</div>`.trim();
	}
	return `
<${tag}>
  <h3>${name}</h3>
  <p>Reusable component composition block.</p>
</${tag}>`.trim();
}

function relatedDemo(relatedTags) {
	return relatedTags
		.map((tag) => `<a href="./${tag.replace('bf-', '')}-test.html">${tag.replace('bf-', '')}</a>`)
		.join('\n');
}

function utilitiesPageHtml() {
	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>bareframe utilities test</title>
    <link id="themeStylesheet" rel="stylesheet" href="./themes/system.css" />
    <style>
      body {
        font-family: 'Avenir Next', 'Segoe UI', sans-serif;
        margin: 2rem;
        line-height: 1.45;
        color: var(--bf-theme-text-1, #111827);
        background: var(--bf-theme-surface-2, #f8fafc);
      }

      .layout { display: grid; gap: 1rem; max-width: 980px; }
      .panel {
        border: 1px solid var(--bf-theme-border-1, #d1d5db);
        border-radius: 12px;
        background: var(--bf-theme-surface-1, #ffffff);
        padding: 1rem;
      }
      .theme-controls, .demo-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.7rem;
      }
      .stack { display: grid; gap: 0.5rem; }
      .hint { margin: 0; color: var(--bf-theme-text-2, #4b5563); }
      .swatch {
        border: 1px dashed var(--bf-theme-border-1, #cbd5e1);
        border-radius: 8px;
        padding: 0.55rem;
      }
      .colbox {
        min-height: 7.2rem;
        border: 1px dashed var(--bf-theme-border-1, #cbd5e1);
        border-radius: 8px;
        padding: 0.45rem;
      }
      code { background: rgba(148, 163, 184, 0.2); padding: 0.1rem 0.35rem; border-radius: 6px; }
    </style>
  </head>
  <body>
    <div class="layout">
      <header>
        <h1>Utilities</h1>
        <p>Global utility attributes that work across plain HTML and <code>bf-*</code> components.</p>
        <p><a href="./index.html">Back to Examples</a></p>
      </header>

      <section class="panel">
        <div class="theme-controls">
          <label for="themeSelect">Theme</label>
          <select id="themeSelect">
            <option value="system">system</option>
            <option value="light">light</option>
            <option value="dark">dark</option>
            <option value="sprint">sprint</option>
            <option value="retro">retro</option>
            <option value="modern">modern</option>
            <option value="simple">simple</option>
            <option value="nature">nature</option>
            <option value="future">future</option>
            <option value="aurora">aurora</option>
            <option value="nebula">nebula</option>
            <option value="desert">desert</option>
            <option value="matrix">matrix</option>
            <option value="noir">noir</option>
            <option value="sunrise">sunrise</option>
            <option value="oceanic">oceanic</option>
          </select>
          <span id="themeStatus"></span>
        </div>
      </section>

      <section class="panel" stack="sm">
        <h2 style="margin: 0;">Row + Col</h2>
        <p class="hint">Alignment utilities: <code>row="left|center|right"</code> and <code>col="top|center|bottom"</code>.</p>
        <div row="left" class="swatch"><bf-button>Left 1</bf-button><bf-button variant="secondary">Left 2</bf-button></div>
        <div row="center" class="swatch"><bf-button>Center 1</bf-button><bf-button variant="secondary">Center 2</bf-button></div>
        <div row="right" class="swatch"><bf-button>Right 1</bf-button><bf-button variant="secondary">Right 2</bf-button></div>

        <div row>
          <div col="top" class="colbox"><bf-tag>Top</bf-tag><bf-button>Action</bf-button></div>
          <div col="center" class="colbox"><bf-tag>Center</bf-tag><bf-button>Action</bf-button></div>
          <div col="bottom" class="colbox"><bf-tag>Bottom</bf-tag><bf-button>Action</bf-button></div>
        </div>

        <p class="hint">Grid spans still use numeric values: <code>col="3"</code> .. <code>col="12"</code>.</p>
        <div row class="swatch">
          <div col="3"><bf-card>3</bf-card></div>
          <div col="6"><bf-card>6</bf-card></div>
          <div col="3"><bf-card>3</bf-card></div>
        </div>
      </section>

      <section class="panel" stack="sm">
        <h2 style="margin: 0;">Stack</h2>
        <p class="hint">Spacing utility on any element: <code>stack="xs|sm|md|lg|xl"</code>.</p>
        <div stack="xs" class="swatch"><bf-tag>xs</bf-tag><bf-tag>gap</bf-tag><bf-tag>stack</bf-tag></div>
        <div stack="md" class="swatch"><bf-tag>md</bf-tag><bf-tag>gap</bf-tag><bf-tag>stack</bf-tag></div>
        <div stack="xl" class="swatch"><bf-tag>xl</bf-tag><bf-tag>gap</bf-tag><bf-tag>stack</bf-tag></div>
      </section>

      <section class="panel" stack="sm">
        <h2 style="margin: 0;">Typography</h2>
        <p typography="display">Display Utility</p>
        <p typography="h1">Heading 1 Utility</p>
        <p typography="h2">Heading 2 Utility</p>
        <p typography="body">Body utility text for standard copy.</p>
        <small typography="caption">Caption utility text.</small>
        <span typography="label">Label utility text.</span>
        <span typography="code">const mode = 'utility'</span>
      </section>

      <section class="panel" stack="sm">
        <h2 style="margin: 0;">Table Utilities</h2>
        <p class="hint">Use <code>table</code>, <code>thead</code>, <code>tbody</code>, <code>tr</code>, <code>th</code>, and <code>td</code> directly on plain elements.</p>
        <div table dense>
          <div thead>
            <div tr>
              <div th>Key</div>
              <div th>Value</div>
              <div th>Note</div>
            </div>
          </div>
          <div tbody>
            <div tr><div td>layout</div><div td>row / col / stack</div><div td>Global utility attrs</div></div>
            <div tr><div td>typography</div><div td>display, h1..code</div><div td>No class names required</div></div>
            <div tr><div td>skeleton</div><div td>skeleton="1200"</div><div td>Auto-reveal supported</div></div>
          </div>
        </div>
      </section>

      <section class="panel" stack="sm">
        <h2 style="margin: 0;">Skeleton Utility</h2>
        <p class="hint">Attach loading state directly to target elements: <code>skeleton</code> or <code>skeleton="1200"</code>.</p>
        <div id="utility-skel-row" row>
          <bf-card id="utility-skel-card" col="6" skeleton="1500">
            <div stack="sm">
              <strong>Utility Loading Card</strong>
              <p class="hint">This content appears after the skeleton delay.</p>
              <bf-button>View</bf-button>
            </div>
          </bf-card>
          <div col="6" skeleton="2s" class="swatch">
            <strong>Plain Div Skeleton</strong>
            <p class="hint">Works on regular HTML too.</p>
          </div>
        </div>
        <div row>
          <bf-button id="utilityReplay" variant="secondary">Replay Skeleton Utility</bf-button>
        </div>
      </section>
    </div>

    <script type="module" src="./src/index.js"></script>
    <script type="module">
      const themeSelect = document.getElementById('themeSelect');
      const themeStatus = document.getElementById('themeStatus');
      const themeStylesheet = document.getElementById('themeStylesheet');

      function applyTheme(theme) {
        themeStylesheet.href = './themes/' + theme + '.css';
        document.documentElement.setAttribute('data-bf-theme', theme);
        themeStatus.textContent = 'Active: ' + theme;
      }

      themeSelect.addEventListener('change', () => applyTheme(themeSelect.value));
      applyTheme('system');

      document.getElementById('utilityReplay')?.addEventListener('click', () => {
        const card = document.getElementById('utility-skel-card');
        const row = document.getElementById('utility-skel-row');
        const divTarget = row?.querySelector('div[col=\"6\"]');
        if (!card || !divTarget) return;
        card.removeAttribute('skeleton');
        divTarget.removeAttribute('skeleton');
        requestAnimationFrame(() => {
          card.setAttribute('skeleton', '1500');
          divTarget.setAttribute('skeleton', '2s');
        });
      });
    </script>
  </body>
</html>
`;
}

function pageHtml({ tag, name, desc, slug, category }) {
	const primary = primaryDemo(tag, name, slug, category);
	const related = relatedDemo(relatedByCategory(category));

	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>bareframe ${slug} test</title>
    <link id="themeStylesheet" rel="stylesheet" href="./themes/system.css" />
    <style>
      body {
        font-family: 'Avenir Next', 'Segoe UI', sans-serif;
        margin: 2rem;
        line-height: 1.45;
        color: var(--bf-theme-text-1, #111827);
        background: var(--bf-theme-surface-2, #f8fafc);
      }

      .layout {
        display: grid;
        gap: 1rem;
        max-width: 980px;
      }

      .panel {
        border: 1px solid var(--bf-theme-border-1, #d1d5db);
        border-radius: 12px;
        background: var(--bf-theme-surface-1, #ffffff);
        padding: 1rem;
      }

      .theme-controls,
      .demo-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.7rem;
      }

      .stack { display: grid; gap: 0.5rem; }
      .label { font-weight: 600; }
      .hint { margin: 0; color: var(--bf-theme-text-2, #4b5563); }
      .tableish { display: grid; grid-template-columns: 1fr 1fr; gap: 0.35rem 0.75rem; }
      .viz { display: flex; align-items: end; gap: 0.5rem; min-height: 120px; }
      .viz > div {
        width: 24px;
        background: var(--bf-theme-button-primary-bg, #2563eb);
        border-radius: 6px 6px 0 0;
      }
      code { background: rgba(148, 163, 184, 0.2); padding: 0.1rem 0.35rem; border-radius: 6px; }
    </style>
  </head>
  <body>
    <div class="layout">
      <header>
        <h1>${tag}</h1>
        <p>${desc}</p>
        <p><a href="./index.html">Back to Examples</a></p>
      </header>

      <section class="panel">
        <div class="theme-controls">
          <label for="themeSelect">Theme</label>
          <select id="themeSelect">
            <option value="system">system</option>
            <option value="light">light</option>
            <option value="dark">dark</option>
            <option value="sprint">sprint</option>
            <option value="retro">retro</option>
            <option value="modern">modern</option>
            <option value="simple">simple</option>
            <option value="nature">nature</option>
            <option value="future">future</option>
            <option value="aurora">aurora</option>
            <option value="nebula">nebula</option>
            <option value="desert">desert</option>
            <option value="matrix">matrix</option>
            <option value="noir">noir</option>
            <option value="sunrise">sunrise</option>
            <option value="oceanic">oceanic</option>
          </select>
          <span id="themeStatus"></span>
        </div>
      </section>

      <section class="panel">
        <h2>Primary Demo</h2>
        ${primary}
      </section>

      <section class="panel">
        <h2>Related Components</h2>
        <div class="demo-row">
          ${related}
        </div>
      </section>

      <section class="panel">
        <h2>Tag</h2>
        <code>${tag}</code>
      </section>
    </div>

    <script type="module" src="./src/index.js"></script>
    <script type="module">
      const themeSelect = document.getElementById('themeSelect');
      const themeStatus = document.getElementById('themeStatus');
      const themeStylesheet = document.getElementById('themeStylesheet');

      function applyTheme(theme) {
        themeStylesheet.href = './themes/' + theme + '.css';
        document.documentElement.setAttribute('data-bf-theme', theme);
        themeStatus.textContent = 'Active: ' + theme;
      }

      themeSelect.addEventListener('change', () => applyTheme(themeSelect.value));
      applyTheme('system');
    </script>
  </body>
</html>
`;
}

function indexHtml(entries) {
	const sections = [
		{ key: 'utilities', label: 'Utilities' },
		{ key: 'base', label: 'Base Components' },
		{ key: 'editor', label: 'Editor Components' },
		{ key: 'forms', label: 'Form Components' },
		{ key: 'date-time', label: 'Date & Calendar Components' },
		{ key: 'canvas', label: 'Canvas Components' },
		{ key: 'charts', label: 'Charts & Data Viz' },
		{ key: 'feedback', label: 'Modals, Alerts & Feedback' },
		{ key: 'navigation', label: 'Navigation' },
		{ key: 'collections', label: 'Collections & Data Display' },
		{ key: 'media', label: 'Media & Visual' },
	];

	const grouped = new Map(sections.map((section) => [section.key, []]));
	for (const entry of entries) {
		if (!grouped.has(entry.category)) {
			grouped.set(entry.category, []);
		}
		grouped.get(entry.category).push(entry);
	}

	const blocks = sections
		.map(({ key, label }) => {
			const items = (grouped.get(key) || []).sort((a, b) =>
				a.name.localeCompare(b.name),
			);
			if (!items.length) {
				return '';
			}
			const links = items
				.map((entry) => `      <li><a href="./${entry.file}">${entry.name}</a></li>`)
				.join('\n');
			return `    <section>\n      <h2>${label}</h2>\n      <ul>\n${links}\n      </ul>\n    </section>`;
		})
		.filter(Boolean)
		.join('\n');

	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>bareframe examples</title>
    <style>
      body { font-family: 'Avenir Next', 'Segoe UI', sans-serif; margin: 2rem; }
      .layout { display: grid; gap: 1.25rem; max-width: 980px; }
      section { border: 1px solid #d1d5db; border-radius: 10px; padding: 1rem; background: #ffffff; }
      h2 { margin-top: 0; font-size: 1.15rem; }
      ul { columns: 2; margin: 0; padding-left: 1rem; }
      li { margin: 0.35rem 0; }
      #donate-button-container {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 999;
      }
    </style>
  </head>
  <body>
    <div id="donate-button-container">
      <div id="donate-button"></div>
    </div>
    <div class="layout">
      <header>
        <h1>bareframe examples</h1>
        <p>Grouped by category to review overlap and reduce unnecessary components.</p>
        <p>
          <a href="https://www.npmjs.com/package/bareframe" target="_blank" rel="noreferrer">npm package</a>
          ·
          <a href="https://samueldbines.github.io/bareframe/" target="_blank" rel="noreferrer">github pages</a>
          ·
          <a href="https://samueldbines.github.io/bareframe/chart-test.html" target="_blank" rel="noreferrer">chart demo</a>
          ·
          <a href="https://samueldbines.github.io/bareframe/versions/" target="_blank" rel="noreferrer">versions</a>
        </p>
      </header>
${blocks}
    </div>
    <script src="https://www.paypalobjects.com/donate/sdk/donate-sdk.js" charset="UTF-8"></script>
    <script>
      PayPal.Donation.Button({
        env:'production',
        hosted_button_id:'LKTM22NDQDVW6',
        image: {
          src:'https://www.paypalobjects.com/en_US/GB/i/btn/btn_donateCC_LG.gif',
          alt:'Donate with PayPal button',
          title:'PayPal - The safer, easier way to pay online!',
        }
      }).render('#donate-button');
    </script>
  </body>
</html>
`;
}

async function main() {
	const raw = await fs.readFile(componentsFile, 'utf8');
	const lines = raw.split('\n');
	const components = lines
		.map((line) => line.match(/^- \*\*(.+)\*\*: (.+)$/))
		.filter(Boolean)
		.map(([, name, desc]) => ({ name, desc, slug: slugify(name), tag: `bf-${slugify(name)}` }));

	const files = [];
	const indexEntries = [];

	await fs.writeFile(path.join(examplesDir, 'utilities-test.html'), utilitiesPageHtml());
	files.push('utilities-test.html');
	indexEntries.push({ file: 'utilities-test.html', category: 'utilities', name: 'utilities' });

	for (const component of components) {
		const category = categoryForSlug(component.slug);
		const html = pageHtml({ ...component, category });
		const file = `${component.slug}-test.html`;
		await fs.writeFile(path.join(examplesDir, file), html);
		files.push(file);
		indexEntries.push({ file, category, name: component.name });
	}

	await fs.writeFile(path.join(examplesDir, 'index.html'), indexHtml(indexEntries));
	console.log(`Generated ${files.length} example pages.`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
