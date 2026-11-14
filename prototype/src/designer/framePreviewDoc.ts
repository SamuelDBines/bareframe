import type { ThemeId } from '../theme/themes';
import { resolveLayout, resolveVariant, isVisible } from './resolveNode';
import { breakpointForWidth } from './breakpoints';
import type { DesignNode, Page, StyleTrial } from './types';
import { framePreviewHostScript } from './framePreviewHostScript';

function layoutCss(layout: ReturnType<typeof resolveLayout>): string {
	const flexDir =
		layout.mode === 'row' ? 'row' : layout.mode === 'column' || layout.mode === 'stack' ? 'column' : 'row';
	const display = layout.mode === 'free' ? 'block' : 'flex';
	return `
    display:${display};
    flex-direction:${flexDir};
    gap:${layout.gap}px;
    padding:${layout.padding.map((p) => `${p}px`).join(' ')};
    align-items:${layout.align === 'start' ? 'flex-start' : layout.align === 'end' ? 'flex-end' : layout.align};
    justify-content:${layout.justify === 'space-between' ? 'space-between' : layout.justify};
    width:${layout.widthMode === 'fill' ? '100%' : 'auto'};
    box-sizing:border-box;
  `;
}

function renderNode(
	node: DesignNode,
	page: Page,
	frameWidth: number,
	trial: StyleTrial | undefined,
	selectedNodeId: string | null,
	protoHotspotNodeIds?: Set<string>,
): string {
	if (!isVisible(node, breakpointForWidth(frameWidth))) return '';

	const layout = resolveLayout(node, breakpointForWidth(frameWidth));
	const sel = selectedNodeId === node.id ? ' data-selected="true"' : '';
	const hotspot = protoHotspotNodeIds?.has(node.id) ? ' data-proto-hotspot="true"' : '';

	if (node.type === 'text') {
		const tag = node.content?.textTag ?? 'p';
		return `<${tag} class="bf-node" data-node-id="${node.id}"${sel}${hotspot} style="${layoutCss(layout)}margin:0;">${escapeHtml(node.content?.text ?? '')}</${tag}>`;
	}

	if (node.type === 'instance' && node.instance) {
		const variant = resolveVariant(node, trial?.variantSwaps ?? []);
		const def = node.instance.definitionId;
		const label = String(node.instance.props?.children ?? node.instance.props?.title ?? node.name);
		if (def === 'button') {
			const mod =
				variant === 'secondary' ? 'bf-btn--secondary' : variant === 'ghost' ? 'bf-btn--ghost' : 'bf-btn--primary';
			const hotCls = protoHotspotNodeIds?.has(node.id) ? ' bf-proto-hotspot' : '';
			return `<button type="button" class="bf-node btn bf-btn ${mod}${hotCls}" data-node-id="${node.id}"${sel}${hotspot} style="${layoutCss(layout)};cursor:pointer;">${escapeHtml(label)}</button>`;
		}
		if (def === 'card') {
			const title = String(node.instance.props?.title ?? '');
			const body = String(node.instance.props?.children ?? '');
			const elevated = variant === 'elevated' ? ' bf-card--elevated' : variant === 'ghost' ? ' bf-card--ghost' : '';
			return `<div class="bf-node bf-card${elevated}" data-node-id="${node.id}"${sel} style="${layoutCss(layout)}"><div class="bf-card__header"><h3>${escapeHtml(title)}</h3></div><div class="bf-card__body">${escapeHtml(body)}</div></div>`;
		}
		if (def === 'input') {
			const ph = String(node.instance.props?.placeholder ?? node.instance.props?.children ?? '');
			return `<input class="bf-node bf-input" data-node-id="${node.id}"${sel} style="${layoutCss(layout)}" placeholder="${escapeHtml(ph)}" aria-label="${escapeHtml(ph)}" />`;
		}
		if (def === 'badge') {
			const mod = variant === 'outline' ? ' bf-badge--outline' : variant === 'success' ? ' bf-badge--success' : '';
			return `<span class="bf-node bf-badge bf-badge--md${mod}" data-node-id="${node.id}"${sel} style="${layoutCss(layout)}">${escapeHtml(label)}</span>`;
		}
		if (def === 'alert') {
			return `<div class="bf-node bf-alert" data-node-id="${node.id}"${sel} style="${layoutCss(layout)}">${escapeHtml(label)}</div>`;
		}
	}

	const childHtml = node.children
		.map((cid) => {
			const child = page.nodes[cid];
			return child ? renderNode(child, page, frameWidth, trial, selectedNodeId, protoHotspotNodeIds) : '';
		})
		.join('');

	if (node.type === 'frame-root' || node.type === 'stack' || node.type === 'row' || node.type === 'column' || node.type === 'section') {
		const extra = node.id === 'node-nav' ? ' bf-nav' : node.type === 'section' ? ' bf-section' : '';
		const bg =
			node.type === 'frame-root'
				? 'min-height:100%;background:var(--bf-theme-surface-2);'
				: '';
		return `<div class="bf-node bf-${node.type}${extra}" data-node-id="${node.id}"${sel} style="${layoutCss(layout)}${bg}">${childHtml}</div>`;
	}

	return `<div class="bf-node" data-node-id="${node.id}"${sel} style="${layoutCss(layout)}">${childHtml}</div>`;
}

