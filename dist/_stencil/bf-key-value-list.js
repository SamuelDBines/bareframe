import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfKeyValueListCss = () => `:host{--bf-key-value-list-font:var(--bf-theme-font-family, inherit);--bf-key-value-list-radius:var(--bf-theme-radius-md, 8px);--bf-key-value-list-border-width:var(--bf-theme-border-width, 1px);--bf-key-value-list-border-style:var(--bf-theme-border-style, solid);--bf-key-value-list-border-color:var(--bf-theme-key-value-list-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-key-value-list-bg:var(--bf-theme-key-value-list-bg, var(--bf-theme-surface-1, #ffffff));--bf-key-value-list-color:var(--bf-theme-key-value-list-color, var(--bf-theme-text-1, #0f172a));--bf-key-value-list-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-key-value-list-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-key-value-list-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-key-value-list-font);color:var(--bf-key-value-list-color)}.root{background:var(--bf-key-value-list-bg);color:var(--bf-key-value-list-color);border-width:var(--bf-key-value-list-border-width);border-style:var(--bf-key-value-list-border-style);border-color:var(--bf-key-value-list-border-color);border-radius:var(--bf-key-value-list-radius);padding:var(--bf-key-value-list-padding-y) var(--bf-key-value-list-padding-x);transition:var(--bf-key-value-list-transition)}`;

const BfKeyValueList$1 = /*@__PURE__*/ proxyCustomElement(class BfKeyValueList extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: 'eacd9ed4cb4747140f2b68ce6f8b707cd6f410f1' }, h("div", { key: '2d1d025e3c002b6e00ec5b74d23fcf8f12719ceb', class: "root", part: "root" }, h("slot", { key: '7d9225ba0db22a0d52334224e02918cf533c46e5' }))));
    }
    static get style() { return bfKeyValueListCss(); }
}, [257, "bf-key-value-list"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-key-value-list"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-key-value-list":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfKeyValueList$1);
            }
            break;
    } });
}

const BfKeyValueList = BfKeyValueList$1;
const defineCustomElement = defineCustomElement$1;

export { BfKeyValueList, defineCustomElement };
