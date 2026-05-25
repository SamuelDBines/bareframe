import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfHeroCss = () => `:host{--bf-hero-font:var(--bf-theme-font-family, inherit);--bf-hero-radius:var(--bf-theme-radius-md, 8px);--bf-hero-border-width:var(--bf-theme-border-width, 1px);--bf-hero-border-style:var(--bf-theme-border-style, solid);--bf-hero-border-color:var(--bf-theme-hero-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-hero-bg:var(--bf-theme-hero-bg, var(--bf-theme-surface-1, #ffffff));--bf-hero-color:var(--bf-theme-hero-color, var(--bf-theme-text-1, #0f172a));--bf-hero-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-hero-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-hero-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-hero-font);color:var(--bf-hero-color)}.root{background:var(--bf-hero-bg);color:var(--bf-hero-color);border-width:var(--bf-hero-border-width);border-style:var(--bf-hero-border-style);border-color:var(--bf-hero-border-color);border-radius:var(--bf-hero-radius);padding:var(--bf-hero-padding-y) var(--bf-hero-padding-x);transition:var(--bf-hero-transition)}`;

const BfHero$1 = /*@__PURE__*/ proxyCustomElement(class BfHero extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: 'd89c9e898e1256374e40ea35371edc05d8466076' }, h("div", { key: '939a7380e31b3624a3d1d331184e15d9759fa5e7', class: "root", part: "root" }, h("slot", { key: 'becda2efbe339a51306beb5f3c99b13ef95dc74e' }))));
    }
    static get style() { return bfHeroCss(); }
}, [257, "bf-hero"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-hero"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-hero":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfHero$1);
            }
            break;
    } });
}

const BfHero = BfHero$1;
const defineCustomElement = defineCustomElement$1;

export { BfHero, defineCustomElement };
