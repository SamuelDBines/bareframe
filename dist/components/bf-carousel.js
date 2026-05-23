import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfCarouselCss = () => `:host{--bf-carousel-font:var(--bf-theme-font-family, inherit);--bf-carousel-radius:var(--bf-theme-radius-md, 8px);--bf-carousel-border-width:var(--bf-theme-border-width, 1px);--bf-carousel-border-style:var(--bf-theme-border-style, solid);--bf-carousel-border-color:var(--bf-theme-carousel-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-carousel-bg:var(--bf-theme-carousel-bg, var(--bf-theme-surface-1, #ffffff));--bf-carousel-color:var(--bf-theme-carousel-color, var(--bf-theme-text-1, #0f172a));--bf-carousel-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-carousel-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-carousel-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-carousel-font);color:var(--bf-carousel-color)}.root{background:var(--bf-carousel-bg);color:var(--bf-carousel-color);border-width:var(--bf-carousel-border-width);border-style:var(--bf-carousel-border-style);border-color:var(--bf-carousel-border-color);border-radius:var(--bf-carousel-radius);padding:var(--bf-carousel-padding-y) var(--bf-carousel-padding-x);transition:var(--bf-carousel-transition)}`;

const BfCarousel$1 = /*@__PURE__*/ proxyCustomElement(class BfCarousel extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '5ae1c83b8b44632f6e6f35bda255e5ce50d605a0' }, h("div", { key: 'd5f25ac85a93960d720dbb4a37ece0943c517dcf', class: "root", part: "root" }, h("slot", { key: '193530e691c93e5a007ae73ba19e05ab4614c2cf' }))));
    }
    static get style() { return bfCarouselCss(); }
}, [257, "bf-carousel"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-carousel"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-carousel":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfCarousel$1);
            }
            break;
    } });
}

const BfCarousel = BfCarousel$1;
const defineCustomElement = defineCustomElement$1;

export { BfCarousel, defineCustomElement };
