import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfModalCss = () => `:host{--bf-modal-font:var(--bf-theme-font-family, inherit);--bf-modal-bg:var(--bf-theme-modal-bg, var(--bf-theme-surface-1, #ffffff));--bf-modal-color:var(--bf-theme-modal-color, var(--bf-theme-text-1, #0f172a));--bf-modal-border-color:var(--bf-theme-modal-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-modal-radius:var(--bf-theme-radius-md, 10px);--bf-modal-backdrop:rgba(2, 6, 23, 0.48);--bf-modal-max-w:34rem;--bf-modal-shadow:0 18px 44px rgba(2, 6, 23, 0.28);display:block;font:var(--bf-modal-font);z-index:1200}.root{position:fixed;inset:0;display:grid;align-items:center;justify-items:center;padding:1rem}.root[data-open='false']{display:none}.backdrop{position:absolute;inset:0;background:var(--bf-modal-backdrop)}.panel{position:relative;width:min(100%, var(--bf-modal-max-w));background:var(--bf-modal-bg);color:var(--bf-modal-color);border:1px solid var(--bf-modal-border-color);border-radius:var(--bf-modal-radius);padding:1rem;box-shadow:var(--bf-modal-shadow)}`;

const BfModal$1 = /*@__PURE__*/ proxyCustomElement(class BfModal extends H {
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
        this.observer = new MutationObserver(() => this.sync());
        this.observer.observe(this.el, { attributes: true, attributeFilter: ['open', 'label', 'persistent', 'id'] });
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
        this.el.setAttribute('aria-hidden', String(!isOpen));
        this.el.setAttribute('role', 'dialog');
        this.el.setAttribute('aria-modal', 'true');
        const lab = this.el.getAttribute('label');
        if (lab) {
            this.el.setAttribute('aria-label', lab);
        }
        else {
            this.el.removeAttribute('aria-label');
        }
    }
    sync() {
        this.syncRoot();
    }
    componentDidRender() {
        this.syncRoot();
    }
    render() {
        return (h(Host, { key: 'd9b645fb4a7859d7eb240422625b378b492a9962' }, h("div", { key: 'f8384a2236212f087c28ea7fa16c5da968293bfb', class: "root", part: "root" }, h("div", { key: 'f195a42ce31ddc03e4dd310ed1f0c80cd7b8ab11', class: "backdrop", part: "backdrop", onClick: this.onBackdropClick }), h("div", { key: '6e78e229f34a4d3eca31ca769113d8de4f9d0c55', class: "panel", part: "panel" }, h("slot", { key: '90b66bc6735358b78ebb18acccd43b2a1c45f4b9' })))));
    }
    static get style() { return bfModalCss(); }
}, [257, "bf-modal", {
        "open": [64],
        "close": [64],
        "toggle": [64]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-modal"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-modal":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfModal$1);
            }
            break;
    } });
}

const BfModal = BfModal$1;
const defineCustomElement = defineCustomElement$1;

export { BfModal, defineCustomElement };
