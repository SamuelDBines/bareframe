import { Component, Element, Host, h } from '@stencil/core';

type RGBA = { r: number; g: number; b: number; a: number };

@Component({
	tag: 'bf-input',
	styleUrl: 'bf-input.css',
	shadow: true,
})
export class BfInput {
	@Element() el!: HTMLElement;

	private skipHostValueObserve = false;

	private color: RGBA = { r: 0, g: 0, b: 0, a: 1 };

	private colorFormat = 'hex';

	private mutation?: MutationObserver;

	connectedCallback() {
		this.mutation = new MutationObserver((records) => {
			let sawHostValue = false;
			for (const r of records) {
				if (r.attributeName === 'value') {
					sawHostValue = true;
				}
			}
			if (sawHostValue && this.skipHostValueObserve) {
				this.skipHostValueObserve = false;
				return;
			}
			this.syncHost();
		});
		this.mutation.observe(this.el, {
			attributes: true,
			attributeFilter: [
				'type',
				'value',
				'placeholder',
				'disabled',
				'required',
				'readonly',
				'name',
				'label',
				'min',
				'max',
				'step',
				'swatch',
				'swatch-hidden',
				'left',
				'right',
				'format',
				'hex',
				'rgba',
			],
		});

		queueMicrotask(() => {
			if (!this.el.hasAttribute('value')) {
				const fb = this.el.textContent?.trim();
				if (fb) {
					this.el.setAttribute('value', fb);
				}
			}
			this.syncHost();
		});
	}

	disconnectedCallback() {
		this.mutation?.disconnect();
	}

	get value(): string {
		const f = this.el.shadowRoot?.querySelector('.field');
		return f instanceof HTMLInputElement ? f.value : '';
	}

	set value(nextValue: unknown) {
		this.el.setAttribute('value', `${nextValue ?? ''}`);
	}

	componentDidRender() {
		const sr = this.el.shadowRoot;
		if (!sr) {
			return;
		}
		this.attachListeners(sr);
		this.syncHost();
	}

	private attachListeners(sr: ShadowRoot): void {
		const field = sr.querySelector('.field');
		const fmtEl = sr.querySelector('.format');
		const picker = sr.querySelector('.picker');
		const swatch = sr.querySelector('.swatch');
		if (
			field instanceof HTMLInputElement &&
			field.dataset.bfBound !== 'true'
		) {
			field.dataset.bfBound = 'true';
			field.addEventListener('input', () => this.onFieldInput(sr));
			field.addEventListener('change', () => this.onFieldChange(sr));
		}
		if (fmtEl instanceof HTMLSelectElement && fmtEl.dataset.bfBound !== 'true') {
			fmtEl.dataset.bfBound = 'true';
			fmtEl.addEventListener('change', () => this.onFmtChange(sr));
		}
		if (picker instanceof HTMLInputElement && picker.dataset.bfBound !== 'true') {
			picker.dataset.bfBound = 'true';
			picker.addEventListener('input', () => this.onPickerInput(sr));
		}
		if (swatch instanceof HTMLButtonElement && swatch.dataset.bfBound !== 'true') {
			swatch.dataset.bfBound = 'true';
			swatch.addEventListener('click', () => this.onSwatch(sr));
		}
	}

	private field(sr: ShadowRoot): HTMLInputElement | undefined {
		const x = sr.querySelector('.field');
		return x instanceof HTMLInputElement ? x : undefined;
	}

	private reflectValueAttr(field: HTMLInputElement): void {
		const next = field.value;
		if (this.el.getAttribute('value') === next) {
			return;
		}
		this.skipHostValueObserve = true;
		this.el.setAttribute('value', next);
	}

	private dispatchInput(sr: ShadowRoot): void {
		const f = this.field(sr);
		this.el.dispatchEvent(
			new CustomEvent('bf-input', {
				bubbles: true,
				composed: true,
				detail: { value: f!.value },
			}),
		);
	}

	private dispatchChange(sr: ShadowRoot): void {
		const f = this.field(sr);
		this.el.dispatchEvent(
			new CustomEvent('bf-change', {
				bubbles: true,
				composed: true,
				detail: { value: f!.value },
			}),
		);
	}

	private onFieldInput(sr: ShadowRoot): void {
		const f = this.field(sr);
		if (!f) {
			return;
		}
		if (this.typeIsColor()) {
			this.consumeColor(String(f.value));
		}
		this.reflectValueAttr(f);
		this.dispatchInput(sr);
	}

	private onFieldChange(sr: ShadowRoot): void {
		const f = this.field(sr);
		const root = sr.querySelector('.root');
		if (!f || !(root instanceof HTMLElement)) {
			return;
		}
		if (this.typeIsColor()) {
			if (!this.consumeColor(String(f.value))) {
				f.value = this.serialize(this.colorFormat, this.color);
			}
			this.paintColorChrome(sr, root, f);
		}
		this.reflectValueAttr(f);
		this.dispatchChange(sr);
	}

