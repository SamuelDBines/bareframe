import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfToggleCss = () => `:host{--bf-toggle-font:var(--bf-theme-font-family, inherit);--bf-toggle-radius:var(--bf-theme-radius-md, 8px);--bf-toggle-border-width:var(--bf-theme-border-width, 1px);--bf-toggle-border-style:var(--bf-theme-border-style, solid);--bf-toggle-border-color:var(--bf-theme-toggle-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-toggle-bg:var(--bf-theme-toggle-bg, var(--bf-theme-surface-1, #ffffff));--bf-toggle-color:var(--bf-theme-toggle-color, var(--bf-theme-text-1, #0f172a));--bf-toggle-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-toggle-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-toggle-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-toggle-font);color:var(--bf-toggle-color)}.root{display:inline-flex;align-items:center;gap:0.55rem;background:var(--bf-toggle-bg);color:var(--bf-toggle-color);border-width:var(--bf-toggle-border-width);border-style:var(--bf-toggle-border-style);border-color:var(--bf-toggle-border-color);border-radius:var(--bf-toggle-radius);padding:var(--bf-toggle-padding-y) var(--bf-toggle-padding-x);transition:var(--bf-toggle-transition);cursor:pointer}.track{display:none}.root[data-variant='switch']{border-color:transparent;background:transparent;padding:0}.root[data-variant='switch'] .track{display:inline-flex;align-items:center;width:2.2rem;height:1.3rem;border-radius:999px;background:var(--bf-theme-surface-2, #cbd5e1);padding:0.15rem;transition:background-color 140ms ease}.root[data-variant='switch'] .thumb{width:1rem;height:1rem;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0, 0, 0, 0.2);transform:translateX(0);transition:transform 140ms ease}.root[data-variant='switch'].is-checked .track{background:var(--bf-theme-button-primary-bg, #2563eb)}.root[data-variant='switch'].is-checked .thumb{transform:translateX(0.9rem)}.root[data-variant='toggle'].is-checked{background:color-mix(in srgb, var(--bf-theme-button-primary-bg, #2563eb) 12%, var(--bf-toggle-bg));border-color:var(--bf-theme-button-primary-bg, #2563eb)}.root:disabled{opacity:0.55;cursor:not-allowed}`;

const BfToggle$1 = /*@__PURE__*/ proxyCustomElement(class BfToggle extends H {
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
        this.sync();
    }
    handleLabel() {
        this.sync();
    }
    observer;
    connectedCallback() {
        this.observer = new MutationObserver(() => this.sync());
        this.observer.observe(this.el, {
            attributes: true,
            attributeFilter: ['checked', 'disabled', 'label', 'switch', 'variant'],
        });
    }
    disconnectedCallback() {
        this.observer?.disconnect();
    }
    get checked() {
        return this.el.hasAttribute('checked');
    }
    set checked(next) {
        if (next) {
            this.el.setAttribute('checked', '');
        }
        else {
            this.el.removeAttribute('checked');
        }
    }
    variant() {
        const variant = (this.el.getAttribute('variant') || '').toLowerCase();
        if (variant === 'switch' || this.el.hasAttribute('switch')) {
            return 'switch';
        }
        return 'toggle';
    }
    onClick = () => {
        if (this.el.hasAttribute('disabled')) {
            return;
        }
        this.checked = !this.checked;
        this.el.dispatchEvent(new CustomEvent('bf-change', {
            bubbles: true,
            composed: true,
            detail: {
                checked: this.checked,
            },
        }));
    };
    sync() {
        const root = this.el.shadowRoot?.querySelector('.root');
        const text = this.el.shadowRoot?.querySelector('.text');
        if (!(root instanceof HTMLButtonElement) || !(text instanceof H)) {
            return;
        }
        const variant = this.variant();
        root.setAttribute('data-variant', variant);
        root.setAttribute('aria-pressed', String(this.checked));
        root.setAttribute('role', 'switch');
        root.setAttribute('aria-checked', String(this.checked));
        root.disabled = this.el.hasAttribute('disabled');
        root.classList.toggle('is-checked', this.checked);
        const labelAttr = this.el.getAttribute('label');
        if (labelAttr) {
            root.setAttribute('aria-label', labelAttr);
        }
        else {
            root.removeAttribute('aria-label');
        }
        text.hidden = variant === 'switch' && !(this.el.textContent || '').trim();
    }
    render() {
        return (h(Host, { key: 'b333ee9819595d3fd88be22aab7344d8a2f2b1a5' }, h("button", { key: '5489e3a452ecfe09124611167cec46871688868b', class: "root", part: "root", type: "button", onClick: this.onClick }, h("span", { key: '73615ce76c5c494fe45f6848018c39a5e873440e', class: "track", part: "track" }, h("span", { key: 'e3c9b91251b8dfff5ddfb1349aa2f84183c44be0', class: "thumb", part: "thumb" })), h("span", { key: '2def954163460dd24e769354a4e623012c92f15b', class: "text", part: "text" }, h("slot", { key: '1ad28071dad3fa850db71be970c406b3731bcc7f' })))));
    }
    static get watchers() { return {
        "attrLabel": [{
                "handleLabel": 0
            }]
    }; }
    static get style() { return bfToggleCss(); }
}, [769, "bf-toggle", {
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
    const components = ["bf-toggle"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-toggle":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfToggle$1);
            }
            break;
    } });
}

const BfToggle = BfToggle$1;
const defineCustomElement = defineCustomElement$1;

export { BfToggle, defineCustomElement };
