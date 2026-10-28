import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfSplitterCss = () => `:host{--bf-splitter-font:var(--bf-theme-font-family, inherit);--bf-splitter-radius:var(--bf-theme-radius-md, 8px);--bf-splitter-border-width:var(--bf-theme-border-width, 1px);--bf-splitter-border-style:var(--bf-theme-border-style, solid);--bf-splitter-border-color:var(--bf-theme-splitter-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-splitter-bg:var(--bf-theme-splitter-bg, var(--bf-theme-surface-1, #ffffff));--bf-splitter-color:var(--bf-theme-splitter-color, var(--bf-theme-text-1, #0f172a));--bf-splitter-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-splitter-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-splitter-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-splitter-font);color:var(--bf-splitter-color)}.root{background:var(--bf-splitter-bg);color:var(--bf-splitter-color);border-width:var(--bf-splitter-border-width);border-style:var(--bf-splitter-border-style);border-color:var(--bf-splitter-border-color);border-radius:var(--bf-splitter-radius);padding:var(--bf-splitter-padding-y) var(--bf-splitter-padding-x);transition:var(--bf-splitter-transition)}`;

const BfSplitter$1 = /*@__PURE__*/ proxyCustomElement(class BfSplitter extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: 'aaae2b1394b8eb3905d04df55aeea943c2ae2100' }, h("div", { key: '80b926c54c25b7773e59665f94e33168423312f0', class: "root", part: "root" }, h("slot", { key: '3e4b971caa1d5d88f9a33eda07bc70e846d3403e' }))));
    }
    static get style() { return bfSplitterCss(); }
}, [257, "bf-splitter"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-splitter"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-splitter":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfSplitter$1);
            }
            break;
    } });
}

const BfSplitter = BfSplitter$1;
const defineCustomElement = defineCustomElement$1;

export { BfSplitter, defineCustomElement };
