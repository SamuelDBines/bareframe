import { apiFail } from './apiError';

export type ProjectNote = {
	id: string;
	projectId: string;
	authorUserId: number;
	body: string;
	frameId: string | null;
	nodeId: string | null;
	pageUrl: string | null;
	status: 'open' | 'done';
	tags: string[];
	convertedToBacklogId: string | null;
	createdAt: string;
	updatedAt: string;
};

export type ListNotesParams = {
	status?: 'open' | 'done' | 'all';
	frameId?: string;
	tag?: string;
	q?: string;
};

async function parseJson<T>(res: Response): Promise<T> {
	if (!res.ok) await apiFail(res, 'Request failed');
	return (await res.json()) as T;
}

function queryString(params: ListNotesParams): string {
	const q = new URLSearchParams();
	if (params.status && params.status !== 'all') q.set('status', params.status);
	if (params.frameId) q.set('frameId', params.frameId);
	if (params.tag) q.set('tag', params.tag);
	if (params.q) q.set('q', params.q);
	const s = q.toString();
	return s ? `?${s}` : '';
}

export async function listProjectNotes(projectId: string, params: ListNotesParams = {}): Promise<ProjectNote[]> {
	const data = await parseJson<{ notes: ProjectNote[] }>(
		await fetch(`/api/projects/${projectId}/notes${queryString(params)}`, { credentials: 'include' }),
	);
	return data.notes;
}

export async function createProjectNote(
	projectId: string,
	input: {
		body: string;
		frameId?: string | null;
		nodeId?: string | null;
		pageUrl?: string | null;
		tags?: string[];
	},
): Promise<ProjectNote> {
	const data = await parseJson<{ note: ProjectNote }>(
		await fetch(`/api/projects/${projectId}/notes`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		}),
	);
	return data.note;
}

export async function updateProjectNote(
	projectId: string,
	noteId: string,
	input: {
		body?: string;
		frameId?: string | null;
		nodeId?: string | null;
		pageUrl?: string | null;
		status?: 'open' | 'done';
		tags?: string[];
	},
): Promise<ProjectNote> {
	const data = await parseJson<{ note: ProjectNote }>(
		await fetch(`/api/projects/${projectId}/notes/${noteId}`, {
			method: 'PATCH',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		}),
	);
	return data.note;
}

export async function deleteProjectNote(projectId: string, noteId: string): Promise<void> {
	await parseJson(
		await fetch(`/api/projects/${projectId}/notes/${noteId}`, {
			method: 'DELETE',
			credentials: 'include',
		}),
	);
}

export function notesToMarkdown(notes: ProjectNote[], frameNames: Map<string, string>): string {
	const lines: string[] = ['# Project notes', ''];
	for (const note of notes) {
		const status = note.status === 'done' ? '[done]' : '[open]';
		const pin = note.frameId
			? ` (${frameNames.get(note.frameId) ?? note.frameId})`
			: note.pageUrl
				? ` (${note.pageUrl})`
				: '';
		lines.push(`- ${status}${pin} ${note.body.replace(/\n/g, ' ')}`);
	}
	return lines.join('\n');
}