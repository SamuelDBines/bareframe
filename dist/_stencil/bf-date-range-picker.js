import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfDateRangePickerCss = () => `:host{--bf-date-range-picker-font:var(--bf-theme-font-family, inherit);--bf-date-range-picker-radius:var(--bf-theme-radius-md, 8px);--bf-date-range-picker-border-width:var(--bf-theme-border-width, 1px);--bf-date-range-picker-border-style:var(--bf-theme-border-style, solid);--bf-date-range-picker-border-color:var(--bf-theme-date-range-picker-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-date-range-picker-bg:var(--bf-theme-date-range-picker-bg, var(--bf-theme-surface-1, #ffffff));--bf-date-range-picker-color:var(--bf-theme-date-range-picker-color, var(--bf-theme-text-1, #0f172a));--bf-date-range-picker-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-date-range-picker-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-date-range-picker-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-date-range-picker-font);color:var(--bf-date-range-picker-color)}.root{background:var(--bf-date-range-picker-bg);color:var(--bf-date-range-picker-color);border-width:var(--bf-date-range-picker-border-width);border-style:var(--bf-date-range-picker-border-style);border-color:var(--bf-date-range-picker-border-color);border-radius:var(--bf-date-range-picker-radius);padding:var(--bf-date-range-picker-padding-y) var(--bf-date-range-picker-padding-x);transition:var(--bf-date-range-picker-transition)}`;

const BfDateRangePicker$1 = /*@__PURE__*/ proxyCustomElement(class BfDateRangePicker extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '2170fea4167e6c6b2032c8332ec79f2b8bac8ba1' }, h("div", { key: 'a5bbc4d72ca4082c34dcd57490a09839e6f67dbb', class: "root", part: "root" }, h("slot", { key: '5b3678fcdf1f8d1871cc5ef70996c958360fd7d1' }))));
    }
    static get style() { return bfDateRangePickerCss(); }
}, [257, "bf-date-range-picker"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-date-range-picker"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-date-range-picker":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfDateRangePicker$1);
            }
            break;
    } });
}

const BfDateRangePicker = BfDateRangePicker$1;
const defineCustomElement = defineCustomElement$1;

export { BfDateRangePicker, defineCustomElement };
