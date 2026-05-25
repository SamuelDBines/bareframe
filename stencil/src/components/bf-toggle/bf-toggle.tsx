import { Component, Element, Host, Prop, Watch, h } from '@stencil/core';

@Component({
	tag: 'bf-toggle',
	styleUrl: 'bf-toggle.css',
	shadow: true,
})
export class BfToggle {
	@Element() el!: HTMLElement;

	@Prop({ attribute: 'label', reflect: true }) attrLabel?: string;

	componentDidRender() {
		this.sync();
	}

	@Watch('attrLabel')
	handleLabel() {
		this.sync();
	}

	private observer?: MutationObserver;
	connectedCallback() {
		this.observer = new MutationObserver(() => this.sync());
		this.observer.observe(this.el, {
			attributes: true,
			attributeFilter: ['checked', 'disabled', 'label', 'switch', 'variant'],
		});
	}

	disconnectedCallback() {
		this.observer?.disconnect();
	}

	get checked(): boolean {
		return this.el.hasAttribute('checked');
	}
	set checked(next: boolean) {
		if (next) {
			this.el.setAttribute('checked', '');
		} else {
			this.el.removeAttribute('checked');
		}
	}

	private variant(): string {
		const variant = (this.el.getAttribute('variant') || '').toLowerCase();
		if (variant === 'switch' || this.el.hasAttribute('switch')) {
			return 'switch';
		}
		return 'toggle';
	}

	private onClick = () => {
		if (this.el.hasAttribute('disabled')) {
			return;
		}
		this.checked = !this.checked;
		this.el.dispatchEvent(
			new CustomEvent('bf-change', {
				bubbles: true,
				composed: true,
				detail: {
					checked: this.checked,
				},
			}),
		);
	};

	sync() {
		const root = this.el.shadowRoot?.querySelector('.root');
		const text = this.el.shadowRoot?.querySelector('.text');
		if (!(root instanceof HTMLButtonElement) || !(text instanceof HTMLElement)) {
			return;
		}
		const variant = this.variant();
		root.setAttribute('data-variant', variant);
		root.disabled = this.el.hasAttribute('disabled');
		root.classList.toggle('is-checked', this.checked);
		if (variant === 'switch') {
			root.setAttribute('role', 'switch');
			root.setAttribute('aria-checked', String(this.checked));
			root.removeAttribute('aria-pressed');
		} else {
			root.setAttribute('role', 'button');
			root.setAttribute('aria-pressed', String(this.checked));
			root.removeAttribute('aria-checked');
		}
		const labelAttr = this.el.getAttribute('label');
		if (labelAttr) {
			root.setAttribute('aria-label', labelAttr);
		} else {
			root.removeAttribute('aria-label');
		}
		text.hidden = variant === 'switch' && !(this.el.textContent || '').trim();
	}

	render() {
		return (
			<Host>
				<button class="root" part="root" type="button" onClick={this.onClick}>
					<span class="track" part="track">
						<span class="thumb" part="thumb"></span>
					</span>
					<span class="text" part="text">
						<slot />
					</span>
				</button>
			</Host>
		);
	}
}
