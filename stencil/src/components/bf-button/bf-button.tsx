import { Component, Element, Event, EventEmitter, Host, Prop, h } from '@stencil/core';

@Component({
	tag: 'bf-button',
	styleUrl: 'bf-button.css',
	shadow: true,
})
export class BfButton {
	@Element() el!: HTMLElement;

	@Prop({ reflect: true }) label = '';
	@Prop({ reflect: true }) variant = 'primary';
	@Prop({ reflect: true, mutable: true }) selected = false;
	@Prop({ reflect: true }) disabled = false;
	@Prop({ reflect: true }) group?: string;
	@Prop({ reflect: true }) multiple?: string;

	@Event({ eventName: 'bf-click', bubbles: true, composed: true }) bfClick!: EventEmitter<{
		label: string;
		variant: string;
		selected: boolean;
		group: string;
		at: string;
	}>;

	private handleClick = () => {
		if (this.disabled) return;
		this.applyGroupSelection();
		const label = this.label || '';
		const variant = this.variant || 'primary';
		const group = this.group || '';
		this.selected = this.el.hasAttribute('selected');
		this.bfClick.emit({
			label,
			variant,
			selected: this.selected,
			group,
			at: new Date().toISOString(),
		});
	};

	private groupLimit(): number {
		const multiple = this.multiple ?? null;
		if (multiple === null || multiple === undefined) {
			return 1;
		}
		if (`${multiple}` === '') {
			return Infinity;
		}
		const parsed = Number.parseInt(String(multiple), 10);
		return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
	}

	private applyGroupSelection(): void {
		const group = this.group?.trim();
		if (!group) {
			return;
		}
		const peers = Array.from(
			document.querySelectorAll(`bf-button[group="${CSS.escape(group)}"]`),
		) as HTMLElement[];
		const cap = this.groupLimit();

		if (cap === 1) {
			for (const peer of peers) {
				peer.toggleAttribute('selected', peer === this.el);
			}
			this.selected = this.el.hasAttribute('selected');
			return;
		}

		if (this.el.hasAttribute('selected')) {
			this.el.removeAttribute('selected');
			this.selected = false;
			return;
		}

		const selectedCount = peers.filter((peer) => peer.hasAttribute('selected')).length;
		if (selectedCount >= cap) {
			return;
		}
		this.el.setAttribute('selected', '');
		this.selected = true;
	}

	render() {
		const variant = this.variant || 'primary';

		return (
			<Host>
				<button
					part="button"
					type="button"
					class={{
						[variant]: true,
						'is-selected': this.selected,
					}}
					disabled={this.disabled}
					aria-pressed={String(this.selected)}
					onClick={this.handleClick}>
					{this.label}
					<slot />
				</button>
			</Host>
		);
	}
}
