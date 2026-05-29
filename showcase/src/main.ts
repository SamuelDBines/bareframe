import './showcase.css';
import customizeRecipes from '../meta/customize.json';

type Manifest = {
	components?: string[];
};

type TokensManifest = {
	tokens?: string[];
	byTheme?: Record<string, string[]>;
};

/**
 * Tier A essentials — surfaced first in the studio nav (see docs/TIERING.md).
 * Order is preserved.
 */
const ESSENTIAL_SLUGS = [
	'button',
	'link',
	'header',
	'footer',
	'modal',
	'dialog',
	'toast',
	'message',
	'error-summary',
	'input',
	'checkbox',
	'radio',
	'select',
	'toggle',
	'chart',
] as const;

const FALLBACK_DEMOS = ['button', 'input', 'card'];

type CustomizeRecipe = {
	eventsDoc: string[];
	actionIds: string[];
	cssHint: string;
};

const CUSTOMIZE_META = customizeRecipes as Record<string, CustomizeRecipe>;

type ShowcaseStudioPayload = {
	generatedAt: string;
	categories: Record<string, string>;
	parts: Record<string, string[]>;
};

type ShowcaseStudioFetch =
	| { ok: true; categories: Record<string, string>; parts: Record<string, string[]> }
	| { ok: false; categories: Record<string, never>; parts: Record<string, never> };

/** Capture listeners for documented composed events (extend as APIs grow). */
const KNOWN_COMPOSED_BF_EVENTS = [
	'bf-change',
	'bf-click',
	'bf-close',
	'bf-open',
	'bf-select',
	'bf-input',
	'bf-focus',
	'bf-blur',
	'bf-accordion-toggle',
] as const;

const STYLE_OVERRIDE_ID = 'bfStudioUserOverrides';

const CATEGORY_ORDER = [
	'forms',
	'navigation',
	'feedback',
	'charts',
	'collections',
	'date-time',
	'editor',
	'media',
	'canvas',
	'base',
] as const;

const CATEGORY_LABELS: Record<string, string> = {
	forms: 'Forms',
	navigation: 'Navigation',
	feedback: 'Feedback & overlays',
	charts: 'Charts & data viz',
	collections: 'Collections & data display',
	'date-time': 'Date & time',
	editor: 'Editor',
	media: 'Media',
	canvas: 'Canvas',
	base: 'Base',
};

const ACTION_LABELS: Record<string, string> = {
	'click-first-bf-button': 'Dispatch click on first demo bf-button',
	'focus-first-bf-input': 'Focus first bf-input inside demo root',
	'click-open-modal-primary': 'Click the demo “Open modal” control (#btnOpen)',
	'click-first-sheet-trigger': 'Click first bf-button that opens a sheet/panel',
	'click-first-close': 'Click first toast dismiss (×)',
	'click-first-bf-checkbox': 'Activate first bf-checkbox',
	'click-first-bf-radio': 'Activate second bf-radio in group',
	'click-first-bf-toggle': 'Toggle first bf-toggle control',
};

const CUSTOMIZE_ACTIONS: Record<string, (doc: Document) => void> = {
	'click-first-bf-button'(doc) {
		const el = doc.querySelector('[data-demo-root] bf-button');
		el?.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
	},
	'focus-first-bf-input'(doc) {
		const inner = doc
			.querySelector('[data-demo-root] bf-input')
			?.shadowRoot?.querySelector('input, textarea');
		if (inner instanceof HTMLElement) {
			inner.focus();
		}
	},
	'click-open-modal-primary'(doc) {
		doc.querySelector<HTMLElement>('[data-demo-root] #btnOpen')?.click();
	},
	'click-first-sheet-trigger'(doc) {
		doc.querySelector<HTMLElement>('[data-demo-root] bf-button[bf-open]')?.click();
	},
	'click-first-close'(doc) {
		const toast = doc.querySelector('[data-demo-root] bf-toast');
		const btn = toast?.shadowRoot?.querySelector('button.close');
		(btn as HTMLElement | undefined)?.click();
	},
	'click-first-bf-checkbox'(doc) {
		doc.querySelector<HTMLElement>('[data-demo-root] bf-checkbox')?.click();
	},
	'click-first-bf-radio'(doc) {
		const radios = [...doc.querySelectorAll('[data-demo-root] bf-radio')];
		(radios[1] ?? radios[0])?.dispatchEvent(
			new MouseEvent('click', { bubbles: true, composed: true }),
		);
	},
	'click-first-bf-toggle'(doc) {
		doc.querySelector<HTMLElement>('[data-demo-root] bf-toggle')?.click();
	},
};

