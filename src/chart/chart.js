class BfChart extends HTMLElement {
	static observedAttributes = [
		'variant',
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

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		if (this._initialized) {
			this._sync();
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./chart.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('div');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = `
			<div class="viz" part="viz">
				<div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
				<div class="line"></div>
				<div class="pie"></div>
				<div class="donut"></div>
				<div class="gauge"></div>
				<div class="heatmap">
					<span></span><span></span><span></span><span></span>
					<span></span><span></span><span></span><span></span>
					<span></span><span></span><span></span><span></span>
				</div>
				<div class="treemap"><span></span><span></span><span></span></div>
				<div class="gantt"><span></span><span></span><span></span></div>
				<div class="graph"><span></span><span></span><span></span></div>
			</div>
			<div class="meta" part="meta"><slot></slot></div>
		`;

		this.shadowRoot.replaceChildren(link, root);
		this._root = root;
		this._sync();
	}

	attributeChangedCallback() {
		this._sync();
	}

	_variant() {
		const explicit = (this.getAttribute('variant') || '').toLowerCase();
		const valid = ['bar', 'line', 'pie', 'donut', 'graph', 'sparkline', 'gauge', 'heatmap', 'treemap', 'gantt'];
		if (valid.includes(explicit)) {
			return explicit;
		}
		for (const item of valid) {
			if (this.hasAttribute(item)) {
				return item;
			}
		}
		return 'bar';
	}

	_sync() {
		if (!this._root) {
			return;
		}
		this._root.setAttribute('data-variant', this._variant());
	}
}

customElements.define('bf-chart', BfChart);
