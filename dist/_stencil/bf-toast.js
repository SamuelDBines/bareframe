import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfToastCss = () => `:host{--bf-toast-font:var(--bf-theme-font-family, inherit);--bf-toast-radius:var(--bf-theme-radius-md, 8px);--bf-toast-border-width:var(--bf-theme-border-width, 1px);--bf-toast-border-style:var(--bf-theme-border-style, solid);--bf-toast-border-color:var(--bf-theme-toast-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-toast-bg:var(--bf-theme-toast-bg, var(--bf-theme-surface-1, #ffffff));--bf-toast-color:var(--bf-theme-toast-color, var(--bf-theme-text-1, #0f172a));--bf-toast-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-toast-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-toast-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);--bf-toast-success-bg:var(--bf-theme-success-bg, #dcfce7);--bf-toast-success-color:var(--bf-theme-success-color, #166534);--bf-toast-warning-bg:var(--bf-theme-warning-bg, #fef3c7);--bf-toast-warning-color:var(--bf-theme-warning-color, #92400e);--bf-toast-error-bg:var(--bf-theme-error-bg, #fee2e2);--bf-toast-error-color:var(--bf-theme-error-color, #991b1b);--bf-toast-info-bg:var(--bf-theme-info-bg, var(--bf-toast-bg));--bf-toast-info-color:var(--bf-theme-info-color, var(--bf-toast-color));--bf-toast-snackbar-bg:var(--bf-theme-snackbar-bg, #111827);--bf-toast-snackbar-color:var(--bf-theme-snackbar-color, #f8fafc);display:block;font:var(--bf-toast-font);color:var(--bf-toast-color);z-index:1000}.root{display:grid;grid-template-columns:auto 1fr auto;align-items:start;gap:0.5rem;min-width:16rem;max-width:30rem;background:var(--bf-toast-bg);color:var(--bf-toast-color);border-width:var(--bf-toast-border-width);border-style:var(--bf-toast-border-style);border-color:var(--bf-toast-border-color);border-radius:var(--bf-toast-radius);padding:var(--bf-toast-padding-y) var(--bf-toast-padding-x);transition:var(--bf-toast-transition);box-shadow:0 8px 28px rgba(15, 23, 42, 0.18)}.icon{width:1.1rem;height:1.1rem;display:inline-flex;align-items:center;justify-content:center;font-weight:700;line-height:1;margin-top:0.1rem}.content{min-width:0}.close{border:0;background:transparent;color:currentColor;font:inherit;line-height:1;cursor:pointer;padding:0;opacity:0.75}.close:hover{opacity:1}.root[data-open='false']{display:none}.root[data-variant='alert']{border-left-width:4px}.root[data-variant='notification']{border-radius:calc(var(--bf-toast-radius) + 4px)}.root[data-variant='snackbar']{background:var(--bf-toast-snackbar-bg);color:var(--bf-toast-snackbar-color);border-color:transparent;border-radius:999px;padding-inline:0.9rem;min-width:14rem}.root[data-variant='snackbar'] .icon{display:none}.root[data-variant='banner']{width:min(100%, 64rem);max-width:64rem;border-radius:10px;box-shadow:none}.root[data-variant='banner'] .icon{display:none}.root[data-type='success']{background:var(--bf-toast-success-bg);color:var(--bf-toast-success-color)}.root[data-type='warning']{background:var(--bf-toast-warning-bg);color:var(--bf-toast-warning-color)}.root[data-type='error']{background:var(--bf-toast-error-bg);color:var(--bf-toast-error-color)}.root[data-type='info']{background:var(--bf-toast-info-bg);color:var(--bf-toast-info-color)}.root[data-variant='snackbar'][data-type='success'],.root[data-variant='snackbar'][data-type='warning'],.root[data-variant='snackbar'][data-type='error'],.root[data-variant='snackbar'][data-type='info']{background:var(--bf-toast-snackbar-bg);color:var(--bf-toast-snackbar-color)}`;

