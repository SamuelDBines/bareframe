class BfAutocomplete extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._items = [];
		this._filtered = [];
		this._activeIndex = -1;
		this._listOpen = false;
		this._boundOnDocumentClick = this._onDocumentClick.bind(this);
	}

	connectedCallback() {
		if (this._initialized) {
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./autocomplete.css', import.meta.url);
		const placeholder = this.getAttribute('placeholder') || 'Search...';
		const value = this.getAttribute('value') || '';
		const listId = `ac-list-${Math.random().toString(36).slice(2, 10)}`;

		this.shadowRoot.innerHTML = `
			<link rel="stylesheet" href="${cssUrl.href}" />
			<div class="root" part="root">
				<input
					class="input"
					part="input"
					type="text"
					placeholder="${placeholder.replace(/"/g, '&quot;')}"
					autocomplete="off"
					spellcheck="false"
					role="combobox"
					aria-expanded="false"
					aria-controls="${listId}"
					aria-autocomplete="list"
				/>
				<ul class="list" part="list" id="${listId}" role="listbox" hidden></ul>
			</div>
		`;

		this._input = this.shadowRoot.querySelector('.input');
		this._list = this.shadowRoot.querySelector('.list');
		this._input.value = value;
		this._setItemsFromAttributes();
		this._filtered = [...this._items];
		this._renderList();

		this._input.addEventListener('focus', () => {
			this._filter(this._input.value);
			this._openList();
		});

		this._input.addEventListener('input', () => {
			const text = this._input.value;
			this._filter(text);
			this._openList();
			this.dispatchEvent(
				new CustomEvent('bf-change', {
					bubbles: true,
					composed: true,
					detail: { value: text },
				}),
			);
		});

		this._input.addEventListener('keydown', (event) => {
			if (!this._listOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
				this._openList();
			}

			if (event.key === 'ArrowDown') {
				event.preventDefault();
				this._moveActive(1);
			}

			if (event.key === 'ArrowUp') {
				event.preventDefault();
				this._moveActive(-1);
			}

			if (event.key === 'Enter' && this._activeIndex >= 0) {
				event.preventDefault();
				const item = this._filtered[this._activeIndex];
				if (item) {
					this._select(item);
				}
			}

			if (event.key === 'Escape') {
				this._closeList();
			}
		});

		document.addEventListener('click', this._boundOnDocumentClick);
	}

	disconnectedCallback() {
		document.removeEventListener('click', this._boundOnDocumentClick);
	}

	_setItemsFromAttributes() {
		const json = this.getAttribute('options');
		if (json) {
			try {
				const parsed = JSON.parse(json);
				if (Array.isArray(parsed)) {
					this._items = parsed.map((item) => String(item));
					return;
				}
			} catch {
				// Fall through to csv parsing.
			}
		}

		const csv = this.getAttribute('options-csv');
		if (csv) {
			this._items = csv
				.split(',')
				.map((part) => part.trim())
				.filter(Boolean);
			return;
		}

		this._items = [
			'Accessibility',
			'Accordion',
			'Autocomplete',
			'Button',
			'Card',
			'Color Picker',
			'Data Grid',
			'Dropdown',
			'Modal',
			'Typography',
		];
	}

	_filter(query) {
		const lower = query.trim().toLowerCase();
		if (!lower) {
			this._filtered = [...this._items];
		} else {
			this._filtered = this._items.filter((item) =>
				item.toLowerCase().includes(lower),
			);
		}
		this._activeIndex = -1;
		this._renderList();
	}

	_renderList() {
		this._list.innerHTML = '';

		if (!this._filtered.length) {
			const li = document.createElement('li');
			li.className = 'item empty';
			li.textContent = 'No matches';
			li.setAttribute('part', 'item empty');
			this._list.append(li);
			return;
		}

		this._filtered.forEach((item, index) => {
			const li = document.createElement('li');
			li.className = 'item';
			li.textContent = item;
			li.role = 'option';
			li.id = `ac-opt-${index}`;
			li.setAttribute('part', 'item');
			li.addEventListener('mousedown', (event) => {
				event.preventDefault();
				this._select(item);
			});
			this._list.append(li);
		});
	}

	_moveActive(step) {
		if (!this._filtered.length) {
			return;
		}

		const next = this._activeIndex + step;
		if (next < 0) {
			this._activeIndex = this._filtered.length - 1;
		} else if (next >= this._filtered.length) {
			this._activeIndex = 0;
		} else {
			this._activeIndex = next;
		}

		const items = [...this.shadowRoot.querySelectorAll('.item:not(.empty)')];
		items.forEach((itemEl, idx) => {
			itemEl.classList.toggle('active', idx === this._activeIndex);
		});

		const activeEl = items[this._activeIndex];
		if (activeEl) {
			this._input.setAttribute('aria-activedescendant', activeEl.id);
			activeEl.scrollIntoView({ block: 'nearest' });
		}
	}

	_select(value) {
		this._input.value = value;
		this._closeList();
		this.dispatchEvent(
			new CustomEvent('bf-select', {
				bubbles: true,
				composed: true,
				detail: { value },
			}),
		);
	}

	_openList() {
		this._listOpen = true;
		this._input.setAttribute('aria-expanded', 'true');
		this._list.hidden = false;
	}

	_closeList() {
		this._listOpen = false;
		this._activeIndex = -1;
		this._input.setAttribute('aria-expanded', 'false');
		this._input.removeAttribute('aria-activedescendant');
		this._list.hidden = true;
		this.shadowRoot.querySelectorAll('.item.active').forEach((itemEl) => {
			itemEl.classList.remove('active');
		});
	}

	_onDocumentClick(event) {
		if (!this.contains(event.target) && !this.shadowRoot.contains(event.target)) {
			this._closeList();
		}
	}
}

customElements.define('bf-autocomplete', BfAutocomplete);
