import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfIconCss = () => `:host{--bf-icon-font:var(--bf-theme-font-family, inherit);--bf-icon-radius:var(--bf-theme-radius-md, 8px);--bf-icon-border-width:var(--bf-theme-border-width, 1px);--bf-icon-border-style:var(--bf-theme-border-style, solid);--bf-icon-border-color:var(--bf-theme-icon-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-icon-bg:var(--bf-theme-icon-bg, var(--bf-theme-surface-1, #ffffff));--bf-icon-color:var(--bf-theme-icon-color, var(--bf-theme-text-1, #0f172a));--bf-icon-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-icon-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-icon-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-icon-font);color:var(--bf-icon-color)}.root{background:var(--bf-icon-bg);color:var(--bf-icon-color);border-width:var(--bf-icon-border-width);border-style:var(--bf-icon-border-style);border-color:var(--bf-icon-border-color);border-radius:var(--bf-icon-radius);padding:var(--bf-icon-padding-y) var(--bf-icon-padding-x);transition:var(--bf-icon-transition)}`;

const BfIcon$1 = /*@__PURE__*/ proxyCustomElement(class BfIcon extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '8f3b081e76e3403ee2e9e74f4f80ba2c02fd666f' }, h("div", { key: '15c351f6f09e3f9628101b537737167f5c50566e', class: "root", part: "root" }, h("slot", { key: '7016ccc5ac8777dcadc8cdd3eb115d616ca0415f' }))));
    }
    static get style() { return bfIconCss(); }
}, [257, "bf-icon"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-icon"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-icon":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfIcon$1);
            }
            break;
    } });
}

const BfIcon = BfIcon$1;
const defineCustomElement = defineCustomElement$1;

export { BfIcon, defineCustomElement };
