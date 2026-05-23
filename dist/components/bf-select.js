import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfSelectCss = () => `:host{--bf-select-font:var(--bf-theme-font-family, inherit);--bf-select-radius:var(--bf-theme-radius-md, 8px);--bf-select-border-width:var(--bf-theme-border-width, 1px);--bf-select-border-style:var(--bf-theme-border-style, solid);--bf-select-border-color:var(--bf-theme-select-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-select-bg:var(--bf-theme-select-bg, var(--bf-theme-surface-1, #ffffff));--bf-select-color:var(--bf-theme-select-color, var(--bf-theme-text-1, #0f172a));--bf-select-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-select-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-select-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-select-font);color:var(--bf-select-color)}.root{position:relative;background:var(--bf-select-bg);color:var(--bf-select-color);border-width:var(--bf-select-border-width);border-style:var(--bf-select-border-style);border-color:var(--bf-select-border-color);border-radius:var(--bf-select-radius);transition:var(--bf-select-transition)}select{appearance:none;-webkit-appearance:none;width:100%;border:0;outline:0;background:transparent;color:inherit;font:inherit;padding:var(--bf-select-padding-y) calc(var(--bf-select-padding-x) * 2.1)   var(--bf-select-padding-y) var(--bf-select-padding-x)}.root.is-multi select{padding-right:var(--bf-select-padding-x)}.chevron{position:absolute;top:50%;right:var(--bf-select-padding-x);width:0.6rem;height:0.6rem;transform:translateY(-60%) rotate(45deg);border-right:2px solid currentColor;border-bottom:2px solid currentColor;opacity:0.7;pointer-events:none}.root.is-multi .chevron{display:none}`;

