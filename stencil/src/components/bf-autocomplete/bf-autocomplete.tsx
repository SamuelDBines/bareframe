import { Component, Element, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-autocomplete',
	styleUrl: 'bf-autocomplete.css',
	shadow: true,
})
export class BfAutocomplete {
	@Element() el!: HTMLElement;

	private booted = false;

	private listId = `ac-list-${Math.random().toString(36).slice(2, 10)}`;

	private items: string[] = [];

	private filtered: string[] = [];

	private activeIndex = -1;

	private listOpen = false;

	private observer?: MutationObserver;

	private inputEl?: HTMLInputElement;

	private listEl?: HTMLElement | null;

	private boundDocClick = (event: MouseEvent) => this.onDocumentClick(event);

	connectedCallback() {
		document.addEventListener('click', this.boundDocClick);
		this.observer = new MutationObserver(() => {
			this.refreshFromAttrs();
		});
		this.observer.observe(this.el, {
			attributes: true,
			attributeFilter: ['options', 'options-csv'],
		});
	}

	disconnectedCallback() {
		document.removeEventListener('click', this.boundDocClick);
		this.observer?.disconnect();
	}

	private refreshFromAttrs() {
		this.cacheDom();
		this.setItemsFromAttributes();
		this.filtered = [...this.items];
		this.renderList();
	}

	private cacheDom() {
		const sr = this.el.shadowRoot;
		this.inputEl = sr?.querySelector('.input') ?? undefined;
		this.listEl = sr?.querySelector('.list') ?? null;
	}

