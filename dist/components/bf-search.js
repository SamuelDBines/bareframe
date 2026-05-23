import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfSearchCss = () => `:host{--bf-search-font:var(--bf-theme-font-family, inherit);--bf-search-radius:var(--bf-theme-radius-md, 8px);--bf-search-border-width:var(--bf-theme-border-width, 1px);--bf-search-border-style:var(--bf-theme-border-style, solid);--bf-search-border-color:var(--bf-theme-search-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-search-bg:var(--bf-theme-search-bg, var(--bf-theme-surface-1, #ffffff));--bf-search-color:var(--bf-theme-search-color, var(--bf-theme-text-1, #0f172a));--bf-search-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-search-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-search-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-search-font);color:var(--bf-search-color)}.root{background:var(--bf-search-bg);color:var(--bf-search-color);border-width:var(--bf-search-border-width);border-style:var(--bf-search-border-style);border-color:var(--bf-search-border-color);border-radius:var(--bf-search-radius);padding:var(--bf-search-padding-y) var(--bf-search-padding-x);transition:var(--bf-search-transition)}`;

const BfSearch$1 = /*@__PURE__*/ proxyCustomElement(class BfSearch extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '2fe18816c20b6d3e9d682a2a9065e1935c41e1d3' }, h("div", { key: 'dff0301d45ad4537d611ce63c7ea4acd54a7e84e', class: "root", part: "root" }, h("slot", { key: '0db89f19b138219ce48789aba127502bdc39f53f' }))));
    }
    static get style() { return bfSearchCss(); }
}, [257, "bf-search"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-search"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-search":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfSearch$1);
            }
            break;
    } });
}

const BfSearch = BfSearch$1;
const defineCustomElement = defineCustomElement$1;

export { BfSearch, defineCustomElement };