function escapeHtml(s: string) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function buildFramePreviewDoc(opts: {
	page: Page;
	frameWidth: number;
	frameHeight?: number;
	themeId: ThemeId;
	tokenOverrides: Record<string, string>;
	trial?: StyleTrial;
	selectedNodeId: string | null;
	protoHotspotNodeIds?: string[];
	assetBase: string;
	previewCss?: string;
	/** @deprecated use previewCss */
	themeCss?: string;
}): string {
	const { page, frameWidth, frameHeight, themeId, tokenOverrides, trial, selectedNodeId, previewCss, themeCss } = opts;
	const hotspotSet = opts.protoHotspotNodeIds?.length ? new Set(opts.protoHotspotNodeIds) : undefined;
	const root = page.nodes[page.rootNodeId];
	const overrides = { ...tokenOverrides, ...(trial?.tokenOverrides ?? {}) };
	const varBlock = Object.entries(overrides)
		.map(([k, v]) => `${k}:${v};`)
		.join('');

	const inner = root ? renderNode(root, page, frameWidth, trial, selectedNodeId, hotspotSet) : '';

	const styles =
		previewCss ??
		(themeCss ? themeCss.replace(/@import\s+['"]\.\/layout\.css['"]\s*;?\s*/g, '') : '');

	const linkedStyles = styles
		? `<style id="bf-preview-styles">${styles}</style>`
		: `<link rel="stylesheet" href="themes/layout.css" />
<link rel="stylesheet" href="themes/${themeId}.css" />
<link rel="stylesheet" href="assets/frame-preview/bareframe-ui.css" />
<link rel="stylesheet" href="assets/frame-preview/button.css" />`;

	const bodyHeight =
		frameHeight != null
			? `height:${frameHeight}px;overflow:hidden;`
			: 'min-height:100%;';

	return `<!DOCTYPE html>
<html data-bf-theme="${themeId}">
<head>
<meta charset="utf-8" />
<base href="${opts.assetBase}" />
<meta name="viewport" content="width=${frameWidth}" />
${linkedStyles}
<style>
  html, body { margin:0; ${bodyHeight} font-family:var(--bf-theme-font-family, system-ui, sans-serif); font-size:16px; background:var(--bf-theme-surface-2); color:var(--bf-theme-text-1); touch-action:none; overscroll-behavior:none; -webkit-font-smoothing:antialiased; box-sizing:border-box; }
  p { margin:0; color:var(--bf-theme-text-2); line-height:var(--bf-theme-typography-line-height, 1.45); }
  .bf-row, .bf-stack { width:100%; box-sizing:border-box; }
  .bf-section { background:var(--bf-theme-surface-1); border:1px solid var(--bf-theme-border-1); border-radius:var(--bf-theme-radius-md,8px); box-sizing:border-box; }
  .bf-nav { background:var(--bf-theme-surface-1); border-bottom:1px solid var(--bf-theme-border-1); box-sizing:border-box; }
  [data-bf-theme="${themeId}"] { ${varBlock} }
  .bf-node.bf-input { box-sizing:border-box; }
  [data-selected="true"] { outline:2px solid var(--bf-theme-button-primary-bg); outline-offset:2px; }
  .bf-proto-hotspot,[data-proto-hotspot="true"] { outline:2px dashed color-mix(in srgb, var(--bf-theme-button-primary-bg) 70%, transparent); outline-offset:3px; }
</style>
</head>
<body>${inner}${framePreviewHostScript()}</body>
</html>`;
}
