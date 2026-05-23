import { Component, Element, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-progress',
	styleUrl: 'bf-progress.css',
	shadow: true,
})
export class BfProgress {
	@Element() el!: HTMLElement;
	private loadingTimer?: ReturnType<typeof setInterval>;
	private loadingTimerMs?: number | null;

	private mutation?: MutationObserver;

	connectedCallback() {
		this.mutation = new MutationObserver(() => this.sync());
		this.mutation.observe(this.el, { attributes: true });
	}

	disconnectedCallback() {
		this.stopLoading();
		this.mutation?.disconnect();
	}

	get value(): number {
		return this.valueNum();
	}
	set value(nextValue: unknown) {
		this.el.setAttribute('value', String(nextValue ?? ''));
	}

	get max(): number {
		return this.maxNum();
	}
	set max(nextValue: unknown) {
		this.el.setAttribute('max', String(nextValue ?? ''));
	}

	get variant(): string {
		return this.variantId();
	}
	set variant(nextValue: unknown) {
		this.el.setAttribute('variant', String(nextValue ?? ''));
	}

	get tone(): string {
		return this.toneId();
	}
	set tone(nextValue: unknown) {
		this.el.setAttribute('tone', String(nextValue ?? ''));
	}

	get size(): string {
		return this.el.getAttribute('size') || 'md';
	}
	set size(nextValue: unknown) {
		this.el.setAttribute('size', String(nextValue ?? ''));
	}

	get loading(): boolean {
		return this.isLoading();
	}
	set loading(on: unknown) {
		if (Boolean(on)) {
			this.el.setAttribute('loading', '');
		} else {
			this.el.removeAttribute('loading');
		}
	}

	private variantId(): string {
		let variant = (this.el.getAttribute('variant') || '').toLowerCase();
		if (!variant) {
			if (this.el.hasAttribute('circular')) {
				variant = 'circular';
			} else if (this.el.hasAttribute('striped')) {
				variant = 'striped';
			} else if (this.el.hasAttribute('linear')) {
				variant = 'linear';
			}
		}
		if (!variant) {
			variant = 'linear';
		}
		if (variant === 'circlular') {
			variant = 'circular';
		}
		if (variant === 'indeterminate') {
			return 'linear';
		}
		if (['linear', 'circular', 'striped'].includes(variant)) {
			return variant;
		}
		return 'linear';
	}

	private toneId(): string {
		const explicit = (this.el.getAttribute('tone') || '').toLowerCase();
		if (explicit === 'secondary') {
			return 'secondary';
		}
		if (explicit === 'primary') {
			return 'primary';
		}
		if (this.el.hasAttribute('secondary')) {
			return 'secondary';
		}
		if (this.el.hasAttribute('primary')) {
			return 'primary';
		}
		return 'default';
	}

	private hasMaxAttr(): boolean {
		return this.el.hasAttribute('max');
	}

	private maxNum(): number {
		const parsed = Number.parseFloat(this.el.getAttribute('max') || '');
		if (!Number.isFinite(parsed) || parsed <= 0) {
			return 100;
		}
		return parsed;
	}

	private valueNum(): number {
		const parsed = Number.parseFloat(this.el.getAttribute('value') || '0');
		if (!Number.isFinite(parsed)) {
			return 0;
		}
		const upper = this.hasMaxAttr() ? this.maxNum() : 100;
		return Math.min(upper, Math.max(0, parsed));
	}

	private percent(): number {
		if (!this.hasMaxAttr()) {
			return this.valueNum();
		}
		return (this.valueNum() / this.maxNum()) * 100;
	}

	private loadingVariantId(): string {
		const explicit = (this.el.getAttribute('loading-variant') || '').toLowerCase();
		const attrValue = (this.el.getAttribute('loading') || '').toLowerCase();
		const candidate = explicit || attrValue || 'loop';
		if (['loop', 'pulse', 'stripe', 'bounce', 'spin'].includes(candidate)) {
			return candidate;
		}
		return 'loop';
	}

	private loadingMs(): number {
		const parsed = Number.parseInt(this.el.getAttribute('loading-ms') || '450', 10);
		return Number.isFinite(parsed) && parsed >= 80 ? parsed : 450;
	}

