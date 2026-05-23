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
        return (h(Host, { key: 'e567c604ed60d9042e34c66a51e1e3fefe9c6212' }, h("div", { key: 'fe05a74eeead25300e8af7a931c6a1de7777d416', class: "root", part: "root" }, h("div", { key: 'cda349cdafed6184c061c34b9db3aaf08cc3b519', class: "single", part: "single" }, h("input", { key: '286f8ec8cb1019db402ca7f7e6923e628b8017f3', class: "single-input", type: "range", part: "input" })), h("div", { key: 'fd473cfc0095068e665be6272cd8e09bd54a862d', class: "dual", part: "dual" }, h("div", { key: 'faa92b43249013fff90600b2c7a620449aaca3bd', class: "dual-track", part: "track" }, h("div", { key: '50a7c8c6fb2258464104bb4a6fc5f4016f828470', class: "dual-fill", part: "fill" })), h("input", { key: '98f408f774bf27ed785d018dd4dea496810693fa', class: "dual-low", type: "range", part: "low" }), h("input", { key: '501042b20b7d14be46f8d0c1c78511a06d10c259', class: "dual-high", type: "range", part: "high" })), h("div", { key: '744b93990f70dd5c5426296a359bccafc5071fdf', class: "rating", part: "rating" }), h("div", { key: 'f06b4859a24fccba1e87f2155bbd6fd069eff416', class: "meta", part: "meta" }, h("slot", { key: '6d641ed2bc2328a5bb638a5c2e4daa066274ab0c' })))));
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
