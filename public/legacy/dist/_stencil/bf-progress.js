import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfProgressCss = () => `:host{--bf-progress-font:var(--bf-theme-font-family, inherit);--bf-progress-bg:var(--bf-theme-progress-bar-bg, var(--bf-theme-surface-2, #e2e8f0));--bf-progress-color:var(--bf-theme-progress-bar-color, var(--bf-theme-button-primary-bg, #2563eb));--bf-progress-ring-bg:var(--bf-theme-progress-circle-bg, var(--bf-theme-surface-2, #e2e8f0));--bf-progress-ring-color:var(--bf-theme-progress-circle-color, var(--bf-theme-button-primary-bg, #2563eb));--bf-progress-radius:var(--bf-theme-radius-md, 999px);--bf-progress-track-height:0.7rem;--bf-progress-size-sm:2rem;--bf-progress-size-md:3rem;--bf-progress-size-lg:4rem;display:inline-flex;font:var(--bf-progress-font);color:var(--bf-theme-text-1, #0f172a)}.root{display:inline-flex;align-items:center;gap:0.5rem}.linear{display:inline-block;min-width:8rem}.track{width:100%;height:var(--bf-progress-track-height);border-radius:var(--bf-progress-radius);background:var(--bf-progress-bg);overflow:hidden}.fill{height:100%;width:0;background:var(--bf-progress-color);transition:width 160ms ease}.circular{display:none}.circular svg{width:var(--bf-progress-size-md);height:var(--bf-progress-size-md);transform:rotate(-90deg)}.ring,.meter{fill:none;stroke-width:10}.ring{stroke:var(--bf-progress-ring-bg)}.meter{stroke:var(--bf-progress-ring-color);stroke-linecap:round;transition:stroke-dashoffset 180ms ease}.meta:empty{display:none}.root[data-variant='circular'] .linear{display:none}.root[data-variant='circular'] .circular{display:inline-block}.root[data-variant='striped'] .fill{background-image:linear-gradient(   45deg,   rgba(255, 255, 255, 0.25) 25%,   transparent 25%,   transparent 50%,   rgba(255, 255, 255, 0.25) 50%,   rgba(255, 255, 255, 0.25) 75%,   transparent 75%,   transparent  );background-size:0.9rem 0.9rem}.root[data-tone='primary']{--bf-progress-color:var(--bf-theme-button-primary-bg, #2563eb);--bf-progress-ring-color:var(--bf-theme-button-primary-bg, #2563eb)}.root[data-tone='secondary']{--bf-progress-color:var(--bf-theme-button-secondary-color, #1d4ed8);--bf-progress-ring-color:var(--bf-theme-button-secondary-color, #1d4ed8)}.root[data-loading='true'][data-variant='striped'] .fill,.root[data-loading='true'][data-loading-variant='stripe'] .fill{animation:bf-progress-stripes 700ms linear infinite}.root[data-loading='true'][data-loading-variant='pulse'] .fill{animation:bf-progress-pulse 900ms ease-in-out infinite}.root[data-loading='true'][data-loading-variant='bounce'] .fill{transform-origin:left center;animation:bf-progress-bounce 900ms ease-in-out infinite}.root[data-loading='true'][data-variant='circular'] .circular svg,.root[data-loading='true'][data-loading-variant='spin'][data-variant='circular'] .circular svg{animation:bf-progress-spin 1s linear infinite}.root[data-loading='true'][data-variant='circular'] .meter{animation:bf-progress-meter 1.1s ease-in-out infinite}.root[data-size='sm'] .circular svg{width:var(--bf-progress-size-sm);height:var(--bf-progress-size-sm)}.root[data-size='lg'] .circular svg{width:var(--bf-progress-size-lg);height:var(--bf-progress-size-lg)}@keyframes bf-progress-indeterminate{0%{transform:translateX(-120%)}100%{transform:translateX(260%)}}@keyframes bf-progress-stripes{0%{background-position:0 0}100%{background-position:0.9rem 0}}@keyframes bf-progress-pulse{0%,100%{opacity:1}50%{opacity:0.45}}@keyframes bf-progress-bounce{0%,100%{transform:scaleX(1)}50%{transform:scaleX(0.7)}}@keyframes bf-progress-spin{0%{transform:rotate(-90deg)}100%{transform:rotate(270deg)}}@keyframes bf-progress-meter{0%{stroke-dashoffset:220}50%{stroke-dashoffset:80}100%{stroke-dashoffset:220}}`;

