class BfSelect extends HTMLElement {
	static observedAttributes = [
		'value',
		'multi',
		'disabled',
		'required',
		'placeholder',
		'label',
		'name',
	];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._onChange = this._onChange.bind(this);
		this._onLightDomMutate = this._onLightDomMutate.bind(this);
	}

	connectedCallback() {
		if (this._initialized) {
			this._syncOptions();
			this._syncState();
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./select.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('div');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = `
			<select part="select"></select>
			<span class="chevron" part="chevron" aria-hidden="true"></span>
		`;

		this.shadowRoot.replaceChildren(link, root);
		this._root = root;
		this._select = root.querySelector('select');
		this._select.addEventListener('change', this._onChange);

		this._observer = new MutationObserver(this._onLightDomMutate);
		this._observer.observe(this, {
			childList: true,
			subtree: true,
			characterData: true,
			attributes: true,
			attributeFilter: ['value', 'selected', 'disabled', 'label'],
		});

		this._syncOptions();
		this._syncState();
	}

	disconnectedCallback() {
		if (this._observer) {
			this._observer.disconnect();
		}
	}

	attributeChangedCallback(name) {
		if (name === 'value' && this._reflectingValue) {
			return;
		}
		this._syncState();
	}

	get value() {
		if (this._isMulti()) {
			return this.values;
		}
		return this._select?.value || '';
	}

	set value(nextValue) {
		if (Array.isArray(nextValue)) {
			this.setAttribute('value', nextValue.join(','));
			return;
		}
		this.setAttribute('value', `${nextValue ?? ''}`);
	}

	get values() {
		if (!this._select) {
			return [];
		}
		return [...this._select.selectedOptions].map((option) => option.value);
	}

	_onLightDomMutate() {
		this._syncOptions();
		this._syncState();
	}

	_onChange() {
		this._enforceMultiLimit();
		this._reflectValueAttribute();
		this.dispatchEvent(
			new CustomEvent('bf-change', {
				bubbles: true,
				composed: true,
				detail: {
					value: this._isMulti() ? this.values : this._select.value,
					values: this.values,
					multiple: this._isMulti(),
					multi: this._multiLimit(),
				},
			}),
		);
	}

	_isMulti() {
		return this.hasAttribute('multi');
	}

	_multiLimit() {
		if (!this._isMulti()) {
			return 1;
		}
		const raw = this.getAttribute('multi');
		if (raw === '' || raw === null) {
			return Infinity;
		}
		const parsed = Number.parseInt(raw, 10);
		return Number.isFinite(parsed) && parsed > 0 ? parsed : Infinity;
	}

	_parsedValueAttribute() {
		const raw = this.getAttribute('value');
		if (raw === null) {
			return [];
		}
		if (this._isMulti()) {
			return raw
				.split(',')
				.map((value) => value.trim())
				.filter(Boolean);
		}
		return [raw];
	}

	cloneLightDomOptions() {
		const fragment = document.createDocumentFragment();
		let count = 0;

		for (const child of this.children) {
			const tag = child.tagName.toLowerCase();
			if (tag === 'option') {
				fragment.append(this._cloneOption(child));
				count += 1;
				continue;
			}
			if (tag === 'optgroup') {
				const group = document.createElement('optgroup');
				const label = child.getAttribute('label');
				if (label) {
					group.label = label;
				}
				for (const option of child.querySelectorAll('option')) {
					group.append(this._cloneOption(option));
					count += 1;
				}
				fragment.append(group);
			}
		}

		return { fragment, count };
	}

	_cloneOption(option) {
		const clone = document.createElement('option');
		clone.value = option.getAttribute('value') ?? option.textContent?.trim() ?? '';
		clone.textContent = option.textContent?.trim() ?? '';
		clone.disabled = option.hasAttribute('disabled');
		clone.defaultSelected = option.hasAttribute('selected');
		clone.selected = option.hasAttribute('selected');
		return clone;
	}

	_syncOptions() {
		if (!this._select) {
			return;
		}

		const { fragment, count } = this.cloneLightDomOptions();
		this._select.replaceChildren();

		const placeholder = this.getAttribute('placeholder');
		const hasPlaceholder = Boolean(placeholder && !this._isMulti());
		if (hasPlaceholder) {
			const placeholderOption = document.createElement('option');
			placeholderOption.value = '';
			placeholderOption.textContent = placeholder;
			this._select.append(placeholderOption);
		}

		if (count > 0) {
			this._select.append(fragment);
		} else {
			const fallback = this.textContent?.trim();
			if (fallback) {
				const option = document.createElement('option');
				option.value = fallback;
				option.textContent = fallback;
				this._select.append(option);
			}
		}
	}

	_applyValueAttribute() {
		if (!this.hasAttribute('value')) {
			return;
		}

		const values = new Set(this._parsedValueAttribute());
		if (this._isMulti()) {
			for (const option of this._select.options) {
				option.selected = values.has(option.value);
			}
			return;
		}

		const first = this._parsedValueAttribute()[0] ?? '';
		this._select.value = first;
	}

	_enforceMultiLimit() {
		if (!this._isMulti()) {
			return;
		}
		const limit = this._multiLimit();
		if (limit === Infinity) {
			return;
		}
		const selected = [...this._select.options].filter((option) => option.selected);
		if (selected.length <= limit) {
			return;
		}
		for (let index = limit; index < selected.length; index += 1) {
			selected[index].selected = false;
		}
	}

	_reflectValueAttribute() {
		if (!this._select) {
			return;
		}
		const nextValue = this._isMulti() ? this.values.join(',') : this._select.value;
		if (this.getAttribute('value') === nextValue) {
			return;
		}
		this._reflectingValue = true;
		this.setAttribute('value', nextValue);
		this._reflectingValue = false;
	}

	_syncState() {
		if (!this._select || !this._root) {
			return;
		}

		this._select.multiple = this._isMulti();
		this._root.classList.toggle('is-multi', this._isMulti());
		this._select.disabled = this.hasAttribute('disabled');
		this._select.required = this.hasAttribute('required');
		this._select.name = this.getAttribute('name') || '';
		if (this.getAttribute('label')) {
			this._select.setAttribute('aria-label', this.getAttribute('label'));
		} else {
			this._select.removeAttribute('aria-label');
		}

		this._applyValueAttribute();
		this._enforceMultiLimit();
		this._reflectValueAttribute();
	}
}

customElements.define('bf-select', BfSelect);
