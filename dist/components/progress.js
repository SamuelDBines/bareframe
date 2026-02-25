class BfProgress extends HTMLElement {
	static observedAttributes = [
		'variant',
		'value',
		'max',
		'label',
		'size',
		'loading',
		'loading-variant',
		'loading-ms',
		'linear',
		'circular',
		'indeterminate',
		'striped',
		'tone',
		'primary',
		'secondary',
	];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._onSlotChange = this._onSlotChange.bind(this);
	}

	connectedCallback() {
		if (this._initialized) {
			this._sync();
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./progress.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('div');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = `
			<div class="linear" part="linear">
				<div class="track" part="track">
					<div class="fill" part="fill"></div>
				</div>
			</div>
			<div class="circular" part="circular">
				<svg viewBox="0 0 100 100" aria-hidden="true">
					<circle class="ring" cx="50" cy="50" r="42"></circle>
					<circle class="meter" cx="50" cy="50" r="42"></circle>
				</svg>
			</div>
			<div class="meta" part="meta"><slot></slot></div>
		`;

		this.shadowRoot.replaceChildren(link, root);
		this._root = root;
		this._fill = root.querySelector('.fill');
		this._meter = root.querySelector('.meter');
		this._slot = root.querySelector('slot');
		this._slot.addEventListener('slotchange', this._onSlotChange);
		this._sync();
	}

	disconnectedCallback() {
		this._stopLoading();
	}

	attributeChangedCallback() {
		this._sync();
	}

	get value() {
		return this._value();
	}

	set value(nextValue) {
		this.setAttribute('value', String(nextValue));
	}

	get max() {
		return this._max();
	}

	set max(nextValue) {
		this.setAttribute('max', String(nextValue));
	}

	get variant() {
		return this._variant();
	}

	set variant(nextValue) {
		this.setAttribute('variant', String(nextValue));
	}

	get size() {
		return this.getAttribute('size') || 'md';
	}

	set size(nextValue) {
		this.setAttribute('size', String(nextValue));
	}

	get tone() {
		return this._tone();
	}

	set tone(nextValue) {
		this.setAttribute('tone', String(nextValue));
	}

	get loading() {
		return this.hasAttribute('loading');
	}

	set loading(nextValue) {
		if (nextValue) {
			this.setAttribute('loading', '');
			return;
		}
		this.removeAttribute('loading');
	}

	_onSlotChange() {
		this._renderValueTokens();
	}

	_variant() {
		let variant = (this.getAttribute('variant') || '').toLowerCase();
		if (!variant) {
			if (this.hasAttribute('circular')) {
				variant = 'circular';
			} else if (this.hasAttribute('striped')) {
				variant = 'striped';
			} else if (this.hasAttribute('linear')) {
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

	_tone() {
		const explicit = (this.getAttribute('tone') || '').toLowerCase();
		if (explicit === 'secondary') {
			return 'secondary';
		}
		if (explicit === 'primary') {
			return 'primary';
		}
		if (this.hasAttribute('secondary')) {
			return 'secondary';
		}
		if (this.hasAttribute('primary')) {
			return 'primary';
		}
		return 'default';
	}

	_hasMax() {
		return this.hasAttribute('max');
	}

	_max() {
		const parsed = Number.parseFloat(this.getAttribute('max') || '');
		if (!Number.isFinite(parsed) || parsed <= 0) {
			return 100;
		}
		return Number.isFinite(parsed) && parsed > 0 ? parsed : 100;
	}

	_value() {
		const parsed = Number.parseFloat(this.getAttribute('value') || '0');
		if (!Number.isFinite(parsed)) {
			return 0;
		}
		const upper = this._hasMax() ? this._max() : 100;
		return Math.min(upper, Math.max(0, parsed));
	}

	_percent() {
		if (!this._hasMax()) {
			return this._value();
		}
		return (this._value() / this._max()) * 100;
	}

	_loadingVariant() {
		const explicit = (this.getAttribute('loading-variant') || '').toLowerCase();
		const attrValue = (this.getAttribute('loading') || '').toLowerCase();
		const candidate = explicit || attrValue || 'loop';
		if (['loop', 'pulse', 'stripe', 'bounce', 'spin'].includes(candidate)) {
			return candidate;
		}
		return 'loop';
	}

	_loadingMs() {
		const parsed = Number.parseInt(this.getAttribute('loading-ms') || '450', 10);
		return Number.isFinite(parsed) && parsed >= 80 ? parsed : 450;
	}

	_isLoading() {
		const legacyVariant = (this.getAttribute('variant') || '').toLowerCase() === 'indeterminate';
		return this.hasAttribute('loading') || this.hasAttribute('indeterminate') || legacyVariant;
	}

	_startLoading() {
		const ms = this._loadingMs();
		if (this._loadingTimer && this._loadingTimerMs === ms) {
			return;
		}
		this._stopLoading();
		this._loadingTimerMs = ms;
		this._loadingTimer = setInterval(() => {
			const ceiling = this._hasMax() ? this._max() : 100;
			const step = ceiling / 10;
			let next = this._value() + step;
			if (next > ceiling) {
				next = 0;
			}
			this.value = Number(next.toFixed(4));
		}, ms);
	}

	_stopLoading() {
		if (!this._loadingTimer) {
			return;
		}
		clearInterval(this._loadingTimer);
		this._loadingTimer = null;
		this._loadingTimerMs = null;
	}

	_formatValueLabel() {
		if (this._hasMax()) {
			return `${Math.round(this._percent())}%`;
		}
		const raw = this._value();
		return Number.isInteger(raw) ? `${raw}` : `${raw.toFixed(2)}`;
	}

	_renderValueTokens() {
		const tokens = this.querySelectorAll('value');
		if (!tokens.length) {
			return;
		}
		const display = this._formatValueLabel();
		for (const token of tokens) {
			token.textContent = display;
		}
	}

	_sync() {
		if (!this._root) {
			return;
		}
		const variant = this._variant();
		const percent = this._percent();
		const size = this.getAttribute('size') || 'md';
		const tone = this._tone();
		const loading = this._isLoading();
		const loadingVariant = this._loadingVariant();

		this._root.setAttribute('data-variant', variant);
		this._root.setAttribute('data-size', size);
		this._root.setAttribute('data-tone', tone);
		this._root.setAttribute('data-loading', loading ? 'true' : 'false');
		this._root.setAttribute('data-loading-variant', loadingVariant);
		this.setAttribute('role', 'progressbar');
		this.setAttribute('aria-valuemin', '0');
		this.setAttribute('aria-valuemax', String(this._hasMax() ? this._max() : 100));
		this.setAttribute('aria-valuenow', String(this._value()));
		if (this.getAttribute('label')) {
			this.setAttribute('aria-label', this.getAttribute('label'));
		}

		this._fill.style.width = `${percent}%`;
		const circumference = 2 * Math.PI * 42;
		const dash = circumference - (percent / 100) * circumference;
		this._meter.style.strokeDasharray = `${circumference}`;
		this._meter.style.strokeDashoffset = `${dash}`;
		this._renderValueTokens();
		if (loading) {
			this._startLoading();
		} else {
			this._stopLoading();
		}
	}
}

customElements.define('bf-progress', BfProgress);
