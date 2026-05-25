import './showcase.css';

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

function render(app: HTMLElement, components: string[], tokenData: TokensManifestResolved, base: URL) {
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
        <div class="bf-preview-frame-wrap" id="bfPreviewWrap">
          <iframe class="bf-preview-frame" id="bfFrame" title="Component demo preview"></iframe>
        </div>
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
	const bfTabTokens = document.getElementById('bfTabTokens') as HTMLButtonElement;
	const bfTokensPane = document.getElementById('bfTokensPane') as HTMLElement;
	const bfPreviewWrap = document.getElementById('bfPreviewWrap') as HTMLElement;
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
		!bfTabTokens ||
		!bfTokensPane ||
		!bfPreviewWrap ||
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
	let viewMode: 'components' | 'tokens' = 'components';

	for (const t of uniqueThemes()) {
		bfTheme.appendChild(optionFor(t));
	}
	bfTheme.value = demoTheme;

	function setViewMode(mode: 'components' | 'tokens') {
		viewMode = mode;
		const isComponents = mode === 'components';
		bfTabComponents.classList.toggle('active', isComponents);
		bfTabComponents.setAttribute('aria-selected', String(isComponents));
		bfTabTokens.classList.toggle('active', !isComponents);
		bfTabTokens.setAttribute('aria-selected', String(!isComponents));

		bfSearchWrap.hidden = !isComponents;
		bfTokenSearchWrap.hidden = isComponents;
		nav.style.display = isComponents ? '' : 'none';

		toolbar.style.display = isComponents ? '' : 'none';
		bfTokensPane.hidden = isComponents;
		bfPreviewWrap.hidden = !isComponents;

		if (isComponents) {
			detachStudioThemeLink();
		} else {
			attachStudioThemeLink(demoTheme, base);
			refreshTokenTable();
		}
	}

	function refreshTokenTable() {
		if (!tokenData.ok) return;
		renderTokensTable(tokensMount, tokenData.tokens, bfTokenSearch.value);
	}

	bfTabComponents.addEventListener('click', () => setViewMode('components'));
	bfTabTokens.addEventListener('click', () => setViewMode('tokens'));

	let active = '';

	bfTheme.addEventListener('change', () => {
		demoTheme = bfTheme.value;
		syncDemoDocumentTheme(demoTheme, base, bfIframe.contentWindow);
		if (viewMode === 'tokens') {
			attachStudioThemeLink(demoTheme, base);
			requestAnimationFrame(() => refreshTokenTable());
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
		if (syncUrl) {
			syncComponentQuery(slug);
		}
	}

	bfIframe.addEventListener('load', () => {
		syncDemoDocumentTheme(demoTheme, base, bfIframe.contentWindow);
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
			parts.push(
				`<div class="bf-nav-section-head">More components (${labsList.length})</div>${links(labsList)}`,
			);
		}

		const next =
			active && filtered.includes(active) ? active : (essentialsList[0] ?? filtered[0]!);
		const shouldReload = next !== active;

		nav.innerHTML = parts.join('');

		active = next;
		applyChip(next);
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

	const [{ ok: manOk, components }, tokenFetch] = await Promise.all([
		fetchManifest(base),
		fetchTokensManifest(base),
	]);

	if (!manOk) {
		renderSetupError(`Could not load ${new URL('dist/manifest.json', base).pathname}.`);
		return;
	}

	const tokenData: TokensManifestResolved = tokenFetch.ok
		? { ok: true, tokens: tokenFetch.tokens, byTheme: tokenFetch.byTheme }
		: { ok: false, tokens: [], byTheme: {} };

	render(app, components, tokenData, base);
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
