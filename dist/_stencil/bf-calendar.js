import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfCalendarCss = () => `:host{--bf-calendar-font:var(--bf-theme-font-family, inherit);--bf-calendar-radius:var(--bf-theme-radius-md, 8px);--bf-calendar-border-width:var(--bf-theme-border-width, 1px);--bf-calendar-border-style:var(--bf-theme-border-style, solid);--bf-calendar-border-color:var(--bf-theme-calendar-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-calendar-bg:var(--bf-theme-calendar-bg, var(--bf-theme-surface-1, #ffffff));--bf-calendar-color:var(--bf-theme-calendar-color, var(--bf-theme-text-1, #0f172a));--bf-calendar-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-calendar-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-calendar-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-calendar-font);color:var(--bf-calendar-color)}.root{background:var(--bf-calendar-bg);color:var(--bf-calendar-color);border-width:var(--bf-calendar-border-width);border-style:var(--bf-calendar-border-style);border-color:var(--bf-calendar-border-color);border-radius:var(--bf-calendar-radius);padding:var(--bf-calendar-padding-y) var(--bf-calendar-padding-x);transition:var(--bf-calendar-transition)}`;

const BfCalendar$1 = /*@__PURE__*/ proxyCustomElement(class BfCalendar extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '18585135df31bbce04e65fb813476c4611e467e9' }, h("div", { key: 'a181dc975008ac0039ee36d99874f4a114ac1be3', class: "root", part: "root" }, h("slot", { key: 'e00cc75032b7eca61ed2fa3d322c47639da48a32' }))));
    }
    static get style() { return bfCalendarCss(); }
}, [257, "bf-calendar"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-calendar"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-calendar":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfCalendar$1);
            }
            break;
    } });
}

const BfCalendar = BfCalendar$1;
const defineCustomElement = defineCustomElement$1;

export { BfCalendar, defineCustomElement };
