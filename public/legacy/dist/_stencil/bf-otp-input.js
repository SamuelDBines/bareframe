import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfOtpInputCss = () => `:host{--bf-otp-input-font:var(--bf-theme-font-family, inherit);--bf-otp-input-radius:var(--bf-theme-radius-md, 8px);--bf-otp-input-border-width:var(--bf-theme-border-width, 1px);--bf-otp-input-border-style:var(--bf-theme-border-style, solid);--bf-otp-input-border-color:var(--bf-theme-otp-input-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-otp-input-bg:var(--bf-theme-otp-input-bg, var(--bf-theme-surface-1, #ffffff));--bf-otp-input-color:var(--bf-theme-otp-input-color, var(--bf-theme-text-1, #0f172a));--bf-otp-input-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-otp-input-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-otp-input-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-otp-input-font);color:var(--bf-otp-input-color)}.root{background:var(--bf-otp-input-bg);color:var(--bf-otp-input-color);border-width:var(--bf-otp-input-border-width);border-style:var(--bf-otp-input-border-style);border-color:var(--bf-otp-input-border-color);border-radius:var(--bf-otp-input-radius);padding:var(--bf-otp-input-padding-y) var(--bf-otp-input-padding-x);transition:var(--bf-otp-input-transition)}`;

const BfOtpInput$1 = /*@__PURE__*/ proxyCustomElement(class BfOtpInput extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: 'd55855b74c5b1c29a1ab76c5711ba6946a060978' }, h("div", { key: '0e2a27f50e301a3f33f17adbb0c6ae0c58bd118e', class: "root", part: "root" }, h("slot", { key: 'd9ded8b3dc4ccb931bea4770e70c1fe5d6c3cb17' }))));
    }
    static get style() { return bfOtpInputCss(); }
}, [257, "bf-otp-input"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-otp-input"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-otp-input":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfOtpInput$1);
            }
            break;
    } });
}

const BfOtpInput = BfOtpInput$1;
const defineCustomElement = defineCustomElement$1;

export { BfOtpInput, defineCustomElement };
