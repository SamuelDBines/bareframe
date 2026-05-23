import { p as proxyCustomElement, H, d as createEvent, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfButtonCss = () => `:host{--bf-button-font:var(--bf-theme-font-family, inherit);--bf-button-border-width:var(--bf-theme-border-width, 1px);--bf-button-border-style:var(--bf-theme-border-style, solid);--bf-button-border-radius:var(--bf-theme-radius-md, 6px);--bf-button-padding-y:var(--bf-theme-space-2, 0.5rem);--bf-button-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-button-cursor:var(--bf-theme-cursor-button, pointer);--bf-button-opacity-hover:var(--bf-theme-opacity-hover, 0.95);--bf-button-active-translate-y:var(--bf-theme-active-translate-y, 1px);--bf-button-focus-outline-width:var(--bf-theme-focus-ring-width, 2px);--bf-button-focus-outline-style:var(--bf-theme-focus-ring-style, solid);--bf-button-focus-outline-color:var(--bf-theme-focus-ring-color, #93c5fd);--bf-button-focus-outline-offset:var(--bf-theme-focus-ring-offset, 2px);--bf-button-transition:var(--bf-theme-transition-transform, transform 120ms ease),   var(--bf-theme-transition-opacity, opacity 120ms ease),   var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);--bf-button-primary-bg:var(--bf-theme-button-primary-bg, #1d4ed8);--bf-button-primary-color:var(--bf-theme-button-primary-color, #ffffff);--bf-button-primary-border-color:var(   --bf-theme-button-primary-border-color,   transparent  );--bf-button-primary-hover-bg:var(--bf-button-primary-bg);--bf-button-primary-hover-color:var(--bf-button-primary-color);--bf-button-primary-hover-border-color:var(--bf-button-primary-border-color);--bf-button-primary-active-bg:var(--bf-button-primary-bg);--bf-button-primary-active-color:var(--bf-button-primary-color);--bf-button-primary-active-border-color:var(   --bf-button-primary-border-color  );--bf-button-secondary-bg:var(--bf-theme-button-secondary-bg, #ffffff);--bf-button-secondary-color:var(--bf-theme-button-secondary-color, #1d4ed8);--bf-button-secondary-border-color:var(   --bf-theme-button-secondary-border-color,   #1d4ed8  );--bf-button-secondary-hover-bg:var(--bf-button-secondary-bg);--bf-button-secondary-hover-color:var(--bf-button-secondary-color);--bf-button-secondary-hover-border-color:var(   --bf-button-secondary-border-color  );--bf-button-secondary-active-bg:var(--bf-button-secondary-bg);--bf-button-secondary-active-color:var(--bf-button-secondary-color);--bf-button-secondary-active-border-color:var(   --bf-button-secondary-border-color  );--bf-button-tertiary-bg:var(--bf-theme-button-tertiary-bg, #f3f4f6);--bf-button-tertiary-color:var(--bf-theme-button-tertiary-color, #111827);--bf-button-tertiary-border-color:var(   --bf-theme-button-tertiary-border-color,   transparent  );--bf-button-outlined-bg:var(--bf-theme-button-outlined-bg, transparent);--bf-button-outlined-color:var(--bf-theme-button-outlined-color, #1d4ed8);--bf-button-outlined-border-color:var(   --bf-theme-button-outlined-border-color,   #1d4ed8  );--bf-button-ghost-bg:var(--bf-theme-button-ghost-bg, transparent);--bf-button-ghost-color:var(--bf-theme-button-ghost-color, #1d4ed8);--bf-button-ghost-border-color:var(   --bf-theme-button-ghost-border-color,   transparent  );display:inline-block}button{--_bf-button-bg:var(--bf-button-primary-bg);--_bf-button-color:var(--bf-button-primary-color);--_bf-button-border-color:var(--bf-button-primary-border-color);--_bf-button-hover-bg:var(--bf-button-primary-hover-bg);--_bf-button-hover-color:var(--bf-button-primary-hover-color);--_bf-button-hover-border-color:var(--bf-button-primary-hover-border-color);--_bf-button-active-bg:var(--bf-button-primary-active-bg);--_bf-button-active-color:var(--bf-button-primary-active-color);--_bf-button-active-border-color:var(   --bf-button-primary-active-border-color  );font:var(--bf-button-font);border-width:var(--bf-button-border-width);border-style:var(--bf-button-border-style);border-color:var(--_bf-button-border-color);border-radius:var(--bf-button-border-radius);cursor:var(--bf-button-cursor);padding:var(--bf-button-padding-y) var(--bf-button-padding-x);transition:var(--bf-button-transition);background:var(--_bf-button-bg);color:var(--_bf-button-color)}button:hover{opacity:var(--bf-button-opacity-hover);background:var(--_bf-button-hover-bg);color:var(--_bf-button-hover-color);border-color:var(--_bf-button-hover-border-color)}button:active{transform:translateY(var(--bf-button-active-translate-y));background:var(--_bf-button-active-bg);color:var(--_bf-button-active-color);border-color:var(--_bf-button-active-border-color)}button:focus-visible{outline-width:var(--bf-button-focus-outline-width);outline-style:var(--bf-button-focus-outline-style);outline-color:var(--bf-button-focus-outline-color);outline-offset:var(--bf-button-focus-outline-offset)}button:disabled{opacity:var(--bf-button-disabled-opacity, 0.55);cursor:var(--bf-button-disabled-cursor, not-allowed)}button.primary{--_bf-button-bg:var(--bf-button-primary-bg);--_bf-button-color:var(--bf-button-primary-color);--_bf-button-border-color:var(--bf-button-primary-border-color);--_bf-button-hover-bg:var(--bf-button-primary-hover-bg);--_bf-button-hover-color:var(--bf-button-primary-hover-color);--_bf-button-hover-border-color:var(--bf-button-primary-hover-border-color);--_bf-button-active-bg:var(--bf-button-primary-active-bg);--_bf-button-active-color:var(--bf-button-primary-active-color);--_bf-button-active-border-color:var(   --bf-button-primary-active-border-color  )}button.secondary{--_bf-button-bg:var(--bf-button-secondary-bg);--_bf-button-color:var(--bf-button-secondary-color);--_bf-button-border-color:var(--bf-button-secondary-border-color);--_bf-button-hover-bg:var(--bf-button-secondary-hover-bg);--_bf-button-hover-color:var(--bf-button-secondary-hover-color);--_bf-button-hover-border-color:var(   --bf-button-secondary-hover-border-color  );--_bf-button-active-bg:var(--bf-button-secondary-active-bg);--_bf-button-active-color:var(--bf-button-secondary-active-color);--_bf-button-active-border-color:var(   --bf-button-secondary-active-border-color  )}button.tertiary{--_bf-button-bg:var(--bf-button-tertiary-bg);--_bf-button-color:var(--bf-button-tertiary-color);--_bf-button-border-color:var(--bf-button-tertiary-border-color);--_bf-button-hover-bg:color-mix(in srgb, var(--bf-button-tertiary-bg) 85%, var(--bf-button-tertiary-color));--_bf-button-hover-color:var(--bf-button-tertiary-color);--_bf-button-hover-border-color:var(--bf-button-tertiary-border-color);--_bf-button-active-bg:color-mix(in srgb, var(--bf-button-tertiary-bg) 75%, var(--bf-button-tertiary-color));--_bf-button-active-color:var(--bf-button-tertiary-color);--_bf-button-active-border-color:var(--bf-button-tertiary-border-color)}button.outlined{--_bf-button-bg:var(--bf-button-outlined-bg);--_bf-button-color:var(--bf-button-outlined-color);--_bf-button-border-color:var(--bf-button-outlined-border-color);--_bf-button-hover-bg:color-mix(in srgb, var(--bf-button-outlined-color) 12%, transparent);--_bf-button-hover-color:var(--bf-button-outlined-color);--_bf-button-hover-border-color:var(--bf-button-outlined-border-color);--_bf-button-active-bg:color-mix(in srgb, var(--bf-button-outlined-color) 20%, transparent);--_bf-button-active-color:var(--bf-button-outlined-color);--_bf-button-active-border-color:var(--bf-button-outlined-border-color)}button.ghost{--_bf-button-bg:var(--bf-button-ghost-bg);--_bf-button-color:var(--bf-button-ghost-color);--_bf-button-border-color:var(--bf-button-ghost-border-color);--_bf-button-hover-bg:color-mix(in srgb, var(--bf-button-ghost-color) 12%, transparent);--_bf-button-hover-color:var(--bf-button-ghost-color);--_bf-button-hover-border-color:var(--bf-button-ghost-border-color);--_bf-button-active-bg:color-mix(in srgb, var(--bf-button-ghost-color) 20%, transparent);--_bf-button-active-color:var(--bf-button-ghost-color);--_bf-button-active-border-color:var(--bf-button-ghost-border-color)}button.is-selected{box-shadow:inset 0 0 0 2px var(--bf-theme-focus-ring-color, #93c5fd)}:host-context(bf-dropdown[border]) button{border:none;background:transparent}`;

const BfButton$1 = /*@__PURE__*/ proxyCustomElement(class BfButton extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
        this.bfClick = createEvent(this, "bf-click");
    }
    get el() { return this; }
    label = '';
    variant = 'primary';
    selected = false;
    disabled = false;
    group;
    multiple;
    bfClick;
    handleClick = () => {
        if (this.disabled)
            return;
        this.applyGroupSelection();
        const label = this.label || '';
        const variant = this.variant || 'primary';
        const group = this.group || '';
        this.selected = this.el.hasAttribute('selected');
        this.bfClick.emit({
            label,
            variant,
            selected: this.selected,
            group,
            at: new Date().toISOString(),
        });
    };
    groupLimit() {
        const multiple = this.multiple ?? null;
        if (multiple === null || multiple === undefined) {
            return 1;
        }
        if (`${multiple}` === '') {
            return Infinity;
        }
        const parsed = Number.parseInt(String(multiple), 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    }
    applyGroupSelection() {
        const group = this.group?.trim();
        if (!group) {
            return;
        }
        const peers = Array.from(document.querySelectorAll(`bf-button[group="${CSS.escape(group)}"]`));
        const cap = this.groupLimit();
        if (cap === 1) {
            for (const peer of peers) {
                peer.toggleAttribute('selected', peer === this.el);
            }
            this.selected = this.el.hasAttribute('selected');
            return;
        }
        if (this.el.hasAttribute('selected')) {
            this.el.removeAttribute('selected');
            this.selected = false;
            return;
        }
        const selectedCount = peers.filter((peer) => peer.hasAttribute('selected')).length;
        if (selectedCount >= cap) {
            return;
        }
        this.el.setAttribute('selected', '');
        this.selected = true;
    }
    render() {
        const variant = this.variant || 'primary';
        return (h(Host, { key: '132711f233a12d074dcbebfd28755c754e3593a5' }, h("button", { key: '5739bd4e9aeae79311ad872f81181e7f1d52fb8a', part: "button", type: "button", class: {
                [variant]: true,
                'is-selected': this.selected,
            }, disabled: this.disabled, "aria-pressed": String(this.selected), onClick: this.handleClick }, this.label, h("slot", { key: 'fcc3a826359a9b1069a8157465b98dc367bda87b' }))));
    }
    static get style() { return bfButtonCss(); }
}, [769, "bf-button", {
        "label": [513],
        "variant": [513],
        "selected": [1540],
        "disabled": [516],
        "group": [513],
        "multiple": [513]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-button"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-button":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfButton$1);
            }
            break;
    } });
}

const BfButton = BfButton$1;
const defineCustomElement = defineCustomElement$1;

export { BfButton, defineCustomElement };