const OVERRIDE_TEXTAREA_DEFAULT = `:root {
  --bf-theme-button-primary-bg: #6366f1;
}
`;

function stringifyDetail(d: unknown): string {
	if (d === undefined) return '—';
	if (typeof d === 'string') return d;
	try {
		return JSON.stringify(d);
	} catch {
		return String(d);
	}
}

const EVENT_LOG_CAP = 56;

/** Capture composed bf-* CustomEvents inside the iframe and inject demo-local CSS snippet. */
function attachCustomizeIframeBridge(
	iframe: HTMLIFrameElement,
	getCssSnippet: () => string,
	onLine: (type: string, detail: unknown) => void,
): () => void {
	const doc = iframe.contentDocument;
	if (!doc?.documentElement) {
		onLine('[studio]', 'Cannot access iframe document (cross-origin or not ready)');
		return () => {};
	}
	const handler = (e: Event) => {
		if (!(e instanceof CustomEvent)) return;
		onLine(e.type, e.detail);
	};
	for (const ev of KNOWN_COMPOSED_BF_EVENTS) {
		doc.addEventListener(ev, handler, true);
	}
	let el = doc.getElementById(STYLE_OVERRIDE_ID) as HTMLStyleElement | null;
	if (!el) {
		el = doc.createElement('style');
		el.id = STYLE_OVERRIDE_ID;
		doc.head.appendChild(el);
	}
	el.textContent = getCssSnippet();
	return () => {
		for (const ev of KNOWN_COMPOSED_BF_EVENTS) {
			doc.removeEventListener(ev, handler, true);
		}
		doc.getElementById(STYLE_OVERRIDE_ID)?.remove();
	};
}

const THEME_OPTIONS = [
	'system',
	'dark',
	'light',
	'modern',
	'layout',
	'aurora',
	'noir',
	'oceanic',
	'nature',
	'matrix',
	'retro',
	'simple',
	'sprint',
	'sunrise',
	'desert',
	'future',
	'nebula',
] as const;

function uniqueThemes(): readonly string[] {
	return [...new Set(THEME_OPTIONS)];
}

function orderComponents(slugs: string[]): string[] {
	const set = new Set(slugs);
	const essentials = ESSENTIAL_SLUGS.filter((s) => set.has(s));
	const rest = slugs.filter((s) => !ESSENTIAL_SLUGS.includes(s as (typeof ESSENTIAL_SLUGS)[number])).sort();
	return [...essentials, ...rest];
}

async function fetchManifest(base: URL): Promise<{ ok: boolean; components: string[] }> {
	const url = new URL('dist/manifest.json', base);
	const res = await fetch(url.href);
	if (!res.ok) {
		return { ok: false, components: [] };
	}
	const data = (await res.json()) as Manifest;
	const raw = Array.isArray(data.components) ? data.components : [];
	return { ok: true, components: orderComponents([...new Set(raw)].sort()) };
}

async function fetchTokensManifest(
	base: URL,
): Promise<{ ok: boolean; tokens: string[]; byTheme: Record<string, string[]> }> {
	const url = new URL('dist/tokens.json', base);
	const res = await fetch(url.href);
	if (!res.ok) {
		return { ok: false, tokens: [], byTheme: {} };
	}
	const data = (await res.json()) as TokensManifest;
	const tokens = Array.isArray(data.tokens) ? data.tokens : [];
	const byTheme = data.byTheme && typeof data.byTheme === 'object' ? data.byTheme : {};
	return { ok: true, tokens, byTheme };
}

async function fetchShowcaseStudio(base: URL): Promise<ShowcaseStudioFetch> {
	const url = new URL('dist/showcase-studio.json', base);
	const res = await fetch(url.href);
	if (!res.ok) {
		return { ok: false, categories: {}, parts: {} };
	}
	const data = (await res.json()) as ShowcaseStudioPayload;
	const categories = data.categories && typeof data.categories === 'object' ? data.categories : {};
	const parts = data.parts && typeof data.parts === 'object' ? data.parts : {};
	return { ok: true, categories, parts };
}

function showcasePublicBase(): URL {
	const p = window.location.pathname.replace(/\/?(?:index\.html)?$/i, '');
	const idx = p.indexOf('/showcase');

	if (idx === -1) {
		return new URL('./', window.location.href);
	}

	let root = `${p.slice(0, idx) || '/'}`;
	if (!root.endsWith('/')) {
		root = `${root}/`;
	}

	return new URL(root, window.location.origin);
}

function slugToTag(slug: string): string {
	return `bf-${slug}`;
}