const BfProgress$1 = /*@__PURE__*/ proxyCustomElement(class BfProgress extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
    loadingTimer;
    loadingTimerMs;
    mutation;
    connectedCallback() {
        this.mutation = new MutationObserver(() => this.sync());
        this.mutation.observe(this.el, { attributes: true });
    }
    disconnectedCallback() {
        this.stopLoading();
        this.mutation?.disconnect();
    }
    get value() {
        return this.valueNum();
    }
    set value(nextValue) {
        this.el.setAttribute('value', String(nextValue ?? ''));
    }
    get max() {
        return this.maxNum();
    }
    set max(nextValue) {
        this.el.setAttribute('max', String(nextValue ?? ''));
    }
    get variant() {
        return this.variantId();
    }
    set variant(nextValue) {
        this.el.setAttribute('variant', String(nextValue ?? ''));
    }
    get tone() {
        return this.toneId();
    }
    set tone(nextValue) {
        this.el.setAttribute('tone', String(nextValue ?? ''));
    }
    get size() {
        return this.el.getAttribute('size') || 'md';
    }
    set size(nextValue) {
        this.el.setAttribute('size', String(nextValue ?? ''));
    }
    get loading() {
        return this.isLoading();
    }
    set loading(on) {
        if (Boolean(on)) {
            this.el.setAttribute('loading', '');
        }
        else {
            this.el.removeAttribute('loading');
        }
    }
    variantId() {
        let variant = (this.el.getAttribute('variant') || '').toLowerCase();
        if (!variant) {
            if (this.el.hasAttribute('circular')) {
                variant = 'circular';
            }
            else if (this.el.hasAttribute('striped')) {
                variant = 'striped';
            }
            else if (this.el.hasAttribute('linear')) {
                variant = 'linear';
            }
        }
        if (!variant) {
            variant = 'linear';
        }
        if (variant === 'circlular') {
            variant = 'circular';
        }
        if (variant === 'indeterminate') {
            return 'linear';
        }
        if (['linear', 'circular', 'striped'].includes(variant)) {
            return variant;
        }
        return 'linear';
    }
    toneId() {
        const explicit = (this.el.getAttribute('tone') || '').toLowerCase();
        if (explicit === 'secondary') {
            return 'secondary';
        }
        if (explicit === 'primary') {
            return 'primary';
        }
        if (this.el.hasAttribute('secondary')) {
            return 'secondary';
        }
        if (this.el.hasAttribute('primary')) {
            return 'primary';
        }
        return 'default';
    }
    hasMaxAttr() {
        return this.el.hasAttribute('max');
    }
    maxNum() {
        const parsed = Number.parseFloat(this.el.getAttribute('max') || '');
        if (!Number.isFinite(parsed) || parsed <= 0) {
            return 100;
        }
        return parsed;
    }
    valueNum() {
        const parsed = Number.parseFloat(this.el.getAttribute('value') || '0');
        if (!Number.isFinite(parsed)) {
            return 0;
        }
        const upper = this.hasMaxAttr() ? this.maxNum() : 100;
        return Math.min(upper, Math.max(0, parsed));
    }
    percent() {
        if (!this.hasMaxAttr()) {
            return this.valueNum();
        }
        return (this.valueNum() / this.maxNum()) * 100;
    }
    loadingVariantId() {
        const explicit = (this.el.getAttribute('loading-variant') || '').toLowerCase();
        const attrValue = (this.el.getAttribute('loading') || '').toLowerCase();
        const candidate = explicit || attrValue || 'loop';
        if (['loop', 'pulse', 'stripe', 'bounce', 'spin'].includes(candidate)) {
            return candidate;
        }
        return 'loop';
    }
    loadingMs() {
        const parsed = Number.parseInt(this.el.getAttribute('loading-ms') || '450', 10);
        return Number.isFinite(parsed) && parsed >= 80 ? parsed : 450;
    }
    isLoading() {
        const legacy = (this.el.getAttribute('variant') || '').toLowerCase() === 'indeterminate';
        return this.el.hasAttribute('loading') || this.el.hasAttribute('indeterminate') || legacy;
    }
    startLoading() {
        const ms = this.loadingMs();
        if (this.loadingTimer && this.loadingTimerMs === ms) {
            return;
        }
        this.stopLoading();
        this.loadingTimerMs = ms;
        this.loadingTimer = setInterval(() => {
            const ceiling = this.hasMaxAttr() ? this.maxNum() : 100;
            const step = ceiling / 10;
            let next = this.valueNum() + step;
            if (next > ceiling) {
                next = 0;
            }
            this.value = Number(next.toFixed(4));
            this.sync();
        }, ms);
    }
    stopLoading() {
        if (!this.loadingTimer) {
            return;
        }
        clearInterval(this.loadingTimer);
        this.loadingTimer = undefined;
        this.loadingTimerMs = null;
    }
    formatLabel() {
        if (this.hasMaxAttr()) {
            return `${Math.round(this.percent())}%`;
        }
        const raw = this.valueNum();
        return Number.isInteger(raw) ? `${raw}` : `${raw.toFixed(2)}`;
    }
    updateValueTokens() {
        const tokens = this.el.querySelectorAll('value');
        if (!tokens.length) {
            return;
        }
        const display = this.formatLabel();
        tokens.forEach((t) => {
            t.textContent = display;
        });
    }
    bindSlotOnce(sr) {
        const slot = sr.querySelector('slot');
        if (slot instanceof HTMLSlotElement && slot.dataset.bfSlotBound !== 'true') {
            slot.dataset.bfSlotBound = 'true';
            slot.addEventListener('slotchange', () => this.updateValueTokens());
        }
    }
    sync() {
        const sr = this.el.shadowRoot;
        const root = sr?.querySelector('.root');
        const fill = sr?.querySelector('.fill');
        const meter = sr?.querySelector('.meter');
        if (!(root instanceof H) || !(fill instanceof H) || !(meter instanceof H)) {
            return;
        }
        const variant = this.variantId();
        const percent = this.percent();
        const size = this.el.getAttribute('size') || 'md';
        const tone = this.toneId();
        const loading = this.isLoading();
        const loadingVariant = this.loadingVariantId();
        root.setAttribute('data-variant', variant);
        root.setAttribute('data-size', size);
        root.setAttribute('data-tone', tone);
        root.setAttribute('data-loading', loading ? 'true' : 'false');
        root.setAttribute('data-loading-variant', loadingVariant);
        this.el.setAttribute('role', 'progressbar');
        this.el.setAttribute('aria-valuemin', '0');
        this.el.setAttribute('aria-valuemax', String(this.hasMaxAttr() ? this.maxNum() : 100));
        this.el.setAttribute('aria-valuenow', String(this.valueNum()));
        const lb = this.el.getAttribute('label');
        if (lb) {
            this.el.setAttribute('aria-label', lb);
        }
        else {
            this.el.removeAttribute('aria-label');
        }
        fill.style.width = `${percent}%`;
        const circumference = 2 * Math.PI * 42;
        const dash = circumference - (percent / 100) * circumference;
        meter.style.strokeDasharray = `${circumference}`;
        meter.style.strokeDashoffset = `${dash}`;
        this.updateValueTokens();
        this.bindSlotOnce(sr);
        if (loading) {
            this.startLoading();
        }
        else {
            this.stopLoading();
        }
    }
    componentDidRender() {
        const sr = this.el.shadowRoot;
        if (!sr?.querySelector('.root')) {
            return;
        }
        this.bindSlotOnce(sr);
        this.sync();
    }
    render() {
        return (h(Host, { key: 'd27ae36d9155364d3e9e287abd97fdd531e14c4a' }, h("div", { key: '852803bbfd72ab13719ca2e1240d963e4f15d049', class: "root", part: "root" }, h("div", { key: 'ac7b71da14623b14cdc93c05f187bab3ee108957', class: "linear", part: "linear" }, h("div", { key: '2d11faa8fb809ba151a8ac3cc7e96723d6df236d', class: "track", part: "track" }, h("div", { key: '18ef75bc289bd96df72f26ee2622a76c45c6d62d', class: "fill", part: "fill" }))), h("div", { key: 'e2012a541741baffaf0f24fb59c40e52f1c76b66', class: "circular", part: "circular" }, h("svg", { key: '332e0b73dd1526bc66662a07e47d0b9b889ed819', viewBox: "0 0 100 100", "aria-hidden": "true" }, h("circle", { key: '3ed74049f29cc88cf4220745be5586473c325519', class: "ring", cx: "50", cy: "50", r: "42" }), h("circle", { key: '318616e5958a6867951badc06e6e5047cad6e935', class: "meter", cx: "50", cy: "50", r: "42" }))), h("div", { key: '73e80e093a03d9a41309140d5ec55c626b07df9e', class: "meta", part: "meta" }, h("slot", { key: '3eb7ff7d08434901c36ea9bf1f2ca396082dd43f' })))));
    }
    static get style() { return bfProgressCss(); }
}, [257, "bf-progress"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-progress"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-progress":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfProgress$1);
            }
            break;
    } });
}

const BfProgress = BfProgress$1;
const defineCustomElement = defineCustomElement$1;

export { BfProgress, defineCustomElement };
