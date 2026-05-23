import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfBottomNavigationCss = () => `:host{--bf-bottom-navigation-font:var(--bf-theme-font-family, inherit);--bf-bottom-navigation-radius:var(--bf-theme-radius-md, 8px);--bf-bottom-navigation-border-width:var(--bf-theme-border-width, 1px);--bf-bottom-navigation-border-style:var(--bf-theme-border-style, solid);--bf-bottom-navigation-border-color:var(--bf-theme-bottom-navigation-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-bottom-navigation-bg:var(--bf-theme-bottom-navigation-bg, var(--bf-theme-surface-1, #ffffff));--bf-bottom-navigation-color:var(--bf-theme-bottom-navigation-color, var(--bf-theme-text-1, #0f172a));--bf-bottom-navigation-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-bottom-navigation-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-bottom-navigation-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-bottom-navigation-font);color:var(--bf-bottom-navigation-color)}.root{background:var(--bf-bottom-navigation-bg);color:var(--bf-bottom-navigation-color);border-width:var(--bf-bottom-navigation-border-width);border-style:var(--bf-bottom-navigation-border-style);border-color:var(--bf-bottom-navigation-border-color);border-radius:var(--bf-bottom-navigation-radius);padding:var(--bf-bottom-navigation-padding-y) var(--bf-bottom-navigation-padding-x);transition:var(--bf-bottom-navigation-transition)}`;

const BfBottomNavigation$1 = /*@__PURE__*/ proxyCustomElement(class BfBottomNavigation extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '42502441ffcc6ec7be366ab2a0db371587fc35e4' }, h("div", { key: 'b03e5a4d88ce4e4c6e48d8fdd228c40aa4640a0a', class: "root", part: "root" }, h("slot", { key: 'e28de1bcba3d77750e4d461fc1dcb29d63d7b845' }))));
    }
    static get style() { return bfBottomNavigationCss(); }
}, [257, "bf-bottom-navigation"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-bottom-navigation"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-bottom-navigation":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfBottomNavigation$1);
            }
            break;
    } });
}

const BfBottomNavigation = BfBottomNavigation$1;
const defineCustomElement = defineCustomElement$1;

export { BfBottomNavigation, defineCustomElement };
