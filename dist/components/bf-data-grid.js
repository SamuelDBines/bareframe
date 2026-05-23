import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfDataGridCss = () => `:host{--bf-data-grid-font:var(--bf-theme-font-family, inherit);--bf-data-grid-radius:var(--bf-theme-radius-md, 8px);--bf-data-grid-border-width:var(--bf-theme-border-width, 1px);--bf-data-grid-border-style:var(--bf-theme-border-style, solid);--bf-data-grid-border-color:var(--bf-theme-data-grid-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-data-grid-bg:var(--bf-theme-data-grid-bg, var(--bf-theme-surface-1, #ffffff));--bf-data-grid-color:var(--bf-theme-data-grid-color, var(--bf-theme-text-1, #0f172a));--bf-data-grid-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-data-grid-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-data-grid-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-data-grid-font);color:var(--bf-data-grid-color)}.root{background:var(--bf-data-grid-bg);color:var(--bf-data-grid-color);border-width:var(--bf-data-grid-border-width);border-style:var(--bf-data-grid-border-style);border-color:var(--bf-data-grid-border-color);border-radius:var(--bf-data-grid-radius);padding:var(--bf-data-grid-padding-y) var(--bf-data-grid-padding-x);transition:var(--bf-data-grid-transition)}`;

const BfDataGrid$1 = /*@__PURE__*/ proxyCustomElement(class BfDataGrid extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '0ebc3e751b8bc399765a4a7a6cb3e4b938ab840f' }, h("div", { key: '72cc5f04cd0f5e96116349c7ec222014610b5cf8', class: "root", part: "root" }, h("slot", { key: 'ca278d05437032c86ef4668311920440cc3c0f77' }))));
    }
    static get style() { return bfDataGridCss(); }
}, [257, "bf-data-grid"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-data-grid"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-data-grid":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfDataGrid$1);
            }
            break;
    } });
}

const BfDataGrid = BfDataGrid$1;
const defineCustomElement = defineCustomElement$1;

export { BfDataGrid, defineCustomElement };
