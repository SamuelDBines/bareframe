import { useCallback, useRef, useState } from 'react';
import type { DesignDevice, ProjectDocument } from '@bareframe/designer-core';
import { ApiError, apiFail, friendlyError } from '../../app/apiError';
import { useReview } from '../../app/ReviewContext';
import { fetchProject, fromProjectDocument } from '../projectApi';
import { useDesigner } from '../store';
import type { Frame } from '../types';

export type ScreenDesignResult = {
	version: number;
	document: ProjectDocument;
	design: { device: DesignDevice; states: string[]; repairs: string[] };
};

export async function generateScreenDesign(
	projectId: string,
	pageId: string,
	body: { baseVersion: number; device: DesignDevice },
	signal?: AbortSignal,
): Promise<ScreenDesignResult> {
	const res = await fetch(`/api/projects/${projectId}/screens/${pageId}/design`, {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
		signal,
	});
	if (!res.ok) await apiFail(res, 'We couldn’t design that screen');
	return (await res.json()) as ScreenDesignResult;
}

function designErrorMessage(e: unknown): string {
	if (e instanceof ApiError && (e.code === 'design_invalid' || e.code === 'llm_failed') && e.serverMessage) {
		return e.serverMessage;
	}
	if (e instanceof ApiError && e.status === 409) return 'This project changed while designing. Try again.';
	return friendlyError(e, 'We couldn’t design that screen. Please try again.');
}

export type DesignQueueState = {
	running: boolean;
	total: number;
	done: number;
	currentFrameId: string | null;
	currentName: string | null;
	message: string | null;
	error: string | null;
};

const IDLE: DesignQueueState = {
	running: false,
	total: 0,
	done: 0,
	currentFrameId: null,
	currentName: null,
	message: null,
	error: null,
};

/**
 * Designs screens one at a time (a single screen is a queue of one). Each result is loaded onto
 * the canvas as it lands; Cancel stops after aborting the request in flight. When at least one
 * screen was designed, the project's AI review runs so its flags appear on the map.
 */
export function useDesignQueue(projectId: string | undefined) {
	const { state, dispatch } = useDesigner();
	const review = useReview();
	const [queue, setQueue] = useState<DesignQueueState>(IDLE);
	const abortRef = useRef<AbortController | null>(null);
	const cancelledRef = useRef(false);

	const run = useCallback(
		async (frames: Frame[], device: DesignDevice) => {
			if (!projectId || frames.length === 0 || abortRef.current) return;
			cancelledRef.current = false;
			setQueue({ ...IDLE, running: true, total: frames.length });
			let designed = 0;
			let error: string | null = null;
			let version: number | null = null;
			for (const [index, frame] of frames.entries()) {
				if (cancelledRef.current) break;
				setQueue((q) => ({ ...q, done: index, currentFrameId: frame.id, currentName: frame.name }));
				const controller = new AbortController();
				abortRef.current = controller;
				try {
					version ??= (await fetchProject(projectId)).version;
					const result = await generateScreenDesign(projectId, frame.pageId, { baseVersion: version, device }, controller.signal);
					version = result.version;
					designed += 1;
					dispatch({ type: 'hydrateProject', project: fromProjectDocument(result.document), remoteVersion: result.version });
				} catch (e) {
					if (controller.signal.aborted) break;
					error = designErrorMessage(e);
					break;
				} finally {
					abortRef.current = null;
				}
			}
			const cancelled = cancelledRef.current;
			const parts = [`Designed ${designed} of ${frames.length} screen${frames.length === 1 ? '' : 's'}`];
			if (cancelled) parts.push('Cancelled');
			const reviewing = designed > 0 && review && !review.demo && !review.aiUnavailable;
			if (reviewing) parts.push('Running a UX review');
			setQueue({ ...IDLE, message: `${parts.join('. ')}.`, error });
			if (reviewing) void review.runReview();
		},
		[dispatch, projectId, review],
	);

	const cancel = useCallback(() => {
		cancelledRef.current = true;
		abortRef.current?.abort();
	}, []);

	const designable = state.project.frames.filter((f) => !f.ghost && state.project.pages.some((p) => p.id === f.pageId));

	return {
		queue,
		designOne: (frame: Frame, device: DesignDevice) => run([frame], device),
		designAll: (device: DesignDevice) => run(designable, device),
		cancel,
		dismiss: () => setQueue(IDLE),
	};
}
