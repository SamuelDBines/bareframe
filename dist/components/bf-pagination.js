import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfPaginationCss = () => `:host{--bf-pagination-font:var(--bf-theme-font-family, inherit);--bf-pagination-radius:var(--bf-theme-radius-md, 8px);--bf-pagination-border-width:var(--bf-theme-border-width, 1px);--bf-pagination-border-style:var(--bf-theme-border-style, solid);--bf-pagination-border-color:var(--bf-theme-pagination-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-pagination-bg:var(--bf-theme-pagination-bg, var(--bf-theme-surface-1, #ffffff));--bf-pagination-color:var(--bf-theme-pagination-color, var(--bf-theme-text-1, #0f172a));--bf-pagination-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-pagination-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-pagination-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-pagination-font);color:var(--bf-pagination-color)}.root{background:var(--bf-pagination-bg);color:var(--bf-pagination-color);border-width:var(--bf-pagination-border-width);border-style:var(--bf-pagination-border-style);border-color:var(--bf-pagination-border-color);border-radius:var(--bf-pagination-radius);padding:var(--bf-pagination-padding-y) var(--bf-pagination-padding-x);transition:var(--bf-pagination-transition)}`;

const BfPagination$1 = /*@__PURE__*/ proxyCustomElement(class BfPagination extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '5303b71228fa927d229e99d6b095e91ade5cbb02' }, h("div", { key: 'abc878891de8213ad0c9a95cd6075b6d9a09cc34', class: "root", part: "root" }, h("slot", { key: '566b015a7ed9123f5c67f5e659df96f8bb042a76' }))));
    }
    static get style() { return bfPaginationCss(); }
}, [257, "bf-pagination"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-pagination"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-pagination":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfPagination$1);
            }
            break;
    } });
}

const BfPagination = BfPagination$1;
const defineCustomElement = defineCustomElement$1;

export { BfPagination, defineCustomElement };
