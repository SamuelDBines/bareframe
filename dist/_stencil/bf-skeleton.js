import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfSkeletonCss = () => `:host{--bf-skeleton-radius:var(--bf-theme-radius-md, 8px);--bf-skeleton-width:100%;--bf-skeleton-height:0.9rem;--bf-skeleton-base:color-mix(in srgb, var(--bf-theme-border-1, #cbd5e1) 55%, var(--bf-theme-surface-1, #ffffff));--bf-skeleton-highlight:color-mix(in srgb, var(--bf-theme-surface-1, #ffffff) 86%, transparent);--bf-skeleton-speed:1.15s;display:block}.root{position:relative;overflow:hidden;width:var(--bf-skeleton-width);height:var(--bf-skeleton-height);background:var(--bf-skeleton-base);border-radius:var(--bf-skeleton-radius);color:transparent;user-select:none}.root[data-animate='on']::after{content:'';position:absolute;inset:0;background:linear-gradient(   100deg,   transparent 0%,   var(--bf-skeleton-highlight) 45%,   transparent 80%  );transform:translateX(-100%);animation:bf-skeleton-shimmer var(--bf-skeleton-speed) ease-in-out infinite}.root[data-variant='title']{--bf-skeleton-height:1.05rem;--bf-skeleton-width:58%}.root[data-variant='avatar']{--bf-skeleton-width:2.5rem;--bf-skeleton-height:2.5rem;--bf-skeleton-radius:999px}.root[data-variant='button']{--bf-skeleton-width:8rem;--bf-skeleton-height:2.1rem;--bf-skeleton-radius:10px}.root[data-variant='image']{--bf-skeleton-height:auto;--bf-skeleton-width:100%;aspect-ratio:16 / 9;border-radius:12px}.root[data-variant='paragraph']{--bf-skeleton-height:auto;background:transparent;display:grid;gap:0.45rem}.root[data-variant='paragraph']::after{display:none}.lines{display:none}.root[data-variant='paragraph'] .lines{display:grid;gap:0.45rem}.line{position:relative;display:block;height:0.78rem;border-radius:999px;background:var(--bf-skeleton-base);overflow:hidden}.root[data-variant='paragraph'][data-animate='on'] .line::after{content:'';position:absolute;inset:0;background:linear-gradient(   100deg,   transparent 0%,   var(--bf-skeleton-highlight) 45%,   transparent 80%  );transform:translateX(-100%);animation:bf-skeleton-shimmer var(--bf-skeleton-speed) ease-in-out infinite}slot{display:none}@keyframes bf-skeleton-shimmer{100%{transform:translateX(120%)}}@media (prefers-reduced-motion: reduce){.root::after,.line::after{animation:none !important}}`;

const BfSkeleton$1 = /*@__PURE__*/ proxyCustomElement(class BfSkeleton extends H {
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
        this.observer = new MutationObserver(() => this.apply());
        this.observer.observe(this.el, { attributes: true });
        this.applyHostVars();
        this.apply();
    }
    disconnectedCallback() {
        this.observer?.disconnect();
    }
    setSizeVar(name, value) {
        if (!value) {
            this.el.style.removeProperty(name);
            return;
        }
        const trimmed = value.trim();
        if (/^-?\d*\.?\d+$/.test(trimmed)) {
            this.el.style.setProperty(name, `${trimmed}px`);
            return;
        }
        this.el.style.setProperty(name, trimmed);
    }
    applyHostVars() {
        this.setSizeVar('--bf-skeleton-width', this.el.getAttribute('width'));
        this.setSizeVar('--bf-skeleton-height', this.el.getAttribute('height'));
        this.setSizeVar('--bf-skeleton-radius', this.el.getAttribute('radius'));
    }
    applyLines(root, lines) {
        const linesEl = root.querySelector('.lines');
        if (!(linesEl instanceof H)) {
            return;
        }
        const rawVariant = (this.el.getAttribute('variant') || 'text').toLowerCase();
        const variant = rawVariant === 'text' && lines > 1 ? 'paragraph' : rawVariant;
        root.dataset.variant = variant;
        root.dataset.animate = this.el.hasAttribute('static') ? 'off' : 'on';
        if (variant !== 'paragraph') {
            linesEl.replaceChildren();
            return;
        }
        const widths = ['96%', '90%', '94%', '86%', '92%', '84%'];
        const nodes = [];
        for (let i = 0; i < lines; i += 1) {
            const line = document.createElement('span');
            line.className = 'line';
            const width = i === lines - 1 ? '68%' : widths[i % widths.length];
            line.style.width = width;
            nodes.push(line);
        }
        linesEl.replaceChildren(...nodes);
    }
    apply() {
        this.applyHostVars();
        const root = this.el.shadowRoot?.querySelector('.root');
        if (!(root instanceof H)) {
            return;
        }
        const lines = Math.max(1, Number.parseInt(this.el.getAttribute('lines') || '1', 10) || 1);
        this.applyLines(root, lines);
    }
    componentDidRender() {
        this.apply();
    }
    render() {
        return (h(Host, { key: 'a7ab9b0d75f7b5c492efef933f36a4f56cc5615e' }, h("div", { key: '337872cda407cdaeed5394bbd32425388b7f0f90', class: "root", part: "root" }, h("div", { key: 'e07a52fd50610e6853ad95764ea2da13eb77e89a', class: "lines", part: "lines" }), h("slot", { key: '7780eaa44f8e7766e14ac8d0889697fff3ad65e4' }))));
    }
    static get style() { return bfSkeletonCss(); }
}, [257, "bf-skeleton"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-skeleton"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-skeleton":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfSkeleton$1);
            }
            break;
    } });
}

const BfSkeleton = BfSkeleton$1;
const defineCustomElement = defineCustomElement$1;

export { BfSkeleton, defineCustomElement };
