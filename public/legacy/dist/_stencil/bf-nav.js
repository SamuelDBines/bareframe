import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfNavCss = () => `:host{--bf-nav-font:var(--bf-theme-font-family, inherit);--bf-nav-radius:var(--bf-theme-radius-md, 8px);--bf-nav-border-width:var(--bf-theme-border-width, 1px);--bf-nav-border-style:var(--bf-theme-border-style, solid);--bf-nav-border-color:var(--bf-theme-nav-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-nav-bg:var(--bf-theme-nav-bg, var(--bf-theme-surface-1, #ffffff));--bf-nav-color:var(--bf-theme-nav-color, var(--bf-theme-text-1, #0f172a));--bf-nav-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-nav-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-nav-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-nav-font);color:var(--bf-nav-color)}.root{display:flex;align-items:center;justify-content:space-between;gap:var(--bf-nav-padding-x);background:var(--bf-nav-bg);color:var(--bf-nav-color);border-width:var(--bf-nav-border-width);border-style:var(--bf-nav-border-style);border-color:var(--bf-nav-border-color);border-radius:var(--bf-nav-radius);padding:var(--bf-nav-padding-y) var(--bf-nav-padding-x);transition:var(--bf-nav-transition)}::slotted([col]),::slotted([nav-col]){display:flex;align-items:center;gap:var(--bf-nav-padding-x);min-width:0}::slotted([col]:first-child),::slotted([nav-col]:first-child){justify-content:flex-start;flex:1 1 0}::slotted([col]:nth-child(2)),::slotted([nav-col]:nth-child(2)){justify-content:center;flex:1 1 0}::slotted([col]:last-child),::slotted([nav-col]:last-child){justify-content:flex-end;flex:1 1 0}::slotted([row]),::slotted([nav-row]){display:flex;align-items:center;justify-content:space-between;gap:var(--bf-nav-padding-x);width:100%}`;

const BfNav$1 = /*@__PURE__*/ proxyCustomElement(class BfNav extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '718668f06ceb77fc1d2076b4854a7347bc0a5462' }, h("div", { key: '11cad1889896b49764b792d4cf228d6a12ea56df', class: "root", part: "root" }, h("slot", { key: '0351142eb246c1a089d268ee6210692369fcf3fb' }))));
    }
    static get style() { return bfNavCss(); }
}, [257, "bf-nav"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-nav"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-nav":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfNav$1);
            }
            break;
    } });
}

const BfNav = BfNav$1;
const defineCustomElement = defineCustomElement$1;

export { BfNav, defineCustomElement };
