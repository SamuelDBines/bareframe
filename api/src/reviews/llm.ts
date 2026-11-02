import { createOpenAiCompatibleAdapter } from '@bareframe/package-generator';
import type { ProjectDocument } from '@bareframe/designer-core';
import type { Config } from '../config.js';
import type { ReviewIssue, ReviewLlmAdapter } from './process-review.js';

const REVIEW_SYSTEM = `You are a senior UX reviewer for Bareframe journey maps.
Analyze the project summary and return actionable issues only — no filler.
Categories (use exactly these values):
- ux_problem — confusing UX or unclear hierarchy
- missing_state — missing empty, error, loading, or edge-case screens
- drop_off_estimate — likely drop-off (label as estimate; no analytics claims)
- accessibility — WCAG 2.2 AA concerns
- design_consistency — deviation from @bareframe/react patterns
- alternative_solution — suggest a fix; optional previewHint component slug

Severity: critical | major | minor | info.
Prefer frameId from the summary when the issue is screen-specific.`;

const ISSUES_SCHEMA = `{
  "issues": [
    {
      "category": "ux_problem",
      "severity": "major",
      "title": "string",
      "explanation": "string",
      "fix": "string",
      "frameId": "optional frame id from summary",
      "previewHint": "optional @bareframe/react slug"
    }
  ]
}`;

function summarizeProject(document: ProjectDocument): string {
  const { project } = document;
  const frames = project.frames
    .filter((f) => !f.ghost)
    .map((f) => `- ${f.id}: "${f.name}" (${f.devicePresetId}) page=${f.pageId}`)
    .join('\n');
  const pages = project.pages.map((p) => `- ${p.id}: "${p.name}" route=${p.routePath ?? '/'} `).join('\n');
  const connectors =
    project.connectors?.map((c) => `- ${c.fromFrameId} → ${c.toFrameId}${c.label ? ` (${c.label})` : ''}`).join('\n') ||
    '(none)';
  return `Pages:\n${pages}\n\nFrames:\n${frames}\n\nConnectors:\n${connectors}`;
}

export function createOpenAiCompatibleReviewLlm(
  config: Config,
  project: ProjectDocument,
): ReviewLlmAdapter {
  if (!config.llmApiKey || !config.llmBaseUrl || !config.llmModel) {
    throw new Error('LLM is not configured. Set LLM_API_BASE_URL, LLM_API_KEY, and LLM_MODEL.');
  }
  const adapter = createOpenAiCompatibleAdapter({
    baseUrl: config.llmBaseUrl,
    apiKey: config.llmApiKey,
    model: config.llmModel,
  });
  const summary = summarizeProject(project);

  return {
    async completeJson<T>(input: { projectName: string; frameCount: number; pageCount: number }) {
      const user = `Project name: ${input.projectName}
Screen count: ${input.frameCount}
Page count: ${input.pageCount}

${summary}

Return 4–10 issues covering multiple categories where relevant.`;
      const result = await adapter.completeJson<{ issues: ReviewIssue[] }>({
        stage: 'prototype',
        system: REVIEW_SYSTEM,
        user,
        schemaHint: ISSUES_SCHEMA,
      });
      return result as T;
    },
  };
}
