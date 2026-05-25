import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfTableCss = () => `:host{--bf-table-font:var(--bf-theme-font-family, inherit);--bf-table-radius:var(--bf-theme-radius-md, 8px);--bf-table-border-width:var(--bf-theme-border-width, 1px);--bf-table-border-style:var(--bf-theme-border-style, solid);--bf-table-border-color:var(--bf-theme-table-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-table-bg:var(--bf-theme-table-bg, var(--bf-theme-surface-1, #ffffff));--bf-table-color:var(--bf-theme-table-color, var(--bf-theme-text-1, #0f172a));--bf-table-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-table-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-table-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-table-font);color:var(--bf-table-color)}.root{background:var(--bf-table-bg);color:var(--bf-table-color);border-width:var(--bf-table-border-width);border-style:var(--bf-table-border-style);border-color:var(--bf-table-border-color);border-radius:var(--bf-table-radius);padding:var(--bf-table-padding-y) var(--bf-table-padding-x);transition:var(--bf-table-transition)}`;

const BfTable$1 = /*@__PURE__*/ proxyCustomElement(class BfTable extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '8a2b9a606b6c4121f8f16cb489ee6498c3ba5162' }, h("div", { key: '0ff2171b232e1f36b46ffc24a335f9d00d783863', class: "root", part: "root" }, h("slot", { key: 'cd5dd8c52d38792f4bde40e736638a8d0c0806a7' }))));
    }
    static get style() { return bfTableCss(); }
}, [257, "bf-table"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-table"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-table":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfTable$1);
            }
            break;
    } });
}

const BfTable = BfTable$1;
const defineCustomElement = defineCustomElement$1;

export { BfTable, defineCustomElement };
