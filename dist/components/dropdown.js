class BfDropdown extends HTMLElement {
	static observedAttributes = ['open', 'position'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._onToggleClick = this._onToggleClick.bind(this);
		this._onDocumentClick = this._onDocumentClick.bind(this);
		this._onKeyDown = this._onKeyDown.bind(this);
		this._onContentClick = this._onContentClick.bind(this);
		this._onSlotChange = this._onSlotChange.bind(this);
	}

	connectedCallback() {
		if (this._initialized) {
			this._sync();
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./dropdown.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('div');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = `
			<div class="toggle" part="toggle" role="button" tabindex="0" aria-haspopup="menu" aria-expanded="false">
				<span class="toggle-label"><slot name="trigger">Open</slot></span>
				<span class="caret" aria-hidden="true">▾</span>
			</div>
			<div class="menu" part="menu" role="menu">
				<slot name="content"></slot>
			</div>
		`;

		this.shadowRoot.replaceChildren(link, root);
		this._root = root;
		this._toggle = root.querySelector('.toggle');
		this._menu = root.querySelector('.menu');
		this._triggerSlot = root.querySelector('slot[name="trigger"]');
		this._contentSlot = root.querySelector('slot[name="content"]');

		this._toggle.addEventListener('click', this._onToggleClick);
		this._toggle.addEventListener('keydown', this._onKeyDown);
		this._menu.addEventListener('click', this._onContentClick);
		this._triggerSlot.addEventListener('slotchange', this._onSlotChange);
		this._contentSlot.addEventListener('slotchange', this._onSlotChange);
		document.addEventListener('click', this._onDocumentClick);

		this._assignSlots();
		this._decorateItems();
		this._sync();
	}

	disconnectedCallback() {
		document.removeEventListener('click', this._onDocumentClick);
		if (this._toggle) {
			this._toggle.removeEventListener('click', this._onToggleClick);
			this._toggle.removeEventListener('keydown', this._onKeyDown);
		}
		if (this._menu) {
			this._menu.removeEventListener('click', this._onContentClick);
		}
		if (this._triggerSlot) {
			this._triggerSlot.removeEventListener('slotchange', this._onSlotChange);
		}
		if (this._contentSlot) {
			this._contentSlot.removeEventListener('slotchange', this._onSlotChange);
		}
	}

	attributeChangedCallback() {
		this._sync();
	}

	open() {
		this.setAttribute('open', '');
	}

	close() {
		this.removeAttribute('open');
	}

	toggle() {
		if (this.hasAttribute('open')) {
			this.close();
			return;
		}
		this.open();
	}

	_onSlotChange() {
		this._assignSlots();
		this._decorateItems();
	}

	_assignSlots() {
		const candidates = [...this.children].filter(
			(element) => element.nodeType === Node.ELEMENT_NODE,
		);
		if (!candidates.length) {
			return;
		}
		const hasTrigger = candidates.some((el) => el.getAttribute('slot') === 'trigger');
		const hasContent = candidates.some((el) => el.getAttribute('slot') === 'content');
		if (!hasTrigger) {
			candidates[0].setAttribute('slot', 'trigger');
		}
		if (!hasContent) {
			for (let i = 1; i < candidates.length; i += 1) {
				candidates[i].setAttribute('slot', 'content');
			}
		}
	}

	_actionableItems() {
		const assigned = this._contentSlot?.assignedElements({ flatten: true }) || [];
		const items = [];
		for (const element of assigned) {
			if (element.matches?.('a,button,[item],[role="menuitem"],[tabindex]')) {
				items.push(element);
			}
			items.push(
				...element.querySelectorAll(
					'a,button,[item],[role="menuitem"],[tabindex]',
				),
			);
		}
		return items;
	}

	_decorateItems() {
		const items = this._actionableItems();
		for (const item of items) {
			item.setAttribute('data-bf-dropdown-item', '');
			if (item.hasAttribute('item') && !item.hasAttribute('role')) {
				item.setAttribute('role', 'menuitem');
			}
			if (!item.hasAttribute('tabindex')) {
				item.setAttribute('tabindex', '0');
			}
			if (item.dataset.bfDropdownStyled !== 'true') {
				item.style.display = 'flex';
				item.style.alignItems = 'center';
				item.style.width = '100%';
				item.style.gap = '0.45rem';
				item.style.border = '0';
				item.style.background = 'transparent';
				item.style.borderRadius = '0.4rem';
				item.style.padding = '0.5rem 0.6rem';
				item.style.cursor = 'pointer';
				item.style.textAlign = 'left';
				item.style.font = 'inherit';
				item.style.color = 'inherit';
				item.style.textDecoration = 'none';
				item.dataset.bfDropdownStyled = 'true';
			}
		}
	}

	_focusFirstItem() {
		const items = this._actionableItems();
		const first = items.find((item) => !item.hasAttribute('disabled'));
		first?.focus();
	}

	_emitSelect(target) {
		const value = target.getAttribute('value') || target.textContent?.trim() || '';
		this.dispatchEvent(
			new CustomEvent('bf-select', {
				bubbles: true,
				composed: true,
				detail: {
					id: target.id || '',
					value,
				},
			}),
		);
	}

	_onContentClick(event) {
		const target = event.target instanceof Element
			? event.target.closest('[data-bf-dropdown-item]')
			: null;
		if (!target) {
			return;
		}
		this._emitSelect(target);
		this.close();
	}

	_onToggleClick() {
		this.toggle();
		if (this.hasAttribute('open')) {
			requestAnimationFrame(() => this._focusFirstItem());
		}
	}

	_onDocumentClick(event) {
		if (!this.hasAttribute('open')) {
			return;
		}
		const path = event.composedPath();
		if (path.includes(this)) {
			return;
		}
		this.close();
	}

	_onKeyDown(event) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			this.toggle();
			if (this.hasAttribute('open')) {
				requestAnimationFrame(() => this._focusFirstItem());
			}
			return;
		}
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			this.open();
			requestAnimationFrame(() => this._focusFirstItem());
			return;
		}
		if (event.key === 'Escape') {
			this.close();
			this._toggle?.focus();
		}
	}

	_position() {
		const value = (this.getAttribute('position') || 'bottom-start').toLowerCase();
		if (
			['bottom-start', 'bottom-end', 'top-start', 'top-end'].includes(value)
		) {
			return value;
		}
		return 'bottom-start';
	}

	_sync() {
		if (!this._root || !this._toggle || !this._menu) {
			return;
		}
		const open = this.hasAttribute('open');
		this._root.setAttribute('data-open', open ? 'true' : 'false');
		this._root.setAttribute('data-position', this._position());
		this._toggle.setAttribute('aria-expanded', String(open));
		this._toggle.setAttribute('aria-pressed', String(open));
		this._menu.hidden = !open;
	}
}

customElements.define('bf-dropdown', BfDropdown);
