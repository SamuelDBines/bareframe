import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfTimelineCss = () => `:host{--bf-timeline-font:var(--bf-theme-font-family, inherit);--bf-timeline-radius:var(--bf-theme-radius-md, 8px);--bf-timeline-border-width:var(--bf-theme-border-width, 1px);--bf-timeline-border-style:var(--bf-theme-border-style, solid);--bf-timeline-border-color:var(--bf-theme-timeline-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-timeline-bg:var(--bf-theme-timeline-bg, var(--bf-theme-surface-1, #ffffff));--bf-timeline-color:var(--bf-theme-timeline-color, var(--bf-theme-text-1, #0f172a));--bf-timeline-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-timeline-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-timeline-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-timeline-font);color:var(--bf-timeline-color)}.root{background:var(--bf-timeline-bg);color:var(--bf-timeline-color);border-width:var(--bf-timeline-border-width);border-style:var(--bf-timeline-border-style);border-color:var(--bf-timeline-border-color);border-radius:var(--bf-timeline-radius);padding:var(--bf-timeline-padding-y) var(--bf-timeline-padding-x);transition:var(--bf-timeline-transition)}`;

const BfTimeline$1 = /*@__PURE__*/ proxyCustomElement(class BfTimeline extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '9ed907402843ec1555bd1b7bc92208990f8d1c12' }, h("div", { key: '5feacfe174691f10395a8ceb7fa4e01a29332b70', class: "root", part: "root" }, h("slot", { key: '26e2ee8b28fd75bfb7201b6f449ec65523d00c8e' }))));
    }
    static get style() { return bfTimelineCss(); }
}, [257, "bf-timeline"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-timeline"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-timeline":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfTimeline$1);
            }
            break;
    } });
}

const BfTimeline = BfTimeline$1;
const defineCustomElement = defineCustomElement$1;

export { BfTimeline, defineCustomElement };
