import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfDrawerCss = () => `:host{--bf-drawer-font:var(--bf-theme-font-family, inherit);--bf-drawer-bg:var(--bf-theme-drawer-bg, var(--bf-theme-surface-1, #ffffff));--bf-drawer-color:var(--bf-theme-drawer-color, var(--bf-theme-text-1, #0f172a));--bf-drawer-border-color:var(--bf-theme-drawer-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-drawer-backdrop:rgba(2, 6, 23, 0.35);--bf-drawer-width:min(90vw, 22rem);--bf-drawer-height:min(75vh, 24rem);--bf-drawer-shadow:0 18px 44px rgba(2, 6, 23, 0.28);display:block;font:var(--bf-drawer-font);z-index:1190}.root{position:fixed;inset:0;display:grid}.root[data-open='false']{display:none}.backdrop{position:absolute;inset:0;background:var(--bf-drawer-backdrop)}.panel{position:relative;background:var(--bf-drawer-bg);color:var(--bf-drawer-color);border:1px solid var(--bf-drawer-border-color);box-shadow:var(--bf-drawer-shadow);padding:1rem}.root[data-side='right']{justify-items:end}.root[data-side='right'] .panel{width:var(--bf-drawer-width);height:100%;border-radius:0}.root[data-side='left']{justify-items:start}.root[data-side='left'] .panel{width:var(--bf-drawer-width);height:100%;border-radius:0}.root[data-side='top']{align-items:start}.root[data-side='top'] .panel{width:100%;max-width:100%;height:var(--bf-drawer-height);border-radius:0 0 12px 12px}.root[data-side='bottom']{align-items:end}.root[data-side='bottom'] .panel{width:100%;max-width:100%;height:var(--bf-drawer-height);border-radius:12px 12px 0 0}`;

const BfDrawer$1 = /*@__PURE__*/ proxyCustomElement(class BfDrawer extends H {
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
        this.observer = new MutationObserver(() => this.syncRoot());
        this.observer.observe(this.el, {
            attributes: true,
            attributeFilter: ['open', 'label', 'persistent', 'id', 'side', 'left', 'right', 'top', 'bottom'],
        });
    }
    disconnectedCallback() {
        this.observer?.disconnect();
    }
    async open() {
        this.el.setAttribute('open', '');
    }
    async close() {
        this.el.removeAttribute('open');
    }
    async toggle() {
        if (this.el.hasAttribute('open')) {
            await this.close();
            return;
        }
        await this.open();
    }
    side() {
        const explicit = (this.el.getAttribute('side') || '').toLowerCase();
        if (['left', 'right', 'top', 'bottom'].includes(explicit)) {
            return explicit;
        }
        if (this.el.hasAttribute('left')) {
            return 'left';
        }
        if (this.el.hasAttribute('top')) {
            return 'top';
        }
        if (this.el.hasAttribute('bottom')) {
            return 'bottom';
        }
        return 'right';
    }
    shouldOpenByDefault() {
        return !this.el.hasAttribute('id');
    }
    onBackdropClick = () => {
        if (this.el.hasAttribute('persistent')) {
            return;
        }
        this.el.removeAttribute('open');
    };
    syncRoot() {
        const root = this.el.shadowRoot?.querySelector('.root');
        if (!(root instanceof H)) {
            return;
        }
        if (!this.el.hasAttribute('open') && this.shouldOpenByDefault()) {
            this.el.setAttribute('open', '');
            return;
        }
        const isOpen = this.el.hasAttribute('open');
        this.el.hidden = !isOpen;
        root.setAttribute('data-open', isOpen ? 'true' : 'false');
        root.setAttribute('data-side', this.side());
        this.el.setAttribute('aria-hidden', String(!isOpen));
        this.el.setAttribute('role', 'dialog');
        const lab = this.el.getAttribute('label');
        if (lab) {
            this.el.setAttribute('aria-label', lab);
        }
        else {
            this.el.removeAttribute('aria-label');
        }
    }
    componentDidRender() {
        this.syncRoot();
    }
    render() {
        return (h(Host, { key: 'a826e6b8d6cb199a263cebc30eecbffa278a8bf9' }, h("div", { key: '044fb3bd50ef9123e9be5821c5be180b110f6d42', class: "root", part: "root" }, h("div", { key: '0b05601a224d69f3c935c577454548f05b08d954', class: "backdrop", part: "backdrop", onClick: this.onBackdropClick }), h("div", { key: '8772aadc936babd426af6fed05d4c523f5e76625', class: "panel", part: "panel" }, h("slot", { key: '9f185d32a1f28819e7a02bd1d4093c6f74a816b8' })))));
    }
    static get style() { return bfDrawerCss(); }
}, [257, "bf-drawer", {
        "open": [64],
        "close": [64],
        "toggle": [64]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-drawer"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-drawer":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfDrawer$1);
            }
            break;
    } });
}

const BfDrawer = BfDrawer$1;
const defineCustomElement = defineCustomElement$1;

export { BfDrawer, defineCustomElement };
