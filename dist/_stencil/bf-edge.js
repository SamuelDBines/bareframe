import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfEdgeCss = () => `:host{--bf-edge-font:var(--bf-theme-font-family, inherit);--bf-edge-radius:var(--bf-theme-radius-md, 8px);--bf-edge-border-width:var(--bf-theme-border-width, 1px);--bf-edge-border-style:var(--bf-theme-border-style, solid);--bf-edge-border-color:var(--bf-theme-header-border-color, var(--bf-theme-footer-border-color, var(--bf-theme-border-1, #cbd5e1)));--bf-edge-bg:var(--bf-theme-header-bg, var(--bf-theme-footer-bg, var(--bf-theme-surface-1, #ffffff)));--bf-edge-color:var(--bf-theme-header-color, var(--bf-theme-footer-color, var(--bf-theme-text-1, #0f172a)));--bf-edge-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-edge-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-edge-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-edge-font);color:var(--bf-edge-color)}.root{background:var(--bf-edge-bg);color:var(--bf-edge-color);border-width:var(--bf-edge-border-width);border-style:var(--bf-edge-border-style);border-color:var(--bf-edge-border-color);border-radius:var(--bf-edge-radius);padding:var(--bf-edge-padding-y) var(--bf-edge-padding-x);transition:var(--bf-edge-transition)}:host([sticky]){position:sticky;z-index:var(--bf-theme-z-sticky, 100)}:host([fixed]){position:fixed;left:0;right:0;z-index:var(--bf-theme-z-fixed, 200)}:host([header][sticky]),:host([header][fixed]){top:0;bottom:auto}:host([footer][sticky]),:host([footer][fixed]){bottom:0;top:auto}`;

const BfEdge$1 = /*@__PURE__*/ proxyCustomElement(class BfEdge extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
    observer;
    connectedCallback() {
        this.observer = new MutationObserver(() => this.syncPosition());
        this.observer.observe(this.el, {
            attributes: true,
            attributeFilter: ['position', 'sticky', 'fixed', 'header', 'footer'],
        });
        this.syncPosition();
    }
    disconnectedCallback() {
        this.observer?.disconnect();
    }
    syncPosition() {
        if (!this.el.hasAttribute('header') &&
            !this.el.hasAttribute('footer') &&
            !this.el.getAttribute('position')) {
            this.el.setAttribute('header', '');
        }
        const position = this.el.getAttribute('position');
        if (position === 'bottom') {
            this.el.removeAttribute('header');
            this.el.setAttribute('footer', '');
        }
        if (position === 'top') {
            this.el.removeAttribute('footer');
            this.el.setAttribute('header', '');
        }
    }
    render() {
        return (h(Host, { key: '1886f1d5431f8b57acdd6d30cf4d36aeb739170b' }, h("div", { key: 'd639aa0d46f22fc27892e4ed8d5d160db066cf75', class: "root", part: "root" }, h("slot", { key: '7dbdce6a8459acc75fc66a6a433424a1c3643a07' }))));
    }
    static get style() { return bfEdgeCss(); }
}, [257, "bf-edge"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-edge"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-edge":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfEdge$1);
            }
            break;
    } });
}

const BfEdge = BfEdge$1;
const defineCustomElement = defineCustomElement$1;

export { BfEdge, defineCustomElement };
