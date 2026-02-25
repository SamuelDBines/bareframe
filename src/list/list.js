class BfList extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._onSlotChange = this._onSlotChange.bind(this);
	}

	connectedCallback() {
		if (this._initialized) {
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./list.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('div');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = '<slot></slot>';

		if (!this.innerHTML.trim()) {
			root.textContent = 'list';
		}

		this.shadowRoot.replaceChildren(link, root);
		this._slot = root.querySelector('slot');
		this._slot.addEventListener('slotchange', this._onSlotChange);
		this._onSlotChange();
	}

	_onSlotChange() {
		if (!this._slot) {
			return;
		}
		const items = this._slot
			.assignedElements({ flatten: true })
			.filter((element) => element.hasAttribute('item'));

		for (const [index, item] of items.entries()) {
			item.setAttribute('role', item.getAttribute('role') || 'listitem');
			if (!item.hasAttribute('tabindex')) {
				item.setAttribute('tabindex', '0');
			}
			if (item.dataset.bfListBound === 'true') {
				continue;
			}
			item.dataset.bfListBound = 'true';
			item.addEventListener('click', () => this._emitSelect(item, index));
			item.addEventListener('keydown', (event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					this._emitSelect(item, index);
				}
			});
		}
	}

	_emitSelect(item, index) {
		this.dispatchEvent(
			new CustomEvent('bf-select', {
				bubbles: true,
				composed: true,
				detail: {
					index,
					id: item.id || '',
					value: item.getAttribute('value') || item.textContent?.trim() || '',
				},
			}),
		);
	}
}

customElements.define('bf-list', BfList);
