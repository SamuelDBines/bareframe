import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfBreadcrumbCss = () => `:host{--bf-breadcrumb-font:var(--bf-theme-font-family, inherit);--bf-breadcrumb-radius:var(--bf-theme-radius-md, 7px);--bf-breadcrumb-border-color:var(--bf-theme-breadcrumb-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-breadcrumb-bg:var(--bf-theme-breadcrumb-bg, transparent);--bf-breadcrumb-color:var(--bf-theme-breadcrumb-color, var(--bf-theme-text-1, #0f172a));--bf-breadcrumb-muted:var(--bf-theme-text-2, #64748b);--bf-breadcrumb-link:var(--bf-theme-button-primary-bg, #2563eb);--bf-breadcrumb-pill-bg:var(--bf-theme-surface-1, #ffffff);display:inline-block;font:var(--bf-breadcrumb-font);color:var(--bf-breadcrumb-color)}.root{background:var(--bf-breadcrumb-bg);color:var(--bf-breadcrumb-color)}.list{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;align-items:center;gap:0.45rem}.item{display:inline-flex;align-items:center;gap:0.45rem;color:inherit}.item a,.item span{font:inherit;color:inherit;text-decoration:none}.item a{color:var(--bf-breadcrumb-link)}.item .current{color:var(--bf-breadcrumb-color);font-weight:600}.item .ellipsis{color:var(--bf-breadcrumb-muted)}.separator{color:var(--bf-breadcrumb-muted)}.root[data-variant='minimal'] .separator{opacity:0.55}.root[data-variant='pills'] .item a,.root[data-variant='pills'] .item span{border:1px solid var(--bf-breadcrumb-border-color);background:var(--bf-breadcrumb-pill-bg);border-radius:var(--bf-breadcrumb-radius);padding:0.2rem 0.5rem}.root[data-variant='pills'] .separator{margin-inline:-0.1rem 0.1rem}`;

const BfBreadcrumb$1 = /*@__PURE__*/ proxyCustomElement(class BfBreadcrumb extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
    slotRef;
    mo;
    connectedCallback() {
        this.mo = new MutationObserver(() => this.renderList());
        this.mo.observe(this.el, { childList: true, subtree: true, characterData: true });
        this.attrMo = new MutationObserver(() => this.renderList());
        this.attrMo.observe(this.el, { attributes: true });
    }
    onSlotChange = () => {
        this.renderList();
    };
    variant() {
        const value = (this.el.getAttribute('variant') || 'default').toLowerCase();
        if (['default', 'pills', 'minimal'].includes(value)) {
            return value;
        }
        return 'default';
    }
    separatorText() {
        const icon = this.el.getAttribute('separator-icon');
        if (icon) {
            return icon;
        }
        const raw = this.el.getAttribute('separator');
        if (!raw) {
            return '›';
        }
        const value = raw.toLowerCase();
        if (value === 'chevron') {
            return '›';
        }
        if (value === 'slash') {
            return '/';
        }
        if (value === 'dot') {
            return '•';
        }
        if (value === 'pipe') {
            return '|';
        }
        return raw;
    }
    max() {
        const parsed = Number.parseInt(this.el.getAttribute('max') || '', 10);
        if (Number.isFinite(parsed) && parsed >= 2) {
            return parsed;
        }
        return Infinity;
    }
    itemsFromDom() {
        const items = [];
        const children = Array.from(this.el.children);
        for (const child of children) {
            const text = child.textContent?.trim();
            if (!text) {
                continue;
            }
            const isLink = child.tagName.toLowerCase() === 'a' && child.getAttribute('href');
            items.push({
                label: text,
                href: isLink ? child.getAttribute('href') || '' : '',
                current: child.hasAttribute('current'),
            });
        }
        return items;
    }
    applyCollapse(items) {
        const max = this.max();
        if (max === Infinity || items.length <= max || max < 3) {
            return items;
        }
        const head = items[0];
        const tailCount = max - 2;
        const tail = items.slice(items.length - tailCount);
        return [
            head,
            { label: '...', href: '', current: false, ellipsis: true },
            ...tail,
        ];
    }
    renderList() {
        const list = this.el.shadowRoot?.querySelector('.list');
        const root = this.el.shadowRoot?.querySelector('.root');
        if (!(list instanceof H) || !(root instanceof H)) {
            return;
        }
        const items = this.applyCollapse(this.itemsFromDom());
        root.setAttribute('data-variant', this.variant());
        list.replaceChildren();
        if (!items.length) {
            return;
        }
        items.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'item';
            if (item.ellipsis) {
                const span = document.createElement('span');
                span.className = 'ellipsis';
                span.textContent = item.label;
                li.append(span);
            }
            else if (item.href && !item.current) {
                const link = document.createElement('a');
                link.href = item.href;
                link.textContent = item.label;
                li.append(link);
            }
            else {
                const span = document.createElement('span');
                span.className = item.current || index === items.length - 1 ? 'current' : '';
                span.textContent = item.label;
                if (item.current || index === items.length - 1) {
                    span.setAttribute('aria-current', 'page');
                }
                li.append(span);
            }
            if (index < items.length - 1) {
                const sep = document.createElement('span');
                sep.className = 'separator';
                sep.textContent = this.separatorText();
                li.append(sep);
            }
            list.append(li);
        });
    }
    attrMo;
    componentDidLoad() {
        this.slotRef?.addEventListener('slotchange', this.onSlotChange);
        this.renderList();
    }
    disconnectedCallback() {
        this.attrMo?.disconnect();
        this.mo?.disconnect();
        this.slotRef?.removeEventListener('slotchange', this.onSlotChange);
    }
    componentDidRender() {
        this.renderList();
    }
    render() {
        return (h(Host, { key: 'f0205ff43e36575a09e11b819a5d2bf4cc46419c' }, h("nav", { key: 'eb55a040ae2b06a658c7c4e6d5f5051dfb16548b', class: "root", part: "root", "aria-label": "Breadcrumb" }, h("ol", { key: 'cfa573d015ba684eead63f0688210b4d98e8acd4', class: "list", part: "list" }), h("span", { key: 'ee8a1824538dc841f47af2831228f33268c703d4', hidden: true }, h("slot", { key: '7d5eeeaf0da2aa72283f35774674944122685291', ref: (el) => (this.slotRef = el) })))));
    }
    static get style() { return bfBreadcrumbCss(); }
}, [257, "bf-breadcrumb"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-breadcrumb"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-breadcrumb":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfBreadcrumb$1);
            }
            break;
    } });
}

const BfBreadcrumb = BfBreadcrumb$1;
const defineCustomElement = defineCustomElement$1;

export { BfBreadcrumb, defineCustomElement };
