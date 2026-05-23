import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfLoadingIndicatorCss = () => `:host{--bf-loading-indicator-font:var(--bf-theme-font-family, inherit);--bf-loading-indicator-radius:var(--bf-theme-radius-md, 8px);--bf-loading-indicator-border-width:var(--bf-theme-border-width, 1px);--bf-loading-indicator-border-style:var(--bf-theme-border-style, solid);--bf-loading-indicator-border-color:var(--bf-theme-loading-indicator-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-loading-indicator-bg:var(--bf-theme-loading-indicator-bg, var(--bf-theme-surface-1, #ffffff));--bf-loading-indicator-color:var(--bf-theme-loading-indicator-color, var(--bf-theme-text-1, #0f172a));--bf-loading-indicator-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-loading-indicator-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-loading-indicator-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-loading-indicator-font);color:var(--bf-loading-indicator-color)}.root{background:var(--bf-loading-indicator-bg);color:var(--bf-loading-indicator-color);border-width:var(--bf-loading-indicator-border-width);border-style:var(--bf-loading-indicator-border-style);border-color:var(--bf-loading-indicator-border-color);border-radius:var(--bf-loading-indicator-radius);padding:var(--bf-loading-indicator-padding-y) var(--bf-loading-indicator-padding-x);transition:var(--bf-loading-indicator-transition)}`;

const BfLoadingIndicator$1 = /*@__PURE__*/ proxyCustomElement(class BfLoadingIndicator extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: 'a52aa77a78095ca159c54aab320190ce9912d1a4' }, h("div", { key: '3b3ec635b40a84f5520d6b1c04ee83360673b1e9', class: "root", part: "root" }, h("slot", { key: 'b36a15ff8ab24777799d1e74919f846330c757d3' }))));
    }
    static get style() { return bfLoadingIndicatorCss(); }
}, [257, "bf-loading-indicator"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-loading-indicator"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-loading-indicator":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfLoadingIndicator$1);
            }
            break;
    } });
}

const BfLoadingIndicator = BfLoadingIndicator$1;
const defineCustomElement = defineCustomElement$1;

export { BfLoadingIndicator, defineCustomElement };
