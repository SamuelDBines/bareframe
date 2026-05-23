import { Component, Element, Host, Method, h } from '@stencil/core';

@Component({
	tag: 'bf-dropdown',
	styleUrl: 'bf-dropdown.css',
	shadow: true,
})
export class BfDropdown {
	@Element() el!: HTMLElement;
	private observer?: MutationObserver;

	private toggleEl?: HTMLElement;

	private menuEl?: HTMLElement | null;

	private triggerSlotEl?: HTMLSlotElement | null;

	private contentSlotEl?: HTMLSlotElement | null;

	private boundDocClick = this.onDocumentClick.bind(this);

	connectedCallback() {
		document.addEventListener('click', this.boundDocClick);
		this.observer = new MutationObserver(() => this.syncDom());
		this.observer.observe(this.el, {
			attributes: true,
			attributeFilter: ['open', 'position', 'border'],
		});
	}

	disconnectedCallback() {
		document.removeEventListener('click', this.boundDocClick);
		this.observer?.disconnect();
	}

	@Method()
	async open(): Promise<void> {
		this.el.setAttribute('open', '');
	}

	@Method()
	async close(): Promise<void> {
		this.el.removeAttribute('open');
	}

	@Method()
	async toggle(): Promise<void> {
		if (this.el.hasAttribute('open')) {
			await this.close();
			return;
		}
		await this.open();
	}

	private assignSlots() {
		const cs = this.contentSlotEl;
		const ts = this.triggerSlotEl;
		if (!cs || !ts) {
			return;
		}
		const candidates = Array.from(this.el.children).filter(
			(element) => element.nodeType === Node.ELEMENT_NODE,
		);
		if (!candidates.length) {
			return;
		}
		const hasTrigger = candidates.some((e) => e.getAttribute('slot') === 'trigger');
		const hasContent = candidates.some((e) => e.getAttribute('slot') === 'content');
		if (!hasTrigger) {
			candidates[0].setAttribute('slot', 'trigger');
		}
		if (!hasContent) {
			for (let i = 1; i < candidates.length; i += 1) {
				candidates[i].setAttribute('slot', 'content');
			}
		}
	}

	private actionableItemsComputed(): HTMLElement[] {
		const root = this.contentSlotEl ?? this.el.shadowRoot?.querySelector('slot[name="content"]');
		if (!(root instanceof HTMLSlotElement)) {
			return [];
		}
		this.contentSlotEl = root;
		const assigned = root.assignedElements({ flatten: true });
		const items: HTMLElement[] = [];
		for (const element of Array.from(assigned)) {
			if (!(element instanceof HTMLElement)) {
				continue;
			}
			if (
				element.matches(
					'a,button,[item],[role="menuitem"],[tabindex]',
				)
			) {
				items.push(element);
			}
			items.push(
				...Array.from(
					element.querySelectorAll(
						'a,button,[item],[role="menuitem"],[tabindex]',
					),
				) as HTMLElement[],
			);
		}
		return items;
	}

	private decorateItems() {
		const items = this.actionableItemsComputed();
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

	private focusFirstItem() {
		const items = this.actionableItemsComputed();
		const first = items.find((item) => !item.hasAttribute('disabled'));
		first?.focus();
	}

	private emitSelect(target: HTMLElement) {
		const value =
			target.getAttribute('value') || target.textContent?.trim() || '';
		this.el.dispatchEvent(
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

	private onContentClick = (event: Event) => {
		const from = event.target;
		if (!from || (from as Node).nodeType !== Node.ELEMENT_NODE) {
			return;
		}
		const closest = (from as Element).closest('[data-bf-dropdown-item]');
		if (!(closest instanceof HTMLElement)) {
			return;
		}
		this.emitSelect(closest);
		void this.close();
	};

	private onToggleClick = () => {
		void this.toggle();
		if (this.el.hasAttribute('open')) {
			requestAnimationFrame(() => this.focusFirstItem());
		}
	};

	private onDocumentClick(event: MouseEvent) {
		if (!this.el.hasAttribute('open')) {
			return;
		}
		const path = event.composedPath();
		if (path.includes(this.el)) {
			return;
		}
		void this.close();
	}

	private onKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			void this.toggle();
			if (this.el.hasAttribute('open')) {
				requestAnimationFrame(() => this.focusFirstItem());
			}
			return;
		}
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			void this.open();
			requestAnimationFrame(() => this.focusFirstItem());
			return;
		}
		if (event.key === 'Escape') {
			void this.close();
			const t =
				this.toggleEl ?? this.el.shadowRoot?.querySelector('.toggle');
			(t as HTMLElement)?.focus();
		}
	};

