import {
  applyProjectCommand,
  createDefaultCommandContext,
  createEmptyProjectDocument,
  defaultNewId,
  type ProjectDocument,
} from '@bareframe/designer-core';
import type { JourneyPlan, ScreenPlan } from '../types.js';

export type BuildDesignerOptions = {
  projectId: string;
  projectName: string;
  themeId: string;
  screens: ScreenPlan[];
  journeys: JourneyPlan[];
  copyByScreen: Map<string, { key: string; text: string }[]>;
  isValidComponentSlug: (slug: string) => boolean;
};

export function buildDesignerProjectDocument(opts: BuildDesignerOptions): ProjectDocument {
  const ctx = createDefaultCommandContext(opts.isValidComponentSlug);
  let doc = createEmptyProjectDocument(opts.projectId, opts.projectName, opts.themeId, ctx);
  const frameByScreen = new Map<string, string>();

  // Replace default empty project with fresh canvas per screen
  doc.project.pages = [];
  doc.project.frames = [];

  for (const screen of opts.screens) {
    const result = applyProjectCommand(
      doc,
      {
        type: 'create_canvas',
        name: screen.name,
        routePath: screen.route,
        presetId: 'iphone-15',
      },
      ctx,
    );
    doc = result.document;
    const frameId = result.effects.frameId as string;
    const pageId = result.effects.pageId as string;
    frameByScreen.set(screen.id, frameId);

    const page = doc.project.pages.find((p) => p.id === pageId);
    if (!page) continue;
    const rootId = page.rootNodeId;

    for (const slug of screen.components.slice(0, 6)) {
      if (!opts.isValidComponentSlug(slug)) continue;
      const add = applyProjectCommand(
        doc,
        {
          type: 'add_component',
          pageId,
          parentNodeId: rootId,
          slug,
          props: slug === 'button' ? { children: 'Continue' } : undefined,
        },
        ctx,
      );
      doc = add.document;
    }

    const blocks = opts.copyByScreen.get(screen.id);
    const heading = blocks?.find((b) => b.key === 'hero.heading')?.text ?? screen.name;
    const addText = applyProjectCommand(
      doc,
      {
        type: 'add_component',
        pageId,
        parentNodeId: rootId,
        slug: 'field',
        props: { label: heading },
      },
      ctx,
    );
    doc = addText.document;
  }

  for (const journey of opts.journeys) {
    for (const step of journey.steps) {
      if (!step.next_screen_id) continue;
      const from = frameByScreen.get(step.screen_id);
      const to = frameByScreen.get(step.next_screen_id);
      if (!from || !to) continue;
      const conn = applyProjectCommand(
        doc,
        {
          type: 'add_connector',
          fromFrameId: from,
          toFrameId: to,
          label: step.action,
          trigger: 'click',
        },
        ctx,
      );
      doc = conn.document;
    }
  }

  return doc;
}
