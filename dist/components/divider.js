class BfDivider extends HTMLElement {
	static observedAttributes = ['vertical', 'thickness'];

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

		const cssUrl = new URL('./divider.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('div');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = '<slot></slot>';

		this.shadowRoot.replaceChildren(link, root);
		this._root = root;
		this._sync();
	}

	attributeChangedCallback() {
		this._sync();
	}

	_sync() {
		if (!this._root) {
			return;
		}

		const isVertical = this.hasAttribute('vertical');
		this._root.dataset.orientation = isVertical ? 'vertical' : 'horizontal';

		const raw = this.getAttribute('thickness');
		if (!raw) {
			this.style.removeProperty('--bf-divider-thickness');
			return;
		}

		const parsed = Number.parseFloat(raw);
		if (Number.isFinite(parsed)) {
			this.style.setProperty('--bf-divider-thickness', `${parsed}px`);
			return;
		}

		this.style.setProperty('--bf-divider-thickness', raw);
	}
}

customElements.define('bf-divider', BfDivider);
