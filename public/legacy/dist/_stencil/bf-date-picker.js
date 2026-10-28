import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfDatePickerCss = () => `:host{--bf-date-picker-font:var(--bf-theme-font-family, inherit);--bf-date-picker-radius:var(--bf-theme-radius-md, 8px);--bf-date-picker-border-width:var(--bf-theme-border-width, 1px);--bf-date-picker-border-style:var(--bf-theme-border-style, solid);--bf-date-picker-border-color:var(--bf-theme-date-picker-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-date-picker-bg:var(--bf-theme-date-picker-bg, var(--bf-theme-surface-1, #ffffff));--bf-date-picker-color:var(--bf-theme-date-picker-color, var(--bf-theme-text-1, #0f172a));--bf-date-picker-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-date-picker-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-date-picker-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-date-picker-font);color:var(--bf-date-picker-color)}.root{background:var(--bf-date-picker-bg);color:var(--bf-date-picker-color);border-width:var(--bf-date-picker-border-width);border-style:var(--bf-date-picker-border-style);border-color:var(--bf-date-picker-border-color);border-radius:var(--bf-date-picker-radius);padding:var(--bf-date-picker-padding-y) var(--bf-date-picker-padding-x);transition:var(--bf-date-picker-transition)}`;

const BfDatePicker$1 = /*@__PURE__*/ proxyCustomElement(class BfDatePicker extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: 'fd6753901a1e3b46a5e6c282616d16b07e85688c' }, h("div", { key: '157f0c1979c4cfa9ca509c5bf20817c266ccab2f', class: "root", part: "root" }, h("slot", { key: '549de96b86ca2e4a5de15c90045bcfc3eb5e4cde' }))));
    }
    static get style() { return bfDatePickerCss(); }
}, [257, "bf-date-picker"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-date-picker"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-date-picker":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfDatePicker$1);
            }
            break;
    } });
}

const BfDatePicker = BfDatePicker$1;
const defineCustomElement = defineCustomElement$1;

export { BfDatePicker, defineCustomElement };
