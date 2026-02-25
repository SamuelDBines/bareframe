class BfModal extends HTMLElement {
	static observedAttributes = ['open', 'label'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._onBackdropClick = this._onBackdropClick.bind(this);
	}

	connectedCallback() {
		if (this._initialized) {
			this._sync();
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./modal.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('div');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = `
			<div class="backdrop" part="backdrop"></div>
			<div class="panel" part="panel"><slot></slot></div>
		`;

		this.shadowRoot.replaceChildren(link, root);
		this._root = root;
		this._backdrop = root.querySelector('.backdrop');
		this._backdrop.addEventListener('click', this._onBackdropClick);

		if (!this.textContent?.trim()) {
			this.textContent = 'modal';
		}

		this._sync();
	}

	attributeChangedCallback() {
		this._sync();
	}

	open() {
		this.setAttribute('open', '');
	}

	close() {
		this.removeAttribute('open');
	}

	toggle() {
		if (this.hasAttribute('open')) {
			this.close();
			return;
		}
		this.open();
	}

	_onBackdropClick() {
		if (this.hasAttribute('persistent')) {
			return;
		}
		this.close();
	}

	_shouldOpenByDefault() {
		return !this.hasAttribute('id');
	}

	_sync() {
		if (!this._root) {
			return;
		}

		if (!this.hasAttribute('open') && this._shouldOpenByDefault()) {
			this.setAttribute('open', '');
			return;
		}

		const isOpen = this.hasAttribute('open');
		this.hidden = !isOpen;
		this._root.setAttribute('data-open', isOpen ? 'true' : 'false');
		this.setAttribute('aria-hidden', String(!isOpen));
		this.setAttribute('role', 'dialog');
		this.setAttribute('aria-modal', 'true');
		if (this.getAttribute('label')) {
			this.setAttribute('aria-label', this.getAttribute('label'));
		}
	}
}

customElements.define('bf-modal', BfModal);
