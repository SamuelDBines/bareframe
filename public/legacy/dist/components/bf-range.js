import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfRangeCss = () => `:host{--bf-range-font:var(--bf-theme-font-family, inherit);--bf-range-track:var(--bf-theme-surface-2, #e2e8f0);--bf-range-fill:var(--bf-theme-button-primary-bg, #2563eb);--bf-range-rating-active:var(--bf-theme-button-primary-bg, #2563eb);--bf-range-rating-muted:var(--bf-theme-border-1, #cbd5e1);display:inline-flex;font:var(--bf-range-font)}.root{display:inline-flex;flex-direction:column;gap:0.4rem;min-width:12rem}.single,.dual,.rating{display:none}.root[data-mode='slider'] .single{display:block}.root[data-mode='range'] .dual{display:block;position:relative;padding-block:0.35rem}.root[data-mode='rating'] .rating{display:inline-flex;gap:0.25rem}input[type='range']{width:100%;accent-color:var(--bf-range-fill)}.dual-track{position:absolute;inset:50% 0 auto;height:0.35rem;transform:translateY(-50%);background:var(--bf-range-track);border-radius:999px}.dual-fill{position:absolute;height:100%;background:var(--bf-range-fill);border-radius:inherit}.dual input[type='range']{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);background:transparent;pointer-events:none}.dual input[type='range']::-webkit-slider-thumb{pointer-events:auto}.dual input[type='range']::-moz-range-thumb{pointer-events:auto}.star{border:0;background:transparent;color:var(--bf-range-rating-muted);font:inherit;font-size:1.1rem;cursor:pointer;padding:0;line-height:1}.star.is-active{color:var(--bf-range-rating-active)}`;

