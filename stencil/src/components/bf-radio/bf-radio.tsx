import { Component, Element, Host, Watch, Prop, h } from '@stencil/core';

@Component({
	tag: 'bf-radio',
	styleUrl: 'bf-radio.css',
	shadow: true,
})
export class BfRadio {
	@Element() el!: HTMLElement;

	@Prop({ attribute: 'label', reflect: true }) attrLabel?: string;

	componentDidRender() {
		this.syncState();
	}

	@Watch('attrLabel')
	handleLabel() {
		this.syncState();
	}

	private observer?: MutationObserver;
	connectedCallback() {
		this.observer = new MutationObserver(() => this.syncState());
		this.observer.observe(this.el, {
			attributes: true,
			attributeFilter: ['checked', 'disabled', 'label', 'value', 'group'],
		});
	}

	disconnectedCallback() {
		this.observer?.disconnect();
	}

	get checked(): boolean {
		return this.el.hasAttribute('checked');
	}
	set checked(value: boolean) {
		if (value) {
			this.el.setAttribute('checked', '');
		} else {
			this.el.removeAttribute('checked');
		}
	}

	get value(): string {
		return this.el.getAttribute('value') || this.el.textContent?.trim() || '';
	}

	syncState() {
		const input = this.el.shadowRoot?.querySelector('input');
		if (!(input instanceof HTMLInputElement)) {
			return;
		}
		const group = this.el.getAttribute('group') || '';
		input.name = group;
		input.value = this.value;
		input.checked = this.checked;
		input.disabled = this.el.hasAttribute('disabled');

		const hasLabelText = (this.el.textContent || '').trim().length > 0;
		const labelAttr = this.el.getAttribute('label');
		if (!hasLabelText && !labelAttr) {
			this.el.setAttribute('label', 'radio');
		}
		const finalLabel = this.el.getAttribute('label');
		if (finalLabel) {
			input.setAttribute('aria-label', finalLabel);
		} else {
			input.removeAttribute('aria-label');
		}
	}

	private effectiveGroup(): string {
		return this.el.getAttribute('group') || '';
	}

	private uncheckPeers() {
		const group = this.effectiveGroup();
		if (!group) {
			return;
		}
		const peers = document.querySelectorAll(`bf-radio[group="${CSS.escape(group)}"]`);
		for (const peer of Array.from(peers)) {
			if (peer !== this.el) {
				peer.removeAttribute('checked');
			}
		}
	}

	private onInputChange = () => {
		const input = this.el.shadowRoot?.querySelector('input');
		if (!(input instanceof HTMLInputElement)) {
			return;
		}
		if (input.checked) {
			this.checked = true;
			this.uncheckPeers();
		}

		this.el.dispatchEvent(
			new CustomEvent('bf-change', {
				bubbles: true,
				composed: true,
				detail: {
					group: this.effectiveGroup(),
					value: this.value,
					checked: this.checked,
				},
			}),
		);
	};

	render() {
		return (
			<Host>
				<label class="root" part="root">
					<input type="radio" part="input" onChange={this.onInputChange} />
					<span class="dot" part="dot"></span>
					<span class="text" part="text">
						<slot />
					</span>
				</label>
			</Host>
		);
	}
}
