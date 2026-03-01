class BfLink extends HTMLElement {
	static observedAttributes = ['variant', 'vertical'];

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

		const cssUrl = new URL('./link.css', import.meta.url);
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
		const variant = (this.getAttribute('variant') || 'inline').toLowerCase();
		this._root.setAttribute('data-variant', ['inline', 'pill', 'nav'].includes(variant) ? variant : 'inline');
		this._root.toggleAttribute('data-vertical', this.hasAttribute('vertical'));
	}
}

customElements.define('bf-link', BfLink);
