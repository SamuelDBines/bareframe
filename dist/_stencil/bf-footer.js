import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfFooterCss = () => `:host{--bf-footer-font:var(--bf-theme-font-family, inherit);--bf-footer-radius:var(--bf-theme-radius-md, 8px);--bf-footer-border-width:var(--bf-theme-border-width, 1px);--bf-footer-border-style:var(--bf-theme-border-style, solid);--bf-footer-border-color:var(--bf-theme-border-1, #cbd5e1);--bf-footer-bg:var(--bf-theme-surface-2, #f8fafc);--bf-footer-color:var(--bf-theme-text-2, #475569);--bf-footer-padding-y:var(--bf-theme-space-2, 0.65rem);--bf-footer-padding-x:var(--bf-theme-space-3, 1.1rem);display:block;font:var(--bf-footer-font);color:var(--bf-footer-color)}:host([sticky]) .root{position:sticky;bottom:0;z-index:20}.root{box-sizing:border-box;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--bf-footer-padding-x);width:100%;padding:var(--bf-footer-padding-y) var(--bf-footer-padding-x);background:var(--bf-footer-bg);color:var(--bf-footer-color);border-radius:var(--bf-footer-radius);border-width:var(--bf-footer-border-width);border-style:var(--bf-footer-border-style);border-color:var(--bf-footer-border-color);font-size:0.9rem;min-height:2.75rem}`;

const BfFooter$1 = /*@__PURE__*/ proxyCustomElement(class BfFooter extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    sticky = false;
    render() {
        return (h(Host, { key: '4436fdc3409fe0f1791a8369ed020b23dcaafd8e' }, h("footer", { key: '2d4a5645ca720f2e2c26e36773250d04fc06c1da', class: "root", part: "root" }, h("slot", { key: 'efc8b11885d5adbe3ae40ed0ad159658889bad7e' }))));
    }
    static get style() { return bfFooterCss(); }
}, [769, "bf-footer", {
        "sticky": [516]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-footer"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-footer":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfFooter$1);
            }
            break;
    } });
}

const BfFooter = BfFooter$1;
const defineCustomElement = defineCustomElement$1;

export { BfFooter, defineCustomElement };
