import type {
	Annotation,
	Frame,
	Page,
	ProjectDocument,
	StyleTrial,
} from '@bareframe/designer-core';

/** Server-side frame HTML for Playwright capture (no external theme URLs). */
export function buildFrameRenderHtml(opts: {
	document: ProjectDocument;
	frameId: string;
	annotations?: Annotation[];
	themeCss?: string;
}): string {
	const { document, frameId, annotations = [], themeCss = defaultThemeCss() } = opts;
	const frame = document.project.frames.find((f) => f.id === frameId);
	if (!frame) throw new Error('Frame not found');
	const page = document.project.pages.find((p) => p.id === frame.pageId);
	if (!page) throw new Error('Page not found');
	const trial = document.project.trials.find((t) => t.id === frame.trialId);

	const root = page.nodes[page.rootNodeId];
	const inner = root ? renderNode(root, page, frame.width, trial) : '';
	const overlay = annotations
		.filter((a) => a.frameId === frameId)
		.map((a, i) => renderAnnotationOverlay(a, i + 1))
		.join('');

	return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>${themeCss}</style>
<style>
  html, body { margin:0; background:#f4f4f5; font-family: system-ui, sans-serif; }
  .bf-frame { width:${frame.width}px; min-height:${frame.height}px; margin:0 auto; background:#fff; position:relative; overflow:hidden; }
  .bf-overlay { position:absolute; inset:0; pointer-events:none; }
  .bf-callout { position:absolute; border:2px solid #2563eb; background:rgba(37,99,235,0.12); font-size:12px; padding:4px 6px; color:#111; }
</style>
</head>
<body>
<div class="bf-frame">${inner}${overlay ? `<div class="bf-overlay">${overlay}</div>` : ''}</div>
</body>
</html>`;
}

function renderAnnotationOverlay(a: Annotation, index: number): string {
	if (a.target.kind === 'rect') {
		const { x, y, w, h } = a.target;
		return `<div class="bf-callout" style="left:${x}px;top:${y}px;width:${w}px;min-height:${h}px">${index}. ${escapeHtml(a.text)}</div>`;
	}
	return '';
}

function renderNode(
	node: Page['nodes'][string],
	page: Page,
	frameWidth: number,
	trial: StyleTrial | undefined,
): string {
	if (node.type === 'text') {
		return `<p data-node-id="${node.id}">${escapeHtml(node.content?.text ?? '')}</p>`;
	}
	if (node.type === 'image' && node.image) {
		return `<img data-node-id="${node.id}" alt="${escapeHtml(node.image.alt ?? '')}" src="asset://${node.image.assetId}" style="max-width:100%;display:block" />`;
	}
	const childHtml = node.children
		.map((id) => page.nodes[id])
		.filter(Boolean)
		.map((c) => renderNode(c!, page, frameWidth, trial))
		.join('');
	return `<div data-node-id="${node.id}">${childHtml}</div>`;
}

function escapeHtml(s: string) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function defaultThemeCss() {
	return `:root { --text:#111; } body { color: var(--text); }`;
}

export function findFrame(document: ProjectDocument, frameId: string): Frame | undefined {
	return document.project.frames.find((f) => f.id === frameId);
}
