import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfDialogCss = () => `:host{--bf-dialog-font:var(--bf-theme-font-family, inherit);--bf-dialog-radius:var(--bf-theme-radius-md, 8px);--bf-dialog-border-width:var(--bf-theme-border-width, 1px);--bf-dialog-border-style:var(--bf-theme-border-style, solid);--bf-dialog-border-color:var(--bf-theme-dialog-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-dialog-bg:var(--bf-theme-dialog-bg, var(--bf-theme-surface-1, #ffffff));--bf-dialog-color:var(--bf-theme-dialog-color, var(--bf-theme-text-1, #0f172a));--bf-dialog-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-dialog-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-dialog-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);--bf-dialog-backdrop:rgba(2, 6, 23, 0.45);--bf-dialog-max-w:36rem;--bf-dialog-shadow:0 18px 44px rgba(2, 6, 23, 0.28);display:block;font:var(--bf-dialog-font);color:var(--bf-dialog-color);z-index:1100}.root{position:fixed;inset:0;display:grid;align-items:center;justify-items:center;padding:1rem}.backdrop{position:absolute;inset:0;background:var(--bf-dialog-backdrop)}.panel{position:relative;width:min(100%, var(--bf-dialog-max-w));background:var(--bf-dialog-bg);color:var(--bf-dialog-color);border-width:var(--bf-dialog-border-width);border-style:var(--bf-dialog-border-style);border-color:var(--bf-dialog-border-color);border-radius:var(--bf-dialog-radius);padding:var(--bf-dialog-padding-y) var(--bf-dialog-padding-x);transition:var(--bf-dialog-transition);box-shadow:var(--bf-dialog-shadow)}.root[data-open='false']{display:none}.root[data-variant='tooltip'] .backdrop,.root[data-variant='popover'] .backdrop,.root[data-variant='panel'] .backdrop,.root[data-variant='sheet'] .backdrop,.root[data-variant='bottom-sheet'] .backdrop{background:transparent}.root[data-variant='tooltip'] .panel{width:auto;max-width:18rem;padding:0.35rem 0.55rem;border-radius:6px}.root[data-variant='popover'] .panel{width:min(24rem, 100%)}.root[data-variant='sheet']{align-items:center}.root[data-variant='bottom-sheet']{align-items:end}.root[data-variant='bottom-sheet'] .panel{width:min(100%, 42rem);border-radius:14px 14px 0 0}.root[data-position='top']{align-items:start}.root[data-position='bottom']{align-items:end}.root[data-position='left']{justify-items:start}.root[data-position='right']{justify-items:end}.root[data-position='top-left']{align-items:start;justify-items:start}.root[data-position='top-right']{align-items:start;justify-items:end}.root[data-position='bottom-left']{align-items:end;justify-items:start}.root[data-position='bottom-right']{align-items:end;justify-items:end}`;

const BfDialog$1 = /*@__PURE__*/ proxyCustomElement(class BfDialog extends H {
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
    variant() {
        const explicit = (this.el.getAttribute('variant') || '').toLowerCase();
        if (['dialog', 'sheet', 'bottom-sheet', 'popover', 'tooltip', 'panel'].includes(explicit)) {
            return explicit;
        }
        if (this.el.hasAttribute('sheet')) {
            return 'sheet';
        }
        if (this.el.hasAttribute('bottom-sheet')) {
            return 'bottom-sheet';
        }
        if (this.el.hasAttribute('popover')) {
            return 'popover';
        }
        if (this.el.hasAttribute('tooltip')) {
            return 'tooltip';
        }
        if (this.el.hasAttribute('panel')) {
            return 'panel';
        }
        return 'dialog';
    }
    position() {
        const explicit = (this.el.getAttribute('position') || '')
            .toLowerCase()
            .replace(/\s+/g, '-');
        if ([
            'center',
            'left',
            'right',
            'top',
            'bottom',
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
        ].includes(explicit)) {
            return explicit;
        }
        if (this.el.hasAttribute('left')) {
            return 'left';
        }
        if (this.el.hasAttribute('right')) {
            return 'right';
        }
        if (this.el.hasAttribute('top')) {
            return 'top';
        }
        if (this.el.hasAttribute('bottom')) {
            return 'bottom';
        }
        if (this.el.hasAttribute('center')) {
            return 'center';
        }
        return 'center';
    }
    get openState() {
        return this.el.hasAttribute('open');
    }
    shouldOpenByDefault() {
        return !this.el.hasAttribute('id');
    }
    onBackdropClick = () => {
        const variant = this.variant();
        if (variant === 'tooltip' || variant === 'popover') {
            return;
        }
        if (this.el.hasAttribute('persistent')) {
            return;
        }
        this.el.removeAttribute('open');
        this.el.dispatchEvent(new CustomEvent('bf-close', {
            bubbles: true,
            composed: true,
            detail: { id: this.el.id || '' },
        }));
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
        const variant = this.variant();
        const position = this.position();
        root.setAttribute('data-open', isOpen ? 'true' : 'false');
        root.setAttribute('data-variant', variant);
        root.setAttribute('data-position', position);
        this.el.hidden = !isOpen;
        this.el.setAttribute('aria-hidden', String(!isOpen));
        this.el.setAttribute('role', variant === 'tooltip' ? 'tooltip' : 'dialog');
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
        return (h(Host, { key: 'e5fc44f1b0624864421e27b77750656713c51de5' }, h("div", { key: 'f7e83a1dc53f02e9d8028af5ba039d52403ff3e0', class: "root", part: "root" }, h("div", { key: '9f7440a5555591c80b879fd18125c164422ea0b1', class: "backdrop", part: "backdrop", onClick: this.onBackdropClick }), h("div", { key: 'bf2e4d14f4ef156e1f4e48f09b13a0d306356f6a', class: "panel", part: "panel" }, h("slot", { key: '6ca90122734dc973d8ede0dd090082b809dddb96' })))));
    }
    static get style() { return bfDialogCss(); }
}, [257, "bf-dialog", {
        "open": [64],
        "close": [64],
        "toggle": [64]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-dialog"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-dialog":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfDialog$1);
            }
            break;
    } });
}

const BfDialog = BfDialog$1;
const defineCustomElement = defineCustomElement$1;

export { BfDialog, defineCustomElement };
