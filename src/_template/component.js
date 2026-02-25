class BfComponent extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		if (this._initialized) {
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./component.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('div');
		root.setAttribute('part', 'root');
		root.innerHTML = `<slot></slot>`;

		this.shadowRoot.replaceChildren(link, root);
	}
}

customElements.define('bf-component', BfComponent);
