import { Component, Element, Host, Method, h } from '@stencil/core';

@Component({
	tag: 'bf-toast',
	styleUrl: 'bf-toast.css',
	shadow: true,
})
export class BfToast {
	@Element() el!: HTMLElement;
	private observer?: MutationObserver;
	private durationTimer?: ReturnType<typeof setTimeout>;

	connectedCallback() {
		this.observer = new MutationObserver(() => this.sync());
		this.observer.observe(this.el, {
			attributes: true,
			attributeFilter: [
				'open',
				'variant',
				'type',
				'duration',
				'alert',
				'notification',
				'snackbar',
				'banner',
				'success',
				'warning',
				'error',
				'info',
				'position',
				'top',
				'bottom',
				'left',
				'right',
				'center',
			],
		});
	}

	disconnectedCallback() {
		this.observer?.disconnect();
		this.clearDurationTimer();
	}

	@Method()
	async show(): Promise<void> {
		this.el.setAttribute('open', '');
	}

	@Method()
	async hide(): Promise<void> {
		this.el.removeAttribute('open');
	}

	get open(): boolean {
		return this.el.hasAttribute('open');
	}
	set open(next: boolean) {
		if (next) {
			this.el.setAttribute('open', '');
		} else {
			this.el.removeAttribute('open');
		}
	}

	private onCloseClick = () => {
		this.hide();
		this.el.dispatchEvent(
			new CustomEvent('bf-close', {
				bubbles: true,
				composed: true,
				detail: { id: this.el.id || '' },
			}),
		);
	};

	private variant(): string {
		const explicit = (this.el.getAttribute('variant') || '').toLowerCase();
		if (['toast', 'alert', 'notification', 'snackbar', 'banner'].includes(explicit)) {
			return explicit;
		}
		if (this.el.hasAttribute('alert')) {
			return 'alert';
		}
		if (this.el.hasAttribute('notification')) {
			return 'notification';
		}
		if (this.el.hasAttribute('snackbar')) {
			return 'snackbar';
		}
		if (this.el.hasAttribute('banner')) {
			return 'banner';
		}
		return 'toast';
	}

	private type(): string {
		const explicit = (this.el.getAttribute('type') || '').toLowerCase();
		if (['success', 'warning', 'error', 'info'].includes(explicit)) {
			return explicit;
		}
		if (this.el.hasAttribute('success')) {
			return 'success';
		}
		if (this.el.hasAttribute('warning')) {
			return 'warning';
		}
		if (this.el.hasAttribute('error')) {
			return 'error';
		}
		return 'info';
	}

	private isValidPosition(position: string): boolean {
		return [
			'top-left',
			'top-center',
			'top-right',
			'bottom-left',
			'bottom-center',
			'bottom-right',
		].includes(position);
	}

	private position(): string {
		const variant = this.variant();
		const explicit = (this.el.getAttribute('position') || '')
			.toLowerCase()
			.replace(/\s+/g, '-');
		if (explicit && this.isValidPosition(explicit)) {
			return explicit;
		}
		if (
			variant === 'snackbar' &&
			!this.el.hasAttribute('top') &&
			!this.el.hasAttribute('bottom') &&
			!this.el.hasAttribute('left') &&
			!this.el.hasAttribute('right') &&
			!this.el.hasAttribute('center') &&
			!this.el.hasAttribute('position')
		) {
			return 'bottom-center';
		}
		if (
			variant === 'banner' &&
			!this.el.hasAttribute('top') &&
			!this.el.hasAttribute('bottom') &&
			!this.el.hasAttribute('left') &&
			!this.el.hasAttribute('right') &&
			!this.el.hasAttribute('center') &&
			!this.el.hasAttribute('position')
		) {
			return 'top-center';
		}
		const y = this.el.hasAttribute('bottom') ? 'bottom' : 'top';
		let x = 'right';
		if (this.el.hasAttribute('left')) {
			x = 'left';
		}
		if (this.el.hasAttribute('center')) {
			x = 'center';
		}
		if (this.el.hasAttribute('right')) {
			x = 'right';
		}
		return `${y}-${x}`;
	}

	private duration(): number {
		const parsed = Number.parseInt(this.el.getAttribute('duration') || '', 10);
		return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
	}

	private iconSymbol(): string {
		switch (this.type()) {
			case 'success':
				return '✓';
			case 'warning':
				return '!';
			case 'error':
				return 'x';
			default:
				return 'i';
		}
	}

	private clearDurationTimer() {
		if (!this.durationTimer) {
			return;
		}
		clearTimeout(this.durationTimer);
		this.durationTimer = undefined;
	}

	private scheduleAutoHide() {
		this.clearDurationTimer();
		const ms = this.duration();
		if (!this.open || ms <= 0) {
			return;
		}
		this.durationTimer = setTimeout(() => {
			this.hide();
		}, ms);
	}

	private applyPosition(position: string) {
		const anchored =
			this.el.hasAttribute('position') ||
			this.el.hasAttribute('top') ||
			this.el.hasAttribute('bottom') ||
			this.el.hasAttribute('left') ||
			this.el.hasAttribute('right') ||
			this.el.hasAttribute('center');
		if (!anchored) {
			this.el.style.position = '';
			this.el.style.top = '';
			this.el.style.bottom = '';
			this.el.style.left = '';
			this.el.style.right = '';
			this.el.style.transform = '';
			this.el.style.zIndex = '';
			return;
		}

		this.el.style.position = 'fixed';
		this.el.style.zIndex = '1000';
		this.el.style.top = '';
		this.el.style.bottom = '';
		this.el.style.left = '';
		this.el.style.right = '';
		this.el.style.transform = '';

		const [y, x] = position.split('-');
		if (y === 'bottom') {
			this.el.style.bottom = '1rem';
		} else {
			this.el.style.top = '1rem';
		}
		if (x === 'left') {
			this.el.style.left = '1rem';
		} else if (x === 'right') {
			this.el.style.right = '1rem';
		} else {
			this.el.style.left = '50%';
			this.el.style.transform = 'translateX(-50%)';
		}
	}

	private sync() {
		const root = this.el.shadowRoot?.querySelector('.root');
		const icon = this.el.shadowRoot?.querySelector('.icon');
		if (!(root instanceof HTMLElement) || !(icon instanceof HTMLElement)) {
			return;
		}

		const variant = this.variant();
		const type = this.type();
		const position = this.position();
		if (!this.el.hasAttribute('open')) {
			this.el.setAttribute('open', '');
		}

		root.setAttribute('data-variant', variant);
		root.setAttribute('data-type', type);
		root.setAttribute('data-position', position);
		root.setAttribute('data-open', this.open ? 'true' : 'false');
		icon.textContent = this.iconSymbol();
		this.applyPosition(position);

		this.el.setAttribute('role', variant === 'alert' ? 'alert' : 'status');
		this.el.setAttribute('aria-live', variant === 'alert' ? 'assertive' : 'polite');

		this.scheduleAutoHide();
	}

	componentDidRender() {
		this.sync();
	}

	render() {
		return (
			<Host>
				<div class="root" part="root">
					<span class="icon" part="icon" aria-hidden="true"></span>
					<div class="content" part="content">
						<slot />
					</div>
					<button
						class="close"
						part="close"
						type="button"
						aria-label="Close"
						onClick={this.onCloseClick}>
						&times;
					</button>
				</div>
			</Host>
		);
	}
}
