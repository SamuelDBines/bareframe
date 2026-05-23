import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfInputCss = () => `:host{--bf-input-font:var(--bf-theme-font-family, inherit);--bf-input-radius:var(--bf-theme-radius-md, 8px);--bf-input-border-width:var(--bf-theme-border-width, 1px);--bf-input-border-style:var(--bf-theme-border-style, solid);--bf-input-border-color:var(--bf-theme-input-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-input-bg:var(--bf-theme-input-bg, var(--bf-theme-surface-1, #ffffff));--bf-input-color:var(--bf-theme-input-color, var(--bf-theme-text-1, #0f172a));--bf-input-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-input-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-input-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-input-font);color:var(--bf-input-color)}.root{display:flex;align-items:center;gap:0.5rem;background:var(--bf-input-bg);color:var(--bf-input-color);border-width:var(--bf-input-border-width);border-style:var(--bf-input-border-style);border-color:var(--bf-input-border-color);border-radius:var(--bf-input-radius);padding:var(--bf-input-padding-y) var(--bf-input-padding-x);transition:var(--bf-input-transition)}.field{width:100%;min-width:0;border:0;outline:0;background:transparent;color:inherit;font:inherit;padding:0}.swatch,.format{display:none}.root.is-color .swatch,.root.is-color .format{display:inline-flex}.swatch{width:1.25rem;height:1.25rem;border:1px solid var(--bf-theme-border-1, #94a3b8);border-radius:4px;cursor:pointer;flex:0 0 auto}.format{border:0;outline:0;background:transparent;color:inherit;font:inherit;cursor:pointer;flex:0 0 auto}.picker{position:absolute;opacity:0;pointer-events:none;width:0;height:0}.root.is-color.swatch-right .swatch{order:3}.root.is-color.swatch-hidden .swatch{display:none}`;

