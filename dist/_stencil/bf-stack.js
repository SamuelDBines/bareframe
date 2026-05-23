import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfStackCss = () => `:host{--bf-stack-font:var(--bf-theme-font-family, inherit);--bf-stack-radius:var(--bf-theme-radius-md, 8px);--bf-stack-border-width:var(--bf-theme-border-width, 1px);--bf-stack-border-style:var(--bf-theme-border-style, solid);--bf-stack-border-color:var(--bf-theme-stack-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-stack-bg:var(--bf-theme-stack-bg, var(--bf-theme-surface-1, #ffffff));--bf-stack-color:var(--bf-theme-stack-color, var(--bf-theme-text-1, #0f172a));--bf-stack-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-stack-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-stack-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-stack-font);color:var(--bf-stack-color)}.root{background:var(--bf-stack-bg);color:var(--bf-stack-color);border-width:var(--bf-stack-border-width);border-style:var(--bf-stack-border-style);border-color:var(--bf-stack-border-color);border-radius:var(--bf-stack-radius);padding:var(--bf-stack-padding-y) var(--bf-stack-padding-x);transition:var(--bf-stack-transition)}`;

const BfStack$1 = /*@__PURE__*/ proxyCustomElement(class BfStack extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '2d22c14310575cb42049e1feee1d4232ad2f8247' }, h("div", { key: '73400642d6a3d48c005dde878a3a816d15d5750b', class: "root", part: "root" }, h("slot", { key: '19cd06815d9caf7f96bcc4c85f7737f180b344ab' }))));
    }
    static get style() { return bfStackCss(); }
}, [257, "bf-stack"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-stack"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-stack":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfStack$1);
            }
            break;
    } });
}

const BfStack = BfStack$1;
const defineCustomElement = defineCustomElement$1;

export { BfStack, defineCustomElement };
