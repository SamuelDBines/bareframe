import type { DesignNode, Page, ProjectDocument } from './types.js';

function normalizeLabel(value: string) {
	return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function buttonLabel(node: DesignNode): string | null {
	if (node.type !== 'instance' || node.instance?.definitionId !== 'button') return null;
	const label = String(node.instance.props?.children ?? '').trim();
	return label || null;
}

/** Collect actionable buttons on a page (for matching flow connector labels). */
export function listPageButtons(page: Page): { nodeId: string; label: string }[] {
	const out: { nodeId: string; label: string }[] = [];
	for (const node of Object.values(page.nodes)) {
		const label = buttonLabel(node);
		if (label) out.push({ nodeId: node.id, label });
	}
	return out;
}

/**
 * Set `fromNodeId` on outgoing connectors from a frame when a button label matches the connector label.
 */
export function attachConnectorButtonNodes(document: ProjectDocument, pageId: string, frameId: string): string[] {
	const notes: string[] = [];
	const page = document.project.pages.find((p) => p.id === pageId);
	if (!page) return notes;
	const buttons = listPageButtons(page);
	if (!buttons.length) return notes;

	const connectors = document.project.connectors.filter(
		(c) => c.fromFrameId === frameId && c.fromFrameId !== c.toFrameId,
	);
	for (const conn of connectors) {
		const target = normalizeLabel(conn.label ?? conn.trigger ?? 'next');
		if (!target) continue;
		const match =
			buttons.find((b) => normalizeLabel(b.label) === target) ??
			buttons.find((b) => target.includes(normalizeLabel(b.label)) || normalizeLabel(b.label).includes(target));
		if (match) {
			conn.fromNodeId = match.nodeId;
			notes.push(`Linked button "${match.label}" to ${conn.label ?? 'next screen'}`);
		}
	}
	return notes;
}