const BfInput$1 = /*@__PURE__*/ proxyCustomElement(class BfInput extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
    skipHostValueObserve = false;
    color = { r: 0, g: 0, b: 0, a: 1 };
    colorFormat = 'hex';
    mutation;
    connectedCallback() {
        this.mutation = new MutationObserver((records) => {
            let sawHostValue = false;
            for (const r of records) {
                if (r.attributeName === 'value') {
                    sawHostValue = true;
                }
            }
            if (sawHostValue && this.skipHostValueObserve) {
                this.skipHostValueObserve = false;
                return;
            }
            this.syncHost();
        });
        this.mutation.observe(this.el, {
            attributes: true,
            attributeFilter: [
                'type',
                'value',
                'placeholder',
                'disabled',
                'required',
                'readonly',
                'name',
                'label',
                'min',
                'max',
                'step',
                'swatch',
                'swatch-hidden',
                'left',
                'right',
                'format',
                'hex',
                'rgba',
            ],
        });
        queueMicrotask(() => {
            if (!this.el.hasAttribute('value')) {
                const fb = this.el.textContent?.trim();
                if (fb) {
                    this.el.setAttribute('value', fb);
                }
            }
            this.syncHost();
        });
    }
    disconnectedCallback() {
        this.mutation?.disconnect();
    }
    get value() {
        const f = this.el.shadowRoot?.querySelector('.field');
        return f instanceof HTMLInputElement ? f.value : '';
    }
    set value(nextValue) {
        this.el.setAttribute('value', `${nextValue ?? ''}`);
    }
    componentDidRender() {
        const sr = this.el.shadowRoot;
        if (!sr) {
            return;
        }
        this.attachListeners(sr);
        this.syncHost();
    }
    attachListeners(sr) {
        const field = sr.querySelector('.field');
        const fmtEl = sr.querySelector('.format');
        const picker = sr.querySelector('.picker');
        const swatch = sr.querySelector('.swatch');
        if (field instanceof HTMLInputElement &&
            field.dataset.bfBound !== 'true') {
            field.dataset.bfBound = 'true';
            field.addEventListener('input', () => this.onFieldInput(sr));
            field.addEventListener('change', () => this.onFieldChange(sr));
        }
        if (fmtEl instanceof HTMLSelectElement && fmtEl.dataset.bfBound !== 'true') {
            fmtEl.dataset.bfBound = 'true';
            fmtEl.addEventListener('change', () => this.onFmtChange(sr));
        }
        if (picker instanceof HTMLInputElement && picker.dataset.bfBound !== 'true') {
            picker.dataset.bfBound = 'true';
            picker.addEventListener('input', () => this.onPickerInput(sr));
        }
        if (swatch instanceof HTMLButtonElement && swatch.dataset.bfBound !== 'true') {
            swatch.dataset.bfBound = 'true';
            swatch.addEventListener('click', () => this.onSwatch(sr));
        }
    }
    field(sr) {
        const x = sr.querySelector('.field');
        return x instanceof HTMLInputElement ? x : undefined;
    }
    reflectValueAttr(field) {
        const next = field.value;
        if (this.el.getAttribute('value') === next) {
            return;
        }
        this.skipHostValueObserve = true;
        this.el.setAttribute('value', next);
    }
    dispatchInput(sr) {
        const f = this.field(sr);
        this.el.dispatchEvent(new CustomEvent('bf-input', {
            bubbles: true,
            composed: true,
            detail: { value: f.value },
        }));
    }
    dispatchChange(sr) {
        const f = this.field(sr);
        this.el.dispatchEvent(new CustomEvent('bf-change', {
            bubbles: true,
            composed: true,
            detail: { value: f.value },
        }));
    }
    onFieldInput(sr) {
        const f = this.field(sr);
        if (!f) {
            return;
        }
        if (this.typeIsColor()) {
            this.consumeColor(String(f.value));
        }
        this.reflectValueAttr(f);
        this.dispatchInput(sr);
    }
    onFieldChange(sr) {
        const f = this.field(sr);
        const root = sr.querySelector('.root');
        if (!f || !(root instanceof H)) {
            return;
        }
        if (this.typeIsColor()) {
            if (!this.consumeColor(String(f.value))) {
                f.value = this.serialize(this.colorFormat, this.color);
            }
            this.paintColorChrome(sr, root, f);
        }
        this.reflectValueAttr(f);
        this.dispatchChange(sr);
    }
    onFmtChange(sr) {
        const fmt = sr.querySelector('.format');
        const field = this.field(sr);
        if (!(fmt instanceof HTMLSelectElement) || !field) {
            return;
        }
        if (!this.typeIsColor()) {
            return;
        }
        this.colorFormat = fmt.value;
        field.value = this.serialize(this.colorFormat, this.color);
        this.reflectValueAttr(field);
    }
    onPickerInput(sr) {
        const picker = sr.querySelector('.picker');
        const field = this.field(sr);
        const root = sr.querySelector('.root');
        if (!(picker instanceof HTMLInputElement) || !field || !(root instanceof H)) {
            return;
        }
        if (!this.typeIsColor()) {
            return;
        }
        const px = this.parseHex(picker.value);
        if (!px) {
            return;
        }
        this.color = { ...px, a: this.color.a };
        field.value = this.serialize(this.colorFormat, this.color);
        this.paintColorChrome(sr, root, field);
        this.reflectValueAttr(field);
        this.dispatchInput(sr);
    }
    onSwatch(sr) {
        const picker = sr.querySelector('.picker');
        if (!this.typeIsColor() || this.el.hasAttribute('disabled')) {
            return;
        }
        if (picker instanceof HTMLInputElement) {
            picker.click();
        }
    }
    typeIsColor() {
        return (this.el.getAttribute('type') || 'text').toLowerCase() === 'color';
    }
    allowedFormats() {
        const hasHex = this.el.hasAttribute('hex');
        const hasRgba = this.el.hasAttribute('rgba');
        if (hasHex && hasRgba) {
            return ['hex', 'rgba'];
        }
        if (hasHex) {
            return ['hex'];
        }
        if (hasRgba) {
            return ['rgba'];
        }
        const explicit = (this.el.getAttribute('format') || '').toLowerCase();
        if (explicit === 'hex') {
            return ['hex'];
        }
        if (explicit === 'rgba') {
            return ['rgba'];
        }
        return ['hex', 'rgba'];
    }
    resolveFormat(allowed) {
        const explicit = (this.el.getAttribute('format') || '').toLowerCase();
        if (allowed.includes(explicit)) {
            return explicit;
        }
        if (allowed.includes(this.colorFormat)) {
            return this.colorFormat;
        }
        return allowed[0] || 'hex';
    }
    swatchPos() {
        const explicit = (this.el.getAttribute('swatch') || '').toLowerCase();
        if (explicit === 'left' || explicit === 'right' || explicit === 'hidden') {
            return explicit;
        }
        if (this.el.hasAttribute('swatch-hidden')) {
            return 'hidden';
        }
        if (this.el.hasAttribute('right')) {
            return 'right';
        }
        if (this.el.hasAttribute('left')) {
            return 'left';
        }
        return 'left';
    }
    normHex(hexValue) {
        return this.serialize('hex', this.parseHex(hexValue) || this.color);
    }
    paintColorChrome(sr, root, field) {
        const fmt = sr.querySelector('.format');
        const picker = sr.querySelector('.picker');
        const swatch = sr.querySelector('.swatch');
        if (!(fmt instanceof HTMLSelectElement) || !(picker instanceof HTMLInputElement) || !(swatch instanceof HTMLButtonElement)) {
            return;
        }
        const pos = this.swatchPos();
        const allowed = this.allowedFormats();
        this.colorFormat = this.resolveFormat(allowed);
        root.classList.add('is-color');
        root.classList.toggle('swatch-right', pos === 'right');
        root.classList.toggle('swatch-hidden', pos === 'hidden');
        fmt.innerHTML = allowed
            .map((v) => `<option value="${v}">${v.toUpperCase()}</option>`)
            .join('');
        fmt.value = this.colorFormat;
        fmt.hidden = allowed.length <= 1;
        picker.value = this.normHex(this.serialize('hex', this.color));
        swatch.style.background = this.serialize('rgba', this.color);
        field.value = this.serialize(this.colorFormat, this.color);
    }
    clearColorChrome(root) {
        root.classList.remove('is-color', 'swatch-right', 'swatch-hidden');
    }
    clampCh(v) {
        return Math.min(255, Math.max(0, v));
    }
    clampA(v) {
        return Math.min(1, Math.max(0, v));
    }
    parseHex(value) {
        const raw = `${value || ''}`.trim().replace(/^#/, '');
        if (!raw) {
            return null;
        }
        if (raw.length === 3 || raw.length === 4) {
            const r = Number.parseInt(raw[0] + raw[0], 16);
            const g = Number.parseInt(raw[1] + raw[1], 16);
            const b = Number.parseInt(raw[2] + raw[2], 16);
            const a = raw.length === 4 ? Number.parseInt(raw[3] + raw[3], 16) / 255 : 1;
            if ([r, g, b, a].some((x) => Number.isNaN(x))) {
                return null;
            }
            return { r, g, b, a };
        }
        if (raw.length === 6 || raw.length === 8) {
            const r = Number.parseInt(raw.slice(0, 2), 16);
            const g = Number.parseInt(raw.slice(2, 4), 16);
            const b = Number.parseInt(raw.slice(4, 6), 16);
            const a = raw.length === 8 ? Number.parseInt(raw.slice(6, 8), 16) / 255 : 1;
            if ([r, g, b, a].some((x) => Number.isNaN(x))) {
                return null;
            }
            return { r, g, b, a };
        }
        return null;
    }
    parseRgba(value) {
        const m = `${value || ''}`.trim().match(/^rgba?\(\s*([^\)]+)\s*\)$/i);
        if (!m) {
            return null;
        }
        const parts = m[1].split(',').map((p) => p.trim());
        if (parts.length !== 3 && parts.length !== 4) {
            return null;
        }
        const r = Number.parseFloat(parts[0]);
        const g = Number.parseFloat(parts[1]);
        const b = Number.parseFloat(parts[2]);
        const a = parts.length === 4 ? Number.parseFloat(parts[3]) : 1;
        if ([r, g, b, a].some((x) => Number.isNaN(x))) {
            return null;
        }
        return {
            r: this.clampCh(r),
            g: this.clampCh(g),
            b: this.clampCh(b),
            a: this.clampA(a),
        };
    }
    consumeColor(value) {
        const h = this.parseHex(value);
        if (h) {
            this.color = h;
            return true;
        }
        const rgba = this.parseRgba(value);
        if (rgba) {
            this.color = rgba;
            return true;
        }
        return false;
    }
    hexCh(v) {
        return Math.round(this.clampCh(v))
            .toString(16)
            .padStart(2, '0');
    }
    alphaStr(value) {
        const rounded = Math.round(this.clampA(value) * 1000) / 1000;
        return `${rounded}`;
    }
    serialize(fmt, c) {
        if (fmt === 'rgba') {
            return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${this.alphaStr(c.a)})`;
        }
        return `#${this.hexCh(c.r)}${this.hexCh(c.g)}${this.hexCh(c.b)}`;
    }
    syncHost() {
        const sr = this.el.shadowRoot;
        const root = sr?.querySelector('.root');
        const field = sr?.querySelector('.field');
        if (!(root instanceof H) || !(field instanceof HTMLInputElement)) {
            return;
        }
        const type = (this.el.getAttribute('type') || 'text').toLowerCase();
        const value = this.el.getAttribute('value') || '';
        field.type = type === 'color' ? 'text' : type;
        field.value = value;
        field.placeholder = this.el.getAttribute('placeholder') || '';
        field.disabled = this.el.hasAttribute('disabled');
        field.required = this.el.hasAttribute('required');
        field.readOnly = this.el.hasAttribute('readonly');
        field.name = this.el.getAttribute('name') || '';
        field.min = this.el.getAttribute('min') || '';
        field.max = this.el.getAttribute('max') || '';
        field.step = this.el.getAttribute('step') || '';
        const lab = this.el.getAttribute('label');
        if (lab) {
            field.setAttribute('aria-label', lab);
        }
        else {
            field.removeAttribute('aria-label');
        }
        if (type === 'color') {
            if (!this.consumeColor(value) && !value) {
                this.color = { r: 0, g: 0, b: 0, a: 1 };
            }
            this.paintColorChrome(sr, root, field);
            field.value = this.serialize(this.colorFormat, this.color);
            this.reflectValueAttr(field);
        }
        else {
            this.clearColorChrome(root);
        }
    }
    render() {
        return (h(Host, { key: '0f46012ecc46350faada566d017c13feda76e326' }, h("div", { key: '0224dfad923eebf77776993781b3430b54178912', class: "root", part: "root" }, h("button", { key: '8a3048026b335c1058c9a7cdd401e3e1aae66271', class: "swatch", part: "swatch", type: "button", "aria-label": "Pick color" }), h("input", { key: 'bd52c70a64486e7acdee7b683fc602ce2bd30dc3', class: "field", part: "input" }), h("select", { key: '0aa3646fa6f3b29b6be13628ecb436c67ba70368', class: "format", part: "format", "aria-label": "Color format" }, h("option", { key: '6cf6f6dd173f65792ec77bcb55ba4bae3a3d1ca3', value: "hex" }, "HEX"), h("option", { key: '63efc93a20ed11362a43647c31ed607e815c85e7', value: "rgba" }, "RGBA")), h("input", { key: '4f187260c17ec17315989f14fb5f5dff46f6e80b', class: "picker", part: "picker", type: "color", tabIndex: -1, "aria-hidden": "true" }))));
    }
    static get style() { return bfInputCss(); }
}, [1, "bf-input"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-input"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-input":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfInput$1);
            }
            break;
    } });
}

const BfInput = BfInput$1;
const defineCustomElement = defineCustomElement$1;

export { BfInput, defineCustomElement };