const BfRange$1 = /*@__PURE__*/ proxyCustomElement(class BfRange extends H {
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
        this.observer.observe(this.el, { attributes: true });
    }
    disconnectedCallback() {
        this.observer?.disconnect();
    }
    mode() {
        const explicit = (this.el.getAttribute('mode') || '').toLowerCase();
        if (['slider', 'range', 'rating'].includes(explicit)) {
            return explicit;
        }
        if (this.el.hasAttribute('rating')) {
            return 'rating';
        }
        if (this.el.hasAttribute('range')) {
            return 'range';
        }
        return 'slider';
    }
    min() {
        const parsed = Number.parseFloat(this.el.getAttribute('min') || '0');
        return Number.isFinite(parsed) ? parsed : 0;
    }
    max() {
        const mn = this.min();
        const parsed = Number.parseFloat(this.el.getAttribute('max') || '100');
        return Number.isFinite(parsed) && parsed > mn ? parsed : mn + 100;
    }
    step() {
        const parsed = Number.parseFloat(this.el.getAttribute('step') || '1');
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    }
    parseValue(attrName, fallback) {
        const parsed = Number.parseFloat(this.el.getAttribute(attrName) || `${fallback}`);
        if (!Number.isFinite(parsed)) {
            return fallback;
        }
        return Math.min(this.max(), Math.max(this.min(), parsed));
    }
    count() {
        const parsed = Number.parseInt(this.el.getAttribute('count') || '5', 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
    }
    setAttr(attrName, value) {
        const next = `${value}`;
        if (this.el.getAttribute(attrName) === next) {
            return;
        }
        this.el.setAttribute(attrName, next);
    }
    emit(kind) {
        const mode = this.mode();
        this.el.dispatchEvent(new CustomEvent(kind, {
            bubbles: true,
            composed: true,
            detail: mode === 'range'
                ? {
                    mode,
                    value: [
                        this.parseValue('low', this.min()),
                        this.parseValue('high', this.max()),
                    ],
                }
                : {
                    mode,
                    value: this.parseValue('value', this.min()),
                },
        }));
    }
    onSingle = (event) => {
        const input = event.target;
        this.setAttr('value', input.value);
        this.emit(event.type === 'change' ? 'bf-change' : 'bf-input');
    };
    onDual = (event) => {
        const tgt = event.target;
        let low = this.parseValue('low', this.min());
        let high = this.parseValue('high', this.max());
        const next = Number.parseFloat(tgt.value);
        if (tgt.classList.contains('dual-low')) {
            low = Math.min(next, high);
        }
        else {
            high = Math.max(next, low);
        }
        this.setAttr('low', low);
        this.setAttr('high', high);
        this.sync();
        this.emit(event.type === 'change' ? 'bf-change' : 'bf-input');
    };
    bindOnce(sr) {
        const sing = sr.querySelector('.single-input');
        const lo = sr.querySelector('.dual-low');
        const hi = sr.querySelector('.dual-high');
        if (sing instanceof HTMLInputElement &&
            sing.dataset.bfBound !== 'true') {
            sing.dataset.bfBound = 'true';
            sing.addEventListener('input', this.onSingle);
            sing.addEventListener('change', this.onSingle);
        }
        [lo, hi].forEach((el) => {
            if (el instanceof HTMLInputElement && el.dataset.bfBound !== 'true') {
                el.dataset.bfBound = 'true';
                el.addEventListener('input', this.onDual);
                el.addEventListener('change', this.onDual);
            }
        });
    }
    renderRating(root) {
        const box = root.querySelector('.rating');
        if (!(box instanceof H)) {
            return;
        }
        box.replaceChildren();
        const ct = this.count();
        const current = this.parseValue('value', 0);
        const disabled = this.el.hasAttribute('disabled');
        for (let i = 1; i <= ct; i += 1) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'star';
            button.textContent = '*';
            button.disabled = disabled;
            button.setAttribute('aria-label', `${i}`);
            if (i <= current) {
                button.classList.add('is-active');
            }
            button.onclick = () => {
                this.setAttr('value', i);
                this.sync();
                this.emit('bf-change');
            };
            box.append(button);
        }
    }
    dualFill(root) {
        const fill = root.querySelector('.dual-fill');
        if (!(fill instanceof H)) {
            return;
        }
        const mn = this.min();
        const mx = this.max();
        const low = this.parseValue('low', mn);
        const high = this.parseValue('high', mx);
        fill.style.left = `${((low - mn) / (mx - mn)) * 100}%`;
        fill.style.width = `${((high - low) / (mx - mn)) * 100}%`;
    }
    sync() {
        const sr = this.el.shadowRoot;
        if (!sr) {
            return;
        }
        this.bindOnce(sr);
        const root = sr.querySelector('.root');
        if (!(root instanceof H)) {
            return;
        }
        const mode = this.mode();
        root.setAttribute('data-mode', mode);
        const mn = this.min();
        const mx = this.max();
        const st = this.step();
        const disabled = this.el.hasAttribute('disabled');
        const label = this.el.getAttribute('label') || '';
        const nm = this.el.getAttribute('name') || '';
        const sing = sr.querySelector('.single-input');
        const lo = sr.querySelector('.dual-low');
        const hi = sr.querySelector('.dual-high');
        if (sing instanceof HTMLInputElement) {
            sing.min = `${mn}`;
            sing.max = `${mx}`;
            sing.step = `${st}`;
            sing.value = `${this.parseValue('value', mn)}`;
            sing.disabled = disabled;
            sing.name = nm;
        }
        if (lo instanceof HTMLInputElement) {
            lo.min = `${mn}`;
            lo.max = `${mx}`;
            lo.step = `${st}`;
            lo.value = `${this.parseValue('low', mn)}`;
            lo.disabled = disabled;
            lo.name = `${nm ? `${nm}-` : ''}low`;
        }
        if (hi instanceof HTMLInputElement) {
            hi.min = `${mn}`;
            hi.max = `${mx}`;
            hi.step = `${st}`;
            hi.value = `${this.parseValue('high', mx)}`;
            hi.disabled = disabled;
            hi.name = `${nm ? `${nm}-` : ''}high`;
        }
        this.dualFill(root);
        this.renderRating(root);
        if (label) {
            if (sing instanceof HTMLInputElement) {
                sing.setAttribute('aria-label', label);
            }
            if (lo instanceof HTMLInputElement) {
                lo.setAttribute('aria-label', `${label} low`);
            }
            if (hi instanceof HTMLInputElement) {
                hi.setAttribute('aria-label', `${label} high`);
            }
            sr.querySelector('.rating')?.setAttribute?.('aria-label', label);
        }
    }
    componentDidRender() {
        this.sync();
    }
    render() {
        return (h(Host, { key: '45d2eb84aa1b7ff58f314213bdf540a8fce8d9aa' }, h("div", { key: 'aa5ef97e069da6a6db7ef80baf9f24cba7f0c280', class: "root", part: "root" }, h("div", { key: 'fb7a2dcad77d2fb6b58048d0efc8f2dd638d595c', class: "single", part: "single" }, h("input", { key: '8870f984495ed5d0a1e98960592e4e3e0ea7fffc', class: "single-input", type: "range", part: "input" })), h("div", { key: 'df17f8c21891e64d6e0a7e2c21a9bc0b9938223f', class: "dual", part: "dual" }, h("div", { key: '79565d6e592ebdabb792083ab972800a026d2b58', class: "dual-track", part: "track" }, h("div", { key: '9051301f921ef855ea3dad041d04af47d53b0abd', class: "dual-fill", part: "fill" })), h("input", { key: 'fe2025b9a36e4d316eaab58144af56866062cc14', class: "dual-low", type: "range", part: "low" }), h("input", { key: 'a7d505ced2c0ede347f94b53f9efeac217c5b5b3', class: "dual-high", type: "range", part: "high" })), h("div", { key: '1d211525aed3108b71caf950b793888f6755919f', class: "rating", part: "rating" }), h("div", { key: 'e32b02e699961302703e4a376429b55cb2808356', class: "meta", part: "meta" }, h("slot", { key: 'e7889a48db873a223bc9eb5cc1f9ee3d2c1d715e' })))));
    }
    static get style() { return bfRangeCss(); }
}, [257, "bf-range"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-range"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-range":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfRange$1);
            }
            break;
    } });
}

const BfRange = BfRange$1;
const defineCustomElement = defineCustomElement$1;

export { BfRange, defineCustomElement };
