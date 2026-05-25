(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const d of i.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&r(d)}).observe(document,{childList:!0,subtree:!0});function s(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(n){if(n.ep)return;n.ep=!0;const i=s(n);fetch(n.href,i)}})();const k=["button","link","header","footer","modal","dialog","toast","message","error-summary","input","checkbox","radio","select","toggle","chart"],ne=["button","input","card"],oe=["system","dark","light","modern","layout","aurora","noir","oceanic","nature","matrix","retro","simple","sprint","sunrise","desert","future","nebula"];function se(){return[...new Set(oe)]}function re(e){const t=new Set(e),s=k.filter(n=>t.has(n)),r=e.filter(n=>!k.includes(n)).sort();return[...s,...r]}async function ae(e){const t=new URL("dist/manifest.json",e),s=await fetch(t.href);if(!s.ok)return{ok:!1,components:[]};const r=await s.json(),n=Array.isArray(r.components)?r.components:[];return{ok:!0,components:re([...new Set(n)].sort())}}async function ie(e){const t=new URL("dist/tokens.json",e),s=await fetch(t.href);if(!s.ok)return{ok:!1,tokens:[],byTheme:{}};const r=await s.json(),n=Array.isArray(r.tokens)?r.tokens:[],i=r.byTheme&&typeof r.byTheme=="object"?r.byTheme:{};return{ok:!0,tokens:n,byTheme:i}}function ce(){const e=window.location.pathname.replace(/\/?(?:index\.html)?$/i,""),t=e.indexOf("/showcase");if(t===-1)return new URL("./",window.location.href);let s=`${e.slice(0,t)||"/"}`;return s.endsWith("/")||(s=`${s}/`),new URL(s,window.location.origin)}function V(e){return`bf-${e}`}function A(e,t,s){try{const r=s==null?void 0:s.document;if(!r)return;const n=r.getElementById("themeStylesheet");n&&(n.href=new URL(`themes/${e}.css`,t).href),r.documentElement.setAttribute("data-bf-theme",e);const i=r.getElementById("themeSelect");i&&(i.value=e);const d=r.getElementById("themeStatus");d&&(d.textContent=`Active: ${e}`)}catch{}}const M="bfStudioThemeMirror";function z(e,t){let s=document.getElementById(M);s||(s=document.createElement("link"),s.rel="stylesheet",s.id=M,document.head.appendChild(s)),s.href=new URL(`themes/${e}.css`,t).href,document.documentElement.setAttribute("data-bf-studio-bf-theme",e)}function le(){var e;(e=document.getElementById(M))==null||e.remove(),document.documentElement.removeAttribute("data-bf-studio-bf-theme")}function G(e){document.body.innerHTML=`
<div class="bf-studio-error">
  <div class="bf-studio-error-card">
    <h2>Component Studio needs a build</h2>
    <p>${b(e)}</p>
    <p class="hint">From the repo root:</p>
    <p><code>pnpm run build</code></p>
    <p class="hint">Then start the studio (build + dev):</p>
    <p><code>pnpm run studio</code></p>
    <p class="hint">If you already built, reload — the preview reads <code>public/dist/manifest.json</code> and <code>public/dist/tokens.json</code>.</p>
  </div>
</div>`}function de(e,t,s){const r=s.trim().toLowerCase(),n=t.filter(c=>r?c.toLowerCase().includes(r)||c.slice(2).toLowerCase().includes(r):!0),i=getComputedStyle(document.documentElement),d=n.map(c=>{const m=i.getPropertyValue(c).trim()||"—";return`<tr><td class="bf-tok-name"><code>${b(c)}</code></td><td class="bf-tok-val"><span class="bf-tok-span">${b(m)}</span></td></tr>`}).join("");e.innerHTML=n.length===0?`<p class="bf-tokens-empty">${b("No matching tokens.")}</p>`:`<table class="bf-token-table"><thead><tr><th>Custom property</th><th>Resolved value (root)</th></tr></thead><tbody>${d}</tbody></table>`,e.querySelectorAll(".bf-tok-span").forEach(c=>{c.title=`Click to copy: ${c.textContent??""}`,c.tabIndex=0}),e.querySelectorAll(".bf-tok-span").forEach(c=>{c.addEventListener("click",()=>{var m;const f=(m=c.textContent)==null?void 0:m.trim();f&&f!=="—"&&navigator.clipboard.writeText(f).catch(()=>{})})})}function fe(e,t,s,r){var D;const n=t.length?t:ne,i=t.length;e.innerHTML=`
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
        ${s.ok?`<span class="bf-pill-count" title="Unique design tokens">${s.tokens.length} tokens</span>`:""}
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
          ${s.ok?"":`<p class="bf-tokens-warn">${b("tokens.json missing — run pnpm build from repo root.")}</p>`}
          <div id="bfTokensMount"></div>
        </div>
        <div class="bf-preview-frame-wrap" id="bfPreviewWrap">
          <iframe class="bf-preview-frame" id="bfFrame" title="Component demo preview"></iframe>
        </div>
      </div>
    </div>
    </div>`;const d=document.getElementById("bfNav"),c=document.getElementById("bfFrame"),f=document.getElementById("bfSearch"),m=document.getElementById("bfActiveSlug"),v=document.getElementById("bfDemoTheme"),P=document.getElementById("bfReload"),R=document.getElementById("bfOpenBlank"),w=document.getElementById("bfTabComponents"),T=document.getElementById("bfTabTokens"),U=document.getElementById("bfTokensPane"),O=document.getElementById("bfPreviewWrap"),x=document.querySelector(".bf-toolbar"),W=document.getElementById("bfSearchWrap"),j=document.getElementById("bfTokenSearchWrap"),L=document.getElementById("bfTokenSearch"),N=document.getElementById("bfTokensMount");if(!d||!c||!f||!m||!v||!P||!R||!w||!T||!U||!O||!W||!j||!L||!N||!x)return;const y=d,J=x,Q=N;let p="system",q="components";for(const o of se())v.appendChild(ue(o));v.value=p;function H(o){q=o;const a=o==="components";w.classList.toggle("active",a),w.setAttribute("aria-selected",String(a)),T.classList.toggle("active",!a),T.setAttribute("aria-selected",String(!a)),W.hidden=!a,j.hidden=a,y.style.display=a?"":"none",J.style.display=a?"":"none",U.hidden=a,O.hidden=!a,a?le():(z(p,r),S())}function S(){s.ok&&de(Q,s.tokens,L.value)}w.addEventListener("click",()=>H("components")),T.addEventListener("click",()=>H("tokens"));let h="";v.addEventListener("change",()=>{p=v.value,A(p,r,c.contentWindow),q==="tokens"&&(z(p,r),requestAnimationFrame(()=>S()))}),P.addEventListener("click",()=>{var o;(o=c.contentWindow)==null||o.location.reload()});function F(o){m.textContent=`${V(o)}`;const a=new URL(`${o}/index.html`,r).href;R.href=a;for(const l of y.querySelectorAll("a[data-slug]"))l.setAttribute("data-active",(l.getAttribute("data-slug")===o).toString())}function X(o){try{const a=new URL(window.location.href);a.searchParams.set("component",o),history.replaceState(null,"",a)}catch{}}function C(o,a={}){const{syncUrl:l=!0}=a;h=o,c.src=new URL(`${o}/index.html`,r).href,F(o),l&&X(o)}c.addEventListener("load",()=>{A(p,r,c.contentWindow)}),y.addEventListener("click",o=>{const a=o.target instanceof Element?o.target.closest("a[data-slug]"):null;if(!(a instanceof HTMLAnchorElement))return;o.preventDefault();const l=a.getAttribute("data-slug");l&&C(l)});function Y(o){const a=pe(o.replace(/-/g," "));return k.includes(o)&&i&&n.includes(o)?`${a} · MVP`:a}const _=()=>{const o=f.value.trim().toLowerCase(),a=n.filter(u=>{if(!o)return!0;const g=u.toLowerCase(),ee=o.startsWith("bf-")?o.slice(3):o,te=V(u).toLowerCase();return g.includes(o)||g.includes(ee)||te.includes(o)});if(a.length===0){y.innerHTML=`<p style="opacity:.72;font-size:.82rem">${b("No matches — try another search.")}</p>`;return}const l=k.filter(u=>a.includes(u)),I=a.filter(u=>!k.includes(u)),K=u=>u.map(g=>`<a href="#" data-slug="${me(g)}">${b(Y(g))}</a>`).join(""),B=[];l.length&&B.push(`<div class="bf-nav-section-head">Essentials</div>${K(l)}`),I.length&&B.push(`<div class="bf-nav-section-head">More components (${I.length})</div>${K(I)}`);const E=h&&a.includes(h)?h:l[0]??a[0],Z=E!==h;y.innerHTML=B.join(""),h=E,F(E),Z?c.src=new URL(`${E}/index.html`,r).href:A(p,r,c.contentWindow)};f.addEventListener("input",()=>_()),L.addEventListener("input",()=>S()),_();const $=(D=new URL(window.location.href).searchParams.get("component"))==null?void 0:D.replace(/^bf-/,"").trim().toLowerCase();$&&n.includes($)&&C($),window.addEventListener("popstate",()=>{var a;const o=(a=new URL(window.location.href).searchParams.get("component"))==null?void 0:a.replace(/^bf-/,"").trim().toLowerCase();o&&n.includes(o)&&C(o,{syncUrl:!1})})}function ue(e){const t=document.createElement("option");return t.value=e,t.textContent=e,t}function b(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function me(e){return e.replace(/[&<>"']/g,t=>t==="&"?"&amp;":t==="<"?"&lt;":t===">"?"&gt;":t==='"'?"&quot;":"&#039;")}function pe(e){return e.replace(/\b\w/g,t=>t.toUpperCase())}(async()=>{const e=document.getElementById("app");if(!e)throw new Error("#app missing");const t=ce(),[{ok:s,components:r},n]=await Promise.all([ae(t),ie(t)]);if(!s){G(`Could not load ${new URL("dist/manifest.json",t).pathname}.`);return}const i=n.ok?{ok:!0,tokens:n.tokens,byTheme:n.byTheme}:{ok:!1,tokens:[]};fe(e,r,i,t)})().catch(e=>{console.error("[studio]",e);const t=e instanceof Error&&typeof e.message=="string"?e.message:typeof e=="string"?e:JSON.stringify(e);G(t)});
