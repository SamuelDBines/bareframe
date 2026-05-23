import { Component, Element, Host, h } from '@stencil/core';

type Crumb = {
	label: string;
	href: string;
	current: boolean;
	ellipsis?: boolean;
};

@Component({
	tag: 'bf-breadcrumb',
	styleUrl: 'bf-breadcrumb.css',
	shadow: true,
})
export class BfBreadcrumb {
	@Element() el!: HTMLElement;
	private slotRef?: HTMLSlotElement;
	private mo?: MutationObserver;

	connectedCallback() {
		this.mo = new MutationObserver(() => this.renderList());
		this.mo.observe(this.el, { childList: true, subtree: true, characterData: true });
		this.attrMo = new MutationObserver(() => this.renderList());
		this.attrMo.observe(this.el, { attributes: true });
	}

	private onSlotChange = () => {
		this.renderList();
	};

	private variant(): string {
		const value = (this.el.getAttribute('variant') || 'default').toLowerCase();
		if (['default', 'pills', 'minimal'].includes(value)) {
			return value;
		}
		return 'default';
	}

	private separatorText(): string {
		const icon = this.el.getAttribute('separator-icon');
		if (icon) {
			return icon;
		}
		const raw = this.el.getAttribute('separator');
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

	private max(): number {
		const parsed = Number.parseInt(this.el.getAttribute('max') || '', 10);
		if (Number.isFinite(parsed) && parsed >= 2) {
			return parsed;
		}
		return Infinity;
	}

	private itemsFromDom(): Crumb[] {
		const items: Crumb[] = [];
		const children = Array.from(this.el.children);
		for (const child of children) {
			const text = child.textContent?.trim();
			if (!text) {
				continue;
			}
			const isLink = child.tagName.toLowerCase() === 'a' && child.getAttribute('href');
			items.push({
				label: text,
				href: isLink ? child.getAttribute('href') || '' : '',
				current: child.hasAttribute('current'),
			});
		}
		return items;
	}

	private applyCollapse(items: Crumb[]): Crumb[] {
		const max = this.max();
		if (max === Infinity || items.length <= max || max < 3) {
			return items;
		}
		const head = items[0];
		const tailCount = max - 2;
		const tail = items.slice(items.length - tailCount);
		return [
			head,
			{ label: '...', href: '', current: false, ellipsis: true },
			...tail,
		];
	}

	private renderList() {
		const list = this.el.shadowRoot?.querySelector('.list');
		const root = this.el.shadowRoot?.querySelector('.root');
		if (!(list instanceof HTMLElement) || !(root instanceof HTMLElement)) {
			return;
		}
		const items = this.applyCollapse(this.itemsFromDom());
		root.setAttribute('data-variant', this.variant());

		list.replaceChildren();
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
				sep.textContent = this.separatorText();
				li.append(sep);
			}
			list.append(li);
		});
	}

	private attrMo?: MutationObserver;

	componentDidLoad() {
		this.slotRef?.addEventListener('slotchange', this.onSlotChange);
		this.renderList();
	}

	disconnectedCallback() {
		this.attrMo?.disconnect();
		this.mo?.disconnect();
		this.slotRef?.removeEventListener('slotchange', this.onSlotChange);
	}

	componentDidRender() {
		this.renderList();
	}

	render() {
		return (
			<Host>
				<nav class="root" part="root" aria-label="Breadcrumb">
					<ol class="list" part="list"></ol>
					<span hidden>
						<slot ref={(el) => (this.slotRef = el as HTMLSlotElement)} />
					</span>
				</nav>
			</Host>
		);
	}
}
