import { Component, Element, Host, Watch, Prop, h } from '@stencil/core';

@Component({
	tag: 'bf-checkbox',
	styleUrl: 'bf-checkbox.css',
	shadow: true,
})
export class BfCheckbox {
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
			attributeFilter: ['checked', 'disabled', 'label', 'value', 'group', 'multiple'],
		});
	}

	disconnectedCallback() {
		this.observer?.disconnect();
	}

	syncState() {
		const input = this.el.shadowRoot?.querySelector('input');
		if (!(input instanceof HTMLInputElement)) {
			return;
		}
		input.checked = this.checked;
		input.disabled = this.disabled;
		input.value = this.value;
		const labelAttr = this.el.getAttribute('label');
		if (labelAttr) {
			input.setAttribute('aria-label', labelAttr);
		} else {
			input.removeAttribute('aria-label');
		}
	}

	get checked(): boolean {
		return this.el.hasAttribute('checked');
	}
	set checked(v: boolean) {
		if (v) {
			this.el.setAttribute('checked', '');
		} else {
			this.el.removeAttribute('checked');
		}
	}

	get value(): string {
		return this.el.getAttribute('value') || this.el.textContent?.trim() || '';
	}

	get disabled(): boolean {
		return this.el.hasAttribute('disabled');
	}

	private effectiveGroup(): string {
		return this.el.getAttribute('group') || '';
	}

	private groupLimit(): number {
		const multiple = this.el.getAttribute('multiple');
		if (multiple === null) {
			return Infinity;
		}
		if (multiple === '') {
			return Infinity;
		}
		const parsed = Number.parseInt(multiple, 10);
		return Number.isFinite(parsed) && parsed > 0 ? parsed : Infinity;
	}

	private canSelectMore(): boolean {
		const group = this.effectiveGroup();
		if (!group) {
			return true;
		}
		const cap = this.groupLimit();
		if (cap === Infinity) {
			return true;
		}
		const selected = Array.from(
			document.querySelectorAll(
				`bf-checkbox[group="${CSS.escape(group)}"][checked]`,
			),
		);
		return selected.length < cap || selected.includes(this.el as unknown as Element);
	}

	private onInputChange = (event: Event) => {
		const input = event.target as HTMLInputElement;
		const nextChecked = input.checked;
		if (nextChecked && !this.canSelectMore()) {
			input.checked = false;
			return;
		}
		this.checked = nextChecked;

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
					<input type="checkbox" part="input" onChange={this.onInputChange} />
					<span class="box" part="box"></span>
					<span class="text" part="text">
						<slot />
					</span>
				</label>
			</Host>
		);
	}
}
