import { Component, Element, Host, Prop, Watch, h } from '@stencil/core';

@Component({
	tag: 'bf-link',
	styleUrl: 'bf-link.css',
	shadow: true,
})
export class BfLink {
	@Element() el!: HTMLElement;

	@Prop({ reflect: true }) variant = 'inline';
	@Prop({ reflect: true }) vertical = false;

	@Watch('variant')
	@Watch('vertical')
	applyRoot() {
		const root = this.el.shadowRoot?.querySelector('.root');
		if (!(root instanceof HTMLElement)) {
			return;
		}
		const v = (this.variant || 'inline').toLowerCase();
		root.setAttribute(
			'data-variant',
			['inline', 'pill', 'nav'].includes(v) ? v : 'inline',
		);
		root.toggleAttribute('data-vertical', this.vertical);
	}

	componentDidRender() {
		this.applyRoot();
	}

	render() {
		return (
			<Host>
				<div class="root" part="root">
					<slot />
				</div>
			</Host>
		);
	}
}
