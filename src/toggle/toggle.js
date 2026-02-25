class BfToggle extends HTMLElement {
	static observedAttributes = ['checked', 'disabled', 'label', 'switch', 'variant'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._onClick = this._onClick.bind(this);
	}

	connectedCallback() {
		if (this._initialized) {
			this._sync();
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./toggle.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('button');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.type = 'button';
		root.innerHTML = `
			<span class="track" part="track"><span class="thumb" part="thumb"></span></span>
			<span class="text" part="text"><slot></slot></span>
		`;

		this.shadowRoot.replaceChildren(link, root);
		this._root = root;
		this._text = root.querySelector('.text');
		this._root.addEventListener('click', this._onClick);
		if (!this.textContent?.trim()) {
			this.textContent = 'toggle';
		}
		this._sync();
	}

	attributeChangedCallback() {
		this._sync();
	}

	get checked() {
		return this.hasAttribute('checked');
	}

	set checked(next) {
		if (next) {
			this.setAttribute('checked', '');
			return;
		}
		this.removeAttribute('checked');
	}

	_onClick() {
		if (this.hasAttribute('disabled')) {
			return;
		}
		this.checked = !this.checked;
		this.dispatchEvent(
			new CustomEvent('bf-change', {
				bubbles: true,
				composed: true,
				detail: {
					checked: this.checked,
				},
			}),
		);
	}

	_variant() {
		const variant = (this.getAttribute('variant') || '').toLowerCase();
		if (variant === 'switch' || this.hasAttribute('switch')) {
			return 'switch';
		}
		return 'toggle';
	}

	_sync() {
		if (!this._root) {
			return;
		}
		const variant = this._variant();
		this._root.setAttribute('data-variant', variant);
		this._root.setAttribute('aria-pressed', String(this.checked));
		this._root.setAttribute('role', 'switch');
		this._root.setAttribute('aria-checked', String(this.checked));
		this._root.disabled = this.hasAttribute('disabled');
		this._root.classList.toggle('is-checked', this.checked);
		if (this.getAttribute('label')) {
			this._root.setAttribute('aria-label', this.getAttribute('label'));
		}
		this._text.hidden = variant === 'switch' && !(this.textContent || '').trim();
	}
}

customElements.define('bf-toggle', BfToggle);
