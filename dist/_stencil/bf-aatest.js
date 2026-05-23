import { p as proxyCustomElement, t as transformTag, H, h, c as Host } from './p-DAXdczoz.js';

const bfAatestCss = () => `:host{display:block;background:red;padding:1rem}`;

const BfAaTest = /*@__PURE__*/ proxyCustomElement(class BfAaTest extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '14638b185a9751509679fceed2563d09add86cb2' }, h("div", { key: 'b55dd0129ade4230a692250f9676bcf7381e2f91', class: "root", part: "root" }, h("slot", { key: '4ede909241b857612a78d032479f9d229f3c2138' }, "hello"))));
    }
    static get style() { return bfAatestCss(); }
}, [257, "bf-aatest"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-aatest"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-aatest":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfAaTest);
            }
            break;
    } });
}

const BfAatest = BfAaTest;
const defineCustomElement = defineCustomElement$1;

export { BfAatest, defineCustomElement };
