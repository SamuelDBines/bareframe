import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfCardCss = () => `:host{--bf-card-font:var(--bf-theme-font-family, inherit);--bf-card-radius:var(--bf-theme-radius-md, 8px);--bf-card-border-width:var(--bf-theme-border-width, 1px);--bf-card-border-style:var(--bf-theme-border-style, solid);--bf-card-border-color:var(--bf-theme-card-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-card-bg:var(--bf-theme-card-bg, var(--bf-theme-surface-1, #ffffff));--bf-card-color:var(--bf-theme-card-color, var(--bf-theme-text-1, #0f172a));--bf-card-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-card-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-card-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-card-font);color:var(--bf-card-color)}.root{background:var(--bf-card-bg);color:var(--bf-card-color);border-width:var(--bf-card-border-width);border-style:var(--bf-card-border-style);border-color:var(--bf-card-border-color);border-radius:var(--bf-card-radius);padding:var(--bf-card-padding-y) var(--bf-card-padding-x);transition:var(--bf-card-transition)}`;

const BfCard$1 = /*@__PURE__*/ proxyCustomElement(class BfCard extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '6907f116ce55c177fb68a3cfbd4ffd27f2826990' }, h("div", { key: '7693d04e61d530cad577b1b82ff6dc51bcb22e4b', class: "root", part: "root" }, h("slot", { key: 'b31178fbeb9764f3666f804e5ddb59957a9c6b42' }))));
    }
    static get style() { return bfCardCss(); }
}, [257, "bf-card"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-card"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-card":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfCard$1);
            }
            break;
    } });
}

const BfCard = BfCard$1;
const defineCustomElement = defineCustomElement$1;

export { BfCard, defineCustomElement };
