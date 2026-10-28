import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfDividerCss = () => `:host{--bf-divider-border-color:var(--bf-theme-divider-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-divider-thickness:1px;--bf-divider-min-length:2rem;display:block}.root{box-sizing:border-box;border-radius:999px;background:var(--bf-divider-border-color);min-width:var(--bf-divider-min-length)}.root[data-orientation='horizontal']{height:var(--bf-divider-thickness);width:100%}.root[data-orientation='vertical']{width:var(--bf-divider-thickness);height:100%;min-height:var(--bf-divider-min-length);min-width:0}`;

const BfDivider$1 = /*@__PURE__*/ proxyCustomElement(class BfDivider extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
    vertical = false;
    thickness;
    applyThickness() {
        const raw = this.thickness;
        if (!raw) {
            this.el.style.removeProperty('--bf-divider-thickness');
            return;
        }
        const parsed = Number.parseFloat(raw);
        if (Number.isFinite(parsed)) {
            this.el.style.setProperty('--bf-divider-thickness', `${parsed}px`);
            return;
        }
        this.el.style.setProperty('--bf-divider-thickness', raw);
    }
    componentWillLoad() {
        this.applyThickness();
    }
    render() {
        const orient = this.vertical ? 'vertical' : 'horizontal';
        return (h(Host, { key: 'dac3891855b8e299b137ae4f54f10e50564eb421' }, h("div", { key: '66cf73c5ba8838fc93924d96925e12af09a1fa4d', class: "root", part: "root", "data-orientation": orient }, h("slot", { key: 'ed73eb34ef6deb3b877a837510fcf72cb5201730' }))));
    }
    static get watchers() { return {
        "thickness": [{
                "applyThickness": 0
            }]
    }; }
    static get style() { return bfDividerCss(); }
}, [769, "bf-divider", {
        "vertical": [516],
        "thickness": [513]
    }, undefined, {
        "thickness": [{
                "applyThickness": 0
            }]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-divider"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-divider":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfDivider$1);
            }
            break;
    } });
}

const BfDivider = BfDivider$1;
const defineCustomElement = defineCustomElement$1;

export { BfDivider, defineCustomElement };
