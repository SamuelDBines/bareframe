class BfAccordion extends HTMLElement {
	static observedAttributes = ['active-id'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._details = [];
		this._itemIds = [];
	}

	connectedCallback() {
		if (this._initialized) {
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./accordion.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const container = document.createElement('div');
		container.className = 'accordion';
		container.setAttribute('part', 'accordion');

		const items = [...this.children].filter(
			(node) => node.nodeType === Node.ELEMENT_NODE,
		);

		items.forEach((item, index) => {
			const title =
				item.getAttribute('title') ||
				item.getAttribute('data-title') ||
				`Section ${index + 1}`;
			const slotName = `item-${index + 1}`;
			const openByDefault = item.hasAttribute('open');
			const itemId = this._ensureItemId(item, index);

			item.setAttribute('slot', slotName);

			const details = document.createElement('details');
			details.className = 'accordion-item';
			details.setAttribute('part', 'item');
			details.dataset.itemId = itemId;
			if (openByDefault) {
				details.open = true;
			}

			const summary = document.createElement('summary');
			summary.className = 'accordion-trigger';
			summary.setAttribute('part', 'trigger');
			summary.textContent = title;

			const panel = document.createElement('div');
			panel.className = 'accordion-panel';
			panel.setAttribute('part', 'panel');

			const slot = document.createElement('slot');
			slot.name = slotName;
			panel.append(slot);

			details.append(summary, panel);
			container.append(details);
			this._details.push(details);
			this._itemIds.push(itemId);

			details.addEventListener('toggle', () => {
				if (!this.multiple && details.open) {
					this._details.forEach((other) => {
						if (other !== details) {
							other.open = false;
						}
					});
				}

				this.dispatchEvent(
					new CustomEvent('bf-accordion-toggle', {
						bubbles: true,
						composed: true,
						detail: {
							index,
							id: itemId,
							title,
							open: details.open,
						},
					}),
				);
			});
		});

		this.shadowRoot.replaceChildren(link, container);
		const activeId = this.getAttribute('active-id');
		if (activeId) {
			this.openItem(activeId);
		}
	}

	get multiple() {
		return this.hasAttribute('multiple');
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (!this._initialized) {
			return;
		}
		if (name === 'active-id' && oldValue !== newValue && newValue) {
			this.openItem(newValue);
		}
	}

	openItem(itemId) {
		const details = this._details.find((entry) => entry.dataset.itemId === itemId);
		if (!details) {
			return;
		}
		details.open = true;
	}

	closeItem(itemId) {
		const details = this._details.find((entry) => entry.dataset.itemId === itemId);
		if (!details) {
			return;
		}
		details.open = false;
	}

	toggleItem(itemId) {
		const details = this._details.find((entry) => entry.dataset.itemId === itemId);
		if (!details) {
			return;
		}
		details.open = !details.open;
	}

	_ensureItemId(item, index) {
		const explicit = item.getAttribute('id');
		if (explicit && !this._itemIds.includes(explicit)) {
			return explicit;
		}

		const hostId = this.getAttribute('id') || 'bf-accordion';
		let counter = index + 1;
		let candidate = `${hostId}-item-${counter}`;
		while (
			this._itemIds.includes(candidate) ||
			(this.querySelector(`#${CSS.escape(candidate)}`) &&
				this.querySelector(`#${CSS.escape(candidate)}`) !== item)
		) {
			counter += 1;
			candidate = `${hostId}-item-${counter}`;
		}

		item.setAttribute('id', candidate);
		return candidate;
	}
}

customElements.define('bf-accordion', BfAccordion);
