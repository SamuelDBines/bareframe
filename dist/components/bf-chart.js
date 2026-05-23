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
        return (h(Host, { key: '70f66ef27f2dd6d0c3c458691b3e5b4587345e13' }, h("div", { key: '6ac76041d2dc3d2c8e1a760210473902a9a9fead', class: "root", part: "root", "data-variant": "bar" }, h("div", { key: '9d2f1b1f99d8f6b17fceb872130056318fdc755c', class: "viz", part: "viz" }, h("div", { key: '3c75ece5bcf04ebaabfe46c146c1d8a2b3ad4e6a', class: "bar" }), h("div", { key: 'e13784df55dc5703e21afc5a83f2b7dc0332b034', class: "bar" }), h("div", { key: '844ee927f91cdcb4e10dfd08f3208e7e00ca7e3b', class: "bar" }), h("div", { key: 'fddc575c4a4d4eea3d001d480cf9f7d2192784f2', class: "bar" }), h("div", { key: 'ca093096c80818b7d0af0db53949924de7021bcb', class: "bar" }), h("div", { key: '779269e18c976729b18e55b2ebd5ede610b53855', class: "line" }), h("div", { key: '0e0c6269bc8aa053febe0640ccd59e42d99b517b', class: "pie" }), h("div", { key: '036352dfc317fa32f5745ab0dac2b86dc5d841cd', class: "donut" }), h("div", { key: '031b81f56ef61fad6fcc183aeb6d01a6192bfd9e', class: "gauge" }), h("div", { key: 'c4786defad7a351be2a1590b8ea1ce8fa2febaa8', class: "heatmap" }, h("span", { key: '518a2d6578821f116b32f7e7ebf884c0cda0d36e' }), h("span", { key: '112fdbcd4fcc4375a178dfd42289cbf03de02731' }), h("span", { key: '908aa40663cdb89f82a0ae949c11007aa49182e0' }), h("span", { key: 'a4165fb4c3d194dad697ca01c5365d56b33fd324' }), h("span", { key: '18cb577bd42e5386ddac4a6226426bcab9260415' }), h("span", { key: 'f507ddfb68694b31dfc7dca612f7452c9dd8f909' }), h("span", { key: '80729ba5b3ef6758d4ba68f63ebe28d55a79e611' }), h("span", { key: '657231327d767f83db222dffe9882876018ae1f7' }), h("span", { key: 'b19db57f56515d0a8302e69d2f25a5c90942ccbe' }), h("span", { key: '3e7726d315f12aca73f2d6dc551e6a317dfaa057' }), h("span", { key: '44c0020078f7a77d133523c8dd6060fd25006e52' }), h("span", { key: '6d26f00e4c2f2c836d3c24c8f845b0dd8c4eb297' })), h("div", { key: 'b20f98c4a535436453b8b8d630fc95f6c39b6a13', class: "treemap" }, h("span", { key: '3fb302b0f79423f0fd4e7201b429094214f61c97' }), h("span", { key: 'cd22fc39fc1ac634ed12721c6ffb0189b4435326' }), h("span", { key: '1780fd8f720f499dc5e2cc794abbcb8246d524a6' })), h("div", { key: '28c1389172f8f79df3c7686e11ea0e56b20ac32f', class: "gantt" }, h("span", { key: '26d1f6b9cd48578a15ffbf5d47aeab73d1d69771' }), h("span", { key: '8a97001f3eaf51e6ca184a809cd3ecdf159ca539' }), h("span", { key: '2c310c2a82f3cbd00e29e57983e2fb7cfbe6cfae' })), h("div", { key: 'bed97c1542892daae7140b854193bfaec6d9ba8e', class: "graph" }, h("span", { key: '22391d17e27f848ceb7f071c72be722c44abb9f0' }), h("span", { key: 'a38f371886434507e0702cd139a9df1203874be6' }), h("span", { key: 'f3222fcf7a8cb9da5daef389c4a6c0d5ee6b1690' }))), h("div", { key: 'a41518174ebb02d328bf68bab4154b9f9963e489', class: "meta", part: "meta" }, h("slot", { key: '41dd4b64fb3a5fd9e0b3dbb6b0db9a0f0aa038d9' })))));
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
