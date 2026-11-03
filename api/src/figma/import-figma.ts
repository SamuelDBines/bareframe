import {
  applyProjectCommand,
  createDefaultCommandContext,
  createEmptyProjectDocument,
  layoutFramesInFlowRow,
  type ProjectDocument,
} from '@bareframe/designer-core';
import { isValidComponentSlug } from '../catalog/components.js';
import { fetchFile, type FigmaNode } from './client.js';
import { parseFigmaDesignUrl } from './parse-url.js';

export type FigmaImportResult = {
  framesImported: number;
  connectorsImported: number;
  fileName: string;
};

function collectFrames(node: FigmaNode, out: FigmaNode[], depth = 0): void {
  if (node.type === 'FRAME' || node.type === 'COMPONENT') {
    out.push(node);
    if (out.length >= 12) return;
  }
  if (!node.children || depth > 4) return;
  for (const child of node.children) {
    collectFrames(child, out, depth + 1);
    if (out.length >= 12) return;
  }
}

function findFrameNode(root: FigmaNode, nodeId: string | undefined): FigmaNode[] {
  if (nodeId) {
    const stack: FigmaNode[] = [root];
    while (stack.length) {
      const n = stack.pop()!;
      if (n.id === nodeId) return [n];
      if (n.children) stack.push(...n.children);
    }
  }
  const frames: FigmaNode[] = [];
  collectFrames(root, frames);
  return frames.slice(0, 8);
}

export function buildFixtureFigmaImport(
  projectId: string,
  projectName: string,
): { document: ProjectDocument; result: FigmaImportResult } {
  const ctx = createDefaultCommandContext(isValidComponentSlug);
  let doc = createEmptyProjectDocument(projectId, projectName, 'noir', { newId: ctx.newId });
  const steps = [
    { name: 'Landing', route: '/' },
    { name: 'Sign-in code', route: '/sign-in' },
    { name: 'Queue', route: '/home' },
  ];
  const frameIds: string[] = [];
  for (const step of steps) {
    const applied = applyProjectCommand(
      doc,
      {
        type: 'add_screen',
        name: step.name,
        routePath: step.route,
        presetId: 'iphone-15',
      },
      ctx,
    );
    doc = applied.document;
    const frameId = applied.effects.frameId!;
    frameIds.push(frameId);
  }
  for (let i = 0; i < frameIds.length - 1; i++) {
    const applied = applyProjectCommand(
      doc,
      {
        type: 'add_connector',
        fromFrameId: frameIds[i]!,
        toFrameId: frameIds[i + 1]!,
        label: i === 0 ? 'Email me a sign-in code' : 'Enter code',
        trigger: 'tap',
      },
      ctx,
    );
    doc = applied.document;
  }
  layoutFramesInFlowRow(doc.project.frames.filter((f) => !f.ghost), 80, 100);
  return {
    document: doc,
    result: { framesImported: frameIds.length, connectorsImported: frameIds.length - 1, fileName: 'Hookoh (demo import)' },
  };
}

export async function importFigmaIntoDocument(
  existing: ProjectDocument,
  projectName: string,
  figmaUrl: string,
  token: string,
): Promise<{ document: ProjectDocument; result: FigmaImportResult }> {
  if (token === 'fixture' || figmaUrl.includes('/design/demo')) {
    return buildFixtureFigmaImport(existing.project.id, projectName);
  }

  const parsed = parseFigmaDesignUrl(figmaUrl);
  if (!parsed) throw new Error('Invalid Figma design URL');

  const file = await fetchFile(parsed.fileKey, token);
  const figmaFrames = findFrameNode(file.document, parsed.nodeId);
  if (figmaFrames.length === 0) throw new Error('No frames found in Figma file');

  const ctx = createDefaultCommandContext(isValidComponentSlug);
  let doc = createEmptyProjectDocument(existing.project.id, projectName, 'noir', { newId: ctx.newId });
  const figmaIdToFrameId = new Map<string, string>();

  for (const ff of figmaFrames) {
    const applied = applyProjectCommand(
      doc,
      {
        type: 'add_screen',
        name: ff.name.slice(0, 80),
        routePath: `/${ff.name.toLowerCase().replace(/\s+/g, '-').slice(0, 40)}`,
        presetId: 'iphone-15',
      },
      ctx,
    );
    doc = applied.document;
    const frameId = applied.effects.frameId!;
    figmaIdToFrameId.set(ff.id, frameId);
  }

  for (const ff of figmaFrames) {
    const fromId = figmaIdToFrameId.get(ff.id);
    if (!fromId || !ff.reactions) continue;
    for (const reaction of ff.reactions) {
      for (const action of reaction.actions ?? []) {
        if (action.type !== 'NODE' || !action.destinationId) continue;
        const toId = figmaIdToFrameId.get(action.destinationId);
        if (!toId) continue;
        const applied = applyProjectCommand(
          doc,
          {
            type: 'add_connector',
            fromFrameId: fromId,
            toFrameId: toId,
            label: action.navigation ?? 'Navigate',
            trigger: reaction.trigger?.type ?? 'tap',
          },
          ctx,
        );
        doc = applied.document;
      }
    }
  }

  layoutFramesInFlowRow(doc.project.frames.filter((f) => !f.ghost), 80, 100);

  return {
    document: doc,
    result: {
      framesImported: figmaFrames.length,
      connectorsImported: doc.project.connectors.length,
      fileName: file.name,
    },
  };
}
