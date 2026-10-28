import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfErrorSummaryCss = () => `:host{--bf-error-summary-font:var(--bf-theme-font-family, inherit);--bf-error-summary-radius:var(--bf-theme-radius-md, 8px);--bf-error-summary-border-width:var(--bf-theme-border-width, 1px);--bf-error-summary-border-style:var(--bf-theme-border-style, solid);--bf-error-summary-border-color:var(--bf-theme-error-summary-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-error-summary-bg:var(--bf-theme-error-summary-bg, var(--bf-theme-surface-1, #ffffff));--bf-error-summary-color:var(--bf-theme-error-summary-color, var(--bf-theme-text-1, #0f172a));--bf-error-summary-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-error-summary-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-error-summary-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-error-summary-font);color:var(--bf-error-summary-color)}.root{background:var(--bf-error-summary-bg);color:var(--bf-error-summary-color);border-width:var(--bf-error-summary-border-width);border-style:var(--bf-error-summary-border-style);border-color:var(--bf-error-summary-border-color);border-radius:var(--bf-error-summary-radius);padding:var(--bf-error-summary-padding-y) var(--bf-error-summary-padding-x);transition:var(--bf-error-summary-transition)}`;

const BfErrorSummary$1 = /*@__PURE__*/ proxyCustomElement(class BfErrorSummary extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '43c59f346684e8cf78b00304dd941c4216fd39cc' }, h("div", { key: '02a63eecec18990e472120224294cd6f47c9090b', class: "root", part: "root" }, h("slot", { key: '00e894c950f95563014876fee5223535e622b535' }))));
    }
    static get style() { return bfErrorSummaryCss(); }
}, [257, "bf-error-summary"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-error-summary"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-error-summary":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfErrorSummary$1);
            }
            break;
    } });
}

const BfErrorSummary = BfErrorSummary$1;
const defineCustomElement = defineCustomElement$1;

export { BfErrorSummary, defineCustomElement };
