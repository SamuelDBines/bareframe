import { Component, Element, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-list',
	styleUrl: 'bf-list.css',
	shadow: true,
})
export class BfList {
	@Element() el!: HTMLElement;

	private onSlotChange = () => {
		const slot = this.el.shadowRoot?.querySelector('slot');
		if (!(slot instanceof HTMLSlotElement)) {
			return;
		}
		const items = slot
			.assignedElements({ flatten: true })
			.filter((element) => element.hasAttribute('item'));

		items.forEach((item, index) => {
			const elitem = item as HTMLElement;
			elitem.setAttribute('role', elitem.getAttribute('role') || 'listitem');
			if (!elitem.hasAttribute('tabindex')) {
				elitem.setAttribute('tabindex', '0');
			}
			if (elitem.dataset.bfListBound === 'true') {
				return;
			}
			elitem.dataset.bfListBound = 'true';
			elitem.addEventListener('click', () => this.emitSelect(elitem, index));
			elitem.addEventListener('keydown', (event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					this.emitSelect(elitem, index);
				}
			});
		});
	};

	private emitSelect(item: HTMLElement, index: number) {
		this.el.dispatchEvent(
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

	componentDidLoad() {
		this.onSlotChange();
	}

	render() {
		return (
			<Host>
				<div class="root" part="root">
					<slot onSlotchange={this.onSlotChange} />
				</div>
			</Host>
		);
	}
}
