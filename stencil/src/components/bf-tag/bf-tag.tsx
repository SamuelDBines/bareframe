import { Component, Element, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-tag',
	styleUrl: 'bf-tag.css',
	shadow: true,
})
export class BfTag {
	@Element() el!: HTMLElement;
	private observer?: MutationObserver;

	connectedCallback() {
		this.observer = new MutationObserver(() => this.applyRoot());
		this.observer.observe(this.el, { attributes: true });
		this.applyRoot();
	}

	disconnectedCallback() {
		this.observer?.disconnect();
	}

	private applyRoot() {
		const root = this.el.shadowRoot?.querySelector('.root');
		if (!(root instanceof HTMLElement)) {
			return;
		}

		const explicit = (this.el.getAttribute('variant') || '').toLowerCase();
		let variant = 'tag';
		if (['tag', 'badge', 'chip', 'pill'].includes(explicit)) {
			variant = explicit;
		} else if (this.el.hasAttribute('badge')) {
			variant = 'badge';
		} else if (this.el.hasAttribute('chip')) {
			variant = 'chip';
		} else if (this.el.hasAttribute('pill')) {
			variant = 'pill';
		}

		root.dataset.variant = variant;

		const size = (this.el.getAttribute('size') || 'md').toLowerCase();
		root.dataset.size = ['sm', 'md', 'lg'].includes(size) ? size : 'md';
	}

	componentDidRender() {
		this.applyRoot();
	}

	render() {
		return (
			<Host>
				<div class="root" part="root" data-variant="tag" data-size="md">
					<slot />
				</div>
			</Host>
		);
	}
}
