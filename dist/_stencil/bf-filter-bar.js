import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfFilterBarCss = () => `:host{--bf-filter-bar-font:var(--bf-theme-font-family, inherit);--bf-filter-bar-radius:var(--bf-theme-radius-md, 8px);--bf-filter-bar-border-width:var(--bf-theme-border-width, 1px);--bf-filter-bar-border-style:var(--bf-theme-border-style, solid);--bf-filter-bar-border-color:var(--bf-theme-filter-bar-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-filter-bar-bg:var(--bf-theme-filter-bar-bg, var(--bf-theme-surface-1, #ffffff));--bf-filter-bar-color:var(--bf-theme-filter-bar-color, var(--bf-theme-text-1, #0f172a));--bf-filter-bar-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-filter-bar-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-filter-bar-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-filter-bar-font);color:var(--bf-filter-bar-color)}.root{background:var(--bf-filter-bar-bg);color:var(--bf-filter-bar-color);border-width:var(--bf-filter-bar-border-width);border-style:var(--bf-filter-bar-border-style);border-color:var(--bf-filter-bar-border-color);border-radius:var(--bf-filter-bar-radius);padding:var(--bf-filter-bar-padding-y) var(--bf-filter-bar-padding-x);transition:var(--bf-filter-bar-transition)}`;

const BfFilterBar$1 = /*@__PURE__*/ proxyCustomElement(class BfFilterBar extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '7691c031164ca6e503c36fd733c64cf5013879b9' }, h("div", { key: 'f198feaec9800b933ce7ded726cb43dd5abefdbb', class: "root", part: "root" }, h("slot", { key: '2658bacd2ae5fa9dccc4d749bdaf124f822dbc20' }))));
    }
    static get style() { return bfFilterBarCss(); }
}, [257, "bf-filter-bar"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-filter-bar"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-filter-bar":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfFilterBar$1);
            }
            break;
    } });
}

const BfFilterBar = BfFilterBar$1;
const defineCustomElement = defineCustomElement$1;

export { BfFilterBar, defineCustomElement };
