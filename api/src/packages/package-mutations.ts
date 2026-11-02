import type pg from 'pg';
import {
  artifactsFromPackage,
  buildDesignerProjectDocument,
  deliverableKeyFromLabel,
  intakeFromPackage,
  reassembleBareframePackage,
  regenerateDeliverable,
} from '@bareframe/package-generator';
import { validateBareframePackage } from '@bareframe/package-contracts';
import type { Config } from '../config.js';
import { isValidComponentSlug } from '../catalog/components.js';
import { getProjectById, replaceProjectDocument } from '../db/projects.js';
import { assertPackageOwner, updateProductPackageDocument, type ProductPackageRow } from '../db/packages.js';
import { createPackageLlm } from './process-job.js';
import { applyDesignDirectionToProject } from './apply-design-direction.js';

function shareUrlForPackage(config: Config, shareToken: string) {
  return `${config.designerPublicUrl}/#/share/${shareToken}`;
}

export async function resolveShareUrl(
  pool: pg.Pool,
  config: Config,
  packageId: string,
): Promise<string | null> {
  const { rows } = await pool.query<{ share_token: string | null }>(
    `SELECT share_token FROM product_packages WHERE id = $1`,
    [packageId],
  );
  const token = rows[0]?.share_token;
  if (!token) return null;
  return shareUrlForPackage(config, token);
}

const PROTOTYPE_DELIVERABLES = new Set(['prototype', 'journeys', 'copy']);

export async function reviseProductPackage(
  pool: pg.Pool,
  config: Config,
  userId: number,
  packageId: string,
  deliverableLabel: string,
  feedback: string,
): Promise<{ document: Record<string, unknown> }> {
  const pkg = await assertPackageOwner(pool, packageId, userId);
  const key = deliverableKeyFromLabel(deliverableLabel);
  if (!key) throw new Error(`Unknown deliverable: ${deliverableLabel}`);

  const doc = pkg.document;
  const intake = intakeFromPackage(doc);
  const projectName = String(doc.project);
  const artifacts = artifactsFromPackage(doc);
  const llm = createPackageLlm(config, intake, projectName);

  const updatedArtifacts = await regenerateDeliverable(llm, { intake, projectName }, key, feedback, artifacts);

  let designerProjectId = pkg.designer_project_id;
  if (designerProjectId && (PROTOTYPE_DELIVERABLES.has(key) || key === 'ia')) {
    const project = await getProjectById(pool, designerProjectId);
    if (project) {
      const copyByScreen = new Map<string, { key: string; text: string }[]>();
      for (const block of updatedArtifacts.copy as { screen_id: string; blocks: { key: string; text: string }[] }[]) {
        copyByScreen.set(block.screen_id, block.blocks);
      }
      const selected = (doc.selected_direction as string | null) ?? null;
      const themeId =
        (updatedArtifacts.design_options as { id: string; bareframe_theme?: { base_theme?: string } }[]).find(
          (d) => d.id === selected,
        )?.bareframe_theme?.base_theme ?? 'simple';

      const designerDoc = buildDesignerProjectDocument({
        projectId: designerProjectId,
        projectName,
        themeId,
        screens: updatedArtifacts.screens,
        journeys: updatedArtifacts.journeys,
        copyByScreen,
        isValidComponentSlug,
      });
      await replaceProjectDocument(pool, designerProjectId, userId, designerDoc, project.version);
    }
  }

  const shareUrl =
    (await resolveShareUrl(pool, config, packageId)) ??
    String((doc.prototype as { share_url?: string })?.share_url ?? '');

  const review = doc.review as {
    checklist: { id: string; section?: string; comment?: string; status: string }[];
    rounds_used: number;
    rounds_included: number;
  };
  const newDoc = reassembleBareframePackage({
    intake,
    projectName,
    designerProjectId: designerProjectId ?? '',
    shareUrl,
    libraryVersion: String((doc.prototype as { library_version?: string })?.library_version ?? '0.0.0'),
    artifacts: updatedArtifacts,
    selectedDirection: doc.selected_direction as string | null,
    existingReview: review,
    revision: ((doc.revision as number) ?? 0) + 1,
    status: 'revision_requested',
  }) as Record<string, unknown>;

  const checklist = (newDoc.review as { checklist: { id: string; section?: string; comment?: string; status: string }[] })
    .checklist;
  const item = checklist.find((x) => x.section === deliverableLabel || x.id.includes(key));
  if (item) {
    item.status = 'change_requested';
    item.comment = feedback;
  }
  const reviewBlock = newDoc.review as { rounds_used: number; rounds_included: number };
  reviewBlock.rounds_used = Math.min(
    ((doc.review as { rounds_used: number }).rounds_used ?? 0) + 1,
    reviewBlock.rounds_included,
  );

  const validation = validateBareframePackage(newDoc);
  if (!validation.ok) {
    throw new Error(`Package validation failed: ${validation.errors.slice(0, 5).join('; ')}`);
  }

  await updateProductPackageDocument(pool, packageId, newDoc, {
    revision: newDoc.revision as number,
    status: 'revision_requested',
  });

  return { document: newDoc };
}

export async function patchProductPackage(
  pool: pg.Pool,
  config: Config,
  userId: number,
  packageId: string,
  body: {
    selectedDirection?: string;
    status?: 'approved';
    checklist?: { id: string; status: string; comment?: string }[];
  },
) {
  const pkg = await assertPackageOwner(pool, packageId, userId);
  const doc = { ...pkg.document } as Record<string, unknown>;

  if (body.selectedDirection) {
    doc.selected_direction = body.selectedDirection;
    if (pkg.designer_project_id) {
      await applyDesignDirectionToProject(pool, pkg.designer_project_id, userId, doc, body.selectedDirection);
    }
  }
  if (body.checklist) {
    const review = doc.review as { checklist: { id: string; status: string; comment?: string }[] };
    review.checklist = review.checklist.map((item) => {
      const patch = body.checklist!.find((x) => x.id === item.id);
      return patch ? { ...item, ...patch } : item;
    });
  }
  if (body.status === 'approved') {
    doc.status = 'approved';
    const review = doc.review as Record<string, unknown>;
    review.approved_at = new Date().toISOString();
    review.approved_by = String(userId);
  }

  const shareUrl = (await resolveShareUrl(pool, config, packageId)) ?? (doc.prototype as { share_url: string }).share_url;
  (doc.prototype as { share_url: string }).share_url = shareUrl;

  const validation = validateBareframePackage(doc);
  if (!validation.ok) throw new Error(`invalid_package: ${validation.errors.join('; ')}`);

  await updateProductPackageDocument(pool, packageId, doc, { status: doc.status as string });
  return doc;
}
