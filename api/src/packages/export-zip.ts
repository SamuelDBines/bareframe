import { strToU8, zipSync } from 'fflate';
import type pg from 'pg';
import type { ProjectDocument } from '@bareframe/designer-core';
import { getProjectAsset, getProjectById } from '../db/projects.js';
import { getRenderJob, insertRenderJob } from '../db/render-jobs.js';
import { processRenderFrameJob } from '../render/process-jobs.js';
import type { ProductPackageRow } from '../db/packages.js';

function packageMarkdown(doc: Record<string, unknown>): string {
  return `# ${doc.project}\n\n${doc.summary}\n\n_Status: ${doc.status}_\n`;
}

function frameForScreen(document: ProjectDocument, screen: { id: string; name: string; route: string }) {
  const page = document.project.pages.find((p) => p.routePath === screen.route || p.name === screen.name);
  if (!page) return undefined;
  return document.project.frames.find((f) => f.pageId === page.id);
}

export async function buildPackageZip(pool: pg.Pool, pkg: ProductPackageRow): Promise<Uint8Array> {
  const doc = pkg.document as Record<string, unknown>;
  const files: Record<string, Uint8Array> = {};
  files['bareframe.package.json'] = strToU8(JSON.stringify(doc, null, 2));
  files['README.md'] = strToU8(packageMarkdown(doc));
  files['delivery-flow/define.requirements.json'] = strToU8(
    JSON.stringify((doc.delivery_flow as { define: unknown }).define, null, 2),
  );
  files['delivery-flow/design.spec.json'] = strToU8(
    JSON.stringify((doc.delivery_flow as { design: unknown }).design, null, 2),
  );

  const scaffolds = (doc.handoff as { scaffolded_screens?: { path: string; tsx: string }[] })?.scaffolded_screens ?? [];
  for (const s of scaffolds) {
    files[s.path.replace(/^\//, '')] = strToU8(s.tsx);
  }

  const screens = (doc.prototype as { screens?: { id: string; name: string; route: string }[] })?.screens ?? [];
  if (pkg.designer_project_id && screens.length > 0) {
    const project = await getProjectById(pool, pkg.designer_project_id);
    if (project) {
      const document = project.document as ProjectDocument;
      for (const screen of screens) {
        const frame = frameForScreen(document, screen);
        if (!frame) continue;
        const jobId = await insertRenderJob(
          pool,
          'render_frame',
          { projectId: pkg.designer_project_id, frameId: frame.id },
          pkg.designer_project_id,
        );
        try {
          await processRenderFrameJob(pool, jobId, {
            projectId: pkg.designer_project_id,
            frameId: frame.id,
          });
        } catch {
          continue;
        }
        const job = await getRenderJob(pool, jobId);
        const assetId = (job?.result as { assetId?: string } | null)?.assetId;
        if (!assetId) continue;
        const asset = await getProjectAsset(pool, pkg.designer_project_id, assetId);
        if (!asset) continue;
        files[`screenshots/${screen.id}.png`] = new Uint8Array(asset.bytes);
      }
    }
  }

  return zipSync(files);
}
