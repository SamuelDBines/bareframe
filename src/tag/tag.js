class BfTag extends HTMLElement {
	static observedAttributes = ['variant', 'badge', 'chip', 'pill', 'size'];

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

		const cssUrl = new URL('./tag.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('div');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = '<slot></slot>';

		if (!this.innerHTML.trim()) {
			root.textContent = 'tag';
		}

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

		const explicit = (this.getAttribute('variant') || '').toLowerCase();
		let variant = 'tag';
		if (['tag', 'badge', 'chip', 'pill'].includes(explicit)) {
			variant = explicit;
		} else if (this.hasAttribute('badge')) {
			variant = 'badge';
		} else if (this.hasAttribute('chip')) {
			variant = 'chip';
		} else if (this.hasAttribute('pill')) {
			variant = 'pill';
		}

		this._root.dataset.variant = variant;

		const size = (this.getAttribute('size') || 'md').toLowerCase();
		this._root.dataset.size = ['sm', 'md', 'lg'].includes(size) ? size : 'md';
	}
}

customElements.define('bf-tag', BfTag);
