import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfTreeViewCss = () => `:host{--bf-tree-view-font:var(--bf-theme-font-family, inherit);--bf-tree-view-radius:var(--bf-theme-radius-md, 8px);--bf-tree-view-border-width:var(--bf-theme-border-width, 1px);--bf-tree-view-border-style:var(--bf-theme-border-style, solid);--bf-tree-view-border-color:var(--bf-theme-tree-view-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-tree-view-bg:var(--bf-theme-tree-view-bg, var(--bf-theme-surface-1, #ffffff));--bf-tree-view-color:var(--bf-theme-tree-view-color, var(--bf-theme-text-1, #0f172a));--bf-tree-view-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-tree-view-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-tree-view-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-tree-view-font);color:var(--bf-tree-view-color)}.root{background:var(--bf-tree-view-bg);color:var(--bf-tree-view-color);border-width:var(--bf-tree-view-border-width);border-style:var(--bf-tree-view-border-style);border-color:var(--bf-tree-view-border-color);border-radius:var(--bf-tree-view-radius);padding:var(--bf-tree-view-padding-y) var(--bf-tree-view-padding-x);transition:var(--bf-tree-view-transition)}`;

const BfTreeView$1 = /*@__PURE__*/ proxyCustomElement(class BfTreeView extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: 'fda0da87d487ddb86fb29e2e0adaa7c2df83e2d6' }, h("div", { key: '9dc6b6e5d9f8422c06165bc6e64ef0bd44ec0ded', class: "root", part: "root" }, h("slot", { key: '69804513da7917ea1e83938b2041df57ecdf110c' }))));
    }
    static get style() { return bfTreeViewCss(); }
}, [257, "bf-tree-view"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-tree-view"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-tree-view":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfTreeView$1);
            }
            break;
    } });
}

const BfTreeView = BfTreeView$1;
const defineCustomElement = defineCustomElement$1;

export { BfTreeView, defineCustomElement };
