import { Component, Element, Host, Method, h } from '@stencil/core';

@Component({
	tag: 'bf-menu',
	styleUrl: 'bf-menu.css',
	shadow: true,
})
export class BfMenu {
	@Element() el!: HTMLElement;
	private observer?: MutationObserver;
	private attrObserver?: MutationObserver;
	private ctxHandler?: (e: MouseEvent) => void;
	private ctxTarget?: EventTarget | null;

	connectedCallback() {
		document.addEventListener('click', this.onDocumentClick);
		this.observer = new MutationObserver(() => this.bindContextTarget());
		this.observer.observe(this.el, {
			childList: true,
			subtree: true,
			characterData: true,
			attributes: true,
			attributeFilter: ['variant', 'context', 'for', 'open', 'x', 'y'],
		});
		this.attrObserver = new MutationObserver(() => this.sync());
		this.attrObserver.observe(this.el, {
			attributes: true,
			attributeFilter: ['variant', 'open', 'x', 'y', 'context', 'for'],
		});
		this.bindContextTarget();
	}

	disconnectedCallback() {
		document.removeEventListener('click', this.onDocumentClick);
		this.observer?.disconnect();
		this.attrObserver?.disconnect();
		this.unbindCtx();
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

	private isContextMode(): boolean {
		const variant = (this.el.getAttribute('variant') || '').toLowerCase();
		return variant === 'context' || this.el.hasAttribute('context');
	}

	private unbindCtx() {
		if (
			this.ctxTarget &&
			this.ctxTarget instanceof HTMLElement &&
			this.ctxHandler
		) {
			this.ctxTarget.removeEventListener('contextmenu', this.ctxHandler);
		}
		this.ctxTarget = null;
		this.ctxHandler = undefined;
	}

	private bindContextTarget() {
		this.unbindCtx();
		if (!this.isContextMode()) {
			return;
		}
		const targetId = this.el.getAttribute('for');
		this.ctxTarget = targetId
			? document.getElementById(targetId)
			: this.el.parentElement;
		if (!(this.ctxTarget instanceof HTMLElement)) {
			return;
		}
		this.ctxHandler = (event: MouseEvent) => {
			event.preventDefault();
			this.el.setAttribute('x', `${event.clientX}`);
			this.el.setAttribute('y', `${event.clientY}`);
			this.el.setAttribute('open', '');
			this.sync();
		};
		this.ctxTarget.addEventListener('contextmenu', this.ctxHandler);
	}

	private onDocumentClick = (event: MouseEvent) => {
		if (!this.isContextMode() || !this.el.hasAttribute('open')) {
			return;
		}
		const path = event.composedPath();
		if (path.includes(this.el)) {
			return;
		}
		this.el.removeAttribute('open');
	};

	private onSlotChange = () => {
		const slot = this.el.shadowRoot?.querySelector('slot');
		if (!(slot instanceof HTMLSlotElement)) {
			return;
		}
		const items = slot
			.assignedElements({ flatten: true })
			.filter((element) => element.hasAttribute('item'));

		items.forEach((item, index) => {
			const elitem = item as HTMLElement;
			elitem.setAttribute('role', elitem.getAttribute('role') || 'menuitem');
			if (!elitem.hasAttribute('tabindex')) {
				elitem.setAttribute('tabindex', '0');
			}
			if (elitem.dataset.bfMenuBound === 'true') {
				return;
			}
			elitem.dataset.bfMenuBound = 'true';
			elitem.addEventListener('click', () => this.emitSelect(elitem, index));
			elitem.addEventListener('keydown', (event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					this.emitSelect(elitem, index);
				}
			});
		});
	};

	private emitSelect(item: HTMLElement, index: number) {
		this.el.dispatchEvent(
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
		if (this.isContextMode()) {
			this.el.removeAttribute('open');
		}
	}

	private sync() {
		const root = this.el.shadowRoot?.querySelector('.root');
		if (!(root instanceof HTMLElement)) {
			return;
		}
		const context = this.isContextMode();
		root.setAttribute('data-variant', context ? 'context' : 'menu');
		root.setAttribute('data-open', this.el.hasAttribute('open') ? 'true' : 'false');
		if (context) {
			this.el.style.position = 'fixed';
			this.el.style.left = `${Number.parseFloat(this.el.getAttribute('x') || '0') || 0}px`;
			this.el.style.top = `${Number.parseFloat(this.el.getAttribute('y') || '0') || 0}px`;
			this.el.style.zIndex = '1300';
		} else {
			this.el.style.position = '';
			this.el.style.left = '';
			this.el.style.top = '';
			this.el.style.zIndex = '';
		}
	}

	componentDidRender() {
		this.sync();
	}

	render() {
		return (
			<Host>
				<div class="root" part="root">
					<slot onSlotchange={this.onSlotChange} />
				</div>
			</Host>
		);
	}
}