	private onSlotChange = () => {
		this.assignSlots();
		this.decorateItems();
	};

	private position(): string {
		const value = (this.el.getAttribute('position') || 'bottom-start').toLowerCase();
		if (['bottom-start', 'bottom-end', 'top-start', 'top-end'].includes(value)) {
			return value;
		}
		return 'bottom-start';
	}

	private syncDom() {
		const root =
			this.el.shadowRoot?.querySelector('.root') ?? undefined;
		const toggle =
			this.toggleEl ?? this.el.shadowRoot?.querySelector('.toggle');
		const menu = this.menuEl ?? this.el.shadowRoot?.querySelector('.menu');

		this.toggleEl = toggle instanceof HTMLElement ? toggle : undefined;
		this.menuEl = menu instanceof HTMLElement ? menu : null;

		if (!(root instanceof HTMLElement) || !(toggle instanceof HTMLElement) || !(menu instanceof HTMLElement)) {
			return;
		}

		const open = this.el.hasAttribute('open');
		root.setAttribute('data-open', open ? 'true' : 'false');
		root.setAttribute('data-position', this.position());
		root.setAttribute('data-bordered', this.el.hasAttribute('border') ? 'true' : 'false');
		toggle.setAttribute('aria-expanded', String(open));
		toggle.setAttribute('aria-pressed', String(open));
		menu.hidden = !open;
	}

	private bindChromeOnce() {
		const sr = this.el.shadowRoot;
		const toggle = sr?.querySelector('.toggle');
		const menu = sr?.querySelector('.menu');
		const ts = sr?.querySelector('slot[name="trigger"]');
		const cs = sr?.querySelector('slot[name="content"]');
		this.triggerSlotEl = ts instanceof HTMLSlotElement ? ts : null;
		this.contentSlotEl = cs instanceof HTMLSlotElement ? cs : null;

		if (toggle instanceof HTMLElement && toggle.dataset.bfBound !== 'true') {
			toggle.dataset.bfBound = 'true';
			toggle.addEventListener('click', this.onToggleClick);
			toggle.addEventListener('keydown', this.onKeyDown);
			this.toggleEl = toggle;
		}
		if (menu instanceof HTMLElement && menu.dataset.bfBound !== 'true') {
			menu.dataset.bfBound = 'true';
			menu.addEventListener('click', this.onContentClick);
			this.menuEl = menu;
		}
		if (ts instanceof HTMLSlotElement && ts.dataset.bfSlotBound !== 'true') {
			ts.dataset.bfSlotBound = 'true';
			ts.addEventListener('slotchange', this.onSlotChange);
		}
		if (cs instanceof HTMLSlotElement && cs.dataset.bfSlotBound !== 'true') {
			cs.dataset.bfSlotBound = 'true';
			cs.addEventListener('slotchange', this.onSlotChange);
		}
	}

	componentDidRender() {
		this.bindChromeOnce();
		this.assignSlots();
		this.decorateItems();
		this.syncDom();
	}

	render() {
		return (
			<Host>
				<div class="root" part="root">
					<div
						class="toggle"
						part="toggle"
						role="button"
						tabIndex={0}
						aria-haspopup="menu"
						aria-expanded="false">
						<span class="toggle-label">
							<slot name="trigger">Open</slot>
						</span>
						<span class="caret" aria-hidden="true">
							▾
						</span>
					</div>
					<div class="menu" part="menu" role="menu">
						<slot name="content" />
					</div>
				</div>
			</Host>
		);
	}
}