	private onFmtChange(sr: ShadowRoot): void {
		const fmt = sr.querySelector('.format');
		const field = this.field(sr);
		if (!(fmt instanceof HTMLSelectElement) || !field) {
			return;
		}
		if (!this.typeIsColor()) {
			return;
		}
		this.colorFormat = fmt.value;
		field.value = this.serialize(this.colorFormat, this.color);
		this.reflectValueAttr(field);
	}

	private onPickerInput(sr: ShadowRoot): void {
		const picker = sr.querySelector('.picker');
		const field = this.field(sr);
		const root = sr.querySelector('.root');
		if (!(picker instanceof HTMLInputElement) || !field || !(root instanceof HTMLElement)) {
			return;
		}
		if (!this.typeIsColor()) {
			return;
		}
		const px = this.parseHex(picker.value);
		if (!px) {
			return;
		}
		this.color = { ...px, a: this.color.a };
		field.value = this.serialize(this.colorFormat, this.color);
		this.paintColorChrome(sr, root, field);
		this.reflectValueAttr(field);
		this.dispatchInput(sr);
	}

	private onSwatch(sr: ShadowRoot): void {
		const picker = sr.querySelector('.picker');
		if (!this.typeIsColor() || this.el.hasAttribute('disabled')) {
			return;
		}
		if (picker instanceof HTMLInputElement) {
			picker.click();
		}
	}

	private typeIsColor(): boolean {
		return (this.el.getAttribute('type') || 'text').toLowerCase() === 'color';
	}

	private allowedFormats(): string[] {
		const hasHex = this.el.hasAttribute('hex');
		const hasRgba = this.el.hasAttribute('rgba');
		if (hasHex && hasRgba) {
			return ['hex', 'rgba'];
		}
		if (hasHex) {
			return ['hex'];
		}
		if (hasRgba) {
			return ['rgba'];
		}
		const explicit = (this.el.getAttribute('format') || '').toLowerCase();
		if (explicit === 'hex') {
			return ['hex'];
		}
		if (explicit === 'rgba') {
			return ['rgba'];
		}
		return ['hex', 'rgba'];
	}

	private resolveFormat(allowed: string[]): string {
		const explicit = (this.el.getAttribute('format') || '').toLowerCase();
		if (allowed.includes(explicit)) {
			return explicit;
		}
		if (allowed.includes(this.colorFormat)) {
			return this.colorFormat;
		}
		return allowed[0] || 'hex';
	}

	private swatchPos(): string {
		const explicit = (this.el.getAttribute('swatch') || '').toLowerCase();
		if (explicit === 'left' || explicit === 'right' || explicit === 'hidden') {
			return explicit;
		}
		if (this.el.hasAttribute('swatch-hidden')) {
			return 'hidden';
		}
		if (this.el.hasAttribute('right')) {
			return 'right';
		}
		if (this.el.hasAttribute('left')) {
			return 'left';
		}
		return 'left';
	}

	private normHex(hexValue: string): string {
		return this.serialize('hex', this.parseHex(hexValue) || this.color);
	}

	private paintColorChrome(
		sr: ShadowRoot,
		root: HTMLElement,
		field: HTMLInputElement,
	): void {
		const fmt = sr.querySelector('.format');
		const picker = sr.querySelector('.picker');
		const swatch = sr.querySelector('.swatch');
		if (!(fmt instanceof HTMLSelectElement) || !(picker instanceof HTMLInputElement) || !(swatch instanceof HTMLButtonElement)) {
			return;
		}
		const pos = this.swatchPos();
		const allowed = this.allowedFormats();
		this.colorFormat = this.resolveFormat(allowed);
		root.classList.add('is-color');
		root.classList.toggle('swatch-right', pos === 'right');
		root.classList.toggle('swatch-hidden', pos === 'hidden');
		fmt.innerHTML = allowed
			.map((v) => `<option value="${v}">${v.toUpperCase()}</option>`)
			.join('');
		fmt.value = this.colorFormat;
		fmt.hidden = allowed.length <= 1;
		picker.value = this.normHex(this.serialize('hex', this.color));
		swatch.style.background = this.serialize('rgba', this.color);
		field.value = this.serialize(this.colorFormat, this.color);
	}

	private clearColorChrome(root: HTMLElement): void {
		root.classList.remove('is-color', 'swatch-right', 'swatch-hidden');
	}

	private clampCh(v: number): number {
		return Math.min(255, Math.max(0, v));
	}

	private clampA(v: number): number {
		return Math.min(1, Math.max(0, v));
	}

