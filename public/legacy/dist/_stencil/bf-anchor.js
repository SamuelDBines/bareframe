import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfAnchorCss = () => `:host{--bf-anchor-font:var(--bf-theme-font-family, inherit);--bf-anchor-radius:var(--bf-theme-radius-md, 8px);--bf-anchor-border-width:var(--bf-theme-border-width, 1px);--bf-anchor-border-style:var(--bf-theme-border-style, solid);--bf-anchor-border-color:var(--bf-theme-anchor-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-anchor-bg:var(--bf-theme-anchor-bg, var(--bf-theme-surface-1, #ffffff));--bf-anchor-color:var(--bf-theme-anchor-color, var(--bf-theme-text-1, #0f172a));--bf-anchor-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-anchor-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-anchor-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-anchor-font);color:var(--bf-anchor-color)}.root{background:var(--bf-anchor-bg);color:var(--bf-anchor-color);border-width:var(--bf-anchor-border-width);border-style:var(--bf-anchor-border-style);border-color:var(--bf-anchor-border-color);border-radius:var(--bf-anchor-radius);padding:var(--bf-anchor-padding-y) var(--bf-anchor-padding-x);transition:var(--bf-anchor-transition)}`;

const BfAnchor$1 = /*@__PURE__*/ proxyCustomElement(class BfAnchor extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '648ef1357be1312d3a500c528ad7e28b589c8a7f' }, h("div", { key: 'f9073a5aa1be6b790cd17710f2ef387e0fe0f8ed', class: "root", part: "root" }, h("slot", { key: 'faf6498245cb15dce362cad9297bfa9cfc3a66b2' }))));
    }
    static get style() { return bfAnchorCss(); }
}, [257, "bf-anchor"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-anchor"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-anchor":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfAnchor$1);
            }
            break;
    } });
}

const BfAnchor = BfAnchor$1;
const defineCustomElement = defineCustomElement$1;

export { BfAnchor, defineCustomElement };
