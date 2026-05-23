import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfVideoPlayerCss = () => `:host{--bf-video-player-font:var(--bf-theme-font-family, inherit);--bf-video-player-radius:var(--bf-theme-radius-md, 8px);--bf-video-player-border-width:var(--bf-theme-border-width, 1px);--bf-video-player-border-style:var(--bf-theme-border-style, solid);--bf-video-player-border-color:var(--bf-theme-video-player-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-video-player-bg:var(--bf-theme-video-player-bg, var(--bf-theme-surface-1, #ffffff));--bf-video-player-color:var(--bf-theme-video-player-color, var(--bf-theme-text-1, #0f172a));--bf-video-player-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-video-player-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-video-player-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-video-player-font);color:var(--bf-video-player-color)}.root{background:var(--bf-video-player-bg);color:var(--bf-video-player-color);border-width:var(--bf-video-player-border-width);border-style:var(--bf-video-player-border-style);border-color:var(--bf-video-player-border-color);border-radius:var(--bf-video-player-radius);padding:var(--bf-video-player-padding-y) var(--bf-video-player-padding-x);transition:var(--bf-video-player-transition)}`;

const BfVideoPlayer$1 = /*@__PURE__*/ proxyCustomElement(class BfVideoPlayer extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    render() {
        return (h(Host, { key: '81419556ddfb42db0612fb581b7aed31b6eb3165' }, h("div", { key: 'f514c2f2a6584f493c6dc4e5d22c35271171e874', class: "root", part: "root" }, h("slot", { key: '8614f59db2b75655302ac83711e05e86f4c7f1d8' }))));
    }
    static get style() { return bfVideoPlayerCss(); }
}, [257, "bf-video-player"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-video-player"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-video-player":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfVideoPlayer$1);
            }
            break;
    } });
}

const BfVideoPlayer = BfVideoPlayer$1;
const defineCustomElement = defineCustomElement$1;

export { BfVideoPlayer, defineCustomElement };
