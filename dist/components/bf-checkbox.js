import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfCheckboxCss = () => `:host{--bf-checkbox-font:var(--bf-theme-font-family, inherit);--bf-checkbox-radius:var(--bf-theme-radius-md, 8px);--bf-checkbox-border-width:var(--bf-theme-border-width, 1px);--bf-checkbox-border-style:var(--bf-theme-border-style, solid);--bf-checkbox-border-color:var(--bf-theme-checkbox-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-checkbox-bg:var(--bf-theme-checkbox-bg, var(--bf-theme-surface-1, #ffffff));--bf-checkbox-color:var(--bf-theme-checkbox-color, var(--bf-theme-text-1, #0f172a));--bf-checkbox-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-checkbox-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-checkbox-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:inline-block;font:var(--bf-checkbox-font);color:var(--bf-checkbox-color)}.root{display:inline-flex;align-items:center;gap:0.5rem;cursor:pointer;background:var(--bf-checkbox-bg);color:var(--bf-checkbox-color);border-width:var(--bf-checkbox-border-width);border-style:var(--bf-checkbox-border-style);border-color:var(--bf-checkbox-border-color);border-radius:var(--bf-checkbox-radius);padding:var(--bf-checkbox-padding-y) var(--bf-checkbox-padding-x);transition:var(--bf-checkbox-transition)}input{position:absolute;opacity:0;width:0;height:0}.box{width:0.95rem;height:0.95rem;border-radius:0.25rem;border:2px solid var(--bf-checkbox-border-color);display:inline-block;position:relative}.box::after{content:'';position:absolute;left:0.2rem;top:0.02rem;width:0.28rem;height:0.55rem;border-right:2px solid var(--bf-theme-button-primary-color, #fff);border-bottom:2px solid var(--bf-theme-button-primary-color, #fff);transform:rotate(45deg) scale(0);transition:transform 120ms ease}input:checked+.box{background:var(--bf-theme-button-primary-bg, #2563eb);border-color:var(--bf-theme-button-primary-bg, #2563eb)}input:checked+.box::after{transform:rotate(45deg) scale(1)}`;

const BfCheckbox$1 = /*@__PURE__*/ proxyCustomElement(class BfCheckbox extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
    attrLabel;
    componentDidRender() {
        this.syncState();
    }
    handleLabel() {
        this.syncState();
    }
    observer;
    connectedCallback() {
        this.observer = new MutationObserver(() => this.syncState());
        this.observer.observe(this.el, {
            attributes: true,
            attributeFilter: ['checked', 'disabled', 'label', 'value', 'group', 'multiple'],
        });
    }
    disconnectedCallback() {
        this.observer?.disconnect();
    }
    syncState() {
        const input = this.el.shadowRoot?.querySelector('input');
        if (!(input instanceof HTMLInputElement)) {
            return;
        }
        input.checked = this.checked;
        input.disabled = this.disabled;
        input.value = this.value;
        const labelAttr = this.el.getAttribute('label');
        if (labelAttr) {
            input.setAttribute('aria-label', labelAttr);
        }
        else {
            input.removeAttribute('aria-label');
        }
    }
    get checked() {
        return this.el.hasAttribute('checked');
    }
    set checked(v) {
        if (v) {
            this.el.setAttribute('checked', '');
        }
        else {
            this.el.removeAttribute('checked');
        }
    }
    get value() {
        return this.el.getAttribute('value') || this.el.textContent?.trim() || '';
    }
    get disabled() {
        return this.el.hasAttribute('disabled');
    }
    effectiveGroup() {
        return this.el.getAttribute('group') || '';
    }
    groupLimit() {
        const multiple = this.el.getAttribute('multiple');
        if (multiple === null) {
            return Infinity;
        }
        if (multiple === '') {
            return Infinity;
        }
        const parsed = Number.parseInt(multiple, 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : Infinity;
    }
    canSelectMore() {
        const group = this.effectiveGroup();
        if (!group) {
            return true;
        }
        const cap = this.groupLimit();
        if (cap === Infinity) {
            return true;
        }
        const selected = Array.from(document.querySelectorAll(`bf-checkbox[group="${CSS.escape(group)}"][checked]`));
        return selected.length < cap || selected.includes(this.el);
    }
    onInputChange = (event) => {
        const input = event.target;
        const nextChecked = input.checked;
        if (nextChecked && !this.canSelectMore()) {
            input.checked = false;
            return;
        }
        this.checked = nextChecked;
        this.el.dispatchEvent(new CustomEvent('bf-change', {
            bubbles: true,
            composed: true,
            detail: {
                group: this.effectiveGroup(),
                value: this.value,
                checked: this.checked,
            },
        }));
    };
    render() {
        return (h(Host, { key: '5b3a15efe0e9396dbfbc5e2667efca946e29cebc' }, h("label", { key: 'afa1cf334ce0279c98ccbdcfc7640a43e807bde2', class: "root", part: "root" }, h("input", { key: '738df61a17cf0887997f75d585bafb48c5125b3b', type: "checkbox", part: "input", onChange: this.onInputChange }), h("span", { key: '88888cee472d1ee1d990f3fbd6531223d7966f8e', class: "box", part: "box" }), h("span", { key: '7292be60173cb2c2b65a23ba1e509442cdb6abec', class: "text", part: "text" }, h("slot", { key: '47b940a1372e876342c00500902df189e6642755' })))));
    }
    static get watchers() { return {
        "attrLabel": [{
                "handleLabel": 0
            }]
    }; }
    static get style() { return bfCheckboxCss(); }
}, [769, "bf-checkbox", {
        "attrLabel": [513, "label"]
    }, undefined, {
        "attrLabel": [{
                "handleLabel": 0
            }]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-checkbox"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-checkbox":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfCheckbox$1);
            }
            break;
    } });
}

const BfCheckbox = BfCheckbox$1;
const defineCustomElement = defineCustomElement$1;

export { BfCheckbox, defineCustomElement };
