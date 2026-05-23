import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfCanvasCss = () => `:host{--bf-canvas-font:var(--bf-theme-font-family, inherit);--bf-canvas-radius:var(--bf-theme-radius-md, 8px);--bf-canvas-border-width:var(--bf-theme-border-width, 1px);--bf-canvas-border-style:var(--bf-theme-border-style, solid);--bf-canvas-border-color:var(--bf-theme-canvas-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-canvas-bg:var(--bf-theme-canvas-bg, var(--bf-theme-surface-1, #ffffff));--bf-canvas-color:var(--bf-theme-canvas-color, var(--bf-theme-text-1, #0f172a));--bf-canvas-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-canvas-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-canvas-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-canvas-font);color:var(--bf-canvas-color)}.root{background:var(--bf-canvas-bg);color:var(--bf-canvas-color);border-width:var(--bf-canvas-border-width);border-style:var(--bf-canvas-border-style);border-color:var(--bf-canvas-border-color);border-radius:var(--bf-canvas-radius);padding:var(--bf-canvas-padding-y) var(--bf-canvas-padding-x);transition:var(--bf-canvas-transition)}`;

const BfCanvas$1 = /*@__PURE__*/ proxyCustomElement(class BfCanvas extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: 'f62735290b05e9c7bba7c5d58c567b73b7878c56' }, h("div", { key: 'c6822e0e1113133981794871f97a94da6bd69786', class: "root", part: "root" }, h("slot", { key: '44c55de1de111513a46f2b4a98c8ac6375e54fc7' }))));
    }
    static get style() { return bfCanvasCss(); }
}, [257, "bf-canvas"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-canvas"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-canvas":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfCanvas$1);
            }
            break;
    } });
}

const BfCanvas = BfCanvas$1;
const defineCustomElement = defineCustomElement$1;

export { BfCanvas, defineCustomElement };
