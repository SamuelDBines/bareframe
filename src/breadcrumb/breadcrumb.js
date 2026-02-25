class BfBreadcrumb extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		if (this._initialized) {
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./breadcrumb.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('div');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = '<slot></slot>';

		if (!this.innerHTML.trim()) {
			root.textContent = 'breadcrumb';
		}

		this.shadowRoot.replaceChildren(link, root);
	}
}

customElements.define('bf-breadcrumb', BfBreadcrumb);
