class BfEdge extends HTMLElement {
	static observedAttributes = ['position', 'sticky', 'fixed', 'header', 'footer'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		if (this._initialized) {
			this._syncPosition();
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./edge.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('div');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = '<slot></slot>';

		if (!this.innerHTML.trim()) {
			root.textContent = 'edge';
		}

		this.shadowRoot.replaceChildren(link, root);
		this._syncPosition();
	}

	attributeChangedCallback() {
		this._syncPosition();
	}

	_syncPosition() {
		if (!this.hasAttribute('header') && !this.hasAttribute('footer') && !this.getAttribute('position')) {
			this.setAttribute('header', '');
		}

		const position = this.getAttribute('position');
		if (position === 'bottom') {
			this.removeAttribute('header');
			this.setAttribute('footer', '');
		}
		if (position === 'top') {
			this.removeAttribute('footer');
			this.setAttribute('header', '');
		}
	}
}

customElements.define('bf-edge', BfEdge);
