import { Component, Element, Host, Prop, Watch, h } from '@stencil/core';

@Component({
	tag: 'bf-divider',
	styleUrl: 'bf-divider.css',
	shadow: true,
})
export class BfDivider {
	@Element() el!: HTMLElement;

	@Prop({ reflect: true }) vertical = false;
	@Prop({ reflect: true }) thickness?: string;

	@Watch('thickness')
	applyThickness() {
		const raw = this.thickness;
		if (!raw) {
			this.el.style.removeProperty('--bf-divider-thickness');
			return;
		}
		const parsed = Number.parseFloat(raw);
		if (Number.isFinite(parsed)) {
			this.el.style.setProperty('--bf-divider-thickness', `${parsed}px`);
			return;
		}
		this.el.style.setProperty('--bf-divider-thickness', raw);
	}

	componentWillLoad() {
		this.applyThickness();
	}

	render() {
		const orient = this.vertical ? 'vertical' : 'horizontal';
		return (
			<Host>
				<div class="root" part="root" data-orientation={orient}>
					<slot />
				</div>
			</Host>
		);
	}
}
