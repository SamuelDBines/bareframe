import type { ProjectDocument } from '@bareframe/designer-core';
import type { DesignerProject } from './types';
import {
	fromProjectDocument,
	toProjectDocument,
	type StoredLocalProject,
	loadLocalProject,
	saveLocalProject,
	clearLocalProject,
} from './localProject';

export type ApiProjectSummary = {
	id: string;
	name: string;
	version: number;
	updatedAt?: string;
};

export type RecordingRow = {
	id: string;
	name: string;
	status: string;
	created_at: string;
	expires_at: string;
	built_page_id: string | null;
};

async function parseJson<T>(res: Response): Promise<T> {
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || res.statusText);
	}
	return (await res.json()) as T;
}

export async function listProjects(): Promise<ApiProjectSummary[]> {
	const data = await parseJson<{ projects: ApiProjectSummary[] }>(
		await fetch('/api/projects', { credentials: 'include' }),
	);
	return data.projects;
}

export async function createProject(name: string): Promise<{
	id: string;
	name: string;
	version: number;
	document: ProjectDocument;
}> {
	return parseJson(
		await fetch('/api/projects', {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name }),
		}),
	);
}

export async function fetchProject(projectId: string): Promise<{
	id: string;
	name: string;
	version: number;
	document: ProjectDocument;
}> {
	return parseJson(
		await fetch(`/api/projects/${projectId}`, { credentials: 'include' }),
	);
}

export async function listRecordings(projectId: string): Promise<RecordingRow[]> {
	const data = await parseJson<{ recordings: RecordingRow[] }>(
		await fetch(`/api/projects/${projectId}/recordings`, { credentials: 'include' }),
	);
	return data.recordings;
}

export async function saveProjectDocument(
	projectId: string,
	project: DesignerProject,
	baseVersion: number,
): Promise<number> {
	const body = await parseJson<{ version: number }>(
		await fetch(`/api/projects/${projectId}/document`, {
			method: 'PUT',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ document: toProjectDocument(project), baseVersion }),
		}),
	);
	return body.version;
}

export async function migrateLocalProjectToServer(
	local: DesignerProject,
): Promise<{ id: string; version: number; project: DesignerProject }> {
	const created = await createProject(local.name || 'Imported project');
	const project = { ...local, id: created.id, name: created.name };
	const version = await saveProjectDocument(created.id, project, created.version);
	const merged = fromProjectDocument({
		schemaVersion: 1,
		project: { ...toProjectDocument(project).project, id: created.id },
	});
	return { id: created.id, version, project: merged };
}

export type ProjectTokenSummary = {
	id: string;
	name: string;
	token_prefix: string;
	scopes: string[];
	created_at: string;
	revoked_at: string | null;
	last_used_at: string | null;
};

export async function listProjectTokens(projectId: string) {
	const data = await parseJson<{ tokens: ProjectTokenSummary[] }>(
		await fetch(`/api/projects/${projectId}/tokens`, { credentials: 'include' }),
	);
	return data.tokens;
}

export async function createProjectToken(projectId: string, name: string) {
	return parseJson<{ id: string; token: string; tokenPrefix: string; scopes: string[] }>(
		await fetch(`/api/projects/${projectId}/tokens`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name }),
		}),
	);
}

export async function revokeProjectToken(projectId: string, tokenId: string) {
	await parseJson(
		await fetch(`/api/projects/${projectId}/tokens/${tokenId}`, {
			method: 'DELETE',
			credentials: 'include' },
		),
	);
}

export function subscribeProjectEvents(projectId: string, onUpdate: (version: number) => void) {
	const source = new EventSource(`/api/projects/${projectId}/events`, { withCredentials: true });
	source.onmessage = (ev) => {
		try {
			const data = JSON.parse(ev.data) as { type?: string; version?: number };
			if (data.type === 'project_updated' && data.version != null) onUpdate(data.version);
		} catch {
			/* ignore */
		}
	};
	return () => source.close();
}

export {
	fromProjectDocument,
	toProjectDocument,
	loadLocalProject,
	saveLocalProject,
	clearLocalProject,
	type StoredLocalProject,
};
