import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfNumberFieldCss = () => `:host{--bf-number-field-font:var(--bf-theme-font-family, inherit);--bf-number-field-radius:var(--bf-theme-radius-md, 8px);--bf-number-field-border-width:var(--bf-theme-border-width, 1px);--bf-number-field-border-style:var(--bf-theme-border-style, solid);--bf-number-field-border-color:var(--bf-theme-number-field-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-number-field-bg:var(--bf-theme-number-field-bg, var(--bf-theme-surface-1, #ffffff));--bf-number-field-color:var(--bf-theme-number-field-color, var(--bf-theme-text-1, #0f172a));--bf-number-field-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-number-field-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-number-field-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-number-field-font);color:var(--bf-number-field-color)}.root{background:var(--bf-number-field-bg);color:var(--bf-number-field-color);border-width:var(--bf-number-field-border-width);border-style:var(--bf-number-field-border-style);border-color:var(--bf-number-field-border-color);border-radius:var(--bf-number-field-radius);padding:var(--bf-number-field-padding-y) var(--bf-number-field-padding-x);transition:var(--bf-number-field-transition)}`;

const BfNumberField$1 = /*@__PURE__*/ proxyCustomElement(class BfNumberField extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '53fac1a288dd8ab3624f349bd214c0ae81d4645c' }, h("div", { key: '722eee0a1a12a27a337b142872a0f15089c9a738', class: "root", part: "root" }, h("slot", { key: '81fce98f013d1200ef01d8e86cd530e0eb68443b' }))));
    }
    static get style() { return bfNumberFieldCss(); }
}, [257, "bf-number-field"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-number-field"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-number-field":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfNumberField$1);
            }
            break;
    } });
}

const BfNumberField = BfNumberField$1;
const defineCustomElement = defineCustomElement$1;

export { BfNumberField, defineCustomElement };
