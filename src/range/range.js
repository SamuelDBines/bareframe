class BfRange extends HTMLElement {
	static observedAttributes = [
		'mode',
		'slider',
		'range',
		'rating',
		'value',
		'low',
		'high',
		'min',
		'max',
		'step',
		'count',
		'disabled',
		'label',
		'name',
	];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._onSingleInput = this._onSingleInput.bind(this);
		this._onRangeInput = this._onRangeInput.bind(this);
	}

	connectedCallback() {
		if (this._initialized) {
			this._sync();
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./range.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('div');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = `
			<div class="single" part="single">
				<input class="single-input" type="range" part="input" />
			</div>
			<div class="dual" part="dual">
				<div class="dual-track" part="track">
					<div class="dual-fill" part="fill"></div>
				</div>
				<input class="dual-low" type="range" part="low" />
				<input class="dual-high" type="range" part="high" />
			</div>
			<div class="rating" part="rating"></div>
			<div class="meta" part="meta"><slot></slot></div>
		`;

		this.shadowRoot.replaceChildren(link, root);
		this._root = root;
		this._single = root.querySelector('.single-input');
		this._dualLow = root.querySelector('.dual-low');
		this._dualHigh = root.querySelector('.dual-high');
		this._dualFill = root.querySelector('.dual-fill');
		this._rating = root.querySelector('.rating');

		this._single.addEventListener('input', this._onSingleInput);
		this._single.addEventListener('change', this._onSingleInput);
		this._dualLow.addEventListener('input', this._onRangeInput);
		this._dualLow.addEventListener('change', this._onRangeInput);
		this._dualHigh.addEventListener('input', this._onRangeInput);
		this._dualHigh.addEventListener('change', this._onRangeInput);

		this._sync();
	}

	attributeChangedCallback() {
		this._sync();
	}

	_mode() {
		const explicit = (this.getAttribute('mode') || '').toLowerCase();
		if (['slider', 'range', 'rating'].includes(explicit)) {
			return explicit;
		}
		if (this.hasAttribute('rating')) {
			return 'rating';
		}
		if (this.hasAttribute('range')) {
			return 'range';
		}
		return 'slider';
	}

	_min() {
		const parsed = Number.parseFloat(this.getAttribute('min') || '0');
		return Number.isFinite(parsed) ? parsed : 0;
	}

	_max() {
		const parsed = Number.parseFloat(this.getAttribute('max') || '100');
		return Number.isFinite(parsed) && parsed > this._min() ? parsed : this._min() + 100;
	}

	_step() {
		const parsed = Number.parseFloat(this.getAttribute('step') || '1');
		return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
	}

	_parseValue(attrName, fallback) {
		const parsed = Number.parseFloat(this.getAttribute(attrName) || `${fallback}`);
		if (!Number.isFinite(parsed)) {
			return fallback;
		}
		return Math.min(this._max(), Math.max(this._min(), parsed));
	}

	_count() {
		const parsed = Number.parseInt(this.getAttribute('count') || '5', 10);
		return Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
	}

	_setValueAttr(attrName, value) {
		const next = `${value}`;
		if (this.getAttribute(attrName) === next) {
			return;
		}
		this.setAttribute(attrName, next);
	}

	_emit(kind) {
		const mode = this._mode();
		this.dispatchEvent(
			new CustomEvent(kind, {
				bubbles: true,
				composed: true,
				detail: {
					mode,
					value: mode === 'range'
						? [this._parseValue('low', this._min()), this._parseValue('high', this._max())]
						: this._parseValue('value', this._min()),
				},
			}),
		);
	}

	_onSingleInput(event) {
		this._setValueAttr('value', event.target.value);
		this._emit(event.type === 'change' ? 'bf-change' : 'bf-input');
	}

	_onRangeInput(event) {
		let low = this._parseValue('low', this._min());
		let high = this._parseValue('high', this._max());
		const next = Number.parseFloat(event.target.value);

		if (event.target === this._dualLow) {
			low = Math.min(next, high);
		} else {
			high = Math.max(next, low);
		}

		this._setValueAttr('low', low);
		this._setValueAttr('high', high);
		this._sync();
		this._emit(event.type === 'change' ? 'bf-change' : 'bf-input');
	}

	_renderRating() {
		this._rating.replaceChildren();
		const count = this._count();
		const current = this._parseValue('value', 0);
		const disabled = this.hasAttribute('disabled');

		for (let i = 1; i <= count; i += 1) {
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'star';
			button.textContent = '*';
			button.disabled = disabled;
			button.setAttribute('aria-label', `${i}`);
			if (i <= current) {
				button.classList.add('is-active');
			}
			button.addEventListener('click', () => {
				this._setValueAttr('value', i);
				this._sync();
				this._emit('bf-change');
			});
			this._rating.append(button);
		}
	}

	_syncDualFill() {
		const min = this._min();
		const max = this._max();
		const low = this._parseValue('low', min);
		const high = this._parseValue('high', max);
		const left = ((low - min) / (max - min)) * 100;
		const width = ((high - low) / (max - min)) * 100;
		this._dualFill.style.left = `${left}%`;
		this._dualFill.style.width = `${width}%`;
	}

	_sync() {
		if (!this._root) {
			return;
		}

		const mode = this._mode();
		const min = this._min();
		const max = this._max();
		const step = this._step();
		const disabled = this.hasAttribute('disabled');
		const label = this.getAttribute('label') || '';
		const name = this.getAttribute('name') || '';

		this._root.setAttribute('data-mode', mode);

		this._single.min = `${min}`;
		this._single.max = `${max}`;
		this._single.step = `${step}`;
		this._single.value = `${this._parseValue('value', min)}`;
		this._single.disabled = disabled;
		this._single.name = name;

		this._dualLow.min = `${min}`;
		this._dualLow.max = `${max}`;
		this._dualLow.step = `${step}`;
		this._dualLow.value = `${this._parseValue('low', min)}`;
		this._dualLow.disabled = disabled;
		this._dualLow.name = `${name ? `${name}-` : ''}low`;

		this._dualHigh.min = `${min}`;
		this._dualHigh.max = `${max}`;
		this._dualHigh.step = `${step}`;
		this._dualHigh.value = `${this._parseValue('high', max)}`;
		this._dualHigh.disabled = disabled;
		this._dualHigh.name = `${name ? `${name}-` : ''}high`;

		this._syncDualFill();
		this._renderRating();

		if (label) {
			this._single.setAttribute('aria-label', label);
			this._dualLow.setAttribute('aria-label', `${label} low`);
			this._dualHigh.setAttribute('aria-label', `${label} high`);
			this._rating.setAttribute('aria-label', label);
		}
	}
}

customElements.define('bf-range', BfRange);
