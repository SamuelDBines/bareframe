import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfActionListCss = () => `:host{--bf-action-list-font:var(--bf-theme-font-family, inherit);--bf-action-list-radius:var(--bf-theme-radius-md, 8px);--bf-action-list-border-width:var(--bf-theme-border-width, 1px);--bf-action-list-border-style:var(--bf-theme-border-style, solid);--bf-action-list-border-color:var(--bf-theme-action-list-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-action-list-bg:var(--bf-theme-action-list-bg, var(--bf-theme-surface-1, #ffffff));--bf-action-list-color:var(--bf-theme-action-list-color, var(--bf-theme-text-1, #0f172a));--bf-action-list-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-action-list-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-action-list-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-action-list-font);color:var(--bf-action-list-color)}.root{background:var(--bf-action-list-bg);color:var(--bf-action-list-color);border-width:var(--bf-action-list-border-width);border-style:var(--bf-action-list-border-style);border-color:var(--bf-action-list-border-color);border-radius:var(--bf-action-list-radius);padding:var(--bf-action-list-padding-y) var(--bf-action-list-padding-x);transition:var(--bf-action-list-transition)}`;

const BfActionList$1 = /*@__PURE__*/ proxyCustomElement(class BfActionList extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '0e7f1ff56b94519ce2c25f89d4c02f7ecd966ca4' }, h("div", { key: '2e9883c7cf8c917901f3f1736cb68975897c3a3e', class: "root", part: "root" }, h("slot", { key: '490bc97788a24a072d032664cfe9146fb9b56c24' }))));
    }
    static get style() { return bfActionListCss(); }
}, [257, "bf-action-list"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-action-list"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-action-list":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfActionList$1);
            }
            break;
    } });
}

const BfActionList = BfActionList$1;
const defineCustomElement = defineCustomElement$1;

export { BfActionList, defineCustomElement };
