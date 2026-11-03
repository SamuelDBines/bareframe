import type { DesignerProject } from '../types';

/** Visible card width on the flow map (world units). */
export const FLOW_CARD_WIDTH = 272;
export const FLOW_THUMB_HEIGHT = 392;
export const FLOW_LABEL_HEIGHT = 44;
export const FLOW_CARD_HEIGHT = FLOW_THUMB_HEIGHT + FLOW_LABEL_HEIGHT;
export const FLOW_CARD_GAP_X = 148;

export function cardPosition(frame: { x: number; y: number }) {
  return { left: frame.x, top: frame.y };
}

export function layoutFlowMapRow(
  frames: { x: number; y: number }[],
  startX = 96,
  startY = 88,
): void {
  let x = startX;
  for (const f of frames) {
    f.x = x;
    f.y = startY;
    x += FLOW_CARD_WIDTH + FLOW_CARD_GAP_X;
  }
}

export function autoLayoutFlowMap(project: DesignerProject): { frameId: string; x: number; y: number }[] {
  const frames = project.frames.filter((f) => !f.ghost);
  const sorted = [...frames].sort((a, b) => a.x - b.x);
  layoutFlowMapRow(sorted);
  return sorted.map((f) => ({ frameId: f.id, x: f.x, y: f.y }));
}

export function boundsForFlowMapFrames(
  frames: { x: number; y: number }[],
): { x: number; y: number; w: number; h: number } | null {
  if (frames.length === 0) return null;
  const xs = frames.map((f) => f.x);
  const ys = frames.map((f) => f.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs.map((x) => x + FLOW_CARD_WIDTH));
  const maxY = Math.max(...ys.map((y) => y + FLOW_CARD_HEIGHT));
  return { x: minX - 64, y: minY - 64, w: maxX - minX + 128, h: maxY - minY + 128 };
}

export function connectorPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
): string {
  const x1 = from.x + FLOW_CARD_WIDTH;
  const y1 = from.y + FLOW_THUMB_HEIGHT / 2;
  const x2 = to.x;
  const y2 = to.y + FLOW_THUMB_HEIGHT / 2;
  const dx = Math.max(48, (x2 - x1) * 0.45);
  const c1x = x1 + dx;
  const c2x = x2 - dx;
  return `M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`;
}

export function connectorMidpoint(
  from: { x: number; y: number },
  to: { x: number; y: number },
): { x: number; y: number } {
  const x1 = from.x + FLOW_CARD_WIDTH;
  const y1 = from.y + FLOW_THUMB_HEIGHT / 2;
  const x2 = to.x;
  const y2 = to.y + FLOW_THUMB_HEIGHT / 2;
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 6 };
}
