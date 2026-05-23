import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfMetricCardCss = () => `:host{--bf-metric-card-font:var(--bf-theme-font-family, inherit);--bf-metric-card-radius:var(--bf-theme-radius-md, 8px);--bf-metric-card-border-width:var(--bf-theme-border-width, 1px);--bf-metric-card-border-style:var(--bf-theme-border-style, solid);--bf-metric-card-border-color:var(--bf-theme-metric-card-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-metric-card-bg:var(--bf-theme-metric-card-bg, var(--bf-theme-surface-1, #ffffff));--bf-metric-card-color:var(--bf-theme-metric-card-color, var(--bf-theme-text-1, #0f172a));--bf-metric-card-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-metric-card-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-metric-card-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-metric-card-font);color:var(--bf-metric-card-color)}.root{background:var(--bf-metric-card-bg);color:var(--bf-metric-card-color);border-width:var(--bf-metric-card-border-width);border-style:var(--bf-metric-card-border-style);border-color:var(--bf-metric-card-border-color);border-radius:var(--bf-metric-card-radius);padding:var(--bf-metric-card-padding-y) var(--bf-metric-card-padding-x);transition:var(--bf-metric-card-transition)}`;

const BfMetricCard$1 = /*@__PURE__*/ proxyCustomElement(class BfMetricCard extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '5d538566d2fc3bca7ed9431f899d0b213bab1766' }, h("div", { key: '46586c3e8f62b58bf95bf61d7963296e7282d065', class: "root", part: "root" }, h("slot", { key: '54b0f6c7c948b911efefa18675be931b51f4504d' }))));
    }
    static get style() { return bfMetricCardCss(); }
}, [257, "bf-metric-card"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-metric-card"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-metric-card":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfMetricCard$1);
            }
            break;
    } });
}

const BfMetricCard = BfMetricCard$1;
const defineCustomElement = defineCustomElement$1;

export { BfMetricCard, defineCustomElement };
