import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfToolbarCss = () => `:host{--bf-toolbar-font:var(--bf-theme-font-family, inherit);--bf-toolbar-radius:var(--bf-theme-radius-md, 8px);--bf-toolbar-border-width:var(--bf-theme-border-width, 1px);--bf-toolbar-border-style:var(--bf-theme-border-style, solid);--bf-toolbar-border-color:var(--bf-theme-toolbar-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-toolbar-bg:var(--bf-theme-toolbar-bg, var(--bf-theme-surface-1, #ffffff));--bf-toolbar-color:var(--bf-theme-toolbar-color, var(--bf-theme-text-1, #0f172a));--bf-toolbar-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-toolbar-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-toolbar-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-toolbar-font);color:var(--bf-toolbar-color)}.root{background:var(--bf-toolbar-bg);color:var(--bf-toolbar-color);border-width:var(--bf-toolbar-border-width);border-style:var(--bf-toolbar-border-style);border-color:var(--bf-toolbar-border-color);border-radius:var(--bf-toolbar-radius);padding:var(--bf-toolbar-padding-y) var(--bf-toolbar-padding-x);transition:var(--bf-toolbar-transition)}`;

const BfToolbar$1 = /*@__PURE__*/ proxyCustomElement(class BfToolbar extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '6ced500fd14a5703325e83b6f67963855205212b' }, h("div", { key: 'a4ed455dbfd06fedef63a5b9e220ca6f32c6209c', class: "root", part: "root" }, h("slot", { key: 'a6c8dbd8d47e167c73a6f030e32d0f5538ee46f2' }))));
    }
    static get style() { return bfToolbarCss(); }
}, [257, "bf-toolbar"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-toolbar"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-toolbar":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfToolbar$1);
            }
            break;
    } });
}

const BfToolbar = BfToolbar$1;
const defineCustomElement = defineCustomElement$1;

export { BfToolbar, defineCustomElement };
