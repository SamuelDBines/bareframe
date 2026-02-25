class BfRadio extends HTMLElement {
	static observedAttributes = ['checked', 'disabled', 'label', 'value', 'group'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._onInputChange = this._onInputChange.bind(this);
	}

	connectedCallback() {
		if (this._initialized) {
			this._syncState();
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./radio.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('label');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = `
			<input type="radio" part="input" />
			<span class="dot" part="dot"></span>
			<span class="text" part="text"><slot></slot></span>
		`;

		this.shadowRoot.replaceChildren(link, root);
		this._input = this.shadowRoot.querySelector('input');
		this._input.addEventListener('change', this._onInputChange);
		this._syncState();
	}

	attributeChangedCallback() {
		this._syncState();
	}

	get checked() {
		return this.hasAttribute('checked');
	}

	set checked(value) {
		if (value) {
			this.setAttribute('checked', '');
			return;
		}
		this.removeAttribute('checked');
	}

	_onInputChange() {
		if (this._input.checked) {
			this.checked = true;
			this._uncheckPeers();
		}

		this.dispatchEvent(
			new CustomEvent('bf-change', {
				bubbles: true,
				composed: true,
				detail: {
					group: this._effectiveGroup(),
					value: this.value,
					checked: this.checked,
				},
			}),
		);
	}

	_uncheckPeers() {
		const group = this._effectiveGroup();
		if (!group) {
			return;
		}
		const peers = document.querySelectorAll(`bf-radio[group="${CSS.escape(group)}"]`);
		for (const peer of peers) {
			if (peer !== this) {
				peer.checked = false;
			}
		}
	}

	_effectiveGroup() {
		return this.getAttribute('group') || '';
	}

	get value() {
		return this.getAttribute('value') || this.textContent?.trim() || '';
	}

	_syncState() {
		if (!this._input) {
			return;
		}
		const group = this._effectiveGroup();
		this._input.name = group;
		this._input.value = this.value;
		this._input.checked = this.checked;
		this._input.disabled = this.hasAttribute('disabled');
		const hasLabelText = (this.textContent || '').trim().length > 0;
		if (!hasLabelText && !this.getAttribute('label')) {
			this.setAttribute('label', 'radio');
		}
		if (this.getAttribute('label')) {
			this.setAttribute('aria-label', this.getAttribute('label'));
		}
	}
}

customElements.define('bf-radio', BfRadio);