	private isLoading(): boolean {
		const legacy = (this.el.getAttribute('variant') || '').toLowerCase() === 'indeterminate';
		return this.el.hasAttribute('loading') || this.el.hasAttribute('indeterminate') || legacy;
	}

	private startLoading() {
		const ms = this.loadingMs();
		if (this.loadingTimer && this.loadingTimerMs === ms) {
			return;
		}
		this.stopLoading();
		this.loadingTimerMs = ms;
		this.loadingTimer = setInterval(() => {
			const ceiling = this.hasMaxAttr() ? this.maxNum() : 100;
			const step = ceiling / 10;
			let next = this.valueNum() + step;
			if (next > ceiling) {
				next = 0;
			}
			this.value = Number(next.toFixed(4));
			this.sync();
		}, ms);
	}

	private stopLoading() {
		if (!this.loadingTimer) {
			return;
		}
		clearInterval(this.loadingTimer);
		this.loadingTimer = undefined;
		this.loadingTimerMs = null;
	}

	private formatLabel(): string {
		if (this.hasMaxAttr()) {
			return `${Math.round(this.percent())}%`;
		}
		const raw = this.valueNum();
		return Number.isInteger(raw) ? `${raw}` : `${raw.toFixed(2)}`;
	}

	private updateValueTokens() {
		const tokens = this.el.querySelectorAll('value');
		if (!tokens.length) {
			return;
		}
		const display = this.formatLabel();
		tokens.forEach((t) => {
			t.textContent = display;
		});
	}

	private bindSlotOnce(sr: ShadowRoot) {
		const slot = sr.querySelector('slot');
		if (slot instanceof HTMLSlotElement && slot.dataset.bfSlotBound !== 'true') {
			slot.dataset.bfSlotBound = 'true';
			slot.addEventListener('slotchange', () => this.updateValueTokens());
		}
	}

	private sync() {
		const sr = this.el.shadowRoot;
		const root = sr?.querySelector('.root');
		const fill = sr?.querySelector('.fill');
		const meter = sr?.querySelector('.meter');
		if (!(root instanceof HTMLElement) || !(fill instanceof HTMLElement) || !(meter instanceof HTMLElement)) {
			return;
		}

		const variant = this.variantId();
		const percent = this.percent();
		const size = this.el.getAttribute('size') || 'md';
		const tone = this.toneId();
		const loading = this.isLoading();
		const loadingVariant = this.loadingVariantId();

		root.setAttribute('data-variant', variant);
		root.setAttribute('data-size', size);
		root.setAttribute('data-tone', tone);
		root.setAttribute('data-loading', loading ? 'true' : 'false');
		root.setAttribute('data-loading-variant', loadingVariant);

		this.el.setAttribute('role', 'progressbar');
		this.el.setAttribute('aria-valuemin', '0');
		this.el.setAttribute(
			'aria-valuemax',
			String(this.hasMaxAttr() ? this.maxNum() : 100),
		);
		this.el.setAttribute('aria-valuenow', String(this.valueNum()));
		const lb = this.el.getAttribute('label');
		if (lb) {
			this.el.setAttribute('aria-label', lb);
		} else {
			this.el.removeAttribute('aria-label');
		}

		fill.style.width = `${percent}%`;
		const circumference = 2 * Math.PI * 42;
		const dash = circumference - (percent / 100) * circumference;
		meter.style.strokeDasharray = `${circumference}`;
		meter.style.strokeDashoffset = `${dash}`;

		this.updateValueTokens();

		this.bindSlotOnce(sr!);

		if (loading) {
			this.startLoading();
		} else {
			this.stopLoading();
		}
	}

	componentDidRender() {
		const sr = this.el.shadowRoot;
		if (!sr?.querySelector('.root')) {
			return;
		}
		this.bindSlotOnce(sr);
		this.sync();
	}

	render() {
		return (
			<Host>
				<div class="root" part="root">
					<div class="linear" part="linear">
						<div class="track" part="track">
							<div class="fill" part="fill"></div>
						</div>
					</div>
					<div class="circular" part="circular">
						<svg viewBox="0 0 100 100" aria-hidden="true">
							<circle class="ring" cx="50" cy="50" r="42" />
							<circle class="meter" cx="50" cy="50" r="42" />
						</svg>
					</div>
					<div class="meta" part="meta">
						<slot />
					</div>
				</div>
			</Host>
		);
	}
}
