import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfLinkCss = () => `:host{--bf-link-font:var(--bf-theme-font-family, inherit);--bf-link-radius:var(--bf-theme-radius-md, 10px);--bf-link-border-width:var(--bf-theme-border-width, 1px);--bf-link-border-style:var(--bf-theme-border-style, solid);--bf-link-border-color:var(--bf-theme-link-border-color, color-mix(in srgb, var(--bf-theme-border-1, #cbd5e1) 80%, transparent));--bf-link-bg:var(--bf-theme-link-bg, transparent);--bf-link-color:var(--bf-theme-link-color, var(--bf-theme-text-1, #0f172a));--bf-link-muted-color:var(--bf-theme-link-muted-color, var(--bf-theme-text-2, #475569));--bf-link-accent:var(--bf-theme-link-accent, var(--bf-theme-button-primary-bg, #2563eb));--bf-link-padding-y:var(--bf-theme-space-2, 0.45rem);--bf-link-padding-x:var(--bf-theme-space-3, 0.7rem);--bf-link-gap:var(--bf-theme-space-2, 0.45rem);--bf-link-transition:background-color 140ms ease, color 140ms ease, border-color 140ms ease;display:inline-block;font:var(--bf-link-font);color:var(--bf-link-color)}.root{display:flex;flex-wrap:wrap;align-items:center;gap:var(--bf-link-gap);background:var(--bf-link-bg);color:var(--bf-link-color);transition:var(--bf-link-transition)}.root[data-vertical]{flex-direction:column;align-items:stretch}.root[data-variant='inline']{padding:0}.root[data-variant='pill']{border-width:var(--bf-link-border-width);border-style:var(--bf-link-border-style);border-color:var(--bf-link-border-color);border-radius:calc(var(--bf-link-radius) + 999px);padding:0.35rem;background:color-mix(in srgb, var(--bf-theme-surface-1, #ffffff) 85%, transparent)}.root[data-variant='nav']{border-width:var(--bf-link-border-width);border-style:var(--bf-link-border-style);border-color:var(--bf-link-border-color);border-radius:var(--bf-link-radius);padding:0.4rem;background:color-mix(in srgb, var(--bf-theme-surface-1, #ffffff) 92%, transparent)}.root ::slotted(a),.root ::slotted([role='link']){color:var(--bf-link-muted-color);text-decoration:none;padding:var(--bf-link-padding-y) var(--bf-link-padding-x);border-radius:calc(var(--bf-link-radius) - 2px);display:inline-flex;align-items:center;gap:0.35rem;outline:none;transition:var(--bf-link-transition)}.root[data-variant='inline'] ::slotted(a),.root[data-variant='inline'] ::slotted([role='link']){padding:0;border-radius:0;text-decoration:underline;text-underline-offset:0.18em;text-decoration-color:color-mix(in srgb, var(--bf-link-muted-color) 45%, transparent)}.root ::slotted(a:hover),.root ::slotted([role='link']:hover){background:color-mix(in srgb, var(--bf-link-accent) 10%, transparent);color:var(--bf-link-color)}.root[data-variant='inline'] ::slotted(a:hover),.root[data-variant='inline'] ::slotted([role='link']:hover){background:transparent;color:var(--bf-link-accent);text-decoration-color:currentColor}.root ::slotted(a:focus-visible),.root ::slotted([role='link']:focus-visible){box-shadow:0 0 0 2px color-mix(in srgb, var(--bf-link-accent) 35%, transparent)}.root ::slotted(a[aria-current='page']),.root ::slotted(a[active]),.root ::slotted([role='link'][aria-current='page']),.root ::slotted([role='link'][active]){background:color-mix(in srgb, var(--bf-link-accent) 16%, transparent);color:var(--bf-link-color);font-weight:600}.root[data-variant='inline'] ::slotted(a[aria-current='page']),.root[data-variant='inline'] ::slotted(a[active]),.root[data-variant='inline'] ::slotted([role='link'][aria-current='page']),.root[data-variant='inline'] ::slotted([role='link'][active]){background:transparent;color:var(--bf-link-accent)}`;

const BfLink$1 = /*@__PURE__*/ proxyCustomElement(class BfLink extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
    variant = 'inline';
    vertical = false;
    applyRoot() {
        const root = this.el.shadowRoot?.querySelector('.root');
        if (!(root instanceof H)) {
            return;
        }
        const v = (this.variant || 'inline').toLowerCase();
        root.setAttribute('data-variant', ['inline', 'pill', 'nav'].includes(v) ? v : 'inline');
        root.toggleAttribute('data-vertical', this.vertical);
    }
    componentDidRender() {
        this.applyRoot();
    }
    render() {
        return (h(Host, { key: '58a70e0e013d74f3bcc2545c597365bb0849fa25' }, h("div", { key: '885cffdc3c7554f79cfb4a6867eac0218a215211', class: "root", part: "root" }, h("slot", { key: '7beca110d851087913fef0dbdc809e9bf5ababec' }))));
    }
    static get watchers() { return {
        "variant": [{
                "applyRoot": 0
            }],
        "vertical": [{
                "applyRoot": 0
            }]
    }; }
    static get style() { return bfLinkCss(); }
}, [769, "bf-link", {
        "variant": [513],
        "vertical": [516]
    }, undefined, {
        "variant": [{
                "applyRoot": 0
            }],
        "vertical": [{
                "applyRoot": 0
            }]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-link"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-link":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfLink$1);
            }
            break;
    } });
}

const BfLink = BfLink$1;
const defineCustomElement = defineCustomElement$1;

export { BfLink, defineCustomElement };
