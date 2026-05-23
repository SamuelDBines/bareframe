import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfSplitButtonCss = () => `:host{--bf-split-button-font:var(--bf-theme-font-family, inherit);--bf-split-button-radius:var(--bf-theme-radius-md, 8px);--bf-split-button-border-width:var(--bf-theme-border-width, 1px);--bf-split-button-border-style:var(--bf-theme-border-style, solid);--bf-split-button-border-color:var(--bf-theme-split-button-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-split-button-bg:var(--bf-theme-split-button-bg, var(--bf-theme-surface-1, #ffffff));--bf-split-button-color:var(--bf-theme-split-button-color, var(--bf-theme-text-1, #0f172a));--bf-split-button-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-split-button-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-split-button-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-split-button-font);color:var(--bf-split-button-color)}.root{background:var(--bf-split-button-bg);color:var(--bf-split-button-color);border-width:var(--bf-split-button-border-width);border-style:var(--bf-split-button-border-style);border-color:var(--bf-split-button-border-color);border-radius:var(--bf-split-button-radius);padding:var(--bf-split-button-padding-y) var(--bf-split-button-padding-x);transition:var(--bf-split-button-transition)}`;

const BfSplitButton$1 = /*@__PURE__*/ proxyCustomElement(class BfSplitButton extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '24d749b06440303f878e09060987505d248bdedc' }, h("div", { key: '4fef1e7a44b674d131e7dbd03fa0df60d44c23b6', class: "root", part: "root" }, h("slot", { key: 'f7773b81c5010ee9040cf2815aaaf1fba7b5edc8' }))));
    }
    static get style() { return bfSplitButtonCss(); }
}, [257, "bf-split-button"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-split-button"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-split-button":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfSplitButton$1);
            }
            break;
    } });
}

const BfSplitButton = BfSplitButton$1;
const defineCustomElement = defineCustomElement$1;

export { BfSplitButton, defineCustomElement };
