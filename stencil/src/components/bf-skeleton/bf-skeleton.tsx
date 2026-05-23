import { Component, Element, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-skeleton',
	styleUrl: 'bf-skeleton.css',
	shadow: true,
})
export class BfSkeleton {
	@Element() el!: HTMLElement;
	private observer?: MutationObserver;

	connectedCallback() {
		this.observer = new MutationObserver(() => this.apply());
		this.observer.observe(this.el, { attributes: true });
		this.applyHostVars();
		this.apply();
	}

	disconnectedCallback() {
		this.observer?.disconnect();
	}

	private setSizeVar(name: string, value: string | null) {
		if (!value) {
			this.el.style.removeProperty(name);
			return;
		}

		const trimmed = value.trim();
		if (/^-?\d*\.?\d+$/.test(trimmed)) {
			this.el.style.setProperty(name, `${trimmed}px`);
			return;
		}

		this.el.style.setProperty(name, trimmed);
	}

	private applyHostVars() {
		this.setSizeVar('--bf-skeleton-width', this.el.getAttribute('width'));
		this.setSizeVar('--bf-skeleton-height', this.el.getAttribute('height'));
		this.setSizeVar('--bf-skeleton-radius', this.el.getAttribute('radius'));
	}

	private applyLines(root: HTMLElement, lines: number) {
		const linesEl = root.querySelector('.lines');
		if (!(linesEl instanceof HTMLElement)) {
			return;
		}

		const rawVariant = (this.el.getAttribute('variant') || 'text').toLowerCase();
		const variant = rawVariant === 'text' && lines > 1 ? 'paragraph' : rawVariant;
		root.dataset.variant = variant;
		root.dataset.animate = this.el.hasAttribute('static') ? 'off' : 'on';

		if (variant !== 'paragraph') {
			linesEl.replaceChildren();
			return;
		}

		const widths = ['96%', '90%', '94%', '86%', '92%', '84%'];
		const nodes: HTMLSpanElement[] = [];
		for (let i = 0; i < lines; i += 1) {
			const line = document.createElement('span');
			line.className = 'line';
			const width = i === lines - 1 ? '68%' : widths[i % widths.length];
			line.style.width = width;
			nodes.push(line);
		}
		linesEl.replaceChildren(...nodes);
	}

	private apply() {
		this.applyHostVars();
		const root = this.el.shadowRoot?.querySelector('.root');
		if (!(root instanceof HTMLElement)) {
			return;
		}
		const lines = Math.max(1, Number.parseInt(this.el.getAttribute('lines') || '1', 10) || 1);
		this.applyLines(root, lines);
	}

	componentDidRender() {
		this.apply();
	}

	render() {
		return (
			<Host>
				<div class="root" part="root">
					<div class="lines" part="lines"></div>
					<slot />
				</div>
			</Host>
		);
	}
}
