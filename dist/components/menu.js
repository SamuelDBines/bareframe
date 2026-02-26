class BfMenu extends HTMLElement {
	static observedAttributes = ['variant', 'context', 'open', 'x', 'y', 'for'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._onSlotChange = this._onSlotChange.bind(this);
		this._onDocumentClick = this._onDocumentClick.bind(this);
	}

	connectedCallback() {
		if (this._initialized) {
			this._sync();
			this._onSlotChange();
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./menu.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('div');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = '<slot></slot>';


		this.shadowRoot.replaceChildren(link, root);
		this._root = root;
		this._slot = root.querySelector('slot');
		this._slot.addEventListener('slotchange', this._onSlotChange);
		this._bindContextTarget();
		document.addEventListener('click', this._onDocumentClick);
		this._onSlotChange();
		this._sync();
	}

	disconnectedCallback() {
		document.removeEventListener('click', this._onDocumentClick);
		if (this._contextTarget) {
			this._contextTarget.removeEventListener('contextmenu', this._boundContextMenuHandler);
		}
	}

	attributeChangedCallback(name) {
		if (name === 'for') {
			this._bindContextTarget();
		}
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

	_isContextMode() {
		const variant = (this.getAttribute('variant') || '').toLowerCase();
		return variant === 'context' || this.hasAttribute('context');
	}

	_bindContextTarget() {
		if (!this._isContextMode()) {
			return;
		}
		if (this._contextTarget && this._boundContextMenuHandler) {
			this._contextTarget.removeEventListener('contextmenu', this._boundContextMenuHandler);
		}
		const targetId = this.getAttribute('for');
		this._contextTarget = targetId ? document.getElementById(targetId) : this.parentElement;
		if (!this._contextTarget) {
			return;
		}
		this._boundContextMenuHandler = (event) => {
			event.preventDefault();
			this.setAttribute('x', `${event.clientX}`);
			this.setAttribute('y', `${event.clientY}`);
			this.open();
		};
		this._contextTarget.addEventListener('contextmenu', this._boundContextMenuHandler);
	}

	_onDocumentClick(event) {
		if (!this._isContextMode() || !this.hasAttribute('open')) {
			return;
		}
		const path = event.composedPath();
		if (path.includes(this)) {
			return;
		}
		this.close();
	}

	_onSlotChange() {
		if (!this._slot) {
			return;
		}
		const items = this._slot
			.assignedElements({ flatten: true })
			.filter((element) => element.hasAttribute('item'));

		for (const [index, item] of items.entries()) {
			item.setAttribute('role', item.getAttribute('role') || 'menuitem');
			if (!item.hasAttribute('tabindex')) {
				item.setAttribute('tabindex', '0');
			}
			if (item.dataset.bfMenuBound === 'true') {
				continue;
			}
			item.dataset.bfMenuBound = 'true';
			item.addEventListener('click', () => this._emitSelect(item, index));
			item.addEventListener('keydown', (event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					this._emitSelect(item, index);
				}
			});
		}
	}

	_emitSelect(item, index) {
		this.dispatchEvent(
			new CustomEvent('bf-select', {
				bubbles: true,
				composed: true,
				detail: {
					index,
					id: item.id || '',
					value: item.getAttribute('value') || item.textContent?.trim() || '',
				},
			}),
		);
		if (this._isContextMode()) {
			this.close();
		}
	}

	_sync() {
		if (!this._root) {
			return;
		}
		const context = this._isContextMode();
		this._root.setAttribute('data-variant', context ? 'context' : 'menu');
		this._root.setAttribute('data-open', this.hasAttribute('open') ? 'true' : 'false');
		if (context) {
			this.style.position = 'fixed';
			this.style.left = `${Number.parseFloat(this.getAttribute('x') || '0') || 0}px`;
			this.style.top = `${Number.parseFloat(this.getAttribute('y') || '0') || 0}px`;
			this.style.zIndex = '1300';
		} else {
			this.style.position = '';
			this.style.left = '';
			this.style.top = '';
			this.style.zIndex = '';
		}
	}
}

customElements.define('bf-menu', BfMenu);
