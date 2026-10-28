import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfMessageCss = () => `:host{--bf-message-font:var(--bf-theme-font-family, inherit);--bf-message-radius:var(--bf-theme-radius-md, 8px);--bf-message-border-width:var(--bf-theme-border-width, 1px);--bf-message-border-style:var(--bf-theme-border-style, solid);--bf-message-border-color:var(--bf-theme-message-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-message-bg:var(--bf-theme-message-bg, var(--bf-theme-surface-1, #ffffff));--bf-message-color:var(--bf-theme-message-color, var(--bf-theme-text-1, #0f172a));--bf-message-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-message-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-message-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-message-font);color:var(--bf-message-color)}.root{background:var(--bf-message-bg);color:var(--bf-message-color);border-width:var(--bf-message-border-width);border-style:var(--bf-message-border-style);border-color:var(--bf-message-border-color);border-radius:var(--bf-message-radius);padding:var(--bf-message-padding-y) var(--bf-message-padding-x);transition:var(--bf-message-transition)}`;

const BfMessage$1 = /*@__PURE__*/ proxyCustomElement(class BfMessage extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: 'af5e2b48248c253a761c257780143d69823811af' }, h("div", { key: '2e6983e4e49cceb0d15d6f448666b5758ed3913c', class: "root", part: "root" }, h("slot", { key: 'b1ecb51baffe6063eff41b4ef4dd235a36db79c4' }))));
    }
    static get style() { return bfMessageCss(); }
}, [257, "bf-message"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-message"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-message":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfMessage$1);
            }
            break;
    } });
}

const BfMessage = BfMessage$1;
const defineCustomElement = defineCustomElement$1;

export { BfMessage, defineCustomElement };
