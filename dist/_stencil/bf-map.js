import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfMapCss = () => `:host{--bf-map-font:var(--bf-theme-font-family, inherit);--bf-map-radius:var(--bf-theme-radius-md, 8px);--bf-map-border-width:var(--bf-theme-border-width, 1px);--bf-map-border-style:var(--bf-theme-border-style, solid);--bf-map-border-color:var(--bf-theme-map-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-map-bg:var(--bf-theme-map-bg, var(--bf-theme-surface-1, #ffffff));--bf-map-color:var(--bf-theme-map-color, var(--bf-theme-text-1, #0f172a));--bf-map-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-map-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-map-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-map-font);color:var(--bf-map-color)}.root{background:var(--bf-map-bg);color:var(--bf-map-color);border-width:var(--bf-map-border-width);border-style:var(--bf-map-border-style);border-color:var(--bf-map-border-color);border-radius:var(--bf-map-radius);padding:var(--bf-map-padding-y) var(--bf-map-padding-x);transition:var(--bf-map-transition)}`;

const BfMap$1 = /*@__PURE__*/ proxyCustomElement(class BfMap extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: 'a4ac138853500556f807e519c71bb0208a03f1e2' }, h("div", { key: '0b94dee96c2b96749714c71d1af0df0acb8a78bf', class: "root", part: "root" }, h("slot", { key: '436c9ee9ff98c56e22cbb851916d2e71c508f32f' }))));
    }
    static get style() { return bfMapCss(); }
}, [257, "bf-map"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-map"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-map":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfMap$1);
            }
            break;
    } });
}

const BfMap = BfMap$1;
const defineCustomElement = defineCustomElement$1;

export { BfMap, defineCustomElement };
