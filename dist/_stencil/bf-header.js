import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfHeaderCss = () => `:host{--bf-header-font:var(--bf-theme-font-family, inherit);--bf-header-radius:var(--bf-theme-radius-md, 8px);--bf-header-border-width:var(--bf-theme-border-width, 1px);--bf-header-border-style:var(--bf-theme-border-style, solid);--bf-header-border-color:var(--bf-theme-border-1, #cbd5e1);--bf-header-bg:var(--bf-theme-surface-1, #ffffff);--bf-header-color:var(--bf-theme-text-1, #0f172a);--bf-header-padding-y:var(--bf-theme-space-3, 0.9rem);--bf-header-padding-x:var(--bf-theme-space-3, 1.1rem);display:block;font:var(--bf-header-font);color:var(--bf-header-color)}:host([sticky]) .root{position:sticky;top:0;z-index:20}.root{box-sizing:border-box;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--bf-header-padding-x);width:100%;padding:var(--bf-header-padding-y) var(--bf-header-padding-x);background:var(--bf-header-bg);color:var(--bf-header-color);border-radius:var(--bf-header-radius);border-width:var(--bf-header-border-width);border-style:var(--bf-header-border-style);border-color:var(--bf-header-border-color);min-height:3rem}::slotted(*){flex:0 0 auto}`;

const BfHeader$1 = /*@__PURE__*/ proxyCustomElement(class BfHeader extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    sticky = false;
    render() {
        return (h(Host, { key: 'ade101c5af649e0ed8f0f8593dc1064abe67f27d' }, h("header", { key: '25e73f4a9d0cc1dee95a1ac248c0f499be6f79e6', class: "root", part: "root" }, h("slot", { key: 'b5e86ee30e99d7f6f3dc69412e93fc6eee085b8a' }))));
    }
    static get style() { return bfHeaderCss(); }
}, [769, "bf-header", {
        "sticky": [516]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-header"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-header":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfHeader$1);
            }
            break;
    } });
}

const BfHeader = BfHeader$1;
const defineCustomElement = defineCustomElement$1;

export { BfHeader, defineCustomElement };
