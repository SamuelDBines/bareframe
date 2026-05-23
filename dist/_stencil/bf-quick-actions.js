import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfQuickActionsCss = () => `:host{--bf-quick-actions-font:var(--bf-theme-font-family, inherit);--bf-quick-actions-radius:var(--bf-theme-radius-md, 8px);--bf-quick-actions-border-width:var(--bf-theme-border-width, 1px);--bf-quick-actions-border-style:var(--bf-theme-border-style, solid);--bf-quick-actions-border-color:var(--bf-theme-quick-actions-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-quick-actions-bg:var(--bf-theme-quick-actions-bg, var(--bf-theme-surface-1, #ffffff));--bf-quick-actions-color:var(--bf-theme-quick-actions-color, var(--bf-theme-text-1, #0f172a));--bf-quick-actions-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-quick-actions-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-quick-actions-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-quick-actions-font);color:var(--bf-quick-actions-color)}.root{background:var(--bf-quick-actions-bg);color:var(--bf-quick-actions-color);border-width:var(--bf-quick-actions-border-width);border-style:var(--bf-quick-actions-border-style);border-color:var(--bf-quick-actions-border-color);border-radius:var(--bf-quick-actions-radius);padding:var(--bf-quick-actions-padding-y) var(--bf-quick-actions-padding-x);transition:var(--bf-quick-actions-transition)}`;

const BfQuickActions$1 = /*@__PURE__*/ proxyCustomElement(class BfQuickActions extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '0bd58200707bf24913135db9e30e1a721eee65f9' }, h("div", { key: 'd11acd9a845f6b2811ab1cfdbff06bb09d2ac8cb', class: "root", part: "root" }, h("slot", { key: '275f856dbfeef98f2acc8e4aba29fc3de297bbff' }))));
    }
    static get style() { return bfQuickActionsCss(); }
}, [257, "bf-quick-actions"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-quick-actions"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-quick-actions":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfQuickActions$1);
            }
            break;
    } });
}

const BfQuickActions = BfQuickActions$1;
const defineCustomElement = defineCustomElement$1;

export { BfQuickActions, defineCustomElement };
