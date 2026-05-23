import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfEmptyStateCss = () => `:host{--bf-empty-state-font:var(--bf-theme-font-family, inherit);--bf-empty-state-radius:var(--bf-theme-radius-md, 8px);--bf-empty-state-border-width:var(--bf-theme-border-width, 1px);--bf-empty-state-border-style:var(--bf-theme-border-style, solid);--bf-empty-state-border-color:var(--bf-theme-empty-state-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-empty-state-bg:var(--bf-theme-empty-state-bg, var(--bf-theme-surface-1, #ffffff));--bf-empty-state-color:var(--bf-theme-empty-state-color, var(--bf-theme-text-1, #0f172a));--bf-empty-state-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-empty-state-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-empty-state-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-empty-state-font);color:var(--bf-empty-state-color)}.root{background:var(--bf-empty-state-bg);color:var(--bf-empty-state-color);border-width:var(--bf-empty-state-border-width);border-style:var(--bf-empty-state-border-style);border-color:var(--bf-empty-state-border-color);border-radius:var(--bf-empty-state-radius);padding:var(--bf-empty-state-padding-y) var(--bf-empty-state-padding-x);transition:var(--bf-empty-state-transition)}`;

const BfEmptyState$1 = /*@__PURE__*/ proxyCustomElement(class BfEmptyState extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: 'd2271559139b3f3f87c3a6e8db138ddadbbe9d85' }, h("div", { key: 'ab60697479be8a487a4ec320abc7959fdf80fabf', class: "root", part: "root" }, h("slot", { key: 'cb8724e4044444d85abc1ad680285fdde67e0f25' }))));
    }
    static get style() { return bfEmptyStateCss(); }
}, [257, "bf-empty-state"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-empty-state"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-empty-state":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfEmptyState$1);
            }
            break;
    } });
}

const BfEmptyState = BfEmptyState$1;
const defineCustomElement = defineCustomElement$1;

export { BfEmptyState, defineCustomElement };
