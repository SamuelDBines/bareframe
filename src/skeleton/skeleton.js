class BfSkeleton extends HTMLElement {
	static observedAttributes = ['variant', 'lines', 'width', 'height', 'radius', 'static'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		if (this._initialized) {
			this._sync();
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./skeleton.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('div');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = '<div class="lines" part="lines"></div><slot></slot>';

		this.shadowRoot.replaceChildren(link, root);
		this._root = root;
		this._lines = root.querySelector('.lines');
		this._sync();
	}

	attributeChangedCallback() {
		this._sync();
	}

	_sync() {
		if (!this._root || !this._lines) {
			return;
		}

		const rawVariant = (this.getAttribute('variant') || 'text').toLowerCase();
		const lines = Math.max(1, Number.parseInt(this.getAttribute('lines') || '1', 10) || 1);
		const variant = rawVariant === 'text' && lines > 1 ? 'paragraph' : rawVariant;
		this._root.dataset.variant = variant;
		this._root.dataset.animate = this.hasAttribute('static') ? 'off' : 'on';

		this._setSizeVar('--bf-skeleton-width', this.getAttribute('width'));
		this._setSizeVar('--bf-skeleton-height', this.getAttribute('height'));
		this._setSizeVar('--bf-skeleton-radius', this.getAttribute('radius'));

		if (variant !== 'paragraph') {
			this._lines.replaceChildren();
			return;
		}

		const widths = ['96%', '90%', '94%', '86%', '92%', '84%'];
		const nodes = [];
		for (let i = 0; i < lines; i += 1) {
			const line = document.createElement('span');
			line.className = 'line';
			const width = i === lines - 1 ? '68%' : widths[i % widths.length];
			line.style.width = width;
			nodes.push(line);
		}
		this._lines.replaceChildren(...nodes);
	}

	_setSizeVar(name, value) {
		if (!value) {
			this.style.removeProperty(name);
			return;
		}

		const trimmed = value.trim();
		if (/^-?\d*\.?\d+$/.test(trimmed)) {
			this.style.setProperty(name, `${trimmed}px`);
			return;
		}

		this.style.setProperty(name, trimmed);
	}
}

customElements.define('bf-skeleton', BfSkeleton);
