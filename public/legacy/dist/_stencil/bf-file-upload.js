import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfFileUploadCss = () => `:host{--bf-file-upload-font:var(--bf-theme-font-family, inherit);--bf-file-upload-radius:var(--bf-theme-radius-md, 8px);--bf-file-upload-border-width:var(--bf-theme-border-width, 1px);--bf-file-upload-border-style:var(--bf-theme-border-style, solid);--bf-file-upload-border-color:var(   --bf-theme-file-upload-border-color,   var(--bf-theme-upload-dropzone-border-color, var(--bf-theme-border-1, #cbd5e1))  );--bf-file-upload-bg:var(   --bf-theme-file-upload-bg,   var(--bf-theme-upload-dropzone-bg, var(--bf-theme-surface-1, #ffffff))  );--bf-file-upload-color:var(   --bf-theme-file-upload-color,   var(--bf-theme-upload-dropzone-color, var(--bf-theme-text-1, #0f172a))  );--bf-file-upload-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-file-upload-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-file-upload-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-file-upload-font);color:var(--bf-file-upload-color)}.root{display:grid;gap:0.45rem;background:var(--bf-file-upload-bg);color:var(--bf-file-upload-color);border-width:var(--bf-file-upload-border-width);border-style:var(--bf-file-upload-border-style);border-color:var(--bf-file-upload-border-color);border-radius:var(--bf-file-upload-radius);padding:var(--bf-file-upload-padding-y) var(--bf-file-upload-padding-x);transition:var(--bf-file-upload-transition);cursor:pointer}.root[data-variant='dropzone']{min-height:7rem;align-content:center;text-align:center}.root[data-border='dotted']{border-style:dotted}.root[data-border='dashed']{border-style:dashed}.root[data-drag='over']{background:color-mix(in srgb, var(--bf-file-upload-bg) 70%, var(--bf-file-upload-border-color))}.root[data-disabled='true']{opacity:0.65;cursor:not-allowed}.native{display:none}.label{font-weight:600}.meta{color:var(--bf-theme-text-2, #475569);font-size:0.9em}.files{display:flex;flex-wrap:wrap;gap:0.35rem}.file{display:inline-flex;align-items:center;gap:0.25rem;padding:0.2rem 0.45rem;border-radius:999px;border:1px solid color-mix(in srgb, var(--bf-file-upload-border-color) 90%, transparent);background:color-mix(in srgb, var(--bf-file-upload-bg) 82%, var(--bf-file-upload-border-color));font-size:0.82em}slot:not(:empty){display:block}`;

