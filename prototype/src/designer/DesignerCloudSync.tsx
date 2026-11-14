import { useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { buildDemoReviewProject } from './demoReviewProject';
import {
	fetchProject,
	fromProjectDocument,
	saveLocalProject,
	saveProjectDocument,
	subscribeProjectEvents,
	toProjectDocument,
	loadLocalProject,
} from './projectApi';
import { useDesigner } from './store';
import type { ProjectDocument } from '@bareframe/designer-core';

type Props = {
	projectId?: string;
	readOnly?: boolean;
	demoReview?: boolean;
	initialDocument?: ProjectDocument | null;
};

export function DesignerCloudSync({
	projectId,
	readOnly,
	demoReview,
	initialDocument,
}: Props) {
	const { status } = useAuth();
	const { state, dispatch } = useDesigner();
	const versionRef = useRef(1);
	const savingRef = useRef(false);
	const mode =
		readOnly || demoReview
			? 'static'
			: status === 'authenticated' && projectId
				? 'cloud'
				: 'local';

	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (demoReview) {
				const demo = buildDemoReviewProject();
				if (!cancelled) {
					dispatch({ type: 'hydrateProject', project: demo });
				}
				return;
			}
			if (initialDocument) {
				if (!cancelled) {
					dispatch({ type: 'hydrateProject', project: fromProjectDocument(initialDocument) });
				}
				return;
			}
			if (mode === 'cloud' && projectId) {
				try {
					const remote = await fetchProject(projectId);
					if (cancelled) return;
					versionRef.current = remote.version;
					dispatch({ type: 'hydrateProject', project: fromProjectDocument(remote.document) });
				} catch (err) {
					console.error('Failed to load cloud project', err);
				}
				return;
			}
			const local = loadLocalProject();
			if (local && !cancelled) {
				versionRef.current = local.version;
				dispatch({ type: 'hydrateProject', project: fromProjectDocument(local.document) });
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [dispatch, demoReview, initialDocument, mode, projectId]);

	useEffect(() => {
		if (mode !== 'cloud' || !projectId || readOnly) return;
		return subscribeProjectEvents(projectId, async (version) => {
			if (version === versionRef.current || savingRef.current) return;
			try {
				const remote = await fetchProject(projectId);
				versionRef.current = remote.version;
				dispatch({ type: 'hydrateProject', project: fromProjectDocument(remote.document) });
			} catch (err) {
				console.error('Live sync refresh failed', err);
			}
		});
	}, [dispatch, mode, projectId, readOnly]);

	// A document the server just wrote (AI flow generation) is already saved: adopt its version.
	useEffect(() => {
		if (state.remote && state.remote.version > versionRef.current) versionRef.current = state.remote.version;
	}, [state.remote]);

	useEffect(() => {
		if (readOnly || demoReview || mode === 'static') return;
		if (state.remote?.project === state.project) return;
		const timer = window.setTimeout(async () => {
			if (mode === 'cloud' && projectId) {
				if (savingRef.current) return;
				savingRef.current = true;
				try {
					const next = await saveProjectDocument(
						projectId,
						state.project,
						versionRef.current,
					);
					versionRef.current = next;
				} catch (err) {
					console.error('Cloud save failed', err);
				} finally {
					savingRef.current = false;
				}
				return;
			}
			saveLocalProject(toProjectDocument(state.project), versionRef.current);
		}, 800);
		return () => window.clearTimeout(timer);
	}, [demoReview, mode, projectId, readOnly, state.project, state.historyIndex, state.remote]);

	return null;
}