const BfSelect$1 = /*@__PURE__*/ proxyCustomElement(class BfSelect extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
    ignoreNextExternalValueChange = false;
    mutation;
    connectedCallback() {
        this.mutation = new MutationObserver((records) => {
            let touchesValue = false;
            for (const r of records) {
                if (r.type === 'attributes' && r.attributeName === 'value') {
                    touchesValue = true;
                }
            }
            if (touchesValue &&
                this.ignoreNextExternalValueChange) {
                this.ignoreNextExternalValueChange = false;
                return;
            }
            void this.pull();
        });
        this.mutation.observe(this.el, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: [
                'value',
                'multi',
                'disabled',
                'required',
                'placeholder',
                'label',
                'name',
                'selected',
                'disabled',
                'label',
            ],
        });
        queueMicrotask(() => this.pull());
    }
    disconnectedCallback() {
        this.mutation?.disconnect();
    }
    get value() {
        const sel = this.nativeSelect();
        if (!sel) {
            return '';
        }
        if (this.isMulti()) {
            return this.values.join(',');
        }
        return sel.value;
    }
    set value(nextValue) {
        if (Array.isArray(nextValue)) {
            this.el.setAttribute('value', nextValue.join(','));
            return;
        }
        this.el.setAttribute('value', `${nextValue ?? ''}`);
    }
    get values() {
        const sel = this.nativeSelect();
        if (!sel) {
            return [];
        }
        return Array.from(sel.selectedOptions).map((o) => o.value);
    }
    nativeSelect() {
        const s = this.el.shadowRoot?.querySelector('select');
        return s instanceof HTMLSelectElement ? s : null;
    }
    isMulti() {
        return this.el.hasAttribute('multi');
    }
    multiLimit() {
        if (!this.isMulti()) {
            return 1;
        }
        const raw = this.el.getAttribute('multi');
        if (raw === '' || raw === null) {
            return Infinity;
        }
        const parsed = Number.parseInt(raw, 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : Infinity;
    }
    parsedValue() {
        const raw = this.el.getAttribute('value');
        if (raw === null) {
            return [];
        }
        return this.isMulti()
            ? raw
                .split(',')
                .map((part) => part.trim())
                .filter(Boolean)
            : [raw];
    }
    cloneOption(option) {
        const clone = document.createElement('option');
        clone.value = option.getAttribute('value') ?? option.textContent?.trim() ?? '';
        clone.textContent = option.textContent?.trim() ?? '';
        clone.disabled = option.hasAttribute('disabled');
        clone.defaultSelected = option.hasAttribute('selected');
        clone.selected = option.hasAttribute('selected');
        return clone;
    }
    cloneOptionsFromLightDom(sel) {
        let count = 0;
        const frag = document.createDocumentFragment();
        for (const child of Array.from(this.el.children)) {
            const tag = child.tagName.toLowerCase();
            if (tag === 'option') {
                frag.append(this.cloneOption(child));
                count += 1;
            }
            else if (tag === 'optgroup') {
                const grp = document.createElement('optgroup');
                const label = child.getAttribute('label');
                if (label) {
                    grp.label = label;
                }
                for (const opt of Array.from(child.querySelectorAll('option'))) {
                    grp.append(this.cloneOption(opt));
                    count += 1;
                }
                frag.append(grp);
            }
        }
        sel.replaceChildren();
        const placeholder = this.el.getAttribute('placeholder');
        if (placeholder && !this.isMulti()) {
            const ph = document.createElement('option');
            ph.value = '';
            ph.textContent = placeholder;
            sel.append(ph);
        }
        if (count > 0) {
            sel.append(frag);
        }
        else {
            const fb = this.el.textContent?.trim();
            if (fb) {
                const o = document.createElement('option');
                o.value = fb;
                o.textContent = fb;
                sel.append(o);
            }
        }
    }
    enforceMulti(sel) {
        if (!this.isMulti()) {
            return;
        }
        const cap = this.multiLimit();
        if (cap === Infinity) {
            return;
        }
        const selArr = Array.from(sel.options).filter((o) => o.selected);
        if (selArr.length <= cap) {
            return;
        }
        for (let i = cap; i < selArr.length; i += 1) {
            selArr[i].selected = false;
        }
    }
    reflectFromControl(sel) {
        const next = this.isMulti() ? this.values.join(',') : sel.value;
        if (this.el.getAttribute('value') === next) {
            return;
        }
        this.ignoreNextExternalValueChange = true;
        this.el.setAttribute('value', next);
    }
    applyAttrValue(sel) {
        if (!this.el.hasAttribute('value')) {
            return;
        }
        const values = new Set(this.parsedValue());
        if (this.isMulti()) {
            for (const opt of Array.from(sel.options)) {
                opt.selected = values.has(opt.value);
            }
            return;
        }
        sel.value = this.parsedValue()[0] ?? '';
    }
    handleChange(sel) {
        this.enforceMulti(sel);
        this.reflectFromControl(sel);
        this.el.dispatchEvent(new CustomEvent('bf-change', {
            bubbles: true,
            composed: true,
            detail: {
                value: this.isMulti() ? this.values : sel.value,
                values: this.values,
                multiple: this.isMulti(),
                multi: this.multiLimit(),
            },
        }));
    }
    bindOnce(sel) {
        if (sel.dataset.bound === 'true') {
            return;
        }
        sel.dataset.bound = 'true';
        sel.addEventListener('change', () => this.handleChange(sel));
    }
    syncDom(sel, root) {
        this.cloneOptionsFromLightDom(sel);
        sel.multiple = this.isMulti();
        root.classList.toggle('is-multi', this.isMulti());
        sel.disabled = this.el.hasAttribute('disabled');
        sel.required = this.el.hasAttribute('required');
        sel.name = this.el.getAttribute('name') || '';
        const label = this.el.getAttribute('label');
        if (label) {
            sel.setAttribute('aria-label', label);
        }
        else {
            sel.removeAttribute('aria-label');
        }
    }
    pull() {
        const root = this.el.shadowRoot?.querySelector('.root');
        const sel = this.nativeSelect();
        if (!(root instanceof H) || !sel) {
            return;
        }
        this.bindOnce(sel);
        this.syncDom(sel, root);
        this.applyAttrValue(sel);
        this.enforceMulti(sel);
        this.reflectFromControl(sel);
    }
    componentDidRender() {
        this.pull();
    }
    render() {
        return (h(Host, { key: 'b17f7004ccecc11752addf8959c65c8dc47488d3' }, h("div", { key: '666c0c098c548032d51918a961fd70b0fddb262c', class: "root", part: "root" }, h("select", { key: '9133532e69a952f81d17f21cf2d2412f60ce9ebf', part: "select" }), h("span", { key: '922a294c7be9431f0635034a7537fbe6f5c85676', class: "chevron", part: "chevron", "aria-hidden": "true" }))));
    }
    static get style() { return bfSelectCss(); }
}, [1, "bf-select"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-select"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-select":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfSelect$1);
            }
            break;
    } });
}

const BfSelect = BfSelect$1;
const defineCustomElement = defineCustomElement$1;

export { BfSelect, defineCustomElement };
