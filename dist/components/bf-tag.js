import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfTagCss = () => `:host{--bf-tag-font:var(--bf-theme-font-family, inherit);--bf-tag-radius:var(--bf-theme-radius-md, 8px);--bf-tag-border-width:var(--bf-theme-border-width, 1px);--bf-tag-border-style:var(--bf-theme-border-style, solid);--bf-tag-border-color:var(--bf-theme-tag-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-tag-bg:var(--bf-theme-tag-bg, var(--bf-theme-surface-1, #ffffff));--bf-tag-color:var(--bf-theme-tag-color, var(--bf-theme-text-1, #0f172a));--bf-tag-padding-y:0.35rem;--bf-tag-padding-x:0.55rem;--bf-tag-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:inline-block;font:var(--bf-tag-font);color:var(--bf-tag-color)}.root{display:inline-flex;align-items:center;justify-content:center;gap:0.3rem;line-height:1;font-size:0.82rem;font-weight:600;background:var(--bf-tag-bg);color:var(--bf-tag-color);border-width:var(--bf-tag-border-width);border-style:var(--bf-tag-border-style);border-color:var(--bf-tag-border-color);border-radius:var(--bf-tag-radius);padding:var(--bf-tag-padding-y) var(--bf-tag-padding-x);transition:var(--bf-tag-transition)}.root[data-size='sm']{font-size:0.74rem;padding:0.22rem 0.42rem}.root[data-size='lg']{font-size:0.9rem;padding:0.45rem 0.68rem}.root[data-variant='badge']{font-size:0.72rem;font-weight:700;min-width:1.35rem;padding:0.14rem 0.42rem;border-radius:999px}.root[data-variant='pill']{border-radius:999px}.root[data-variant='chip']{padding-right:0.75rem}`;

const BfTag$1 = /*@__PURE__*/ proxyCustomElement(class BfTag extends H {
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
        this.observer = new MutationObserver(() => this.applyRoot());
        this.observer.observe(this.el, { attributes: true });
        this.applyRoot();
    }
    disconnectedCallback() {
        this.observer?.disconnect();
    }
    applyRoot() {
        const root = this.el.shadowRoot?.querySelector('.root');
        if (!(root instanceof H)) {
            return;
        }
        const explicit = (this.el.getAttribute('variant') || '').toLowerCase();
        let variant = 'tag';
        if (['tag', 'badge', 'chip', 'pill'].includes(explicit)) {
            variant = explicit;
        }
        else if (this.el.hasAttribute('badge')) {
            variant = 'badge';
        }
        else if (this.el.hasAttribute('chip')) {
            variant = 'chip';
        }
        else if (this.el.hasAttribute('pill')) {
            variant = 'pill';
        }
        root.dataset.variant = variant;
        const size = (this.el.getAttribute('size') || 'md').toLowerCase();
        root.dataset.size = ['sm', 'md', 'lg'].includes(size) ? size : 'md';
    }
    componentDidRender() {
        this.applyRoot();
    }
    render() {
        return (h(Host, { key: 'dc28edc02da6b3b78624dd40d56a2ad439918f19' }, h("div", { key: '8c6fb57ee3b73649838faebcf6ece972bab07009', class: "root", part: "root", "data-variant": "tag", "data-size": "md" }, h("slot", { key: '09e9b3d34278808477949d5dbb5349858978a080' }))));
    }
    static get style() { return bfTagCss(); }
}, [257, "bf-tag"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-tag"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-tag":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfTag$1);
            }
            break;
    } });
}

const BfTag = BfTag$1;
const defineCustomElement = defineCustomElement$1;

export { BfTag, defineCustomElement };
