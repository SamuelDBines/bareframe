import type pg from 'pg';
import {
  assembleBareframePackage,
  buildDesignerProjectDocument,
  createFixtureLlmAdapter,
  createOpenAiCompatibleAdapter,
  runPipelineStages,
} from '@bareframe/package-generator';
import { normalizeIntake, validateBareframePackage, type IntakePayload } from '@bareframe/package-contracts';
import type { Config } from '../config.js';
import { isValidComponentSlug } from '../catalog/components.js';
import { createProject, replaceProjectDocument } from '../db/projects.js';
import {
  incrementUsage,
  insertProductPackage,
  mintShareToken,
  updatePackageJob,
} from '../db/packages.js';
import { publishPackageJobEvent } from './events.js';

function projectNameFromIntake(intake: IntakePayload): string {
  const firstLine = intake.idea.split(/[.!?\n]/)[0]?.trim() || 'New product';
  return firstLine.length > 60 ? `${firstLine.slice(0, 57)}…` : firstLine;
}

export function createPackageLlm(config: Config, intake: IntakePayload, projectName: string) {
  if (config.llmAdapter === 'fixture') {
    return createFixtureLlmAdapter(intake, projectName);
  }
  if (!config.llmApiKey || !config.llmBaseUrl || !config.llmModel) {
    throw new Error('LLM is not configured. Set LLM_API_BASE_URL, LLM_API_KEY, and LLM_MODEL.');
  }
  return createOpenAiCompatibleAdapter({
    baseUrl: config.llmBaseUrl,
    apiKey: config.llmApiKey,
    model: config.llmModel,
  });
}

function createLlm(config: Config, intake: IntakePayload, projectName: string) {
  return createPackageLlm(config, intake, projectName);
}

export async function processPackageGenerationJob(
  pool: pg.Pool,
  config: Config,
  jobId: string,
  userId: number,
  rawIntake: {
    idea: string;
    audience: string;
    constraints?: string[];
    references?: { url: string; note?: string }[];
    answers?: Record<string, string | null | undefined>;
  },
) {
  const intake = normalizeIntake(rawIntake);
  const projectName = projectNameFromIntake(intake);

  try {
    await updatePackageJob(pool, jobId, { status: 'running', stage: 'starting' });
    publishPackageJobEvent(jobId, { type: 'job_updated', status: 'running', stage: 'starting' });

    const llm = createLlm(config, intake, projectName);
    const artifacts = await runPipelineStages(llm, {
      intake,
      projectName,
      onProgress: (p) => {
        void updatePackageJob(pool, jobId, {
          stage: p.stage,
          progress: { index: p.index, total: p.total, label: p.label },
        });
        publishPackageJobEvent(jobId, {
          type: 'progress',
          stage: p.stage,
          label: p.label,
          index: p.index,
          total: p.total,
        });
      },
    });

    const direction =
      (artifacts.design_options[0] as { id?: string; bareframe_theme?: { base_theme?: string } }) ?? {};
    const themeId = direction.bareframe_theme?.base_theme ?? 'simple';

    const copyByScreen = new Map<string, { key: string; text: string }[]>();
    for (const block of artifacts.copy as { screen_id: string; blocks: { key: string; text: string }[] }[]) {
      copyByScreen.set(block.screen_id, block.blocks);
    }

    const created = await createProject(pool, userId, `${projectName} prototype`, themeId);
    const designerDoc = buildDesignerProjectDocument({
      projectId: created.id,
      projectName,
      themeId,
      screens: artifacts.screens,
      journeys: artifacts.journeys,
      copyByScreen,
      isValidComponentSlug,
    });

    await replaceProjectDocument(pool, created.id, userId, designerDoc, created.version);

    const { token: shareToken } = mintShareToken();

    const pkg = assembleBareframePackage({
      intake,
      projectName,
      designerProjectId: created.id,
      shareUrl: `${config.designerPublicUrl}/#/share/${shareToken}`,
      libraryVersion: '0.0.0',
      artifacts,
      selectedDirection: direction.id ?? null,
    });

    const validation = validateBareframePackage(pkg);
    if (!validation.ok) {
      throw new Error(`Package validation failed: ${validation.errors.slice(0, 5).join('; ')}`);
    }

    const packageId = await insertProductPackage(
      pool,
      userId,
      projectName,
      pkg as Record<string, unknown>,
      created.id,
      shareToken,
    );
    await incrementUsage(pool, userId);

    const docRecord = pkg as Record<string, unknown>;
    (docRecord.prototype as { share_url: string }).share_url = `${config.designerPublicUrl}/#/share/${shareToken}`;
    await pool.query(`UPDATE product_packages SET document = $2 WHERE id = $1`, [
      packageId,
      JSON.stringify(docRecord),
    ]);

    await updatePackageJob(pool, jobId, {
      status: 'completed',
      package_id: packageId,
      stage: 'done',
      progress: { index: 1, total: 1, label: 'Complete' },
    });
    publishPackageJobEvent(jobId, { type: 'completed', packageId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed';
    await updatePackageJob(pool, jobId, { status: 'failed', error_message: message, stage: 'failed' });
    publishPackageJobEvent(jobId, { type: 'failed', error: message });
  }
}
