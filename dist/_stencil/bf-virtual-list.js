import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfVirtualListCss = () => `:host{--bf-virtual-list-font:var(--bf-theme-font-family, inherit);--bf-virtual-list-radius:var(--bf-theme-radius-md, 8px);--bf-virtual-list-border-width:var(--bf-theme-border-width, 1px);--bf-virtual-list-border-style:var(--bf-theme-border-style, solid);--bf-virtual-list-border-color:var(--bf-theme-virtual-list-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-virtual-list-bg:var(--bf-theme-virtual-list-bg, var(--bf-theme-surface-1, #ffffff));--bf-virtual-list-color:var(--bf-theme-virtual-list-color, var(--bf-theme-text-1, #0f172a));--bf-virtual-list-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-virtual-list-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-virtual-list-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-virtual-list-font);color:var(--bf-virtual-list-color)}.root{background:var(--bf-virtual-list-bg);color:var(--bf-virtual-list-color);border-width:var(--bf-virtual-list-border-width);border-style:var(--bf-virtual-list-border-style);border-color:var(--bf-virtual-list-border-color);border-radius:var(--bf-virtual-list-radius);padding:var(--bf-virtual-list-padding-y) var(--bf-virtual-list-padding-x);transition:var(--bf-virtual-list-transition)}`;

const BfVirtualList$1 = /*@__PURE__*/ proxyCustomElement(class BfVirtualList extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '1e22e7e61a688281ddb4e38a157760b88813e0cb' }, h("div", { key: '49e968183b15b2088232b02c1d3fe1645148c226', class: "root", part: "root" }, h("slot", { key: 'b0e8e0c6ec3e6d78ef376bfdcf5aa77860945ea8' }))));
    }
    static get style() { return bfVirtualListCss(); }
}, [257, "bf-virtual-list"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-virtual-list"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-virtual-list":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfVirtualList$1);
            }
            break;
    } });
}

const BfVirtualList = BfVirtualList$1;
const defineCustomElement = defineCustomElement$1;

export { BfVirtualList, defineCustomElement };
