export default class BfComponent extends HTMLElement {
	protected _initialized = false;
	protected name = 'bf-component';
	protected link: HTMLLinkElement | null = null;
	protected root: HTMLElement = document.createElement('div');

	constructor(name: string) {
		super();
		if (!this.shadowRoot) {
			this.attachShadow({ mode: 'open' });
		}
		this.name = name;
	}

	ensureInitialized() {
		if (this._initialized) {
			return false;
		}
		this._initialized = true;
		return true;
	}

	createStyleLink(
		baseUrl = import.meta.url,
		baseCss: string = `./${this.name}.css`,
	): HTMLLinkElement {
		const cssUrl = new URL(baseCss, baseUrl);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;
		return link;
	}

	mount() {
		this.link = this.createStyleLink();
		this.root = document.createElement('div');
		this.root.setAttribute('part', 'root');
		this.root.innerHTML = `<slot></slot>`;
		if (this.shadowRoot) this.shadowRoot.replaceChildren(this.link, this.root);
	}

	connectedCallback() {
		if (!this.ensureInitialized()) return;

		this.mount();
	}

	disconnectedCallback() {
		if (!this.ensureInitialized()) return;
	}

	connectedMoveCallback() {
		if (!this.ensureInitialized()) return;
	}

	adoptedCallback() {
		if (!this.ensureInitialized()) return;
	}

	attributeChangedCallback(name: string, oldValue: unknown, newValue: unknown) {
		if (!this.ensureInitialized()) return;
	}
}
