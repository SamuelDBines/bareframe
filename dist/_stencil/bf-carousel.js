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
        return (h(Host, { key: '06355dd22213579ebc05d9dd09f7f71a51fde3a3' }, h("div", { key: '4e29f05c9b20adb355420f18230c8c65ecd46dea', class: "root", part: "root" }, h("slot", { key: 'f3999c08cfc9dc44deb2eedb64cb13d5b73b88ba' }))));
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
