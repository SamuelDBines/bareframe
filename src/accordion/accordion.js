class BfAccordion extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._details = [];
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

			item.setAttribute('slot', slotName);

			const details = document.createElement('details');
			details.className = 'accordion-item';
			details.setAttribute('part', 'item');
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
							title,
							open: details.open,
						},
					}),
				);
			});
		});

		this.shadowRoot.replaceChildren(link, container);
	}

	get multiple() {
		return this.hasAttribute('multiple');
	}
}

customElements.define('bf-accordion', BfAccordion);
