import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfTabCss = () => `:host{--bf-tab-font:var(--bf-theme-font-family, inherit);--bf-tab-radius:var(--bf-theme-radius-md, 8px);--bf-tab-border-width:var(--bf-theme-border-width, 1px);--bf-tab-border-style:var(--bf-theme-border-style, solid);--bf-tab-border-color:var(--bf-theme-tab-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-tab-bg:var(--bf-theme-tab-bg, var(--bf-theme-surface-1, #ffffff));--bf-tab-color:var(--bf-theme-tab-color, var(--bf-theme-text-1, #0f172a));--bf-tab-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-tab-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-tab-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:inline-block;font:var(--bf-tab-font);color:var(--bf-tab-color)}.root{font:inherit;cursor:pointer;background:var(--bf-tab-bg);color:var(--bf-tab-color);border-width:var(--bf-tab-border-width);border-style:var(--bf-tab-border-style);border-color:var(--bf-tab-border-color);border-radius:var(--bf-tab-radius);padding:var(--bf-tab-padding-y) var(--bf-tab-padding-x);transition:var(--bf-tab-transition)}.root.is-selected{background:var(--bf-theme-button-primary-bg, #2563eb);color:var(--bf-theme-button-primary-color, #ffffff);border-color:var(--bf-theme-button-primary-border-color, #1d4ed8)}`;

const BfTab$1 = /*@__PURE__*/ proxyCustomElement(class BfTab extends H {
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
            attributeFilter: ['selected', 'disabled', 'group', 'label', 'value'],
        });
    }
    disconnectedCallback() {
        this.observer?.disconnect();
    }
    get selected() {
        return this.el.hasAttribute('selected');
    }
    set selected(value) {
        if (value) {
            this.el.setAttribute('selected', '');
        }
        else {
            this.el.removeAttribute('selected');
        }
    }
    get value() {
        return this.el.getAttribute('value') || this.el.textContent?.trim() || '';
    }
    onClick = () => {
        const group = this.el.getAttribute('group');
        if (group) {
            const peers = document.querySelectorAll(`bf-tab[group="${CSS.escape(group)}"]`);
            for (const peer of Array.from(peers)) {
                peer.toggleAttribute('selected', peer === this.el);
            }
        }
        else {
            this.selected = true;
        }
        this.el.dispatchEvent(new CustomEvent('bf-change', {
            bubbles: true,
            composed: true,
            detail: {
                group: group || '',
                value: this.value,
                selected: this.selected,
            },
        }));
    };
    syncState() {
        const button = this.el.shadowRoot?.querySelector('.root');
        if (!(button instanceof HTMLButtonElement)) {
            return;
        }
        const labelAttr = this.el.getAttribute('label');
        if (labelAttr) {
            button.setAttribute('aria-label', labelAttr);
        }
        else {
            button.removeAttribute('aria-label');
        }
        button.disabled = this.el.hasAttribute('disabled');
        button.setAttribute('aria-selected', String(this.selected));
        button.setAttribute('role', 'tab');
        button.classList.toggle('is-selected', this.selected);
    }
    render() {
        return (h(Host, { key: '6220dd9772b87c2508fe2e55b853bda03c4178d3' }, h("button", { key: '16752462a379276cf7535490078be54e773098cf', class: "root", part: "root", type: "button", onClick: this.onClick }, h("slot", { key: 'dd7b7773dba5bfb22a67ac0f2aa9cbc021cc0de7' }))));
    }
    static get watchers() { return {
        "attrLabel": [{
                "handleLabel": 0
            }]
    }; }
    static get style() { return bfTabCss(); }
}, [769, "bf-tab", {
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
    const components = ["bf-tab"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-tab":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfTab$1);
            }
            break;
    } });
}

const BfTab = BfTab$1;
const defineCustomElement = defineCustomElement$1;

export { BfTab, defineCustomElement };
