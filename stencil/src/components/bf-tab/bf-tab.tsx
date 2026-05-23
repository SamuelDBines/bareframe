import { Component, Element, Host, Prop, Watch, h } from '@stencil/core';

@Component({
	tag: 'bf-tab',
	styleUrl: 'bf-tab.css',
	shadow: true,
})
export class BfTab {
	@Element() el!: HTMLElement;

	@Prop({ attribute: 'label', reflect: true }) attrLabel?: string;

	componentDidRender() {
		this.syncState();
	}

	@Watch('attrLabel')
	handleLabel() {
		this.syncState();
	}

	private observer?: MutationObserver;
	connectedCallback() {
		this.observer = new MutationObserver(() => this.syncState());
		this.observer.observe(this.el, {
			attributes: true,
			attributeFilter: ['selected', 'disabled', 'group', 'label', 'value'],
		});
	}

	disconnectedCallback() {
		this.observer?.disconnect();
	}

	get selected(): boolean {
		return this.el.hasAttribute('selected');
	}
	set selected(value: boolean) {
		if (value) {
			this.el.setAttribute('selected', '');
		} else {
			this.el.removeAttribute('selected');
		}
	}

	get value(): string {
		return this.el.getAttribute('value') || this.el.textContent?.trim() || '';
	}

	private onClick = () => {
		const group = this.el.getAttribute('group');
		if (group) {
			const peers = document.querySelectorAll(`bf-tab[group="${CSS.escape(group)}"]`);
			for (const peer of Array.from(peers)) {
				peer.toggleAttribute('selected', peer === this.el);
			}
		} else {
			this.selected = true;
		}

		this.el.dispatchEvent(
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
	};

	syncState() {
		const button = this.el.shadowRoot?.querySelector('.root');
		if (!(button instanceof HTMLButtonElement)) {
			return;
		}
		const labelAttr = this.el.getAttribute('label');
		if (labelAttr) {
			button.setAttribute('aria-label', labelAttr);
		} else {
			button.removeAttribute('aria-label');
		}
		button.disabled = this.el.hasAttribute('disabled');
		button.setAttribute('aria-selected', String(this.selected));
		button.setAttribute('role', 'tab');
		button.classList.toggle('is-selected', this.selected);
	}

	render() {
		return (
			<Host>
				<button class="root" part="root" type="button" onClick={this.onClick}>
					<slot />
				</button>
			</Host>
		);
	}
}
