(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const d of i.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&s(d)}).observe(document,{childList:!0,subtree:!0});function o(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(n){if(n.ep)return;n.ep=!0;const i=o(n);fetch(n.href,i)}})();const k=["button","link","header","footer","modal","toast","message","error-summary","chart"],Z=["button","input","card"],ee=["system","dark","light","modern","layout","aurora","noir","oceanic","nature","matrix","retro","simple","sprint","sunrise","desert","future","nebula"];function te(){return[...new Set(ee)]}function ne(e){const t=new Set(e),o=k.filter(n=>t.has(n)),s=e.filter(n=>!k.includes(n)).sort();return[...o,...s]}async function oe(e){const t=new URL("dist/manifest.json",e),o=await fetch(t.href);if(!o.ok)return{ok:!1,components:[]};const s=await o.json(),n=Array.isArray(s.components)?s.components:[];return{ok:!0,components:ne([...new Set(n)].sort())}}async function se(e){const t=new URL("dist/tokens.json",e),o=await fetch(t.href);if(!o.ok)return{ok:!1,tokens:[],byTheme:{}};const s=await o.json(),n=Array.isArray(s.tokens)?s.tokens:[],i=s.byTheme&&typeof s.byTheme=="object"?s.byTheme:{};return{ok:!0,tokens:n,byTheme:i}}function re(){const e=window.location.pathname.replace(/\/?(?:index\.html)?$/i,""),t=e.indexOf("/showcase");if(t===-1)return new URL("./",window.location.href);let o=`${e.slice(0,t)||"/"}`;return o.endsWith("/")||(o=`${o}/`),new URL(o,window.location.origin)}function _(e){return`bf-${e}`}function I(e,t,o){try{const s=o==null?void 0:o.document;if(!s)return;const n=s.getElementById("themeStylesheet");n&&(n.href=new URL(`themes/${e}.css`,t).href),s.documentElement.setAttribute("data-bf-theme",e);const i=s.getElementById("themeSelect");i&&(i.value=e);const d=s.getElementById("themeStatus");d&&(d.textContent=`Active: ${e}`)}catch{}}const B="bfStudioThemeMirror";function D(e,t){let o=document.getElementById(B);o||(o=document.createElement("link"),o.rel="stylesheet",o.id=B,document.head.appendChild(o)),o.href=new URL(`themes/${e}.css`,t).href,document.documentElement.setAttribute("data-bf-studio-bf-theme",e)}function ae(){var e;(e=document.getElementById(B))==null||e.remove(),document.documentElement.removeAttribute("data-bf-studio-bf-theme")}function K(e){document.body.innerHTML=`
<div class="bf-studio-error">
  <div class="bf-studio-error-card">
    <h2>Component Studio needs a build</h2>
    <p>${p(e)}</p>
    <p class="hint">From the repo root:</p>
    <p><code>pnpm run build</code></p>
    <p class="hint">Then start the studio (build + dev):</p>
    <p><code>pnpm run studio</code></p>
    <p class="hint">If you already built, reload — the preview reads <code>public/dist/manifest.json</code> and <code>public/dist/tokens.json</code>.</p>
  </div>
</div>`}function ie(e,t,o){const s=o.trim().toLowerCase(),n=t.filter(c=>s?c.toLowerCase().includes(s)||c.slice(2).toLowerCase().includes(s):!0),i=getComputedStyle(document.documentElement),d=n.map(c=>{const m=i.getPropertyValue(c).trim()||"—";return`<tr><td class="bf-tok-name"><code>${p(c)}</code></td><td class="bf-tok-val"><span class="bf-tok-span">${p(m)}</span></td></tr>`}).join("");e.innerHTML=n.length===0?`<p class="bf-tokens-empty">${p("No matching tokens.")}</p>`:`<table class="bf-token-table"><thead><tr><th>Custom property</th><th>Resolved value (root)</th></tr></thead><tbody>${d}</tbody></table>`,e.querySelectorAll(".bf-tok-span").forEach(c=>{c.title=`Click to copy: ${c.textContent??""}`,c.tabIndex=0}),e.querySelectorAll(".bf-tok-span").forEach(c=>{c.addEventListener("click",()=>{var m;const f=(m=c.textContent)==null?void 0:m.trim();f&&f!=="—"&&navigator.clipboard.writeText(f).catch(()=>{})})})}function ce(e,t,o,s){const n=t.length?t:Z,i=t.length;e.innerHTML=`
    <div class="bf-shell">
    <aside class="bf-sidebar">
      <div class="bf-brand">
        <span class="bf-kicker">Bareframe</span>
        <h1>Component Studio</h1>
        <p>Browse demos, compare themes, and inspect every shipped <code style="font-size:inherit">--bf-*</code> token.</p>
      </div>
      <div class="bf-view-tabs" role="tablist" aria-label="Studio mode">
        <button type="button" class="bf-tab active" role="tab" aria-selected="true" id="bfTabComponents">Components</button>
        <button type="button" class="bf-tab" role="tab" aria-selected="false" id="bfTabTokens">CSS variables</button>
      </div>
      <div class="bf-stats">
        <span class="bf-pill-count" title="Manifest entries">${i?`${i} components`:"Offline list"}</span>
        ${o.ok?`<span class="bf-pill-count" title="Unique design tokens">${o.tokens.length} tokens</span>`:""}
      </div>
      <div class="bf-meta">
        <a href="https://www.npmjs.com/package/bareframe" target="_blank" rel="noreferrer">npm</a>
        <a href="https://samueldbines.github.io/bareframe/" target="_blank" rel="noreferrer">GitHub Pages</a>
      </div>
      <div class="bf-field">
        <label for="bfDemoTheme">Theme (demos &amp; token values)</label>
        <select id="bfDemoTheme" aria-label="Bareframe theme"></select>
      </div>
      <div class="bf-field" id="bfSearchWrap">
        <label for="bfSearch">Find a component</label>
        <input id="bfSearch" type="search" placeholder="e.g. date-picker, bf-button…" autocomplete="off" />
      </div>
      <div class="bf-field" id="bfTokenSearchWrap" hidden>
        <label for="bfTokenSearch">Filter tokens</label>
        <input id="bfTokenSearch" type="search" placeholder="filter --bf-theme-…" autocomplete="off" />
      </div>
      <nav class="bf-nav" id="bfNav" aria-label="Components"></nav>
    </aside>
    <div class="bf-stage">
      <header class="bf-toolbar">
        <div class="bf-toolbar-left">
          <span class="bf-chip-tag" id="bfActiveSlug">Select a component</span>
        </div>
        <div class="bf-toolbar-actions">
          <button type="button" class="bf-btn" id="bfReload">Reload preview</button>
          <a class="bf-open-link primary" id="bfOpenBlank" href="#" target="_blank" rel="noopener">Open demo in new tab</a>
        </div>
      </header>
      <div class="bf-preview" id="bfPreviewOuter">
        <div class="bf-tokens-pane" id="bfTokensPane" hidden>
          <div class="bf-tokens-intro">
            <strong>Resolved at <code>document.documentElement</code></strong> using the theme picker's stylesheet.
            Tokens are enumerated from <code>dist/tokens.json</code> (build parses <code>themes/*.css</code> including <code>@import</code>).
            Click a resolved value to copy.
          </div>
          ${o.ok?"":`<p class="bf-tokens-warn">${p("tokens.json missing — run pnpm build from repo root.")}</p>`}
          <div id="bfTokensMount"></div>
        </div>
        <div class="bf-preview-frame-wrap" id="bfPreviewWrap">
          <iframe class="bf-preview-frame" id="bfFrame" title="Component demo preview"></iframe>
        </div>
      </div>
    </div>
    </div>`;const d=document.getElementById("bfNav"),c=document.getElementById("bfFrame"),f=document.getElementById("bfSearch"),m=document.getElementById("bfActiveSlug"),v=document.getElementById("bfDemoTheme"),A=document.getElementById("bfReload"),M=document.getElementById("bfOpenBlank"),T=document.getElementById("bfTabComponents"),w=document.getElementById("bfTabTokens"),O=document.getElementById("bfTokensPane"),P=document.getElementById("bfPreviewWrap"),R=document.querySelector(".bf-toolbar"),x=document.getElementById("bfSearchWrap"),U=document.getElementById("bfTokenSearchWrap"),S=document.getElementById("bfTokenSearch"),W=document.getElementById("bfTokensMount");if(!d||!c||!f||!m||!v||!A||!M||!T||!w||!O||!P||!x||!U||!S||!W||!R)return;const y=d,V=R,z=W;let b="system",j="components";for(const r of te())v.appendChild(de(r));v.value=b;function N(r){j=r;const a=r==="components";T.classList.toggle("active",a),T.setAttribute("aria-selected",String(a)),w.classList.toggle("active",!a),w.setAttribute("aria-selected",String(!a)),x.hidden=!a,U.hidden=a,y.style.display=a?"":"none",V.style.display=a?"":"none",O.hidden=a,P.hidden=!a,a?ae():(D(b,s),L())}function L(){o.ok&&ie(z,o.tokens,S.value)}T.addEventListener("click",()=>N("components")),w.addEventListener("click",()=>N("tokens"));let h="";v.addEventListener("change",()=>{b=v.value,I(b,s,c.contentWindow),j==="tokens"&&(D(b,s),requestAnimationFrame(()=>L()))}),A.addEventListener("click",()=>{var r;(r=c.contentWindow)==null||r.location.reload()});function q(r){m.textContent=`${_(r)}`;const a=new URL(`${r}/index.html`,s).href;M.href=a;for(const l of y.querySelectorAll("a[data-slug]"))l.setAttribute("data-active",(l.getAttribute("data-slug")===r).toString())}function G(r){h=r,c.src=new URL(`${r}/index.html`,s).href,q(r)}c.addEventListener("load",()=>{I(b,s,c.contentWindow)}),y.addEventListener("click",r=>{const a=r.target instanceof Element?r.target.closest("a[data-slug]"):null;if(!(a instanceof HTMLAnchorElement))return;r.preventDefault();const l=a.getAttribute("data-slug");l&&G(l)});function J(r){const a=fe(r.replace(/-/g," "));return k.includes(r)&&i&&n.includes(r)?`${a} · MVP`:a}const H=()=>{const r=f.value.trim().toLowerCase(),a=n.filter(u=>{if(!r)return!0;const g=u.toLowerCase(),X=r.startsWith("bf-")?r.slice(3):r,Y=_(u).toLowerCase();return g.includes(r)||g.includes(X)||Y.includes(r)});if(a.length===0){y.innerHTML=`<p style="opacity:.72;font-size:.82rem">${p("No matches — try another search.")}</p>`;return}const l=k.filter(u=>a.includes(u)),C=a.filter(u=>!k.includes(u)),F=u=>u.map(g=>`<a href="#" data-slug="${le(g)}">${p(J(g))}</a>`).join(""),$=[];l.length&&$.push(`<div class="bf-nav-section-head">Essentials</div>${F(l)}`),C.length&&$.push(`<div class="bf-nav-section-head">More components (${C.length})</div>${F(C)}`);const E=h&&a.includes(h)?h:l[0]??a[0],Q=E!==h;y.innerHTML=$.join(""),h=E,q(E),Q?c.src=new URL(`${E}/index.html`,s).href:I(b,s,c.contentWindow)};f.addEventListener("input",()=>H()),S.addEventListener("input",()=>L()),H()}function de(e){const t=document.createElement("option");return t.value=e,t.textContent=e,t}function p(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function le(e){return e.replace(/[&<>"']/g,t=>t==="&"?"&amp;":t==="<"?"&lt;":t===">"?"&gt;":t==='"'?"&quot;":"&#039;")}function fe(e){return e.replace(/\b\w/g,t=>t.toUpperCase())}(async()=>{const e=document.getElementById("app");if(!e)throw new Error("#app missing");const t=re(),[{ok:o,components:s},n]=await Promise.all([oe(t),se(t)]);if(!o){K(`Could not load ${new URL("dist/manifest.json",t).pathname}.`);return}const i=n.ok?{ok:!0,tokens:n.tokens,byTheme:n.byTheme}:{ok:!1,tokens:[]};ce(e,s,i,t)})().catch(e=>{console.error("[studio]",e);const t=e instanceof Error&&typeof e.message=="string"?e.message:typeof e=="string"?e:JSON.stringify(e);K(t)});
