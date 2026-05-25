import { Component, Element, Host, Method, h } from '@stencil/core';

@Component({
	tag: 'bf-dialog',
	styleUrl: 'bf-dialog.css',
	shadow: true,
})
export class BfDialog {
	@Element() el!: HTMLElement;
	private observer?: MutationObserver;

	connectedCallback() {
		this.observer = new MutationObserver(() => this.syncRoot());
		this.observer.observe(this.el, {
			attributes: true,
			attributeFilter: [
				'id',
				'open',
				'variant',
				'position',
				'label',
				'persistent',
				'sheet',
				'bottom-sheet',
				'popover',
				'tooltip',
				'panel',
				'left',
				'right',
				'top',
				'bottom',
				'center',
			],
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

	private variant(): string {
		const explicit = (this.el.getAttribute('variant') || '').toLowerCase();
		if (
			['dialog', 'sheet', 'bottom-sheet', 'popover', 'tooltip', 'panel'].includes(
				explicit,
			)
		) {
			return explicit;
		}
		if (this.el.hasAttribute('sheet')) {
			return 'sheet';
		}
		if (this.el.hasAttribute('bottom-sheet')) {
			return 'bottom-sheet';
		}
		if (this.el.hasAttribute('popover')) {
			return 'popover';
		}
		if (this.el.hasAttribute('tooltip')) {
			return 'tooltip';
		}
		if (this.el.hasAttribute('panel')) {
			return 'panel';
		}
		return 'dialog';
	}

	private position(): string {
		const explicit = (this.el.getAttribute('position') || '')
			.toLowerCase()
			.replace(/\s+/g, '-');
		if (
			[
				'center',
				'left',
				'right',
				'top',
				'bottom',
				'top-left',
				'top-right',
				'bottom-left',
				'bottom-right',
			].includes(explicit)
		) {
			return explicit;
		}
		if (this.el.hasAttribute('left')) {
			return 'left';
		}
		if (this.el.hasAttribute('right')) {
			return 'right';
		}
		if (this.el.hasAttribute('top')) {
			return 'top';
		}
		if (this.el.hasAttribute('bottom')) {
			return 'bottom';
		}
		if (this.el.hasAttribute('center')) {
			return 'center';
		}
		return 'center';
	}

	get openState(): boolean {
		return this.el.hasAttribute('open');
	}

	private shouldOpenByDefault(): boolean {
		return !this.el.hasAttribute('id');
	}

	private onBackdropClick = () => {
		const variant = this.variant();
		if (variant === 'tooltip' || variant === 'popover') {
			return;
		}
		if (this.el.hasAttribute('persistent')) {
			return;
		}
		this.el.removeAttribute('open');
		this.el.dispatchEvent(
			new CustomEvent('bf-close', {
				bubbles: true,
				composed: true,
				detail: { id: this.el.id || '' },
			}),
		);
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
		const variant = this.variant();
		const position = this.position();

		root.setAttribute('data-open', isOpen ? 'true' : 'false');
		root.setAttribute('data-variant', variant);
		root.setAttribute('data-position', position);

		this.el.hidden = !isOpen;
		this.el.setAttribute('aria-hidden', String(!isOpen));
		this.el.setAttribute('role', variant === 'tooltip' ? 'tooltip' : 'dialog');
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
