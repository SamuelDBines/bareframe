import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfImageCss = () => `:host{--bf-image-font:var(--bf-theme-font-family, inherit);--bf-image-radius:var(--bf-theme-radius-md, 8px);--bf-image-border-width:var(--bf-theme-border-width, 1px);--bf-image-border-style:var(--bf-theme-border-style, solid);--bf-image-border-color:var(--bf-theme-image-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-image-bg:var(--bf-theme-image-bg, var(--bf-theme-surface-1, #ffffff));--bf-image-color:var(--bf-theme-image-color, var(--bf-theme-text-1, #0f172a));--bf-image-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-image-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-image-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-image-font);color:var(--bf-image-color)}.root{background:var(--bf-image-bg);color:var(--bf-image-color);border-width:var(--bf-image-border-width);border-style:var(--bf-image-border-style);border-color:var(--bf-image-border-color);border-radius:var(--bf-image-radius);padding:var(--bf-image-padding-y) var(--bf-image-padding-x);transition:var(--bf-image-transition)}`;

const BfImage$1 = /*@__PURE__*/ proxyCustomElement(class BfImage extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: 'd6601cd8dc8034dfa0175a4f7dcb596acd2d2045' }, h("div", { key: '84da6d5ed37b504f45a99b1994a7713f77fddd49', class: "root", part: "root" }, h("slot", { key: '56adb7437b850285f6992d543738690cfbbf495f' }))));
    }
    static get style() { return bfImageCss(); }
}, [257, "bf-image"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-image"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-image":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfImage$1);
            }
            break;
    } });
}

const BfImage = BfImage$1;
const defineCustomElement = defineCustomElement$1;

export { BfImage, defineCustomElement };
