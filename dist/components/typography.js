class BfTypography extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		if (this._initialized) {
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./typography.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const variant = this.getAttribute('variant') || 'body';
		const as = this.getAttribute('as') || 'span';
		const safeTag = /^[a-z][a-z0-9-]*$/i.test(as) ? as : 'span';
		const root = document.createElement(safeTag);
		root.className = `root ${variant}`;
		root.setAttribute('part', 'root');
		root.innerHTML = '<slot></slot>';

		this.shadowRoot.replaceChildren(link, root);
	}
}

customElements.define('bf-typography', BfTypography);
