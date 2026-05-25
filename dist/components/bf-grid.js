import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfGridCss = () => `:host{--bf-grid-font:var(--bf-theme-font-family, inherit);--bf-grid-radius:var(--bf-theme-radius-md, 8px);--bf-grid-border-width:var(--bf-theme-border-width, 1px);--bf-grid-border-style:var(--bf-theme-border-style, solid);--bf-grid-border-color:var(--bf-theme-grid-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-grid-bg:var(--bf-theme-grid-bg, var(--bf-theme-surface-1, #ffffff));--bf-grid-color:var(--bf-theme-grid-color, var(--bf-theme-text-1, #0f172a));--bf-grid-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-grid-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-grid-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-grid-font);color:var(--bf-grid-color)}.root{background:var(--bf-grid-bg);color:var(--bf-grid-color);border-width:var(--bf-grid-border-width);border-style:var(--bf-grid-border-style);border-color:var(--bf-grid-border-color);border-radius:var(--bf-grid-radius);padding:var(--bf-grid-padding-y) var(--bf-grid-padding-x);transition:var(--bf-grid-transition)}`;

const BfGrid$1 = /*@__PURE__*/ proxyCustomElement(class BfGrid extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: 'f86efe1d0899b9126b821d0c298fd17fd5c16f27' }, h("div", { key: '1800b5965241398b0464af4d5d3511094ea63765', class: "root", part: "root" }, h("slot", { key: '90b2dc38c686f222e6c0e2da328c4205f44a2064' }))));
    }
    static get style() { return bfGridCss(); }
}, [257, "bf-grid"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-grid"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-grid":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfGrid$1);
            }
            break;
    } });
}

const BfGrid = BfGrid$1;
const defineCustomElement = defineCustomElement$1;

export { BfGrid, defineCustomElement };
