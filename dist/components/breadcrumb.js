class BfBreadcrumb extends HTMLElement {
	static observedAttributes = ['variant', 'separator', 'separator-icon', 'max'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._onSlotChange = this._onSlotChange.bind(this);
	}

	connectedCallback() {
		if (this._initialized) {
			this._render();
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./breadcrumb.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('nav');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.setAttribute('aria-label', 'Breadcrumb');
		root.innerHTML = `
			<ol class="list" part="list"></ol>
			<slot hidden></slot>
		`;

		this.shadowRoot.replaceChildren(link, root);
		this._root = root;
		this._list = root.querySelector('.list');
		this._slot = root.querySelector('slot');
		this._slot.addEventListener('slotchange', this._onSlotChange);
		this._render();
	}

	attributeChangedCallback() {
		this._render();
	}

	_onSlotChange() {
		this._render();
	}

	_variant() {
		const value = (this.getAttribute('variant') || 'default').toLowerCase();
		if (['default', 'pills', 'minimal'].includes(value)) {
			return value;
		}
		return 'default';
	}

	_separatorText() {
		const icon = this.getAttribute('separator-icon');
		if (icon) {
			return icon;
		}
		const raw = this.getAttribute('separator');
		if (!raw) {
			return '›';
		}
		const value = raw.toLowerCase();
		if (value === 'chevron') {
			return '›';
		}
		if (value === 'slash') {
			return '/';
		}
		if (value === 'dot') {
			return '•';
		}
		if (value === 'pipe') {
			return '|';
		}
		return raw;
	}

	_max() {
		const parsed = Number.parseInt(this.getAttribute('max') || '', 10);
		if (Number.isFinite(parsed) && parsed >= 2) {
			return parsed;
		}
		return Infinity;
	}

	_itemsFromDom() {
		const items = [];
		const children = [...this.children];
		for (const child of children) {
			const text = child.textContent?.trim();
			if (!text) {
				continue;
			}
			const isLink = child.tagName.toLowerCase() === 'a' && child.getAttribute('href');
			items.push({
				label: text,
				href: isLink ? child.getAttribute('href') : '',
				current: child.hasAttribute('current'),
			});
		}
		return items;
	}

	_applyCollapse(items) {
		const max = this._max();
		if (max === Infinity || items.length <= max || max < 3) {
			return items;
		}
		const head = items[0];
		const tailCount = max - 2;
		const tail = items.slice(items.length - tailCount);
		return [head, { label: '...', href: '', current: false, ellipsis: true }, ...tail];
	}

	_render() {
		if (!this._list || !this._root) {
			return;
		}
		const items = this._applyCollapse(this._itemsFromDom());
		this._root.setAttribute('data-variant', this._variant());

		this._list.replaceChildren();
		if (!items.length) {
			return;
		}

		items.forEach((item, index) => {
			const li = document.createElement('li');
			li.className = 'item';
			if (item.ellipsis) {
				const span = document.createElement('span');
				span.className = 'ellipsis';
				span.textContent = item.label;
				li.append(span);
			} else if (item.href && !item.current) {
				const link = document.createElement('a');
				link.href = item.href;
				link.textContent = item.label;
				li.append(link);
			} else {
				const span = document.createElement('span');
				span.className = item.current || index === items.length - 1 ? 'current' : '';
				span.textContent = item.label;
				if (item.current || index === items.length - 1) {
					span.setAttribute('aria-current', 'page');
				}
				li.append(span);
			}
			if (index < items.length - 1) {
				const sep = document.createElement('span');
				sep.className = 'separator';
				sep.textContent = this._separatorText();
				li.append(sep);
			}
			this._list.append(li);
		});
	}
}

customElements.define('bf-breadcrumb', BfBreadcrumb);
