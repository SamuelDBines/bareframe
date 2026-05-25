import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfRadioCss = () => `:host{--bf-radio-font:var(--bf-theme-font-family, inherit);--bf-radio-radius:var(--bf-theme-radius-md, 8px);--bf-radio-border-width:var(--bf-theme-border-width, 1px);--bf-radio-border-style:var(--bf-theme-border-style, solid);--bf-radio-border-color:var(--bf-theme-radio-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-radio-bg:var(--bf-theme-radio-bg, var(--bf-theme-surface-1, #ffffff));--bf-radio-color:var(--bf-theme-radio-color, var(--bf-theme-text-1, #0f172a));--bf-radio-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-radio-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-radio-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:inline-block;font:var(--bf-radio-font);color:var(--bf-radio-color)}.root{display:inline-flex;align-items:center;gap:0.5rem;cursor:pointer;background:var(--bf-radio-bg);color:var(--bf-radio-color);border-width:var(--bf-radio-border-width);border-style:var(--bf-radio-border-style);border-color:var(--bf-radio-border-color);border-radius:var(--bf-radio-radius);padding:var(--bf-radio-padding-y) var(--bf-radio-padding-x);transition:var(--bf-radio-transition)}input{position:absolute;opacity:0;width:0;height:0}.dot{width:0.95rem;height:0.95rem;border-radius:999px;border:2px solid var(--bf-radio-border-color);display:inline-block;position:relative}.dot::after{content:'';position:absolute;inset:0.15rem;border-radius:999px;background:var(--bf-theme-button-primary-bg, #2563eb);transform:scale(0);transition:transform 120ms ease}input:checked+.dot::after{transform:scale(1)}`;

const BfRadio$1 = /*@__PURE__*/ proxyCustomElement(class BfRadio extends H {
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
            attributeFilter: ['checked', 'disabled', 'label', 'value', 'group'],
        });
    }
    disconnectedCallback() {
        this.observer?.disconnect();
    }
    get checked() {
        return this.el.hasAttribute('checked');
    }
    set checked(value) {
        if (value) {
            this.el.setAttribute('checked', '');
        }
        else {
            this.el.removeAttribute('checked');
        }
    }
    get value() {
        return this.el.getAttribute('value') || this.el.textContent?.trim() || '';
    }
    syncState() {
        const input = this.el.shadowRoot?.querySelector('input');
        if (!(input instanceof HTMLInputElement)) {
            return;
        }
        const group = this.el.getAttribute('group') || '';
        input.name = group;
        input.value = this.value;
        input.checked = this.checked;
        input.disabled = this.el.hasAttribute('disabled');
        const hasLabelText = (this.el.textContent || '').trim().length > 0;
        const labelAttr = this.el.getAttribute('label');
        if (!hasLabelText && !labelAttr) {
            this.el.setAttribute('label', 'radio');
        }
        const finalLabel = this.el.getAttribute('label');
        if (finalLabel) {
            input.setAttribute('aria-label', finalLabel);
        }
        else {
            input.removeAttribute('aria-label');
        }
    }
    effectiveGroup() {
        return this.el.getAttribute('group') || '';
    }
    uncheckPeers() {
        const group = this.effectiveGroup();
        if (!group) {
            return;
        }
        const peers = document.querySelectorAll(`bf-radio[group="${CSS.escape(group)}"]`);
        for (const peer of Array.from(peers)) {
            if (peer !== this.el) {
                peer.removeAttribute('checked');
            }
        }
    }
    onInputChange = () => {
        const input = this.el.shadowRoot?.querySelector('input');
        if (!(input instanceof HTMLInputElement)) {
            return;
        }
        if (input.checked) {
            this.checked = true;
            this.uncheckPeers();
        }
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
        return (h(Host, { key: '8809c6e319d8138c2646b245196a08a88ee94636' }, h("label", { key: '83c06a9f6fabd8dd565db79468aeafd416b5157a', class: "root", part: "root" }, h("input", { key: '6eb76d6a09bbcc1bde9c73d2959f5b9865e58199', type: "radio", part: "input", onChange: this.onInputChange }), h("span", { key: '57d11ed8838218c86e1dfa13c41ead3f1598c592', class: "dot", part: "dot" }), h("span", { key: '6720311fbb9971a3c2895c289dc69c92be8f8cd9', class: "text", part: "text" }, h("slot", { key: 'ab17618a7cd74d55c84f06ea03d127178db7e87c' })))));
    }
    static get watchers() { return {
        "attrLabel": [{
                "handleLabel": 0
            }]
    }; }
    static get style() { return bfRadioCss(); }
}, [769, "bf-radio", {
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
    const components = ["bf-radio"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-radio":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfRadio$1);
            }
            break;
    } });
}

const BfRadio = BfRadio$1;
const defineCustomElement = defineCustomElement$1;

export { BfRadio, defineCustomElement };
