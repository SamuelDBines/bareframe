import { Component, Element, Host, Method, h } from '@stencil/core';

@Component({
	tag: 'bf-drawer',
	styleUrl: 'bf-drawer.css',
	shadow: true,
})
export class BfDrawer {
	@Element() el!: HTMLElement;
	private observer?: MutationObserver;

	connectedCallback() {
		this.observer = new MutationObserver(() => this.syncRoot());
		this.observer.observe(this.el, {
			attributes: true,
			attributeFilter: ['open', 'label', 'persistent', 'id', 'side', 'left', 'right', 'top', 'bottom'],
		});
	}

	disconnectedCallback() {
		this.observer?.disconnect();
	}

	@Method()
	async open(): Promise<void> {
		this.el.setAttribute('open', '');
	}

	@Method()
	async close(): Promise<void> {
		this.el.removeAttribute('open');
	}

	@Method()
	async toggle(): Promise<void> {
		if (this.el.hasAttribute('open')) {
			await this.close();
			return;
		}
		await this.open();
	}

	private side(): string {
		const explicit = (this.el.getAttribute('side') || '').toLowerCase();
		if (['left', 'right', 'top', 'bottom'].includes(explicit)) {
			return explicit;
		}
		if (this.el.hasAttribute('left')) {
			return 'left';
		}
		if (this.el.hasAttribute('top')) {
			return 'top';
		}
		if (this.el.hasAttribute('bottom')) {
			return 'bottom';
		}
		return 'right';
	}

	private shouldOpenByDefault(): boolean {
		return !this.el.hasAttribute('id');
	}

	private onBackdropClick = () => {
		if (this.el.hasAttribute('persistent')) {
			return;
		}
		this.el.removeAttribute('open');
	};

	private syncRoot() {
		const root = this.el.shadowRoot?.querySelector('.root');
		if (!(root instanceof HTMLElement)) {
			return;
		}
		if (!this.el.hasAttribute('open') && this.shouldOpenByDefault()) {
			this.el.setAttribute('open', '');
			return;
		}

		const isOpen = this.el.hasAttribute('open');
		this.el.hidden = !isOpen;
		root.setAttribute('data-open', isOpen ? 'true' : 'false');
		root.setAttribute('data-side', this.side());
		this.el.setAttribute('aria-hidden', String(!isOpen));
		this.el.setAttribute('role', 'dialog');
		const lab = this.el.getAttribute('label');
		if (lab) {
			this.el.setAttribute('aria-label', lab);
		} else {
			this.el.removeAttribute('aria-label');
		}
	}

	componentDidRender() {
		this.syncRoot();
	}

	render() {
		return (
			<Host>
				<div class="root" part="root">
					<div class="backdrop" part="backdrop" onClick={this.onBackdropClick} />
					<div class="panel" part="panel">
						<slot />
					</div>
				</div>
			</Host>
		);
	}
}