	private parseHex(value: string): RGBA | null {
		const raw = `${value || ''}`.trim().replace(/^#/, '');
		if (!raw) {
			return null;
		}
		if (raw.length === 3 || raw.length === 4) {
			const r = Number.parseInt(raw[0] + raw[0], 16);
			const g = Number.parseInt(raw[1] + raw[1], 16);
			const b = Number.parseInt(raw[2] + raw[2], 16);
			const a = raw.length === 4 ? Number.parseInt(raw[3] + raw[3], 16) / 255 : 1;
			if ([r, g, b, a].some((x) => Number.isNaN(x))) {
				return null;
			}
			return { r, g, b, a };
		}
		if (raw.length === 6 || raw.length === 8) {
			const r = Number.parseInt(raw.slice(0, 2), 16);
			const g = Number.parseInt(raw.slice(2, 4), 16);
			const b = Number.parseInt(raw.slice(4, 6), 16);
			const a = raw.length === 8 ? Number.parseInt(raw.slice(6, 8), 16) / 255 : 1;
			if ([r, g, b, a].some((x) => Number.isNaN(x))) {
				return null;
			}
			return { r, g, b, a };
		}
		return null;
	}

	private parseRgba(value: string): RGBA | null {
		const m = `${value || ''}`.trim().match(/^rgba?\(\s*([^\)]+)\s*\)$/i);
		if (!m) {
			return null;
		}
		const parts = m[1].split(',').map((p) => p.trim());
		if (parts.length !== 3 && parts.length !== 4) {
			return null;
		}
		const r = Number.parseFloat(parts[0]);
		const g = Number.parseFloat(parts[1]);
		const b = Number.parseFloat(parts[2]);
		const a = parts.length === 4 ? Number.parseFloat(parts[3]) : 1;
		if ([r, g, b, a].some((x) => Number.isNaN(x))) {
			return null;
		}
		return {
			r: this.clampCh(r),
			g: this.clampCh(g),
			b: this.clampCh(b),
			a: this.clampA(a),
		};
	}

	private consumeColor(value: string): boolean {
		const h = this.parseHex(value);
		if (h) {
			this.color = h;
			return true;
		}
		const rgba = this.parseRgba(value);
		if (rgba) {
			this.color = rgba;
			return true;
		}
		return false;
	}

	private hexCh(v: number): string {
		return Math.round(this.clampCh(v))
			.toString(16)
			.padStart(2, '0');
	}

	private alphaStr(value: number): string {
		const rounded = Math.round(this.clampA(value) * 1000) / 1000;
		return `${rounded}`;
	}

	private serialize(fmt: string, c: RGBA): string {
		if (fmt === 'rgba') {
			return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${this.alphaStr(c.a)})`;
		}
		return `#${this.hexCh(c.r)}${this.hexCh(c.g)}${this.hexCh(c.b)}`;
	}

	private syncHost(): void {
		const sr = this.el.shadowRoot;
		const root = sr?.querySelector('.root');
		const field = sr?.querySelector('.field');
		if (!(root instanceof HTMLElement) || !(field instanceof HTMLInputElement)) {
			return;
		}

		const type = (this.el.getAttribute('type') || 'text').toLowerCase();
		const value = this.el.getAttribute('value') || '';
		field.type = type === 'color' ? 'text' : type;
		field.value = value;
		field.placeholder = this.el.getAttribute('placeholder') || '';
		field.disabled = this.el.hasAttribute('disabled');
		field.required = this.el.hasAttribute('required');
		field.readOnly = this.el.hasAttribute('readonly');
		field.name = this.el.getAttribute('name') || '';
		field.min = this.el.getAttribute('min') || '';
		field.max = this.el.getAttribute('max') || '';
		field.step = this.el.getAttribute('step') || '';
		const lab = this.el.getAttribute('label');
		if (lab) {
			field.setAttribute('aria-label', lab);
		} else {
			field.removeAttribute('aria-label');
		}

		if (type === 'color') {
			if (!this.consumeColor(value) && !value) {
				this.color = { r: 0, g: 0, b: 0, a: 1 };
			}
			this.paintColorChrome(sr!, root, field);
			field.value = this.serialize(this.colorFormat, this.color);
			this.reflectValueAttr(field);
		} else {
			this.clearColorChrome(root);
		}
	}

	render() {
		return (
			<Host>
				<div class="root" part="root">
					<button class="swatch" part="swatch" type="button" aria-label="Pick color"></button>
					<input class="field" part="input" />
					<select class="format" part="format" aria-label="Color format">
						<option value="hex">HEX</option>
						<option value="rgba">RGBA</option>
					</select>
					<input
						class="picker"
						part="picker"
						type="color"
						tabIndex={-1}
						aria-hidden="true"
					/>
				</div>
			</Host>
		);
	}
}
