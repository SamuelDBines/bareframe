import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfEditorCss = () => `:host{--bf-editor-font:var(--bf-theme-font-family, inherit);--bf-editor-radius:var(--bf-theme-radius-md, 8px);--bf-editor-border-width:var(--bf-theme-border-width, 1px);--bf-editor-border-style:var(--bf-theme-border-style, solid);--bf-editor-border-color:var(--bf-theme-editor-border-color, #1f2937);--bf-editor-bg:var(--bf-theme-editor-bg, #000000);--bf-editor-color:var(--bf-theme-editor-color, #f8fafc);--bf-editor-muted:var(--bf-theme-editor-muted, #94a3b8);--bf-editor-code-bg:color-mix(in srgb, var(--bf-editor-bg) 94%, #111827 6%);--bf-editor-code-color:#e2e8f0;display:block;font:var(--bf-editor-font);color:var(--bf-editor-color)}.root{background:var(--bf-editor-bg);color:var(--bf-editor-color);border-width:var(--bf-editor-border-width);border-style:var(--bf-editor-border-style);border-color:var(--bf-editor-border-color);border-radius:var(--bf-editor-radius);overflow:hidden}.toolbar{display:none;gap:0.35rem;padding:0.5rem;border-bottom:1px solid var(--bf-editor-border-color);background:color-mix(in srgb, var(--bf-editor-bg) 92%, var(--bf-editor-border-color))}.toolbar button{border:1px solid var(--bf-editor-border-color);background:var(--bf-editor-bg);color:var(--bf-editor-color);border-radius:6px;padding:0.22rem 0.45rem;cursor:pointer;font:inherit;font-size:0.85rem}.code-wrap{display:grid;grid-template-columns:auto 1fr;min-height:220px;background:var(--bf-editor-code-bg)}.line-numbers{padding:0.8rem 0.55rem;margin:0;white-space:pre;line-height:1.45;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;font-size:0.85rem;color:color-mix(in srgb, var(--bf-editor-code-color) 55%, transparent);border-right:1px solid color-mix(in srgb, var(--bf-editor-border-color) 80%, transparent);user-select:none}.code{width:100%;min-height:220px;resize:vertical;padding:0.8rem;border:0;outline:0;background:transparent;color:var(--bf-editor-code-color);font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;font-size:0.9rem;line-height:1.45}.rich{display:none;min-height:220px;padding:0.8rem;outline:none;line-height:1.5}.rich:empty::before{content:attr(data-placeholder);color:var(--bf-editor-muted)}.root[data-variant='richtext'] .toolbar{display:flex}.root[data-variant='richtext'] .code-wrap{display:none}.root[data-variant='richtext'] .rich{display:block}:host([disabled]){opacity:0.72}:host([disabled]) .toolbar button{cursor:not-allowed}`;

