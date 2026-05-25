import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfChartCss = () => `:host{--bf-chart-font:var(--bf-theme-font-family, inherit);--bf-chart-radius:var(--bf-theme-radius-md, 10px);--bf-chart-border-color:var(--bf-theme-chart-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-chart-bg:var(--bf-theme-chart-bg, var(--bf-theme-surface-1, #ffffff));--bf-chart-color:var(--bf-theme-chart-color, var(--bf-theme-text-1, #0f172a));--bf-chart-accent:var(--bf-theme-button-primary-bg, #2563eb);--bf-chart-muted:var(--bf-theme-surface-2, #e2e8f0);display:block;font:var(--bf-chart-font);color:var(--bf-chart-color)}.root{background:var(--bf-chart-bg);color:var(--bf-chart-color);border:1px solid var(--bf-chart-border-color);border-radius:var(--bf-chart-radius);padding:0.75rem;display:grid;gap:0.55rem}.viz{display:grid;height:130px;align-items:end}.bar{display:none;background:var(--bf-chart-accent);border-radius:6px 6px 0 0}.viz .bar:nth-child(1){height:35%}.viz .bar:nth-child(2){height:52%}.viz .bar:nth-child(3){height:74%}.viz .bar:nth-child(4){height:46%}.viz .bar:nth-child(5){height:62%}.line,.pie,.donut,.gauge,.heatmap,.treemap,.gantt,.graph{display:none}.root[data-variant='bar'] .viz,.root[data-variant='sparkline'] .viz{grid-template-columns:repeat(5, 1fr);gap:0.45rem}.root[data-variant='bar'] .bar{display:block}.root[data-variant='line'] .line,.root[data-variant='sparkline'] .line{display:block;height:70%;border-bottom:3px solid var(--bf-chart-accent);border-left:3px solid transparent;border-right:3px solid transparent;clip-path:polygon(0 70%, 18% 48%, 36% 58%, 56% 28%, 76% 42%, 100% 12%, 100% 100%, 0 100%);background:linear-gradient(to top, color-mix(in srgb, var(--bf-chart-accent) 20%, transparent), transparent)}.root[data-variant='line'] .viz,.root[data-variant='sparkline'] .viz{grid-template-columns:1fr}.root[data-variant='pie'] .pie,.root[data-variant='donut'] .donut,.root[data-variant='gauge'] .gauge{display:block;justify-self:center;width:108px;height:108px;border-radius:50%}.root[data-variant='pie'] .pie{background:conic-gradient(var(--bf-chart-accent) 0 62%, var(--bf-chart-muted) 62% 100%)}.root[data-variant='donut'] .donut{background:radial-gradient(circle at center, var(--bf-chart-bg) 46%, transparent 47%),   conic-gradient(var(--bf-chart-accent) 0 68%, var(--bf-chart-muted) 68% 100%)}.root[data-variant='gauge'] .gauge{height:64px;border-radius:64px 64px 0 0;background:conic-gradient(from 180deg at 50% 100%, var(--bf-chart-accent) 0 58%, var(--bf-chart-muted) 58% 100%)}.root[data-variant='heatmap'] .heatmap{display:grid;grid-template-columns:repeat(4, 1fr);gap:0.35rem}.root[data-variant='heatmap'] .heatmap span{aspect-ratio:1;border-radius:4px;background:color-mix(in srgb, var(--bf-chart-accent) 20%, var(--bf-chart-muted))}.root[data-variant='heatmap'] .heatmap span:nth-child(3n){background:color-mix(in srgb, var(--bf-chart-accent) 60%, var(--bf-chart-muted))}.root[data-variant='treemap'] .treemap{display:grid;grid-template-columns:1.2fr 1fr;gap:0.35rem}.root[data-variant='treemap'] .treemap span{min-height:56px;background:color-mix(in srgb, var(--bf-chart-accent) 35%, var(--bf-chart-muted));border-radius:6px}.root[data-variant='treemap'] .treemap span:first-child{grid-row:span 2}.root[data-variant='gantt'] .gantt{display:grid;gap:0.45rem}.root[data-variant='gantt'] .gantt span{height:0.65rem;border-radius:999px;background:var(--bf-chart-muted);position:relative}.root[data-variant='gantt'] .gantt span::after{content:'';position:absolute;inset:0 auto 0 0;width:45%;border-radius:inherit;background:var(--bf-chart-accent)}.root[data-variant='gantt'] .gantt span:nth-child(2)::after{width:70%}.root[data-variant='gantt'] .gantt span:nth-child(3)::after{width:32%}.root[data-variant='graph'] .graph{display:grid;grid-template-columns:repeat(3, 1fr);align-items:center;justify-items:center;gap:0.45rem}.root[data-variant='graph'] .graph span{width:1rem;height:1rem;border-radius:50%;background:var(--bf-chart-accent)}.meta:empty{display:none}`;

