import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfFabCss = () => `:host{--bf-fab-font:var(--bf-theme-font-family, inherit);--bf-fab-radius:var(--bf-theme-radius-md, 8px);--bf-fab-border-width:var(--bf-theme-border-width, 1px);--bf-fab-border-style:var(--bf-theme-border-style, solid);--bf-fab-border-color:var(--bf-theme-fab-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-fab-bg:var(--bf-theme-fab-bg, var(--bf-theme-surface-1, #ffffff));--bf-fab-color:var(--bf-theme-fab-color, var(--bf-theme-text-1, #0f172a));--bf-fab-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-fab-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-fab-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-fab-font);color:var(--bf-fab-color)}.root{background:var(--bf-fab-bg);color:var(--bf-fab-color);border-width:var(--bf-fab-border-width);border-style:var(--bf-fab-border-style);border-color:var(--bf-fab-border-color);border-radius:var(--bf-fab-radius);padding:var(--bf-fab-padding-y) var(--bf-fab-padding-x);transition:var(--bf-fab-transition)}`;

const BfFab$1 = /*@__PURE__*/ proxyCustomElement(class BfFab extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '7147c8d9e521a34df4ad38e72e4b5424e996b204' }, h("div", { key: '1d3d92ede46cfb42b36c2dbd8061e0f939cd6ce8', class: "root", part: "root" }, h("slot", { key: '3867aed8c1b92e698cc98903d4d75a2ce5999265' }))));
    }
    static get style() { return bfFabCss(); }
}, [257, "bf-fab"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-fab"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-fab":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfFab$1);
            }
            break;
    } });
}

const BfFab = BfFab$1;
const defineCustomElement = defineCustomElement$1;

export { BfFab, defineCustomElement };
