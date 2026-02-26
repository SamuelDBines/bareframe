class BfButton extends HTMLElement {
	static observedAttributes = ['selected', 'disabled', 'variant', 'label', 'group'];

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
		const label = this.getAttribute('label') || '';
		const cssUrl = new URL('./button.css', import.meta.url);

		this.shadowRoot.innerHTML = '';

		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const button = document.createElement('button');
		button.className = this.getAttribute('variant') || 'primary';
		button.type = 'button';
		button.textContent = label;
		button.append(document.createElement('slot'));

		this.shadowRoot.append(link, button);
		this._button = button;
		button.addEventListener('click', this._onClick);
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

	_onClick() {
		this._applyGroupSelection();
		const label = this.getAttribute('label') || '';
		const variant = this.getAttribute('variant') || 'primary';
		this.dispatchEvent(
			new CustomEvent('bf-click', {
				bubbles: true,
				composed: true,
				detail: {
					label,
					variant,
					selected: this.selected,
					group: this.getAttribute('group') || '',
					at: new Date().toISOString(),
				},
			}),
		);
	}

	_groupLimit() {
		const multiple = this.getAttribute('multiple');
		if (multiple === null) {
			return 1;
		}
		if (multiple === '') {
			return Infinity;
		}
		const parsed = Number.parseInt(multiple, 10);
		return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
	}

	_applyGroupSelection() {
		const group = this.getAttribute('group');
		if (!group) {
			return;
		}
		const peers = [...document.querySelectorAll(`bf-button[group="${CSS.escape(group)}"]`)];
		const cap = this._groupLimit();

		if (cap === 1) {
			for (const peer of peers) {
				peer.selected = peer === this;
			}
			return;
		}

		if (this.selected) {
			this.selected = false;
			return;
		}

		const selectedCount = peers.filter((peer) => peer.selected).length;
		if (selectedCount >= cap) {
			return;
		}
		this.selected = true;
	}

	_syncState() {
		if (!this._button) {
			return;
		}
		this._button.className = this.getAttribute('variant') || 'primary';
		this._button.disabled = this.hasAttribute('disabled');
		this._button.setAttribute('aria-pressed', String(this.selected));
		this._button.classList.toggle('is-selected', this.selected);
	}
}

customElements.define('bf-button', BfButton);
