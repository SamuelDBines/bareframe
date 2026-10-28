import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfFormFieldCss = () => `:host{--bf-form-field-font:var(--bf-theme-font-family, inherit);--bf-form-field-radius:var(--bf-theme-radius-md, 8px);--bf-form-field-border-width:var(--bf-theme-border-width, 1px);--bf-form-field-border-style:var(--bf-theme-border-style, solid);--bf-form-field-border-color:var(--bf-theme-form-field-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-form-field-bg:var(--bf-theme-form-field-bg, var(--bf-theme-surface-1, #ffffff));--bf-form-field-color:var(--bf-theme-form-field-color, var(--bf-theme-text-1, #0f172a));--bf-form-field-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-form-field-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-form-field-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-form-field-font);color:var(--bf-form-field-color)}.root{background:var(--bf-form-field-bg);color:var(--bf-form-field-color);border-width:var(--bf-form-field-border-width);border-style:var(--bf-form-field-border-style);border-color:var(--bf-form-field-border-color);border-radius:var(--bf-form-field-radius);padding:var(--bf-form-field-padding-y) var(--bf-form-field-padding-x);transition:var(--bf-form-field-transition)}`;

const BfFormField$1 = /*@__PURE__*/ proxyCustomElement(class BfFormField extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '94c9226993a86f197114a0e5435e533f087d14e1' }, h("div", { key: 'a7562339050fbedd5ecf649729ad948954298151', class: "root", part: "root" }, h("slot", { key: '9b799bb1cdd8ba919c85f4fb5345d2535bafb381' }))));
    }
    static get style() { return bfFormFieldCss(); }
}, [257, "bf-form-field"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-form-field"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-form-field":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfFormField$1);
            }
            break;
    } });
}

const BfFormField = BfFormField$1;
const defineCustomElement = defineCustomElement$1;

export { BfFormField, defineCustomElement };
