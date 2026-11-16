import { apiFail } from './apiError';

export type ProjectNote = {
	id: string;
	projectId: string;
	authorUserId: number;
	where: string | null;
	body: string;
	frameId: string | null;
	nodeId: string | null;
	pageUrl: string | null;
	elementSelector: string | null;
	screenshotAssetId: string | null;
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
		where?: string | null;
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

export async function createProjectNotesBatch(
	projectId: string,
	notes: { where?: string | null; body: string; pageUrl?: string | null }[],
): Promise<ProjectNote[]> {
	const data = await parseJson<{ notes: ProjectNote[] }>(
		await fetch(`/api/projects/${projectId}/notes/batch`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ notes }),
		}),
	);
	return data.notes;
}

export async function updateProjectNote(
	projectId: string,
	noteId: string,
	input: {
		where?: string | null;
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

const ORDINAL_ISSUE = [
	'First issue:',
	'Second issue:',
	'Third issue:',
	'Fourth issue:',
	'Fifth issue:',
	'Sixth issue:',
	'Seventh issue:',
	'Eighth issue:',
	'Ninth issue:',
	'Tenth issue:',
];

export function notesToMarkdown(notes: ProjectNote[]): string {
	const sorted = [...notes].sort(
		(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
	);
	const lines: string[] = ['# Project notes', ''];
	sorted.forEach((note, i) => {
		const label = ORDINAL_ISSUE[i] ?? `Issue ${i + 1}:`;
		lines.push(label);
		if (note.where?.trim()) lines.push(`Where: ${note.where.trim()}`);
		lines.push(`Issue: ${note.body.trim()}`);
		if (note.status === 'done') lines.push('(done)');
		lines.push('');
	});
	return lines.join('\n').trimEnd();
}