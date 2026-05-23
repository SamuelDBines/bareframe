import { Component, Element, Host, Method, h } from '@stencil/core';

@Component({
	tag: 'bf-modal',
	styleUrl: 'bf-modal.css',
	shadow: true,
})
export class BfModal {
	@Element() el!: HTMLElement;

	private observer?: MutationObserver;

	connectedCallback() {
		this.observer = new MutationObserver(() => this.sync());
		this.observer.observe(this.el, { attributes: true, attributeFilter: ['open', 'label', 'persistent', 'id'] });
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
		this.el.setAttribute('aria-hidden', String(!isOpen));
		this.el.setAttribute('role', 'dialog');
		this.el.setAttribute('aria-modal', 'true');
		const lab = this.el.getAttribute('label');
		if (lab) {
			this.el.setAttribute('aria-label', lab);
		} else {
			this.el.removeAttribute('aria-label');
		}
	}

	sync() {
		this.syncRoot();
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
