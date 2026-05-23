import { Component, Element, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-edge',
	styleUrl: 'bf-edge.css',
	shadow: true,
})
export class BfEdge {
	@Element() el!: HTMLElement;
	private observer?: MutationObserver;

	connectedCallback() {
		this.observer = new MutationObserver(() => this.syncPosition());
		this.observer.observe(this.el, {
			attributes: true,
			attributeFilter: ['position', 'sticky', 'fixed', 'header', 'footer'],
		});
		this.syncPosition();
	}

	disconnectedCallback() {
		this.observer?.disconnect();
	}

	private syncPosition() {
		if (
			!this.el.hasAttribute('header') &&
			!this.el.hasAttribute('footer') &&
			!this.el.getAttribute('position')
		) {
			this.el.setAttribute('header', '');
		}

		const position = this.el.getAttribute('position');
		if (position === 'bottom') {
			this.el.removeAttribute('header');
			this.el.setAttribute('footer', '');
		}
		if (position === 'top') {
			this.el.removeAttribute('footer');
			this.el.setAttribute('header', '');
		}
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
