import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfCommandPaletteCss = () => `:host{--bf-command-palette-font:var(--bf-theme-font-family, inherit);--bf-command-palette-radius:var(--bf-theme-radius-md, 8px);--bf-command-palette-border-width:var(--bf-theme-border-width, 1px);--bf-command-palette-border-style:var(--bf-theme-border-style, solid);--bf-command-palette-border-color:var(--bf-theme-command-palette-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-command-palette-bg:var(--bf-theme-command-palette-bg, var(--bf-theme-surface-1, #ffffff));--bf-command-palette-color:var(--bf-theme-command-palette-color, var(--bf-theme-text-1, #0f172a));--bf-command-palette-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-command-palette-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-command-palette-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-command-palette-font);color:var(--bf-command-palette-color)}.root{background:var(--bf-command-palette-bg);color:var(--bf-command-palette-color);border-width:var(--bf-command-palette-border-width);border-style:var(--bf-command-palette-border-style);border-color:var(--bf-command-palette-border-color);border-radius:var(--bf-command-palette-radius);padding:var(--bf-command-palette-padding-y) var(--bf-command-palette-padding-x);transition:var(--bf-command-palette-transition)}`;

const BfCommandPalette$1 = /*@__PURE__*/ proxyCustomElement(class BfCommandPalette extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: 'a4cb985c0e0acb70068d02cc434dc7d1a753fdc6' }, h("div", { key: 'dab758cdbec2aad63b0503bdc2d0726de4476ec5', class: "root", part: "root" }, h("slot", { key: '9e75e8abc212de8d581c7ee4c8e8d87732a6add7' }))));
    }
    static get style() { return bfCommandPaletteCss(); }
}, [257, "bf-command-palette"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-command-palette"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-command-palette":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfCommandPalette$1);
            }
            break;
    } });
}

const BfCommandPalette = BfCommandPalette$1;
const defineCustomElement = defineCustomElement$1;

export { BfCommandPalette, defineCustomElement };
