import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfCountdownCss = () => `:host{--bf-countdown-font:var(--bf-theme-font-family, inherit);--bf-countdown-radius:var(--bf-theme-radius-md, 8px);--bf-countdown-border-width:var(--bf-theme-border-width, 1px);--bf-countdown-border-style:var(--bf-theme-border-style, solid);--bf-countdown-border-color:var(--bf-theme-countdown-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-countdown-bg:var(--bf-theme-countdown-bg, var(--bf-theme-surface-1, #ffffff));--bf-countdown-color:var(--bf-theme-countdown-color, var(--bf-theme-text-1, #0f172a));--bf-countdown-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-countdown-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-countdown-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-countdown-font);color:var(--bf-countdown-color)}.root{background:var(--bf-countdown-bg);color:var(--bf-countdown-color);border-width:var(--bf-countdown-border-width);border-style:var(--bf-countdown-border-style);border-color:var(--bf-countdown-border-color);border-radius:var(--bf-countdown-radius);padding:var(--bf-countdown-padding-y) var(--bf-countdown-padding-x);transition:var(--bf-countdown-transition)}`;

const BfCountdown$1 = /*@__PURE__*/ proxyCustomElement(class BfCountdown extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: 'cfaa1b0f9629ab9c0d790c372a6c19e7d8f02dd7' }, h("div", { key: 'cd60cc6f4a131998c33adcac03faed67db62ca3f', class: "root", part: "root" }, h("slot", { key: '601d5344744e72bdb13d5963bbf190e0b6d58886' }))));
    }
    static get style() { return bfCountdownCss(); }
}, [257, "bf-countdown"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-countdown"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-countdown":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfCountdown$1);
            }
            break;
    } });
}

const BfCountdown = BfCountdown$1;
const defineCustomElement = defineCustomElement$1;

export { BfCountdown, defineCustomElement };
