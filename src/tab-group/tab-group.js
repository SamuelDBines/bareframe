class BfTabGroup extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		if (this._initialized) {
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./tab-group.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('div');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = '<slot></slot>';

		if (!this.innerHTML.trim()) {
			root.textContent = 'tab group';
		}

		this.shadowRoot.replaceChildren(link, root);
	}
}

customElements.define('bf-tab-group', BfTabGroup);
