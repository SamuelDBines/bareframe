import { Component, Element, Host, Method, h } from '@stencil/core';

@Component({
	tag: 'bf-accordion',
	styleUrl: 'bf-accordion.css',
	shadow: true,
})
export class BfAccordion {
	@Element() el!: HTMLElement;
	private accordion?: HTMLElement;
	private detailsArr: HTMLDetailsElement[] = [];
	private itemIds: string[] = [];
	private built = false;
	private mo?: MutationObserver;

	connectedCallback() {
		this.mo = new MutationObserver(() => {
			const v = this.el.getAttribute('active-id');
			if (v) {
				void this.openItem(v);
			}
		});
		this.mo.observe(this.el, {
			attributes: true,
			attributeFilter: ['active-id'],
		});
	}

	disconnectedCallback() {
		this.mo?.disconnect();
	}

	private multiple(): boolean {
		return this.el.hasAttribute('multiple');
	}

	@Method()
	async openItem(itemId: string): Promise<void> {
		const details = this.detailsArr.find((d) => d.dataset.itemId === itemId);
		if (details) {
			details.open = true;
		}
	}

	@Method()
	async closeItem(itemId: string): Promise<void> {
		const details = this.detailsArr.find((d) => d.dataset.itemId === itemId);
		if (details) {
			details.open = false;
		}
	}

	@Method()
	async toggleItem(itemId: string): Promise<void> {
		const details = this.detailsArr.find((d) => d.dataset.itemId === itemId);
		if (details) {
			details.open = !details.open;
		}
	}

	private emitToggle(
		index: number,
		itemId: string,
		title: string,
		open: boolean,
	) {
		this.el.dispatchEvent(
			new CustomEvent('bf-accordion-toggle', {
				bubbles: true,
				composed: true,
				detail: { index, id: itemId, title, open },
			}),
		);
	}

	private ensureItemId(item: Element, index: number): string {
		const explicit = item.getAttribute('id');
		if (explicit && !this.itemIds.includes(explicit)) {
			return explicit;
		}

		const hostId = this.el.id || this.el.getAttribute('id') || 'bf-accordion';
		let counter = index + 1;
		let candidate = `${hostId}-item-${counter}`;
		while (
			this.itemIds.includes(candidate) ||
			(this.el.querySelector(`#${CSS.escape(candidate)}`) &&
				this.el.querySelector(`#${CSS.escape(candidate)}`) !== item)
		) {
			counter += 1;
			candidate = `${hostId}-item-${counter}`;
		}

		item.setAttribute('id', candidate);
		return candidate;
	}

	private rebuild() {
		const sr = this.el.shadowRoot;
		if (!sr) {
			return;
		}
		this.built = true;
		this.detailsArr = [];
		this.itemIds = [];

		this.accordion?.replaceChildren?.();
		const container = sr.querySelector('.accordion');
		if (!(container instanceof HTMLElement)) {
			return;
		}
		this.accordion = container;
		container.innerHTML = '';
		container.setAttribute('part', 'accordion');

		const items = Array.from(this.el.children).filter(
			(n) => n.nodeType === Node.ELEMENT_NODE,
		) as HTMLElement[];

		items.forEach((item, index) => {
			const title =
				item.getAttribute('title') ||
				item.getAttribute('data-title') ||
				`Section ${index + 1}`;
			const slotName = `item-${index + 1}`;
			const openByDefault = item.hasAttribute('open');
			const itemId = this.ensureItemId(item, index);

			item.setAttribute('slot', slotName);

			const details = document.createElement('details');
			details.className = 'accordion-item';
			details.setAttribute('part', 'item');
			details.dataset.itemId = itemId;
			details.open = openByDefault;

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
			this.detailsArr.push(details);
			this.itemIds.push(itemId);

			details.addEventListener('toggle', () => {
				if (!this.multiple() && details.open) {
					this.detailsArr.forEach((other) => {
						if (other !== details) {
							other.open = false;
						}
					});
				}
				this.emitToggle(index, itemId, title, details.open);
			});
		});

		const aid = this.el.getAttribute('active-id');
		if (aid) {
			void this.openItem(aid);
		}
	}

	componentDidRender() {
		if (!this.built) {
			this.rebuild();
		}
	}

	render() {
		return (
			<Host>
				<div class="accordion" part="accordion"></div>
			</Host>
		);
	}
}
