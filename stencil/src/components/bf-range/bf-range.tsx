import { Component, Element, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-range',
	styleUrl: 'bf-range.css',
	shadow: true,
})
export class BfRange {
	@Element() el!: HTMLElement;

	private observer?: MutationObserver;

	connectedCallback() {
		this.observer = new MutationObserver(() => this.sync());
		this.observer.observe(this.el, { attributes: true });
	}

	disconnectedCallback() {
		this.observer?.disconnect();
	}

	private mode(): string {
		const explicit = (this.el.getAttribute('mode') || '').toLowerCase();
		if (['slider', 'range', 'rating'].includes(explicit)) {
			return explicit;
		}
		if (this.el.hasAttribute('rating')) {
			return 'rating';
		}
		if (this.el.hasAttribute('range')) {
			return 'range';
		}
		return 'slider';
	}

	private min(): number {
		const parsed = Number.parseFloat(this.el.getAttribute('min') || '0');
		return Number.isFinite(parsed) ? parsed : 0;
	}

	private max(): number {
		const mn = this.min();
		const parsed = Number.parseFloat(this.el.getAttribute('max') || '100');
		return Number.isFinite(parsed) && parsed > mn ? parsed : mn + 100;
	}

	private step(): number {
		const parsed = Number.parseFloat(this.el.getAttribute('step') || '1');
		return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
	}

	private parseValue(attrName: string, fallback: number) {
		const parsed = Number.parseFloat(this.el.getAttribute(attrName) || `${fallback}`);
		if (!Number.isFinite(parsed)) {
			return fallback;
		}
		return Math.min(this.max(), Math.max(this.min(), parsed));
	}

	private count(): number {
		const parsed = Number.parseInt(this.el.getAttribute('count') || '5', 10);
		return Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
	}

	private setAttr(attrName: string, value: number | string) {
		const next = `${value}`;
		if (this.el.getAttribute(attrName) === next) {
			return;
		}
		this.el.setAttribute(attrName, next);
	}

	private emit(kind: string) {
		const mode = this.mode();
		this.el.dispatchEvent(
			new CustomEvent(kind, {
				bubbles: true,
				composed: true,
				detail:
					mode === 'range'
						? {
								mode,
								value: [
									this.parseValue('low', this.min()),
									this.parseValue('high', this.max()),
								],
							}
						: {
								mode,
								value: this.parseValue('value', this.min()),
							},
			}),
		);
	}

	private onSingle = (event: Event) => {
		const input = event.target as HTMLInputElement;
		this.setAttr('value', input.value);
		this.emit(event.type === 'change' ? 'bf-change' : 'bf-input');
	};

	private onDual = (event: Event) => {
		const tgt = event.target as HTMLInputElement;
		let low = this.parseValue('low', this.min());
		let high = this.parseValue('high', this.max());
		const next = Number.parseFloat(tgt.value);

		if (tgt.classList.contains('dual-low')) {
			low = Math.min(next, high);
		} else {
			high = Math.max(next, low);
		}

		this.setAttr('low', low);
		this.setAttr('high', high);
		this.sync();
		this.emit(event.type === 'change' ? 'bf-change' : 'bf-input');
	};

	private bindOnce(sr: ShadowRoot) {
		const sing = sr.querySelector('.single-input');
		const lo = sr.querySelector('.dual-low');
		const hi = sr.querySelector('.dual-high');
		if (
			sing instanceof HTMLInputElement &&
			sing.dataset.bfBound !== 'true'
		) {
			sing.dataset.bfBound = 'true';
			sing.addEventListener('input', this.onSingle);
			sing.addEventListener('change', this.onSingle);
		}
		[lo, hi].forEach((el) => {
			if (el instanceof HTMLInputElement && el.dataset.bfBound !== 'true') {
				el.dataset.bfBound = 'true';
				el.addEventListener('input', this.onDual);
				el.addEventListener('change', this.onDual);
			}
		});
	}

