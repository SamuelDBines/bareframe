import { useCallback, useState } from 'react';
import type { FlowPlatform, ProjectDocument } from '@bareframe/designer-core';
import { ApiError, apiFail, friendlyError } from '../../app/apiError';
import { fetchProject, fromProjectDocument } from '../projectApi';
import { useDesigner } from '../store';

export type GenerateFlowResult = {
	version: number;
	document: ProjectDocument;
	screens: number;
	connections: number;
	refined: boolean;
	repairs: string[];
};

export async function generateFlow(
	projectId: string,
	body: { baseVersion: number; description?: string; platform?: FlowPlatform; instruction?: string },
): Promise<GenerateFlowResult> {
	const res = await fetch(`/api/projects/${projectId}/flow/generate`, {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
	if (!res.ok) await apiFail(res, 'We couldn’t map your flow');
	return (await res.json()) as GenerateFlowResult;
}

/** Messages the server writes for people (bad AI output, AI timeouts) are shown as-is. */
function flowErrorMessage(e: unknown): string {
	if (e instanceof ApiError && (e.code === 'flow_invalid' || e.code === 'llm_failed') && e.serverMessage) {
		return e.serverMessage;
	}
	if (e instanceof ApiError && e.status === 409) {
		return 'This project changed while the flow was being mapped. Try again.';
	}
	return friendlyError(e, 'We couldn’t map your flow. Please try again.');
}

/** Generate or refine the flow, then load the saved document onto the canvas. */
export function useGenerateFlow(projectId: string | undefined) {
	const { dispatch } = useDesigner();
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const run = useCallback(
		async (input: { description?: string; platform?: FlowPlatform; instruction?: string }) => {
			if (!projectId) return null;
			setBusy(true);
			setError(null);
			try {
				const current = await fetchProject(projectId);
				const result = await generateFlow(projectId, { baseVersion: current.version, ...input });
				dispatch({
					type: 'hydrateProject',
					project: fromProjectDocument(result.document),
					remoteVersion: result.version,
				});
				return result;
			} catch (e) {
				setError(flowErrorMessage(e));
				return null;
			} finally {
				setBusy(false);
			}
		},
		[dispatch, projectId],
	);

	return { run, busy, error, clearError: () => setError(null) };
}

export function flowResultMessage(result: GenerateFlowResult): string {
	const base = `${result.refined ? 'Updated the flow' : 'Mapped'}: ${result.screens} screen${result.screens === 1 ? '' : 's'}, ${result.connections} link${result.connections === 1 ? '' : 's'}`;
	return result.repairs.length ? `${base}. Fixed ${result.repairs.length} problem${result.repairs.length === 1 ? '' : 's'} in the AI’s answer.` : `${base}.`;
}