const BfToast$1 = /*@__PURE__*/ proxyCustomElement(class BfToast extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
    observer;
    durationTimer;
    connectedCallback() {
        this.observer = new MutationObserver(() => this.sync());
        this.observer.observe(this.el, {
            attributes: true,
        });
    }
    disconnectedCallback() {
        this.observer?.disconnect();
        this.clearDurationTimer();
    }
    async show() {
        this.el.setAttribute('open', '');
    }
    async hide() {
        this.el.removeAttribute('open');
    }
    get open() {
        return this.el.hasAttribute('open');
    }
    set open(next) {
        if (next) {
            this.el.setAttribute('open', '');
        }
        else {
            this.el.removeAttribute('open');
        }
    }
    onCloseClick = () => {
        this.hide();
        this.el.dispatchEvent(new CustomEvent('bf-close', {
            bubbles: true,
            composed: true,
            detail: { id: this.el.id || '' },
        }));
    };
    variant() {
        const explicit = (this.el.getAttribute('variant') || '').toLowerCase();
        if (['toast', 'alert', 'notification', 'snackbar', 'banner'].includes(explicit)) {
            return explicit;
        }
        if (this.el.hasAttribute('alert')) {
            return 'alert';
        }
        if (this.el.hasAttribute('notification')) {
            return 'notification';
        }
        if (this.el.hasAttribute('snackbar')) {
            return 'snackbar';
        }
        if (this.el.hasAttribute('banner')) {
            return 'banner';
        }
        return 'toast';
    }
    type() {
        const explicit = (this.el.getAttribute('type') || '').toLowerCase();
        if (['success', 'warning', 'error', 'info'].includes(explicit)) {
            return explicit;
        }
        if (this.el.hasAttribute('success')) {
            return 'success';
        }
        if (this.el.hasAttribute('warning')) {
            return 'warning';
        }
        if (this.el.hasAttribute('error')) {
            return 'error';
        }
        return 'info';
    }
    isValidPosition(position) {
        return [
            'top-left',
            'top-center',
            'top-right',
            'bottom-left',
            'bottom-center',
            'bottom-right',
        ].includes(position);
    }
    position() {
        const variant = this.variant();
        const explicit = (this.el.getAttribute('position') || '')
            .toLowerCase()
            .replace(/\s+/g, '-');
        if (explicit && this.isValidPosition(explicit)) {
            return explicit;
        }
        if (variant === 'snackbar' &&
            !this.el.hasAttribute('top') &&
            !this.el.hasAttribute('bottom') &&
            !this.el.hasAttribute('left') &&
            !this.el.hasAttribute('right') &&
            !this.el.hasAttribute('center') &&
            !this.el.hasAttribute('position')) {
            return 'bottom-center';
        }
        if (variant === 'banner' &&
            !this.el.hasAttribute('top') &&
            !this.el.hasAttribute('bottom') &&
            !this.el.hasAttribute('left') &&
            !this.el.hasAttribute('right') &&
            !this.el.hasAttribute('center') &&
            !this.el.hasAttribute('position')) {
            return 'top-center';
        }
        const y = this.el.hasAttribute('bottom') ? 'bottom' : 'top';
        let x = 'right';
        if (this.el.hasAttribute('left')) {
            x = 'left';
        }
        if (this.el.hasAttribute('center')) {
            x = 'center';
        }
        if (this.el.hasAttribute('right')) {
            x = 'right';
        }
        return `${y}-${x}`;
    }
    duration() {
        const parsed = Number.parseInt(this.el.getAttribute('duration') || '', 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    }
    iconSymbol() {
        switch (this.type()) {
            case 'success':
                return '✓';
            case 'warning':
                return '!';
            case 'error':
                return 'x';
            default:
                return 'i';
        }
    }
    clearDurationTimer() {
        if (!this.durationTimer) {
            return;
        }
        clearTimeout(this.durationTimer);
        this.durationTimer = undefined;
    }
    scheduleAutoHide() {
        this.clearDurationTimer();
        const ms = this.duration();
        if (!this.open || ms <= 0) {
            return;
        }
        this.durationTimer = setTimeout(() => {
            this.hide();
        }, ms);
    }
    applyPosition(position) {
        const anchored = this.el.hasAttribute('position') ||
            this.el.hasAttribute('top') ||
            this.el.hasAttribute('bottom') ||
            this.el.hasAttribute('left') ||
            this.el.hasAttribute('right') ||
            this.el.hasAttribute('center');
        if (!anchored) {
            this.el.style.position = '';
            this.el.style.top = '';
            this.el.style.bottom = '';
            this.el.style.left = '';
            this.el.style.right = '';
            this.el.style.transform = '';
            this.el.style.zIndex = '';
            return;
        }
        this.el.style.position = 'fixed';
        this.el.style.zIndex = '1000';
        this.el.style.top = '';
        this.el.style.bottom = '';
        this.el.style.left = '';
        this.el.style.right = '';
        this.el.style.transform = '';
        const [y, x] = position.split('-');
        if (y === 'bottom') {
            this.el.style.bottom = '1rem';
        }
        else {
            this.el.style.top = '1rem';
        }
        if (x === 'left') {
            this.el.style.left = '1rem';
        }
        else if (x === 'right') {
            this.el.style.right = '1rem';
        }
        else {
            this.el.style.left = '50%';
            this.el.style.transform = 'translateX(-50%)';
        }
    }
    sync() {
        const root = this.el.shadowRoot?.querySelector('.root');
        const icon = this.el.shadowRoot?.querySelector('.icon');
        if (!(root instanceof H) || !(icon instanceof H)) {
            return;
        }
        const variant = this.variant();
        const type = this.type();
        const position = this.position();
        if (!this.el.hasAttribute('open')) {
            this.el.setAttribute('open', '');
        }
        root.setAttribute('data-variant', variant);
        root.setAttribute('data-type', type);
        root.setAttribute('data-position', position);
        root.setAttribute('data-open', this.open ? 'true' : 'false');
        icon.textContent = this.iconSymbol();
        this.applyPosition(position);
        this.el.setAttribute('role', variant === 'alert' ? 'alert' : 'status');
        this.el.setAttribute('aria-live', variant === 'alert' ? 'assertive' : 'polite');
        this.scheduleAutoHide();
    }
    componentDidRender() {
        this.sync();
    }
    render() {
        return (h(Host, { key: '144ee0bd6a794545ee5eaf2eb8a47c52cdad25eb' }, h("div", { key: 'c5ea1c10c22a534076d50cc5751cd85cb9221a91', class: "root", part: "root" }, h("span", { key: '8d0817a1919b1d5675fc2de9333d15acddd4f837', class: "icon", part: "icon", "aria-hidden": "true" }), h("div", { key: 'b6543ae6fdd16333e8d3f9f3b2c165ab1cce7c77', class: "content", part: "content" }, h("slot", { key: '065d21f25a050f83a0eb416f108288b6a53015f5' })), h("button", { key: 'd6c7e3a151723dc920f14c958a176cdb98a69b52', class: "close", part: "close", type: "button", "aria-label": "Close", onClick: this.onCloseClick }, "\u00D7"))));
    }
    static get style() { return bfToastCss(); }
}, [257, "bf-toast", {
        "show": [64],
        "hide": [64]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-toast"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-toast":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfToast$1);
            }
            break;
    } });
}

const BfToast = BfToast$1;
const defineCustomElement = defineCustomElement$1;

export { BfToast, defineCustomElement };
