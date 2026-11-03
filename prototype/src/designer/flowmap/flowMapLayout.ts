import { layoutFramesInFlowRow } from '@bareframe/designer-core';
import type { DesignerProject } from '../types';

export const FLOW_CARD_WIDTH = 260;
export const FLOW_CARD_HEIGHT = 440;

export function cardPosition(frame: { x: number; y: number }) {
  return { left: frame.x, top: frame.y };
}

export function autoLayoutFlowMap(project: DesignerProject): { frameId: string; x: number; y: number }[] {
  const frames = project.frames.filter((f) => !f.ghost);
  const sorted = [...frames].sort((a, b) => a.x - b.x);
  layoutFramesInFlowRow(sorted, 80, 120);
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
  return { x: minX, y: minY - 48, w: maxX - minX + 96, h: maxY - minY + 96 };
}

export function connectorPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
): string {
  const x1 = from.x + FLOW_CARD_WIDTH;
  const y1 = from.y + FLOW_CARD_HEIGHT / 2;
  const x2 = to.x;
  const y2 = to.y + FLOW_CARD_HEIGHT / 2;
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}
