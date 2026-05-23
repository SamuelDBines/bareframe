import { Component, Element, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-chart',
	styleUrl: 'bf-chart.css',
	shadow: true,
})
export class BfChart {
	@Element() el!: HTMLElement;
	private observer?: MutationObserver;

	connectedCallback() {
		this.observer = new MutationObserver(() => this.applyVariant());
		this.observer.observe(this.el, { attributes: true });
		this.applyVariant();
	}

	disconnectedCallback() {
		this.observer?.disconnect();
	}

	private variant(): string {
		const explicit = (this.el.getAttribute('variant') || '').toLowerCase();
		const valid = [
			'bar',
			'line',
			'pie',
			'donut',
			'graph',
			'sparkline',
			'gauge',
			'heatmap',
			'treemap',
			'gantt',
		];
		if (valid.includes(explicit)) {
			return explicit;
		}
		for (const item of valid) {
			if (this.el.hasAttribute(item)) {
				return item;
			}
		}
		return 'bar';
	}

	private applyVariant() {
		const root = this.el.shadowRoot?.querySelector('.root');
		if (root instanceof HTMLElement) {
			root.setAttribute('data-variant', this.variant());
		}
	}

	componentDidRender() {
		this.applyVariant();
	}

	render() {
		return (
			<Host>
				<div class="root" part="root" data-variant="bar">
					<div class="viz" part="viz">
						<div class="bar"></div>
						<div class="bar"></div>
						<div class="bar"></div>
						<div class="bar"></div>
						<div class="bar"></div>
						<div class="line"></div>
						<div class="pie"></div>
						<div class="donut"></div>
						<div class="gauge"></div>
						<div class="heatmap">
							<span></span>
							<span></span>
							<span></span>
							<span></span>
							<span></span>
							<span></span>
							<span></span>
							<span></span>
							<span></span>
							<span></span>
							<span></span>
							<span></span>
						</div>
						<div class="treemap">
							<span></span>
							<span></span>
							<span></span>
						</div>
						<div class="gantt">
							<span></span>
							<span></span>
							<span></span>
						</div>
						<div class="graph">
							<span></span>
							<span></span>
							<span></span>
						</div>
					</div>
					<div class="meta" part="meta">
						<slot />
					</div>
				</div>
			</Host>
		);
	}
}