/** Keep generated demo HTML in sync with the studio theme picker. */
function syncDemoDocumentTheme(theme: string, base: URL, win: Window | null) {
	try {
		const doc = win?.document;
		if (!doc) return;

		const sheet = doc.getElementById('themeStylesheet') as HTMLLinkElement | null;
		if (sheet) {
			sheet.href = new URL(`themes/${theme}.css`, base).href;
		}

		doc.documentElement.setAttribute('data-bf-theme', theme);

		const sel = doc.getElementById('themeSelect') as HTMLSelectElement | null;
		if (sel) {
			sel.value = theme;
		}

		const status = doc.getElementById('themeStatus');
		if (status) {
			status.textContent = `Active: ${theme}`;
		}
	} catch {
		/* sandboxed or cross-origin iframe */
	}
}

const STUDIO_THEME_LINK_ID = 'bfStudioThemeMirror';

/** Load a Bareframe theme on the Studio document root so `--bf-*` resolve for the token table. Removed when switching back to Components. */
function attachStudioThemeLink(theme: string, base: URL) {
	let link = document.getElementById(STUDIO_THEME_LINK_ID) as HTMLLinkElement | null;
	if (!link) {
		link = document.createElement('link');
		link.rel = 'stylesheet';
		link.id = STUDIO_THEME_LINK_ID;
		document.head.appendChild(link);
	}
	link.href = new URL(`themes/${theme}.css`, base).href;
	document.documentElement.setAttribute('data-bf-studio-bf-theme', theme);
}

function detachStudioThemeLink() {
	document.getElementById(STUDIO_THEME_LINK_ID)?.remove();
	document.documentElement.removeAttribute('data-bf-studio-bf-theme');
}

function renderSetupError(reason: string) {
	document.body.innerHTML = `
<div class="bf-studio-error">
  <div class="bf-studio-error-card">
    <h2>Component Studio needs a build</h2>
    <p>${escapeHtml(reason)}</p>
    <p class="hint">From the repo root:</p>
    <p><code>pnpm run build</code></p>
    <p class="hint">Then start the studio (build + dev):</p>
    <p><code>pnpm run studio</code></p>
    <p class="hint">If you already built, reload — the preview reads <code>public/dist/manifest.json</code> and <code>public/dist/tokens.json</code>.</p>
  </div>
</div>`;
}

type TokensManifestResolved =
	| { ok: true; tokens: string[]; byTheme: Record<string, string[]> }
	| { ok: false; tokens: []; byTheme: Record<string, never> };

function renderTokensTable(
	container: HTMLElement,
	tokenNames: string[],
	filterQ: string,
) {
	const q = filterQ.trim().toLowerCase();
	const filtered = tokenNames.filter((name) =>
		q ? name.toLowerCase().includes(q) || name.slice(2).toLowerCase().includes(q) : true,
	);
	const rootStyle = getComputedStyle(document.documentElement);

	const rows = filtered
		.map((name) => {
			const raw = rootStyle.getPropertyValue(name).trim();
			const value = raw || '—';
			return `<tr><td class="bf-tok-name"><code>${escapeHtml(name)}</code></td><td class="bf-tok-val"><span class="bf-tok-span">${escapeHtml(value)}</span></td></tr>`;
		})
		.join('');

	container.innerHTML =
		filtered.length === 0
			? `<p class="bf-tokens-empty">${escapeHtml('No matching tokens.')}</p>`
			: `<table class="bf-token-table"><thead><tr><th>Custom property</th><th>Resolved value (root)</th></tr></thead><tbody>${rows}</tbody></table>`;
	container.querySelectorAll<HTMLElement>('.bf-tok-span').forEach((el) => {
		el.title = `Click to copy: ${el.textContent ?? ''}`;
		el.tabIndex = 0;
	});
	container.querySelectorAll<HTMLElement>('.bf-tok-span').forEach((el) => {
		el.addEventListener('click', () => {
			const t = el.textContent?.trim();
			if (t && t !== '—') {
				void navigator.clipboard.writeText(t).catch(() => {});
			}
		});
	});
}

