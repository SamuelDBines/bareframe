class BfInput extends HTMLElement {
	static observedAttributes = [
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
	];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._onInput = this._onInput.bind(this);
		this._onChange = this._onChange.bind(this);
		this._onFormatChange = this._onFormatChange.bind(this);
		this._onPickerInput = this._onPickerInput.bind(this);
		this._onSwatchClick = this._onSwatchClick.bind(this);
		this._color = { r: 0, g: 0, b: 0, a: 1 };
		this._colorFormat = 'hex';
	}

	connectedCallback() {
		if (this._initialized) {
			this._syncState();
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./input.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('div');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = `
			<button class="swatch" part="swatch" type="button" aria-label="Pick color"></button>
			<input class="field" part="input" />
			<select class="format" part="format" aria-label="Color format">
				<option value="hex">HEX</option>
				<option value="rgba">RGBA</option>
			</select>
			<input class="picker" part="picker" type="color" tabindex="-1" aria-hidden="true" />
		`;

		this.shadowRoot.replaceChildren(link, root);
		this._root = root;
		this._field = root.querySelector('.field');
		this._swatch = root.querySelector('.swatch');
		this._format = root.querySelector('.format');
		this._picker = root.querySelector('.picker');

		this._field.addEventListener('input', this._onInput);
		this._field.addEventListener('change', this._onChange);
		this._format.addEventListener('change', this._onFormatChange);
		this._picker.addEventListener('input', this._onPickerInput);
		this._swatch.addEventListener('click', this._onSwatchClick);

		if (!this.hasAttribute('value')) {
			const fallbackValue = this.textContent?.trim();
			if (fallbackValue) {
				this.setAttribute('value', fallbackValue);
			}
		}

		this._syncState();
	}

	attributeChangedCallback(name) {
		if (name === 'value' && this._reflectingValue) {
			return;
		}
		this._syncState();
	}

	get value() {
		return this._field?.value || '';
	}

	set value(nextValue) {
		this.setAttribute('value', `${nextValue ?? ''}`);
	}

	_reflectValueAttribute() {
		const next = this._field.value;
		if (this.getAttribute('value') === next) {
			return;
		}
		this._reflectingValue = true;
		this.setAttribute('value', next);
		this._reflectingValue = false;
	}

	_onInput() {
		if (this._isColorType()) {
			this._tryConsumeColorString(this._field.value);
		}
		this._reflectValueAttribute();
		this.dispatchEvent(
			new CustomEvent('bf-input', {
				bubbles: true,
				composed: true,
				detail: {
					value: this._field.value,
				},
			}),
		);
	}

	_onChange() {
		if (this._isColorType()) {
			if (!this._tryConsumeColorString(this._field.value)) {
				this._field.value = this._serializeColor(this._colorFormat, this._color);
			}
			this._renderColorUi();
		}
		this._reflectValueAttribute();
		this.dispatchEvent(
			new CustomEvent('bf-change', {
				bubbles: true,
				composed: true,
				detail: {
					value: this._field.value,
				},
			}),
		);
	}

	_onFormatChange() {
		if (!this._isColorType()) {
			return;
		}
		this._colorFormat = this._format.value;
		this._field.value = this._serializeColor(this._colorFormat, this._color);
		this._reflectValueAttribute();
	}

	_onPickerInput() {
		if (!this._isColorType()) {
			return;
		}
		const parsed = this._parseHex(this._picker.value);
		if (!parsed) {
			return;
		}
		this._color = { ...parsed, a: this._color.a };
		this._field.value = this._serializeColor(this._colorFormat, this._color);
		this._renderColorUi();
		this._reflectValueAttribute();
		this.dispatchEvent(
			new CustomEvent('bf-input', {
				bubbles: true,
				composed: true,
				detail: {
					value: this._field.value,
				},
			}),
		);
	}

	_onSwatchClick() {
		if (this._isColorType() && !this.hasAttribute('disabled')) {
			this._picker.click();
		}
	}

	_isColorType() {
		return (this.getAttribute('type') || 'text').toLowerCase() === 'color';
	}

	_allowedColorFormats() {
		const hasHex = this.hasAttribute('hex');
		const hasRgba = this.hasAttribute('rgba');
		if (hasHex && hasRgba) {
			return ['hex', 'rgba'];
		}
		if (hasHex) {
			return ['hex'];
		}
		if (hasRgba) {
			return ['rgba'];
		}
		const explicit = (this.getAttribute('format') || '').toLowerCase();
		if (explicit === 'hex') {
			return ['hex'];
		}
		if (explicit === 'rgba') {
			return ['rgba'];
		}
		return ['hex', 'rgba'];
	}

	_resolveColorFormat(allowed) {
		const explicit = (this.getAttribute('format') || '').toLowerCase();
		if (allowed.includes(explicit)) {
			return explicit;
		}
		if (allowed.includes(this._colorFormat)) {
			return this._colorFormat;
		}
		return allowed[0] || 'hex';
	}

	_resolveSwatchPosition() {
		const explicit = (this.getAttribute('swatch') || '').toLowerCase();
		if (explicit === 'left' || explicit === 'right' || explicit === 'hidden') {
			return explicit;
		}
		if (this.hasAttribute('swatch-hidden')) {
			return 'hidden';
		}
		if (this.hasAttribute('right')) {
			return 'right';
		}
		if (this.hasAttribute('left')) {
			return 'left';
		}
		return 'left';
	}

	_normalizeHex(hexValue) {
		return this._serializeColor('hex', this._parseHex(hexValue) || this._color);
	}

	_renderColorUi() {
		const swatchPosition = this._resolveSwatchPosition();
		const allowedFormats = this._allowedColorFormats();
		this._colorFormat = this._resolveColorFormat(allowedFormats);

		this._root.classList.add('is-color');
		this._root.classList.toggle('swatch-right', swatchPosition === 'right');
		this._root.classList.toggle('swatch-hidden', swatchPosition === 'hidden');
		this._format.innerHTML = allowedFormats
			.map((value) => `<option value="${value}">${value.toUpperCase()}</option>`)
			.join('');
		this._format.value = this._colorFormat;
		this._format.hidden = allowedFormats.length <= 1;
		this._picker.value = this._normalizeHex(this._serializeColor('hex', this._color));
		this._swatch.style.background = this._serializeColor('rgba', this._color);
	}

	_renderDefaultUi() {
		this._root.classList.remove('is-color', 'swatch-right', 'swatch-hidden');
	}

	_clampChannel(value) {
		return Math.min(255, Math.max(0, value));
	}

	_clampAlpha(value) {
		return Math.min(1, Math.max(0, value));
	}

	_parseHex(value) {
		const raw = `${value || ''}`.trim().replace(/^#/, '');
		if (!raw) {
			return null;
		}
		if (raw.length === 3 || raw.length === 4) {
			const r = Number.parseInt(raw[0] + raw[0], 16);
			const g = Number.parseInt(raw[1] + raw[1], 16);
			const b = Number.parseInt(raw[2] + raw[2], 16);
			const a = raw.length === 4 ? Number.parseInt(raw[3] + raw[3], 16) / 255 : 1;
			if ([r, g, b, a].some((v) => Number.isNaN(v))) {
				return null;
			}
			return { r, g, b, a };
		}
		if (raw.length === 6 || raw.length === 8) {
			const r = Number.parseInt(raw.slice(0, 2), 16);
			const g = Number.parseInt(raw.slice(2, 4), 16);
			const b = Number.parseInt(raw.slice(4, 6), 16);
			const a = raw.length === 8 ? Number.parseInt(raw.slice(6, 8), 16) / 255 : 1;
			if ([r, g, b, a].some((v) => Number.isNaN(v))) {
				return null;
			}
			return { r, g, b, a };
		}
		return null;
	}

	_parseRgba(value) {
		const match = `${value || ''}`
			.trim()
			.match(/^rgba?\(\s*([^\)]+)\s*\)$/i);
		if (!match) {
			return null;
		}
		const parts = match[1].split(',').map((part) => part.trim());
		if (parts.length !== 3 && parts.length !== 4) {
			return null;
		}
		const r = Number.parseFloat(parts[0]);
		const g = Number.parseFloat(parts[1]);
		const b = Number.parseFloat(parts[2]);
		const a = parts.length === 4 ? Number.parseFloat(parts[3]) : 1;
		if ([r, g, b, a].some((v) => Number.isNaN(v))) {
			return null;
		}
		return {
			r: this._clampChannel(r),
			g: this._clampChannel(g),
			b: this._clampChannel(b),
			a: this._clampAlpha(a),
		};
	}

	_tryConsumeColorString(value) {
		const parsedHex = this._parseHex(value);
		if (parsedHex) {
			this._color = parsedHex;
			this._renderColorUi();
			return true;
		}
		const parsedRgba = this._parseRgba(value);
		if (parsedRgba) {
			this._color = parsedRgba;
			this._renderColorUi();
			return true;
		}
		return false;
	}

	_toHexChannel(value) {
		return Math.round(this._clampChannel(value))
			.toString(16)
			.padStart(2, '0');
	}

	_toAlphaString(value) {
		const rounded = Math.round(this._clampAlpha(value) * 1000) / 1000;
		return `${rounded}`;
	}

	_serializeColor(format, color) {
		if (format === 'rgba') {
			return `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(
				color.b,
			)}, ${this._toAlphaString(color.a)})`;
		}
		return `#${this._toHexChannel(color.r)}${this._toHexChannel(color.g)}${this._toHexChannel(color.b)}`;
	}

	_syncState() {
		if (!this._field || !this._root) {
			return;
		}

		const type = (this.getAttribute('type') || 'text').toLowerCase();
		const value = this.getAttribute('value') || '';
		this._field.type = type === 'color' ? 'text' : type;
		this._field.value = value;
		this._field.placeholder = this.getAttribute('placeholder') || '';
		this._field.disabled = this.hasAttribute('disabled');
		this._field.required = this.hasAttribute('required');
		this._field.readOnly = this.hasAttribute('readonly');
		this._field.name = this.getAttribute('name') || '';
		this._field.min = this.getAttribute('min') || '';
		this._field.max = this.getAttribute('max') || '';
		this._field.step = this.getAttribute('step') || '';
		if (this.getAttribute('label')) {
			this._field.setAttribute('aria-label', this.getAttribute('label'));
		} else {
			this._field.removeAttribute('aria-label');
		}

		if (type === 'color') {
			if (!this._tryConsumeColorString(value)) {
				if (!value) {
					this._color = { r: 0, g: 0, b: 0, a: 1 };
				}
			}
			this._renderColorUi();
			this._field.value = this._serializeColor(this._colorFormat, this._color);
			this._reflectValueAttribute();
		} else {
			this._renderDefaultUi();
		}
	}
}

customElements.define('bf-input', BfInput);
