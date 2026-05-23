import { Component, Element, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-select',
	styleUrl: 'bf-select.css',
	shadow: true,
})
export class BfSelect {
	@Element() el!: HTMLElement;

	private ignoreNextExternalValueChange = false;
	private mutation?: MutationObserver;

	connectedCallback() {
		this.mutation = new MutationObserver((records) => {
			let touchesValue = false;
			for (const r of records) {
				if (r.type === 'attributes' && r.attributeName === 'value') {
					touchesValue = true;
				}
			}
			if (
				touchesValue &&
				this.ignoreNextExternalValueChange
			) {
				this.ignoreNextExternalValueChange = false;
				return;
			}
			void this.pull();
		});
		this.mutation.observe(this.el, {
			childList: true,
			subtree: true,
			characterData: true,
			attributes: true,
			attributeFilter: [
				'value',
				'multi',
				'disabled',
				'required',
				'placeholder',
				'label',
				'name',
				'selected',
				'disabled',
				'label',
			],
		});

		queueMicrotask(() => this.pull());
	}

	disconnectedCallback() {
		this.mutation?.disconnect();
	}

	get value(): string {
		const sel = this.nativeSelect();
		if (!sel) {
			return '';
		}
		if (this.isMulti()) {
			return this.values.join(',');
		}
		return sel.value;
	}

	set value(nextValue: unknown) {
		if (Array.isArray(nextValue)) {
			this.el.setAttribute('value', nextValue.join(','));
			return;
		}
		this.el.setAttribute('value', `${nextValue ?? ''}`);
	}

	get values(): string[] {
		const sel = this.nativeSelect();
		if (!sel) {
			return [];
		}
		return Array.from(sel.selectedOptions).map((o) => o.value);
	}

	private nativeSelect(): HTMLSelectElement | null {
		const s = this.el.shadowRoot?.querySelector('select');
		return s instanceof HTMLSelectElement ? s : null;
	}

	private isMulti(): boolean {
		return this.el.hasAttribute('multi');
	}

	private multiLimit(): number {
		if (!this.isMulti()) {
			return 1;
		}
		const raw = this.el.getAttribute('multi');
		if (raw === '' || raw === null) {
			return Infinity;
		}
		const parsed = Number.parseInt(raw, 10);
		return Number.isFinite(parsed) && parsed > 0 ? parsed : Infinity;
	}

	private parsedValue(): string[] {
		const raw = this.el.getAttribute('value');
		if (raw === null) {
			return [];
		}
		return this.isMulti()
			? raw
					.split(',')
					.map((part) => part.trim())
					.filter(Boolean)
			: [raw];
	}

	private cloneOption(option: HTMLElement) {
		const clone = document.createElement('option');
		clone.value = option.getAttribute('value') ?? option.textContent?.trim() ?? '';
		clone.textContent = option.textContent?.trim() ?? '';
		clone.disabled = option.hasAttribute('disabled');
		clone.defaultSelected = option.hasAttribute('selected');
		clone.selected = option.hasAttribute('selected');
		return clone;
	}

	private cloneOptionsFromLightDom(sel: HTMLSelectElement) {
		let count = 0;
		const frag = document.createDocumentFragment();

		for (const child of Array.from(this.el.children)) {
			const tag = child.tagName.toLowerCase();
			if (tag === 'option') {
				frag.append(this.cloneOption(child as HTMLElement));
				count += 1;
			} else if (tag === 'optgroup') {
				const grp = document.createElement('optgroup');
				const label = child.getAttribute('label');
				if (label) {
					grp.label = label;
				}
				for (const opt of Array.from(child.querySelectorAll('option'))) {
					grp.append(this.cloneOption(opt as HTMLElement));
					count += 1;
				}
				frag.append(grp);
			}
		}

		sel.replaceChildren();

		const placeholder = this.el.getAttribute('placeholder');
		if (placeholder && !this.isMulti()) {
			const ph = document.createElement('option');
			ph.value = '';
			ph.textContent = placeholder;
			sel.append(ph);
		}

		if (count > 0) {
			sel.append(frag);
		} else {
			const fb = this.el.textContent?.trim();
			if (fb) {
				const o = document.createElement('option');
				o.value = fb;
				o.textContent = fb;
				sel.append(o);
			}
		}
	}

	private enforceMulti(sel: HTMLSelectElement) {
		if (!this.isMulti()) {
			return;
		}
		const cap = this.multiLimit();
		if (cap === Infinity) {
			return;
		}
		const selArr = Array.from(sel.options).filter((o) => o.selected);
		if (selArr.length <= cap) {
			return;
		}
		for (let i = cap; i < selArr.length; i += 1) {
			selArr[i].selected = false;
		}
	}

	private reflectFromControl(sel: HTMLSelectElement) {
		const next = this.isMulti() ? this.values.join(',') : sel.value;
		if (this.el.getAttribute('value') === next) {
			return;
		}
		this.ignoreNextExternalValueChange = true;
		this.el.setAttribute('value', next);
	}

	private applyAttrValue(sel: HTMLSelectElement) {
		if (!this.el.hasAttribute('value')) {
			return;
		}
		const values = new Set(this.parsedValue());
		if (this.isMulti()) {
			for (const opt of Array.from(sel.options)) {
				opt.selected = values.has(opt.value);
			}
			return;
		}
		sel.value = this.parsedValue()[0] ?? '';
	}

	private handleChange(sel: HTMLSelectElement) {
		this.enforceMulti(sel);
		this.reflectFromControl(sel);
		this.el.dispatchEvent(
			new CustomEvent('bf-change', {
				bubbles: true,
				composed: true,
				detail: {
					value: this.isMulti() ? this.values : sel.value,
					values: this.values,
					multiple: this.isMulti(),
					multi: this.multiLimit(),
				},
			}),
		);
	}

	private bindOnce(sel: HTMLSelectElement) {
		if (sel.dataset.bound === 'true') {
			return;
		}
		sel.dataset.bound = 'true';
		sel.addEventListener('change', () => this.handleChange(sel));
	}

	private syncDom(sel: HTMLSelectElement, root: HTMLElement) {
		this.cloneOptionsFromLightDom(sel);
		sel.multiple = this.isMulti();
		root.classList.toggle('is-multi', this.isMulti());
		sel.disabled = this.el.hasAttribute('disabled');
		sel.required = this.el.hasAttribute('required');
		sel.name = this.el.getAttribute('name') || '';
		const label = this.el.getAttribute('label');
		if (label) {
			sel.setAttribute('aria-label', label);
		} else {
			sel.removeAttribute('aria-label');
		}
	}

	private pull() {
		const root = this.el.shadowRoot?.querySelector('.root');
		const sel = this.nativeSelect();
		if (!(root instanceof HTMLElement) || !sel) {
			return;
		}
		this.bindOnce(sel);
		this.syncDom(sel, root);
		this.applyAttrValue(sel);
		this.enforceMulti(sel);
		this.reflectFromControl(sel);
	}

	componentDidRender() {
		this.pull();
	}

	render() {
		return (
			<Host>
				<div class="root" part="root">
					<select part="select"></select>
					<span class="chevron" part="chevron" aria-hidden="true"></span>
				</div>
			</Host>
		);
	}
}
