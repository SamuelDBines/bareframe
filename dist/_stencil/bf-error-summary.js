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
        return (h(Host, { key: 'a01a6f1fcd495fdfe20f52c2395b21f3e42fd144' }, h("div", { key: '8c838bfb767b278fdc0f37829621fe81131b29c5', class: "root", part: "root" }, h("slot", { key: '29211bdb96a67412d713be44d9b3be9200adf769' }))));
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
