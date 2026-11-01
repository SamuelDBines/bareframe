import { useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
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

type Props = {
	projectId?: string;
};

export function DesignerCloudSync({ projectId }: Props) {
	const { status } = useAuth();
	const { state, dispatch } = useDesigner();
	const versionRef = useRef(1);
	const savingRef = useRef(false);
	const mode = status === 'authenticated' && projectId ? 'cloud' : 'local';

	useEffect(() => {
		let cancelled = false;
		(async () => {
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
	}, [dispatch, mode, projectId]);

	useEffect(() => {
		if (mode !== 'cloud' || !projectId) return;
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
	}, [dispatch, mode, projectId]);

	useEffect(() => {
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
	}, [mode, projectId, state.project, state.historyIndex]);

	return null;
}