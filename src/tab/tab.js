class BfTab extends HTMLElement {
	static observedAttributes = ['selected', 'disabled', 'group', 'label', 'value'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._onClick = this._onClick.bind(this);
	}

	connectedCallback() {
		if (this._initialized) {
			this._syncState();
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./tab.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('button');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.type = 'button';
		root.innerHTML = '<slot></slot>';


		this.shadowRoot.replaceChildren(link, root);
		this._button = root;
		root.addEventListener('click', this._onClick);
		this._syncState();
	}

	attributeChangedCallback() {
		this._syncState();
	}

	get selected() {
		return this.hasAttribute('selected');
	}

	set selected(value) {
		if (value) {
			this.setAttribute('selected', '');
			return;
		}
		this.removeAttribute('selected');
	}

	get value() {
		return this.getAttribute('value') || this.textContent?.trim() || '';
	}

	_onClick() {
		const group = this.getAttribute('group');
		if (group) {
			const peers = document.querySelectorAll(`bf-tab[group="${CSS.escape(group)}"]`);
			for (const peer of peers) {
				peer.selected = peer === this;
			}
		} else {
			this.selected = true;
		}

		this.dispatchEvent(
			new CustomEvent('bf-change', {
				bubbles: true,
				composed: true,
				detail: {
					group: group || '',
					value: this.value,
					selected: this.selected,
				},
			}),
		);
	}

	_syncState() {
		if (!this._button) {
			return;
		}
		if (this.getAttribute('label')) {
			this._button.setAttribute('aria-label', this.getAttribute('label'));
		}
		this._button.disabled = this.hasAttribute('disabled');
		this._button.setAttribute('aria-selected', String(this.selected));
		this._button.setAttribute('role', 'tab');
		this._button.classList.toggle('is-selected', this.selected);
	}
}

customElements.define('bf-tab', BfTab);