const BfChart$1 = /*@__PURE__*/ proxyCustomElement(class BfChart extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
    observer;
    connectedCallback() {
        this.observer = new MutationObserver(() => this.applyVariant());
        this.observer.observe(this.el, { attributes: true });
        this.applyVariant();
    }
    disconnectedCallback() {
        this.observer?.disconnect();
    }
    variant() {
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
    applyVariant() {
        const root = this.el.shadowRoot?.querySelector('.root');
        if (root instanceof H) {
            root.setAttribute('data-variant', this.variant());
        }
    }
    componentDidRender() {
        this.applyVariant();
    }
    render() {
        return (h(Host, { key: '88a21cdda9052f33ef0f85de1dd7c66ffe66443c' }, h("div", { key: 'b2b6127b3ffb52a83c213f01b3786f73e39131c1', class: "root", part: "root", "data-variant": "bar" }, h("div", { key: 'd5d67f98bfe62008485d37d59e2fa15097a8919f', class: "viz", part: "viz" }, h("div", { key: '727329ff6c24b05405954c3b6232a31da861ad8f', class: "bar" }), h("div", { key: 'd18cf0d076878dbb16e0b7b01f887c45affc44e0', class: "bar" }), h("div", { key: '46d2b72c4661058238b8cdb50f1a301ed96bfe8e', class: "bar" }), h("div", { key: '226f74542a7118a41d5cc78c2c7f32d400afa5ff', class: "bar" }), h("div", { key: '1b78ca8ef776bc15e4e7f42eaf559ea330054fe5', class: "bar" }), h("div", { key: 'c9b7072a1b828620092c2a9c7395264a8fe55ec3', class: "line" }), h("div", { key: 'b2687a410bbac806c988e73398bf71fa31e746d5', class: "pie" }), h("div", { key: 'b35b7fce2b69593cd39fc1a5ebcb2ef4af2ec4e3', class: "donut" }), h("div", { key: 'bc89bb53d7d74e29c2712bff2d204f2bd1680bba', class: "gauge" }), h("div", { key: 'fb0edf667b73f156cb2ab6b4d0d9bc05f2cc81b1', class: "heatmap" }, h("span", { key: '2f458afb726d4be950e2bb45e7cfbd9f77e8e4fc' }), h("span", { key: '3984bd9007e7340ede3ea6fb1953a8af7eb2933e' }), h("span", { key: 'fd045a1517a1c7227c066258a662c11170cb85e6' }), h("span", { key: '6c0dac3c5ce8cb5b167b51edcae5eb78e23cf487' }), h("span", { key: '86449fe456811d8c14153dd272091f5fc0fb2e8c' }), h("span", { key: '1f6c000d5743a75d504b02971c266a3a1e1d96b9' }), h("span", { key: 'ff6d4009a6b8a11ad5f9b8edfef66cb35ef833e5' }), h("span", { key: '1867bb7c505d5885ee84cce120cc02469ab94499' }), h("span", { key: 'cf39d7f8150ffd2827e2a6c8e9a73f0fe8170033' }), h("span", { key: 'cfc83a7c887c8542fb545434c0e744d6e795a9d3' }), h("span", { key: '6ebe2950e98da7f3e96ce713a9b0d1d78dc547d7' }), h("span", { key: '0231b61d38d5293408207989494282b16b5043d1' })), h("div", { key: '63c0e306b556dac202da6c2079e43be000642d71', class: "treemap" }, h("span", { key: 'aa634258e71a2fd41a5f53216dd5c5fcdec22cfd' }), h("span", { key: '1fcdafc831cac7971fd95893d550e189958e6907' }), h("span", { key: 'eca400d0712d383532ed1dd59286e73bc0a64afa' })), h("div", { key: '12483c653463aefb3a33b58209c80eb71dabdb28', class: "gantt" }, h("span", { key: '3c62b2edf236e2b776881713fc2a8f0122311792' }), h("span", { key: 'deed9b492ab38d5962f9ee1867946f6b65710bc7' }), h("span", { key: 'f54ec6576650a3938ab8e2e72e5a0455fd8b41c4' })), h("div", { key: 'cd37da671a058468d9bfa703630576408eeb956b', class: "graph" }, h("span", { key: '81367a2b5d31b17d4549ae1acd5e90b3fc6c9831' }), h("span", { key: '4239507a890ef45d963986ff04f1bcbc2a173f41' }), h("span", { key: '72045177b07d7af96a10c56794569b6894073791' }))), h("div", { key: '65822aad29e0d0778659e5ca6d9ee5be8db7a70c', class: "meta", part: "meta" }, h("slot", { key: '42f67bf30216b700a6ee63827a8cd04c2171f409' })))));
    }
    static get style() { return bfChartCss(); }
}, [257, "bf-chart"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-chart"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-chart":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfChart$1);
            }
            break;
    } });
}

const BfChart = BfChart$1;
const defineCustomElement = defineCustomElement$1;

export { BfChart, defineCustomElement };
