import type { ThemeId } from '../theme/themes';
import { resolveLayout, resolveVariant, isVisible } from './resolveNode';
import { breakpointForWidth } from './breakpoints';
import type { DesignNode, Page, StyleTrial } from './types';

const base = import.meta.env.BASE_URL;

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
): string {
	if (!isVisible(node, breakpointForWidth(frameWidth))) return '';

	const layout = resolveLayout(node, breakpointForWidth(frameWidth));
	const sel = selectedNodeId === node.id ? ' data-selected="true"' : '';

	if (node.type === 'text') {
		const tag = node.content?.textTag ?? 'p';
		return `<${tag} class="bf-node" data-node-id="${node.id}"${sel} style="${layoutCss(layout)}color:var(--bf-theme-text-1);margin:0;">${escapeHtml(node.content?.text ?? '')}</${tag}>`;
	}

	if (node.type === 'instance' && node.instance) {
		const variant = resolveVariant(node, trial?.variantSwaps ?? []);
		const def = node.instance.definitionId;
		const label = String(node.instance.props?.children ?? node.instance.props?.title ?? node.name);
		if (def === 'button') {
			const cls = variant === 'secondary' ? 'bf-btn-secondary' : variant === 'ghost' ? 'bf-btn-ghost' : 'bf-btn-primary';
			return `<button type="button" class="bf-node ${cls}" data-node-id="${node.id}"${sel} style="${layoutCss(layout)}">${escapeHtml(label)}</button>`;
		}
		if (def === 'card') {
			const title = String(node.instance.props?.title ?? '');
			const body = String(node.instance.props?.children ?? '');
			return `<div class="bf-node bf-card" data-node-id="${node.id}"${sel} style="${layoutCss(layout)}"><strong>${escapeHtml(title)}</strong><p style="margin:0.5rem 0 0;color:var(--bf-theme-text-2)">${escapeHtml(body)}</p></div>`;
		}
		if (def === 'input') {
			return `<input class="bf-node bf-input" data-node-id="${node.id}"${sel} style="${layoutCss(layout)}" value="${escapeHtml(label)}" />`;
		}
		if (def === 'badge') {
			return `<span class="bf-node bf-badge" data-node-id="${node.id}"${sel} style="${layoutCss(layout)}">${escapeHtml(label)}</span>`;
		}
		if (def === 'alert') {
			return `<div class="bf-node bf-alert" data-node-id="${node.id}"${sel} style="${layoutCss(layout)}">${escapeHtml(label)}</div>`;
		}
	}

	const childHtml = node.children
		.map((cid) => {
			const child = page.nodes[cid];
			return child ? renderNode(child, page, frameWidth, trial, selectedNodeId) : '';
		})
		.join('');

	if (node.type === 'frame-root' || node.type === 'stack' || node.type === 'row' || node.type === 'column' || node.type === 'section') {
		return `<div class="bf-node bf-${node.type}" data-node-id="${node.id}"${sel} style="${layoutCss(layout)}min-height:100%;background:var(--bf-theme-surface-2);">${childHtml}</div>`;
	}

	return `<div class="bf-node" data-node-id="${node.id}"${sel} style="${layoutCss(layout)}">${childHtml}</div>`;
}

function escapeHtml(s: string) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function buildFramePreviewDoc(opts: {
	page: Page;
	frameWidth: number;
	themeId: ThemeId;
	tokenOverrides: Record<string, string>;
	trial?: StyleTrial;
	selectedNodeId: string | null;
}): string {
	const { page, frameWidth, themeId, tokenOverrides, trial, selectedNodeId } = opts;
	const root = page.nodes[page.rootNodeId];
	const overrides = { ...tokenOverrides, ...(trial?.tokenOverrides ?? {}) };
	const varBlock = Object.entries(overrides)
		.map(([k, v]) => `${k}:${v};`)
		.join('');

	const inner = root ? renderNode(root, page, frameWidth, trial, selectedNodeId) : '';

	return `<!DOCTYPE html>
<html data-bf-theme="${themeId}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=${frameWidth}" />
<link rel="stylesheet" href="${base}themes/${themeId}.css" />
<link rel="stylesheet" href="${base}themes/layout.css" />
<style>
  html, body { margin:0; min-height:100%; font-family:var(--bf-theme-font-family); background:var(--bf-theme-surface-2); }
  [data-bf-theme="${themeId}"] { ${varBlock} }
  .bf-btn-primary { background:var(--bf-theme-button-primary-bg); color:var(--bf-theme-button-primary-color); border:1px solid var(--bf-theme-button-primary-border-color); padding:0.5rem 1rem; border-radius:var(--bf-theme-radius-md,8px); font:inherit; cursor:pointer; }
  .bf-btn-secondary { background:var(--bf-theme-button-secondary-bg); color:var(--bf-theme-button-secondary-color); border:1px solid var(--bf-theme-button-secondary-border-color); padding:0.5rem 1rem; border-radius:var(--bf-theme-radius-md,8px); font:inherit; }
  .bf-btn-ghost { background:transparent; color:var(--bf-theme-text-1); border:1px solid var(--bf-theme-border-1); padding:0.5rem 1rem; border-radius:var(--bf-theme-radius-md,8px); font:inherit; }
  .bf-card { background:var(--bf-theme-surface-1); border:1px solid var(--bf-theme-border-1); border-radius:calc(var(--bf-theme-radius-md,8px) + 4px); padding:1rem; color:var(--bf-theme-text-1); }
  .bf-input { padding:0.5rem 0.75rem; border:1px solid var(--bf-theme-border-1); border-radius:var(--bf-theme-radius-md,8px); background:var(--bf-theme-surface-1); color:var(--bf-theme-text-1); font:inherit; width:100%; max-width:280px; }
  .bf-badge { display:inline-block; padding:0.15rem 0.5rem; border-radius:999px; font-size:0.75rem; background:var(--bf-theme-surface-1); border:1px solid var(--bf-theme-border-1); }
  .bf-alert { padding:0.75rem 1rem; border-radius:8px; background:color-mix(in srgb, var(--bf-theme-button-primary-bg) 12%, var(--bf-theme-surface-1)); border:1px solid var(--bf-theme-border-1); }
  [data-selected="true"] { outline:2px solid var(--bf-theme-button-primary-bg); outline-offset:2px; }
</style>
</head>
<body>${inner}</body>
</html>`;
}
