import type pg from 'pg';
import type { ProjectDocument } from '@bareframe/designer-core';
import { getProjectById, replaceProjectDocument } from '../db/projects.js';

export async function applyDesignDirectionToProject(
  pool: pg.Pool,
  projectId: string,
  userId: number,
  doc: Record<string, unknown>,
  directionId: string,
) {
  const options = doc.design_options as { id: string; bareframe_theme?: { base_theme?: string } }[];
  const direction = options.find((o) => o.id === directionId);
  const themeId = direction?.bareframe_theme?.base_theme ?? 'simple';

  const project = await getProjectById(pool, projectId);
  if (!project || project.owner_user_id !== userId) return;

  const next = structuredClone(project.document) as ProjectDocument;
  next.project.defaultThemeId = themeId;
  for (const frame of next.project.frames) {
    frame.themeId = themeId;
  }

  await replaceProjectDocument(pool, projectId, userId, next, project.version);
}