const BfFileUpload$1 = /*@__PURE__*/ proxyCustomElement(class BfFileUpload extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
    observer;
    _selectedFiles = [];
    connectedCallback() {
        this.observer = new MutationObserver(() => this.sync());
        this.observer.observe(this.el, { attributes: true });
    }
    variant() {
        const explicit = (this.el.getAttribute('variant') || '').toLowerCase();
        if (explicit === 'dropzone' || this.el.hasAttribute('dropzone')) {
            return 'dropzone';
        }
        return 'input';
    }
    onRootClick = (event) => {
        const mx = event;
        if (this.el.hasAttribute('disabled')) {
            return;
        }
        const t = mx.target;
        if (!t || t.nodeType !== Node.ELEMENT_NODE) {
            return;
        }
        if (t.tagName.toLowerCase() === 'a') {
            return;
        }
        const input = this.el.shadowRoot?.querySelector('.native');
        if (input instanceof HTMLInputElement) {
            input.click();
        }
    };
    onInputChange = () => {
        const input = this.el.shadowRoot?.querySelector('.native');
        if (input instanceof HTMLInputElement) {
            this.setFiles(input.files);
        }
    };
    onDragOver = (event) => {
        const dx = event;
        if (this.variant() !== 'dropzone' || this.el.hasAttribute('disabled')) {
            return;
        }
        dx.preventDefault();
        const root = this.el.shadowRoot?.querySelector('.root');
        if (root instanceof H) {
            root.dataset.drag = 'over';
        }
    };
    onDragLeave = () => {
        const root = this.el.shadowRoot?.querySelector('.root');
        if (root instanceof H) {
            root.dataset.drag = 'off';
        }
    };
    onDrop = (event) => {
        const dx = event;
        if (this.variant() !== 'dropzone' || this.el.hasAttribute('disabled')) {
            return;
        }
        dx.preventDefault();
        const root = this.el.shadowRoot?.querySelector('.root');
        if (root instanceof H) {
            root.dataset.drag = 'off';
        }
        const list = dx.dataTransfer?.files;
        if (!list || list.length === 0) {
            return;
        }
        this.setFiles(list);
    };
    emitChange(payload) {
        this.el.dispatchEvent(new CustomEvent('bf-change', {
            bubbles: true,
            composed: true,
            detail: payload,
        }));
    }
    setFiles(fileList) {
        const input = this.el.shadowRoot?.querySelector('.native');
        if (!(input instanceof HTMLInputElement)) {
            return;
        }
        const all = Array.from(fileList || []);
        this._selectedFiles = input.multiple ? all : all.slice(0, 1);
        const meta = this.el.shadowRoot?.querySelector('.meta');
        const filesWrap = this.el.shadowRoot?.querySelector('.files');
        if (!(meta instanceof H) || !(filesWrap instanceof H)) {
            return;
        }
        meta.textContent = this._selectedFiles.length
            ? `${this._selectedFiles.length} file${this._selectedFiles.length === 1 ? '' : 's'} selected`
            : input.multiple
                ? 'No files selected'
                : 'No file selected';
        const chips = this._selectedFiles.slice(0, 3).map((file) => {
            const item = document.createElement('span');
            item.className = 'file';
            item.textContent = file.name;
            return item;
        });
        if (this._selectedFiles.length > 3) {
            const more = document.createElement('span');
            more.className = 'file';
            more.textContent = `+${this._selectedFiles.length - 3} more`;
            chips.push(more);
        }
        filesWrap.replaceChildren(...chips);
        this.emitChange({
            count: this._selectedFiles.length,
            files: this._selectedFiles.map((file) => ({
                name: file.name,
                size: file.size,
                type: file.type,
            })),
        });
    }
    sync() {
        const root = this.el.shadowRoot?.querySelector('.root');
        const input = this.el.shadowRoot?.querySelector('.native');
        const labelEl = this.el.shadowRoot?.querySelector('.label');
        const meta = this.el.shadowRoot?.querySelector('.meta');
        const filesWrap = this.el.shadowRoot?.querySelector('.files');
        if (!(root instanceof H) ||
            !(input instanceof HTMLInputElement) ||
            !(labelEl instanceof H) ||
            !(meta instanceof H) ||
            !(filesWrap instanceof H)) {
            return;
        }
        const variant = this.variant();
        root.dataset.variant = variant;
        root.dataset.border = this.el.hasAttribute('dotted')
            ? 'dotted'
            : this.el.hasAttribute('dashed')
                ? 'dashed'
                : 'solid';
        const disabled = this.el.hasAttribute('disabled');
        root.dataset.disabled = disabled ? 'true' : 'false';
        input.disabled = disabled;
        if (this.el.hasAttribute('multiple')) {
            input.multiple = true;
            root.dataset.multiple = 'true';
        }
        else {
            input.multiple = false;
            root.dataset.multiple = 'false';
        }
        const accept = this.el.getAttribute('accept') || '';
        if (accept) {
            input.setAttribute('accept', accept);
        }
        else {
            input.removeAttribute('accept');
        }
        labelEl.textContent =
            this.el.getAttribute('label') ||
                (variant === 'dropzone'
                    ? 'Drop files here or click to browse'
                    : 'Choose file');
        if (!this._selectedFiles || this._selectedFiles.length === 0) {
            meta.textContent = input.multiple ? 'No files selected' : 'No file selected';
            filesWrap.replaceChildren();
        }
    }
    componentDidRender() {
        const root = this.el.shadowRoot?.querySelector('.root');
        const input = this.el.shadowRoot?.querySelector('.native');
        if (root && input instanceof HTMLInputElement && input.dataset.bfBound !== 'true') {
            input.dataset.bfBound = 'true';
            root.addEventListener('click', this.onRootClick);
            input.addEventListener('change', this.onInputChange);
            root.addEventListener('dragover', this.onDragOver);
            root.addEventListener('dragleave', this.onDragLeave);
            root.addEventListener('drop', this.onDrop);
        }
        this.sync();
    }
    disconnectedCallback() {
        const root = this.el.shadowRoot?.querySelector('.root');
        const input = this.el.shadowRoot?.querySelector('.native');
        root?.removeEventListener('click', this.onRootClick);
        root?.removeEventListener('dragover', this.onDragOver);
        root?.removeEventListener('dragleave', this.onDragLeave);
        root?.removeEventListener('drop', this.onDrop);
        input?.removeEventListener('change', this.onInputChange);
        this.observer?.disconnect();
    }
    render() {
        return (h(Host, { key: '72ad7b3c11cd9e3752489e74ea7f362b27f37498' }, h("div", { key: 'e4cec1556a0b02281eeb8e60a2b706efd1f3ff98', class: "root", part: "root" }, h("input", { key: '4c9957eebed55a3c3794f8060982ef468729400c', class: "native", type: "file" }), h("div", { key: 'dbe91c9cd8b27ddcd14b30ec3db5e7fb48343304', class: "label", part: "label" }), h("div", { key: 'c976306139e19a0648e520ffbaf3b1dcdafce389', class: "meta", part: "meta" }), h("div", { key: '9bc372321773e220c31136f2d0c8f2c51a086422', class: "files", part: "files" }), h("slot", { key: 'd31b004f932cd19be2975d3bacf672327264294d' }))));
    }
    static get style() { return bfFileUploadCss(); }
}, [257, "bf-file-upload"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-file-upload"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-file-upload":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfFileUpload$1);
            }
            break;
    } });
}

const BfFileUpload = BfFileUpload$1;
const defineCustomElement = defineCustomElement$1;

export { BfFileUpload, defineCustomElement };