const BfEditor$1 = /*@__PURE__*/ proxyCustomElement(class BfEditor extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
    observer;
    root;
    toolbar;
    lineNumbers;
    code;
    rich;
    _lastSyncedValue = null;
    _hasUserInput = false;
    connectedCallback() {
        this.observer = new MutationObserver(() => this.sync());
        this.observer.observe(this.el, { attributes: true });
    }
    disconnectedCallback() {
        this.observer?.disconnect();
        const sr = this.el.shadowRoot;
        sr?.querySelector('.code')?.removeEventListener('input', this.onInput);
        sr?.querySelector('.rich')?.removeEventListener('input', this.onInput);
        sr?.querySelector('.toolbar')?.removeEventListener('click', this.onToolbarClick);
    }
    variant() {
        const explicit = (this.el.getAttribute('variant') || '').toLowerCase();
        if (explicit === 'richtext' || this.el.hasAttribute('richtext')) {
            return 'richtext';
        }
        if (explicit === 'code' || this.el.hasAttribute('code')) {
            return 'code';
        }
        return 'code';
    }
    onInput = () => {
        const variant = this.variant();
        this._hasUserInput = true;
        if (variant === 'code') {
            this.renderLineNumbers();
            this.el.setAttribute('value', this.code.value);
            this._lastSyncedValue = this.code.value;
            this.emitChange(this.code.value, 'code');
            return;
        }
        this.el.setAttribute('value', this.rich.innerHTML);
        this._lastSyncedValue = this.rich.innerHTML;
        this.emitChange(this.rich.innerHTML, 'richtext');
    };
    renderLineNumbers() {
        if (!this.lineNumbers || !this.code) {
            return;
        }
        const lineCount = Math.max(1, this.code.value.split('\n').length);
        const text = Array.from({ length: lineCount }, (_, i) => String(i + 1)).join('\n');
        this.lineNumbers.textContent = text;
    }
    onToolbarClick = (event) => {
        const mx = event;
        const tgt = mx.target;
        if (!tgt || tgt.nodeType !== Node.ELEMENT_NODE) {
            return;
        }
        const button = tgt.closest('button[data-cmd]');
        if (!button || this.variant() !== 'richtext' || this.el.hasAttribute('disabled')) {
            return;
        }
        const command = button.getAttribute('data-cmd');
        if (!command) {
            return;
        }
        this.rich.focus();
        document.execCommand(command, false);
        this.onInput();
    };
    emitChange(value, mode) {
        this.el.dispatchEvent(new CustomEvent('bf-change', {
            bubbles: true,
            composed: true,
            detail: { value, mode },
        }));
    }
    bindOnce() {
        const sr = this.el.shadowRoot;
        if (!sr) {
            return;
        }
        this.root = sr.querySelector('.root');
        this.toolbar = sr.querySelector('.toolbar');
        this.lineNumbers = sr.querySelector('.line-numbers');
        this.code = sr.querySelector('.code');
        this.rich = sr.querySelector('.rich');
        if (!this.code || !this.rich || !this.toolbar) {
            return;
        }
        if (this.code.dataset.bfBound !== 'true') {
            this.code.dataset.bfBound = 'true';
            this.code.addEventListener('input', this.onInput);
        }
        if (this.rich.dataset.bfBound !== 'true') {
            this.rich.dataset.bfBound = 'true';
            this.rich.addEventListener('input', this.onInput);
        }
        if (this.toolbar.dataset.bfBound !== 'true') {
            this.toolbar.dataset.bfBound = 'true';
            this.toolbar.addEventListener('click', this.onToolbarClick);
        }
    }
    sync() {
        this.bindOnce();
        if (!this.root || !this.code || !this.rich || !this.toolbar) {
            return;
        }
        const variant = this.variant();
        this.root.dataset.variant = variant;
        const disabled = this.el.hasAttribute('disabled');
        this.code.disabled = disabled;
        this.rich.setAttribute('contenteditable', disabled ? 'false' : 'true');
        const placeholder = this.el.getAttribute('placeholder') ||
            (variant === 'richtext' ? 'Write rich content…' : 'Write code…');
        this.code.placeholder = placeholder;
        this.rich.dataset.placeholder = placeholder;
        const value = this.el.getAttribute('value');
        if (value != null && this._lastSyncedValue !== value) {
            if (variant === 'richtext') {
                this.rich.innerHTML = value;
            }
            else {
                this.code.value = value;
                this.renderLineNumbers();
            }
            this._lastSyncedValue = value;
        }
        else if (value == null && !this._hasUserInput) {
            const initial = this.el.textContent?.trim() || '';
            if (initial) {
                if (variant === 'richtext') {
                    this.rich.innerHTML = initial;
                }
                else {
                    this.code.value = initial;
                    this.renderLineNumbers();
                }
                this._hasUserInput = true;
            }
        }
        if (variant === 'code') {
            this.renderLineNumbers();
        }
    }
    componentDidRender() {
        this.sync();
    }
    render() {
        return (h(Host, { key: '6c1c84386f0e54a2fdfb4d8a0a0d192f98213be0' }, h("div", { key: 'b315441e123c68e6dfcb15c42d888722b7922601', class: "root", part: "root" }, h("div", { key: 'f34e8cb6636808329c81154912a15b1d47b66ca3', class: "toolbar", part: "toolbar" }, h("button", { key: 'e39c28b32890dfb4b24a0958e3ba55b147266d98', type: "button", "data-cmd": "bold", title: "Bold" }, h("b", { key: 'af724d795c2da6c3d63b183ef35bbb7dd923c9bd' }, "B")), h("button", { key: '732b1ec93dfde522ff14004b01fc79be0304db54', type: "button", "data-cmd": "italic", title: "Italic" }, h("i", { key: '09c8e81fa82cee5f72bd6c0795e8a49733551d21' }, "I")), h("button", { key: '5e9423829bbb568faa7e0e0b7104c8bcfa2123a2', type: "button", "data-cmd": "underline", title: "Underline" }, h("u", { key: '64cba130d6e5f9047bb4bed8ede70abfe1377232' }, "U")), h("button", { key: '86a15e53d17888c55aac605595bbd9d7fe39b2c6', type: "button", "data-cmd": "insertUnorderedList", title: "Bullet List" }, "\u2022 List"), h("button", { key: '434ff8a3460ecfd7463e04e1c49889a1a1643251', type: "button", "data-cmd": "insertOrderedList", title: "Numbered List" }, "1. List")), h("div", { key: '1d89518a0d9aa5aae0100af899942e5555454fab', class: "code-wrap", part: "code-wrap" }, h("div", { key: '788b02a133e37706e1118ff14af41f7470e8de42', class: "line-numbers", part: "line-numbers" }), h("textarea", { key: '32158466c8d427869284ad9e36875cb829afd920', class: "code", part: "code" })), h("div", { key: '6548164123609b9afd2f426aeee7930574fed26b', class: "rich", part: "rich", contentEditable: true }))));
    }
    static get style() { return bfEditorCss(); }
}, [1, "bf-editor"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-editor"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-editor":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfEditor$1);
            }
            break;
    } });
}

const BfEditor = BfEditor$1;
const defineCustomElement = defineCustomElement$1;

export { BfEditor, defineCustomElement };