function render(
	app: HTMLElement,
	components: string[],
	tokenData: TokensManifestResolved,
	base: URL,
	studioMeta: ShowcaseStudioFetch,
) {
	const list = components.length ? components : FALLBACK_DEMOS;
	const slugCount = components.length;

	app.innerHTML = `
    <div class="bf-shell">
    <aside class="bf-sidebar">
      <div class="bf-brand">
        <span class="bf-kicker">Bareframe</span>
        <h1>Component Studio</h1>
        <p>Browse demos, compare themes, and inspect every shipped <code style="font-size:inherit">--bf-*</code> token.</p>
      </div>
      <div class="bf-view-tabs" role="tablist" aria-label="Studio mode">
        <button type="button" class="bf-tab active" role="tab" aria-selected="true" id="bfTabComponents">Components</button>
        <button type="button" class="bf-tab" role="tab" aria-selected="false" id="bfTabCustomize">Customize</button>
        <button type="button" class="bf-tab" role="tab" aria-selected="false" id="bfTabTokens">CSS variables</button>
      </div>
      <div class="bf-stats">
        <span class="bf-pill-count" title="Manifest entries">${slugCount ? `${slugCount} components` : 'Offline list'}</span>
        ${tokenData.ok ? `<span class="bf-pill-count" title="Unique design tokens">${tokenData.tokens.length} tokens</span>` : ''}
      </div>
      <div class="bf-meta">
        <a href="https://www.npmjs.com/package/bareframe" target="_blank" rel="noreferrer">npm</a>
        <a href="https://samueldbines.github.io/bareframe/" target="_blank" rel="noreferrer">GitHub Pages</a>
      </div>
      <div class="bf-field">
        <label for="bfDemoTheme">Theme (demos &amp; token values)</label>
        <select id="bfDemoTheme" aria-label="Bareframe theme"></select>
      </div>
      <div class="bf-field" id="bfSearchWrap">
        <label for="bfSearch">Find a component</label>
        <input id="bfSearch" type="search" placeholder="e.g. date-picker, bf-button…" autocomplete="off" />
      </div>
      <div class="bf-field" id="bfTokenSearchWrap" hidden>
        <label for="bfTokenSearch">Filter tokens</label>
        <input id="bfTokenSearch" type="search" placeholder="filter --bf-theme-…" autocomplete="off" />
      </div>
      <nav class="bf-nav" id="bfNav" aria-label="Components"></nav>
    </aside>
    <div class="bf-stage">
      <header class="bf-toolbar">
        <div class="bf-toolbar-left">
          <span class="bf-chip-tag" id="bfActiveSlug">Select a component</span>
        </div>
        <div class="bf-toolbar-actions">
          <button type="button" class="bf-btn" id="bfReload">Reload preview</button>
          <a class="bf-open-link primary" id="bfOpenBlank" href="#" target="_blank" rel="noopener">Open demo in new tab</a>
        </div>
      </header>
      <div class="bf-preview" id="bfPreviewOuter">
        <div class="bf-tokens-pane" id="bfTokensPane" hidden>
          <div class="bf-tokens-intro">
            <strong>Resolved at <code>document.documentElement</code></strong> using the theme picker's stylesheet.
            Tokens are enumerated from <code>dist/tokens.json</code> (build parses <code>themes/*.css</code> including <code>@import</code>).
            Click a resolved value to copy.
          </div>
          ${
							tokenData.ok
								? ''
								: `<p class="bf-tokens-warn">${escapeHtml('tokens.json missing — run pnpm build from repo root.')}</p>`
						}
          <div id="bfTokensMount"></div>
        </div>
        <div class="bf-split-stage" id="bfSplitStage">
          <div class="bf-preview-frame-wrap" id="bfPreviewWrap">
            <iframe class="bf-preview-frame" id="bfFrame" title="Component demo preview"></iframe>
          </div>
          <aside class="bf-customize-pane" id="bfCustomizePane" hidden aria-label="Customize and inspect events">
            <div class="bf-customize-block">
              <h3 class="bf-customize-h">Shadow and ::part()</h3>
              <p class="bf-customize-recipe" id="bfCustomizeRecipeHint" hidden></p>
              <p class="bf-customize-p">Primitives use Shadow DOM. Global <code>--bf-theme-*</code> cascade from <code>:root</code>. For internals use host + <code>::part()</code> with the exported part names listed below.</p>
              <pre class="bf-customize-pre" id="bfCustomizeParts">—</pre>
            </div>
            <div class="bf-customize-block">
              <h3 class="bf-customize-h">Documented events</h3>
              <ul class="bf-customize-ul" id="bfCustomizeEventsDoc"></ul>
            </div>
            <div class="bf-customize-block">
              <h3 class="bf-customize-h">CSS overrides</h3>
              <p class="bf-customize-p">Snippet is injected into the preview as <code>&lt;style id="${STYLE_OVERRIDE_ID}"&gt;</code>.</p>
              <textarea class="bf-customize-textarea" id="bfCustomizeCss" spellcheck="false" rows="7"></textarea>
              <div class="bf-customize-row">
                <button type="button" class="bf-btn bf-btn-primary" id="bfCustomizeApply">Apply overrides</button>
                <button type="button" class="bf-btn" id="bfCustomizeReset">Reset snippet</button>
              </div>
            </div>
            <div class="bf-customize-block">
              <h3 class="bf-customize-h">Actions</h3>
              <p class="bf-customize-p">Sandboxed helpers for demos with metadata (<code>showcase/meta/customize.json</code>).</p>
              <div class="bf-customize-actions" id="bfCustomizeActions"></div>
            </div>
            <div class="bf-customize-block">
              <div class="bf-customize-event-head">
                <h3 class="bf-customize-h">Live composed events</h3>
                <button type="button" class="bf-btn" id="bfCustomizeEventClear">Clear</button>
              </div>
              <ul class="bf-event-log" id="bfCustomizeEventLog"></ul>
            </div>
          </aside>
        </div>
    </div>
    </div>`;

	const bfNav = document.getElementById('bfNav') as HTMLElement | null;
	const bfIframe = document.getElementById('bfFrame') as HTMLIFrameElement;
	const bfSearch = document.getElementById('bfSearch') as HTMLInputElement;
	const bfSlugChip = document.getElementById('bfActiveSlug') as HTMLElement;
	const bfTheme = document.getElementById('bfDemoTheme') as HTMLSelectElement;
	const bfReload = document.getElementById('bfReload') as HTMLButtonElement;
	const bfOpenBlank = document.getElementById('bfOpenBlank') as HTMLAnchorElement;
	const bfTabComponents = document.getElementById('bfTabComponents') as HTMLButtonElement;
	const bfTabCustomize = document.getElementById('bfTabCustomize') as HTMLButtonElement;
	const bfTabTokens = document.getElementById('bfTabTokens') as HTMLButtonElement;
	const bfSplitStage = document.getElementById('bfSplitStage') as HTMLElement | null;
	const bfTokensPane = document.getElementById('bfTokensPane') as HTMLElement;
	const bfPreviewWrap = document.getElementById('bfPreviewWrap') as HTMLElement;
	const bfCustomizePane = document.getElementById('bfCustomizePane') as HTMLElement | null;
	const bfCustomizeParts = document.getElementById('bfCustomizeParts') as HTMLElement | null;
	const bfCustomizeEventsDoc = document.getElementById('bfCustomizeEventsDoc') as HTMLElement | null;
	const bfCustomizeCss = document.getElementById('bfCustomizeCss') as HTMLTextAreaElement | null;
	const bfCustomizeApply = document.getElementById('bfCustomizeApply') as HTMLButtonElement | null;
	const bfCustomizeReset = document.getElementById('bfCustomizeReset') as HTMLButtonElement | null;
	const bfCustomizeActions = document.getElementById('bfCustomizeActions') as HTMLElement | null;
	const bfCustomizeEventLog = document.getElementById('bfCustomizeEventLog') as HTMLElement | null;
	const bfCustomizeEventClear = document.getElementById('bfCustomizeEventClear') as HTMLButtonElement | null;
	const bfToolbar = document.querySelector('.bf-toolbar') as HTMLElement | null;
	const bfSearchWrap = document.getElementById('bfSearchWrap') as HTMLElement;
	const bfTokenSearchWrap = document.getElementById('bfTokenSearchWrap') as HTMLElement;
	const bfTokenSearch = document.getElementById('bfTokenSearch') as HTMLInputElement;
	const bfTokensMount = document.getElementById('bfTokensMount') as HTMLElement | null;

	if (
		!bfNav ||
		!bfIframe ||
		!bfSearch ||
		!bfSlugChip ||
		!bfTheme ||
		!bfReload ||
		!bfOpenBlank ||
		!bfTabComponents ||
		!bfTabCustomize ||
		!bfTabTokens ||
		!bfTokensPane ||
		!bfSplitStage ||
		!bfPreviewWrap ||
		!bfCustomizePane ||
		!bfCustomizeParts ||
		!bfCustomizeEventsDoc ||
		!bfCustomizeCss ||
		!bfCustomizeApply ||
		!bfCustomizeReset ||
		!bfCustomizeActions ||
		!bfCustomizeEventLog ||
		!bfCustomizeEventClear ||
		!bfSearchWrap ||
		!bfTokenSearchWrap ||
		!bfTokenSearch ||
		!bfTokensMount ||
		!bfToolbar
	) {
		return;
	}

	const nav = bfNav;
	const toolbar = bfToolbar;
	const tokensMount = bfTokensMount;

	let demoTheme = 'system';
	let viewMode: 'components' | 'tokens' | 'customize' = 'components';

	let customizeBridgeTeardown: (() => void) | undefined;
	type LogRow = { kind: string; detail: unknown; t: number };
	const customizeLogRows: LogRow[] = [];

	bfCustomizeCss.value = OVERRIDE_TEXTAREA_DEFAULT.trim();

	for (const t of uniqueThemes()) {
		bfTheme.appendChild(optionFor(t));
	}
	bfTheme.value = demoTheme;

	function redrawCustomizeEventLog() {
		bfCustomizeEventLog!.replaceChildren();
		const frag = document.createDocumentFragment();
		for (const row of customizeLogRows) {
			const li = document.createElement('li');
			li.className = 'bf-event-item';
			const timeEl = document.createElement('span');
			timeEl.className = 'bf-ev-time';
			timeEl.textContent = new Date(row.t).toISOString().slice(11, 23);
			const kindEl = document.createElement('code');
			kindEl.className = 'bf-ev-kind';
			kindEl.textContent = row.kind;
			const detailEl = document.createElement('pre');
			detailEl.className = 'bf-ev-detail';
			detailEl.textContent = stringifyDetail(row.detail);
			li.append(timeEl, document.createTextNode(' '), kindEl, detailEl);
			frag.appendChild(li);
		}
		bfCustomizeEventLog!.appendChild(frag);
	}

	function pushCustomizeLog(kind: string, detail: unknown) {
		customizeLogRows.push({ kind, detail, t: Date.now() });
		if (customizeLogRows.length > EVENT_LOG_CAP) {
			customizeLogRows.splice(0, customizeLogRows.length - EVENT_LOG_CAP);
		}
		redrawCustomizeEventLog();
	}

	function bindCustomizeIframeIfNeeded() {
		customizeBridgeTeardown?.();
		customizeBridgeTeardown = undefined;
		if (viewMode !== 'customize') return;
		customizeBridgeTeardown = attachCustomizeIframeBridge(
			bfIframe,
			() => bfCustomizeCss!.value,
			pushCustomizeLog,
		);
	}

	function setViewMode(mode: 'components' | 'tokens' | 'customize') {
		viewMode = mode;
		const rails = mode === 'components' || mode === 'customize';

		bfTabComponents.classList.toggle('active', mode === 'components');
		bfTabComponents.setAttribute('aria-selected', String(mode === 'components'));
		bfTabCustomize.classList.toggle('active', mode === 'customize');
		bfTabCustomize.setAttribute('aria-selected', String(mode === 'customize'));
		bfTabTokens.classList.toggle('active', mode === 'tokens');
		bfTabTokens.setAttribute('aria-selected', String(mode === 'tokens'));

		bfSearchWrap.hidden = !rails;
		bfTokenSearchWrap.hidden = mode !== 'tokens';
		nav.style.display = rails ? '' : 'none';

		toolbar.style.display = rails ? '' : 'none';
		bfTokensPane.hidden = mode !== 'tokens';
		bfSplitStage!.hidden = mode === 'tokens';
		bfCustomizePane!.hidden = mode !== 'customize';
		bfSplitStage!.classList.toggle('bf-split-stage--customize', mode === 'customize');

		customizeBridgeTeardown?.();
		customizeBridgeTeardown = undefined;

		if (mode === 'tokens') {
			attachStudioThemeLink(demoTheme, base);
			refreshTokenTable();
		} else {
			detachStudioThemeLink();
			syncDemoDocumentTheme(demoTheme, base, bfIframe.contentWindow);
			bindCustomizeIframeIfNeeded();
		}
	}

	function refreshTokenTable() {
		if (!tokenData.ok) return;
		renderTokensTable(tokensMount, tokenData.tokens, bfTokenSearch.value);
	}

	function refreshCustomizeSidebar(slug: string) {
		const recipe = CUSTOMIZE_META[slug];
		const hintEl = document.getElementById('bfCustomizeRecipeHint') as HTMLElement | null;
		if (hintEl) {
			hintEl.textContent = recipe?.cssHint ?? '';
			hintEl.hidden = !recipe?.cssHint;
		}
		const parts = studioMeta.ok ? (studioMeta.parts[slug] ?? []) : [];
		const host = slugToTag(slug);
		bfCustomizeParts!.textContent = parts.length
			? parts.map((p) => `${host}::part(${p})`).join('\n')
			: '— (no exported ::part detected in TSX)';
		bfCustomizeEventsDoc!.replaceChildren();
		const events = recipe?.eventsDoc ?? [];
		if (!events.length) {
			const li = document.createElement('li');
			li.textContent =
				'No curated list yet for this slug — inspect the component source or docs/COMPONENT-CONTRACT.md.';
			bfCustomizeEventsDoc!.appendChild(li);
		} else {
			for (const line of events) {
				const li = document.createElement('li');
				li.textContent = line;
				bfCustomizeEventsDoc!.appendChild(li);
			}
		}
		bfCustomizeActions!.replaceChildren();
		const ids = recipe?.actionIds ?? [];
		if (!ids.length) {
			const p = document.createElement('p');
			p.className = 'bf-customize-muted';
			p.textContent =
				'No canned actions for this slug — interact with the preview directly.';
			bfCustomizeActions!.appendChild(p);
			return;
		}
		for (const id of ids) {
			const fn = CUSTOMIZE_ACTIONS[id];
			if (!fn) continue;
			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'bf-btn';
			btn.textContent = ACTION_LABELS[id] ?? id;
			btn.addEventListener('click', () => {
				const doc = bfIframe.contentDocument;
				if (!doc) {
					pushCustomizeLog('[studio]', 'No iframe document');
					return;
				}
				try {
					fn(doc);
				} catch (e: unknown) {
					pushCustomizeLog('[action-error]', String(e instanceof Error ? e.message : e));
				}
			});
			bfCustomizeActions!.appendChild(btn);
		}
	}

	bfTabComponents.addEventListener('click', () => setViewMode('components'));
	bfTabCustomize.addEventListener('click', () => setViewMode('customize'));
	bfTabTokens.addEventListener('click', () => setViewMode('tokens'));

	bfCustomizeApply.addEventListener('click', () => bindCustomizeIframeIfNeeded());
	bfCustomizeReset.addEventListener('click', () => {
		bfCustomizeCss.value = OVERRIDE_TEXTAREA_DEFAULT.trim();
		bindCustomizeIframeIfNeeded();
	});
	bfCustomizeEventClear.addEventListener('click', () => {
		customizeLogRows.splice(0, customizeLogRows.length);
		redrawCustomizeEventLog();
	});

	let active = '';

	bfTheme.addEventListener('change', () => {
		demoTheme = bfTheme.value;
		syncDemoDocumentTheme(demoTheme, base, bfIframe.contentWindow);
		if (viewMode === 'tokens') {
			attachStudioThemeLink(demoTheme, base);
			requestAnimationFrame(() => refreshTokenTable());
		} else {
			bindCustomizeIframeIfNeeded();
		}
	});

	bfReload.addEventListener('click', () => {
		bfIframe.contentWindow?.location.reload();
	});

	function applyChip(slug: string) {
		bfSlugChip.textContent = `${slugToTag(slug)}`;
		const demoUrl = new URL(`${slug}/index.html`, base).href;
		bfOpenBlank.href = demoUrl;
		for (const el of nav.querySelectorAll('a[data-slug]')) {
			el.setAttribute('data-active', (el.getAttribute('data-slug') === slug).toString());
		}
	}

	function syncComponentQuery(slug: string) {
		try {
			const u = new URL(window.location.href);
			u.searchParams.set('component', slug);
			history.replaceState(null, '', u);
		} catch {
			/* file:// or restricted */
		}
	}

	function navigateTo(slug: string, opts: { syncUrl?: boolean } = {}) {
		const { syncUrl = true } = opts;
		active = slug;
		bfIframe.src = new URL(`${slug}/index.html`, base).href;
		applyChip(slug);
		refreshCustomizeSidebar(slug);
		if (syncUrl) {
			syncComponentQuery(slug);
		}
	}

	bfIframe.addEventListener('load', () => {
		syncDemoDocumentTheme(demoTheme, base, bfIframe.contentWindow);
		bindCustomizeIframeIfNeeded();
	});

	nav.addEventListener('click', (ev) => {
		const t = ev.target instanceof Element ? ev.target.closest('a[data-slug]') : null;
		if (!(t instanceof HTMLAnchorElement)) return;
		ev.preventDefault();
		const slug = t.getAttribute('data-slug');
		if (slug) navigateTo(slug);
	});

	function navLabel(slug: string): string {
		const worded = titleCase(slug.replace(/-/g, ' '));
		const isEssential = (ESSENTIAL_SLUGS as readonly string[]).includes(slug);
		if (isEssential && slugCount && list.includes(slug)) {
			return `${worded} · MVP`;
		}
		return worded;
	}

	function categorySortKey(cat: string): number {
		const i = CATEGORY_ORDER.indexOf(cat as (typeof CATEGORY_ORDER)[number]);
		return i === -1 ? CATEGORY_ORDER.length : i;
	}

	const rerenderNav = () => {
		const q = bfSearch.value.trim().toLowerCase();
		const filtered = list.filter((c) => {
			if (!q) return true;
			const lc = c.toLowerCase();
			const norm = q.startsWith('bf-') ? q.slice(3) : q;
			const tagLc = slugToTag(c).toLowerCase();
			return lc.includes(q) || lc.includes(norm) || tagLc.includes(q);
		});

		if (filtered.length === 0) {
			nav.innerHTML = `<p style="opacity:.72;font-size:.82rem">${escapeHtml('No matches — try another search.')}</p>`;
			return;
		}

		const essentialsList = ESSENTIAL_SLUGS.filter((s) => filtered.includes(s));
		const labsList = filtered.filter((s) => !ESSENTIAL_SLUGS.includes(s as (typeof ESSENTIAL_SLUGS)[number]));

		const links = (slugs: string[]) =>
			slugs
				.map(
					(c) =>
						`<a href="#" data-slug="${escapeAttr(c)}">${escapeHtml(navLabel(c))}</a>`,
				)
				.join('');

		const parts: string[] = [];
		if (essentialsList.length) {
			parts.push(`<div class="bf-nav-section-head">Essentials</div>${links(essentialsList)}`);
		}
		if (labsList.length) {
			if (!studioMeta.ok) {
				const sortedLabs = [...labsList].sort();
				parts.push(
					`<div class="bf-nav-section-head">More components (${sortedLabs.length})</div>${links(sortedLabs)}`,
				);
			} else {
				const buckets = new Map<string, string[]>();
				for (const s of labsList) {
					const cat = studioMeta.categories[s] ?? 'base';
					const arr = buckets.get(cat);
					if (arr) arr.push(s);
					else buckets.set(cat, [s]);
				}
				for (const arr of buckets.values()) {
					arr.sort();
				}
				const catsSorted = [...buckets.keys()].sort((a, b) => categorySortKey(a) - categorySortKey(b) || a.localeCompare(b));

				for (const cat of catsSorted) {
					const slugs = buckets.get(cat)!;
					const label = CATEGORY_LABELS[cat] ?? titleCase(cat.replace(/-/g, ' '));
					parts.push(
						`<div class="bf-nav-section-head">${escapeHtml(`${label} (${slugs.length})`)}</div>${links(slugs)}`,
					);
				}
			}
		}

		const next =
			active && filtered.includes(active) ? active : (essentialsList[0] ?? filtered[0]!);
		const shouldReload = next !== active;

		nav.innerHTML = parts.join('');

		active = next;
		applyChip(next);
		refreshCustomizeSidebar(active);
		if (shouldReload) {
			bfIframe.src = new URL(`${next}/index.html`, base).href;
		} else {
			syncDemoDocumentTheme(demoTheme, base, bfIframe.contentWindow);
		}
	};

	bfSearch.addEventListener('input', () => rerenderNav());
	bfTokenSearch.addEventListener('input', () => refreshTokenTable());
	rerenderNav();

	const requested = new URL(window.location.href).searchParams
		.get('component')
		?.replace(/^bf-/, '')
		.trim()
		.toLowerCase();
	if (requested && list.includes(requested)) {
		navigateTo(requested);
	}

	window.addEventListener('popstate', () => {
		const slug = new URL(window.location.href).searchParams
			.get('component')
			?.replace(/^bf-/, '')
			.trim()
			.toLowerCase();
		if (slug && list.includes(slug)) {
			navigateTo(slug, { syncUrl: false });
		}
	});
}