	private renderRating(root: HTMLElement) {
		const box = root.querySelector('.rating');
		if (!(box instanceof HTMLElement)) {
			return;
		}
		box.replaceChildren();
		const ct = this.count();
		const current = this.parseValue('value', 0);
		const disabled = this.el.hasAttribute('disabled');

		for (let i = 1; i <= ct; i += 1) {
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'star';
			button.textContent = '*';
			button.disabled = disabled;
			button.setAttribute('aria-label', `${i}`);
			if (i <= current) {
				button.classList.add('is-active');
			}
			button.onclick = () => {
				this.setAttr('value', i);
				this.sync();
				this.emit('bf-change');
			};
			box.append(button);
		}
	}

	private dualFill(root: HTMLElement) {
		const fill = root.querySelector('.dual-fill');
		if (!(fill instanceof HTMLElement)) {
			return;
		}
		const mn = this.min();
		const mx = this.max();
		const low = this.parseValue('low', mn);
		const high = this.parseValue('high', mx);
		fill.style.left = `${((low - mn) / (mx - mn)) * 100}%`;
		fill.style.width = `${((high - low) / (mx - mn)) * 100}%`;
	}

	private sync() {
		const sr = this.el.shadowRoot;
		if (!sr) {
			return;
		}
		this.bindOnce(sr);
		const root = sr.querySelector('.root');
		if (!(root instanceof HTMLElement)) {
			return;
		}

		const mode = this.mode();
		root.setAttribute('data-mode', mode);

		const mn = this.min();
		const mx = this.max();
		const st = this.step();
		const disabled = this.el.hasAttribute('disabled');
		const label = this.el.getAttribute('label') || '';
		const nm = this.el.getAttribute('name') || '';

		const sing = sr.querySelector('.single-input');
		const lo = sr.querySelector('.dual-low');
		const hi = sr.querySelector('.dual-high');
		if (sing instanceof HTMLInputElement) {
			sing.min = `${mn}`;
			sing.max = `${mx}`;
			sing.step = `${st}`;
			sing.value = `${this.parseValue('value', mn)}`;
			sing.disabled = disabled;
			sing.name = nm;
		}
		if (lo instanceof HTMLInputElement) {
			lo.min = `${mn}`;
			lo.max = `${mx}`;
			lo.step = `${st}`;
			lo.value = `${this.parseValue('low', mn)}`;
			lo.disabled = disabled;
			lo.name = `${nm ? `${nm}-` : ''}low`;
		}
		if (hi instanceof HTMLInputElement) {
			hi.min = `${mn}`;
			hi.max = `${mx}`;
			hi.step = `${st}`;
			hi.value = `${this.parseValue('high', mx)}`;
			hi.disabled = disabled;
			hi.name = `${nm ? `${nm}-` : ''}high`;
		}

		this.dualFill(root);
		this.renderRating(root);

		if (label) {
			if (sing instanceof HTMLInputElement) {
				sing.setAttribute('aria-label', label);
			}
			if (lo instanceof HTMLInputElement) {
				lo.setAttribute('aria-label', `${label} low`);
			}
			if (hi instanceof HTMLInputElement) {
				hi.setAttribute('aria-label', `${label} high`);
			}
			sr.querySelector('.rating')?.setAttribute?.('aria-label', label);
		}
	}

	componentDidRender() {
		this.sync();
	}

	render() {
		return (
			<Host>
				<div class="root" part="root">
					<div class="single" part="single">
						<input class="single-input" type="range" part="input" />
					</div>
					<div class="dual" part="dual">
						<div class="dual-track" part="track">
							<div class="dual-fill" part="fill"></div>
						</div>
						<input class="dual-low" type="range" part="low" />
						<input class="dual-high" type="range" part="high" />
					</div>
					<div class="rating" part="rating"></div>
					<div class="meta" part="meta">
						<slot />
					</div>
				</div>
			</Host>
		);
	}
}