	private setItemsFromAttributes() {
		const json = this.el.getAttribute('options');
		if (json) {
			try {
				const parsed = JSON.parse(json);
				if (Array.isArray(parsed)) {
					this.items = parsed.map((item) => String(item));
					return;
				}
			} catch {
				//
			}
		}

		const csv = this.el.getAttribute('options-csv');
		if (csv) {
			this.items = csv
				.split(',')
				.map((part) => part.trim())
				.filter(Boolean);
			return;
		}

		this.items = [
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

	private filter(query: string) {
		const lower = query.trim().toLowerCase();
		if (!lower) {
			this.filtered = [...this.items];
		} else {
			this.filtered = this.items.filter((item) =>
				item.toLowerCase().includes(lower),
			);
		}
		this.activeIndex = -1;
		this.renderList();
	}

	private renderList() {
		const list = this.listEl ?? this.el.shadowRoot?.querySelector('.list');
		const input = this.inputEl ?? this.el.shadowRoot?.querySelector('.input');
		if (!(list instanceof HTMLElement) || !(input instanceof HTMLInputElement)) {
			return;
		}
		list.innerHTML = '';

		if (!this.filtered.length) {
			const li = document.createElement('li');
			li.className = 'item empty';
			li.textContent = 'No matches';
			li.setAttribute('part', 'item empty');
			list.append(li);
			return;
		}

		this.filtered.forEach((item, index) => {
			const li = document.createElement('li');
			li.className = 'item';
			li.textContent = item;
			li.role = 'option';
			li.id = `ac-opt-${index}`;
			li.setAttribute('part', 'item');
			li.onmousedown = (event) => {
				event.preventDefault();
				this.select(item);
			};
			list.append(li);
		});
		input.setAttribute('aria-controls', this.listId);
	}

	private moveActive(step: number) {
		if (!this.filtered.length || !this.inputEl) {
			return;
		}

		const next = this.activeIndex + step;
		if (next < 0) {
			this.activeIndex = this.filtered.length - 1;
		} else if (next >= this.filtered.length) {
			this.activeIndex = 0;
		} else {
			this.activeIndex = next;
		}

		const sr = this.el.shadowRoot;
		const els = Array.from(sr?.querySelectorAll('.item:not(.empty)') ?? []);
		els.forEach((itemEl, idx) => {
			itemEl.classList.toggle('active', idx === this.activeIndex);
		});

		const activeEl = els[this.activeIndex];
		if (activeEl instanceof HTMLElement) {
			this.inputEl.setAttribute('aria-activedescendant', activeEl.id);
			activeEl.scrollIntoView({ block: 'nearest' });
		}
	}

	private select(value: string) {
		const input = this.inputEl ?? this.el.shadowRoot?.querySelector('.input');
		if (input instanceof HTMLInputElement) {
			input.value = value;
		}
		this.closeList();
		this.el.dispatchEvent(
			new CustomEvent('bf-select', {
				bubbles: true,
				composed: true,
				detail: { value },
			}),
		);
	}

	private openList() {
		const input = this.inputEl ?? this.el.shadowRoot?.querySelector('.input');
		const list = this.listEl ?? this.el.shadowRoot?.querySelector('.list');
		if (!(input instanceof HTMLInputElement) || !(list instanceof HTMLElement)) {
			return;
		}
		this.listOpen = true;
		input.setAttribute('aria-expanded', 'true');
		list.hidden = false;
	}

	private closeList() {
		const input = this.inputEl ?? this.el.shadowRoot?.querySelector('.input');
		const list = this.listEl ?? this.el.shadowRoot?.querySelector('.list');
		if (!(input instanceof HTMLInputElement) || !(list instanceof HTMLElement)) {
			return;
		}
		this.listOpen = false;
		this.activeIndex = -1;
		input.setAttribute('aria-expanded', 'false');
		input.removeAttribute('aria-activedescendant');
		list.hidden = true;
		this.el.shadowRoot?.querySelectorAll('.item.active').forEach((itemEl) => {
			itemEl.classList.remove('active');
		});
	}

	private onDocumentClick(event: MouseEvent) {
		const path = event.composedPath();
		if (!path.includes(this.el)) {
			this.closeList();
		}
	}

	private bindInputOnce() {
		const input = this.el.shadowRoot?.querySelector('.input');
		const list = this.el.shadowRoot?.querySelector('.list');
		if (
			input instanceof HTMLInputElement &&
			list instanceof HTMLElement &&
			input.dataset.bfBound !== 'true'
		) {
			input.dataset.bfBound = 'true';
			this.inputEl = input;
			this.listEl = list;
			input.addEventListener('focus', () => {
				this.filter(input.value);
				this.openList();
			});
			input.addEventListener('input', () => {
				const text = input.value;
				this.filter(text);
				this.openList();
				this.el.dispatchEvent(
					new CustomEvent('bf-change', {
						bubbles: true,
						composed: true,
						detail: { value: text },
					}),
				);
			});
			input.addEventListener('keydown', (event) => {
				if (!this.listOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
					this.openList();
				}

				if (event.key === 'ArrowDown') {
					event.preventDefault();
					this.moveActive(1);
				}

				if (event.key === 'ArrowUp') {
					event.preventDefault();
					this.moveActive(-1);
				}

				if (event.key === 'Enter' && this.activeIndex >= 0) {
					event.preventDefault();
					const item = this.filtered[this.activeIndex];
					if (item) {
						this.select(item);
					}
				}

				if (event.key === 'Escape') {
					this.closeList();
				}
			});
		}
	}

	componentDidRender() {
		this.bindInputOnce();
		this.cacheDom();
		const ph = this.el.getAttribute('placeholder') || 'Search...';
		const val = this.el.getAttribute('value') || '';
		if (this.inputEl) {
			this.inputEl.placeholder = ph;
			this.inputEl.setAttribute('autocomplete', 'off');
			this.inputEl.setAttribute('spellcheck', 'false');
			this.inputEl.setAttribute('role', 'combobox');
			if (!this.booted) {
				this.inputEl.value = val;
			}
			this.inputEl.setAttribute('aria-controls', this.listId);
			this.inputEl.setAttribute('aria-expanded', String(this.listOpen));
		}
		if (this.listEl) {
			this.listEl.id = this.listId;
			this.listEl.setAttribute('role', 'listbox');
			this.listEl.hidden = !this.listOpen;
		}
		if (!this.booted) {
			this.booted = true;
			this.refreshFromAttrs();
		}
	}

	render() {
		const placeholder = this.el.getAttribute('placeholder') || 'Search...';

		return (
			<Host>
				<div class="root" part="root">
					<input
						class="input"
						part="input"
						type="text"
						placeholder={placeholder}
						autocomplete="off"
						spellcheck={false}
						role="combobox"
						aria-expanded="false"
						aria-controls={this.listId}
						aria-autocomplete="list"
					/>
					<ul class="list" part="list" id={this.listId} role="listbox" hidden />
				</div>
			</Host>
		);
	}
}
