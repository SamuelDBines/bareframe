import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfSegmentedControlCss = () => `:host{--bf-segmented-control-font:var(--bf-theme-font-family, inherit);--bf-segmented-control-radius:var(--bf-theme-radius-md, 8px);--bf-segmented-control-border-width:var(--bf-theme-border-width, 1px);--bf-segmented-control-border-style:var(--bf-theme-border-style, solid);--bf-segmented-control-border-color:var(--bf-theme-segmented-control-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-segmented-control-bg:var(--bf-theme-segmented-control-bg, var(--bf-theme-surface-1, #ffffff));--bf-segmented-control-color:var(--bf-theme-segmented-control-color, var(--bf-theme-text-1, #0f172a));--bf-segmented-control-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-segmented-control-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-segmented-control-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-segmented-control-font);color:var(--bf-segmented-control-color)}.root{background:var(--bf-segmented-control-bg);color:var(--bf-segmented-control-color);border-width:var(--bf-segmented-control-border-width);border-style:var(--bf-segmented-control-border-style);border-color:var(--bf-segmented-control-border-color);border-radius:var(--bf-segmented-control-radius);padding:var(--bf-segmented-control-padding-y) var(--bf-segmented-control-padding-x);transition:var(--bf-segmented-control-transition)}`;

const BfSegmentedControl$1 = /*@__PURE__*/ proxyCustomElement(class BfSegmentedControl extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '5141d8c3a87eba98c72b91626c20ae751746a41f' }, h("div", { key: '4e07f241d0f5ba0e7120cddc7b28e3d704c6b3ac', class: "root", part: "root" }, h("slot", { key: 'c528a480c7209b31a19dd13b0381318adc7f0914' }))));
    }
    static get style() { return bfSegmentedControlCss(); }
}, [257, "bf-segmented-control"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-segmented-control"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-segmented-control":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfSegmentedControl$1);
            }
            break;
    } });
}

const BfSegmentedControl = BfSegmentedControl$1;
const defineCustomElement = defineCustomElement$1;

export { BfSegmentedControl, defineCustomElement };
