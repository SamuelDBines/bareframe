import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfComboboxCss = () => `:host{--bf-combobox-font:var(--bf-theme-font-family, inherit);--bf-combobox-radius:var(--bf-theme-radius-md, 8px);--bf-combobox-border-width:var(--bf-theme-border-width, 1px);--bf-combobox-border-style:var(--bf-theme-border-style, solid);--bf-combobox-border-color:var(--bf-theme-combobox-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-combobox-bg:var(--bf-theme-combobox-bg, var(--bf-theme-surface-1, #ffffff));--bf-combobox-color:var(--bf-theme-combobox-color, var(--bf-theme-text-1, #0f172a));--bf-combobox-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-combobox-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-combobox-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-combobox-font);color:var(--bf-combobox-color)}.root{background:var(--bf-combobox-bg);color:var(--bf-combobox-color);border-width:var(--bf-combobox-border-width);border-style:var(--bf-combobox-border-style);border-color:var(--bf-combobox-border-color);border-radius:var(--bf-combobox-radius);padding:var(--bf-combobox-padding-y) var(--bf-combobox-padding-x);transition:var(--bf-combobox-transition)}`;

const BfCombobox$1 = /*@__PURE__*/ proxyCustomElement(class BfCombobox extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '9bec26ae0a5bb96100a50c4678c2e8daa5e50b26' }, h("div", { key: 'a6cddd8dd910da9812650d35c1f14e725083d7de', class: "root", part: "root" }, h("slot", { key: '770b3b9740f20577c589224794e300427719c0ce' }))));
    }
    static get style() { return bfComboboxCss(); }
}, [257, "bf-combobox"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-combobox"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-combobox":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfCombobox$1);
            }
            break;
    } });
}

const BfCombobox = BfCombobox$1;
const defineCustomElement = defineCustomElement$1;

export { BfCombobox, defineCustomElement };