function optionFor(text: string): HTMLOptionElement {
	const o = document.createElement('option');
	o.value = text;
	o.textContent = text;
	return o;
}

function escapeHtml(raw: string): string {
	const d = document.createElement('div');
	d.textContent = raw;
	return d.innerHTML;
}

function escapeAttr(raw: string): string {
	return raw.replace(/[&<>"']/g, (ch) =>
		ch === '&'
			? '&amp;'
			: ch === '<'
				? '&lt;'
				: ch === '>'
					? '&gt;'
					: ch === '"'
						? '&quot;'
						: '&#039;',
	);
}

function titleCase(raw: string): string {
	return raw.replace(/\b\w/g, (c) => c.toUpperCase());
}

(async () => {
	const app = document.getElementById('app');
	if (!app) throw new Error('#app missing');

	const base = showcasePublicBase();

	const [{ ok: manOk, components }, tokenFetch, studioMeta] = await Promise.all([
		fetchManifest(base),
		fetchTokensManifest(base),
		fetchShowcaseStudio(base),
	]);

	if (!manOk) {
		renderSetupError(`Could not load ${new URL('dist/manifest.json', base).pathname}.`);
		return;
	}

	const tokenData: TokensManifestResolved = tokenFetch.ok
		? { ok: true, tokens: tokenFetch.tokens, byTheme: tokenFetch.byTheme }
		: { ok: false, tokens: [], byTheme: {} };

	render(app, components, tokenData, base, studioMeta);
})().catch((e: unknown) => {
	console.error('[studio]', e);
	const msg =
		e instanceof Error && typeof e.message === 'string'
			? e.message
			: typeof e === 'string'
				? e
				: JSON.stringify(e);
	renderSetupError(msg);
});
