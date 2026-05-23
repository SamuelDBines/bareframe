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
        return (h(Host, { key: '0313c93da5a9c5ddf648a40eb254d017e4a1e4bf' }, h("div", { key: 'bc773e9c5970e0a9628ea264af501a27c6f732d6', class: "root", part: "root" }, h("slot", { key: '88b6b4305a1685cfba7d796d875e1b2b2def45d1' }))));
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
