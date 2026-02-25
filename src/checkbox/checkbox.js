class BfCheckbox extends HTMLElement {
	static observedAttributes = ['checked', 'disabled', 'label', 'value'];

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

		const cssUrl = new URL('./checkbox.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('label');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = `
			<input type="checkbox" part="input" />
			<span class="box" part="box"></span>
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

	get value() {
		return this.getAttribute('value') || this.textContent?.trim() || '';
	}

	_onInputChange() {
		const nextChecked = this._input.checked;
		if (nextChecked && !this._canSelectMore()) {
			this._input.checked = false;
			return;
		}
		this.checked = nextChecked;

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

	_effectiveGroup() {
		return this.getAttribute('group') || '';
	}

	_groupLimit() {
		const multiple = this.getAttribute('multiple');
		if (multiple === null) {
			return Infinity;
		}
		if (multiple === '') {
			return Infinity;
		}
		const parsed = Number.parseInt(multiple, 10);
		return Number.isFinite(parsed) && parsed > 0 ? parsed : Infinity;
	}

	_canSelectMore() {
		const group = this._effectiveGroup();
		if (!group) {
			return true;
		}
		const cap = this._groupLimit();
		if (cap === Infinity) {
			return true;
		}
		const selected = [
			...document.querySelectorAll(
				`bf-checkbox[group="${CSS.escape(group)}"][checked]`,
			),
		];
		return selected.length < cap || selected.includes(this);
	}

	_syncState() {
		if (!this._input) {
			return;
		}
		this._input.checked = this.checked;
		this._input.disabled = this.hasAttribute('disabled');
		this._input.value = this.value;
		if (this.getAttribute('label')) {
			this.setAttribute('aria-label', this.getAttribute('label'));
		}
	}
}

customElements.define('bf-checkbox', BfCheckbox);
