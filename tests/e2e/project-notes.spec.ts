import { expect, test, type Page, type Route } from './fixtures';
import { createEmptyProjectDocument } from '../../packages/designer-core/dist/index.js';

const PROJECT_ID = 'p-notes-e2e';

type StoredNote = {
	id: string;
	body: string;
	frameId: string | null;
	status: 'open' | 'done';
};

async function mockNotesApi(page: Page) {
	let noteSeq = 0;
	const notes: StoredNote[] = [];
	let document = createEmptyProjectDocument(PROJECT_ID, 'Notes demo', 'light');
	const frame = {
		id: 'frame-home',
		name: 'Home',
		pageId: document.project.pages[0]?.id ?? 'page-1',
		x: 80,
		y: 80,
		width: 393,
		height: 852,
		ghost: false,
	};
	document.project.frames = [frame];

	await page.route('**/api/**', async (route: Route) => {
		const req = route.request();
		const p = new URL(req.url()).pathname;
		const json = (body: unknown, status = 200) =>
			route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
		if (p.endsWith('/api/healthz')) return route.fulfill({ status: 200, body: 'ok' });
		if (p.endsWith('/api/me')) {
			return json({ user: { id: 1, login: 'tester', name: 'Tester', avatarUrl: null, email: 't@example.com' } });
		}
		if (p.endsWith('/api/plan')) return json({ tier: 'free' });
		if (p === `/api/projects/${PROJECT_ID}`) {
			return json({ id: PROJECT_ID, name: 'Notes demo', version: 1, document });
		}
		if (p === `/api/projects/${PROJECT_ID}/notes` && req.method() === 'GET') {
			const url = new URL(req.url());
			const status = url.searchParams.get('status');
			const frameId = url.searchParams.get('frameId');
			let list = [...notes];
			if (status === 'open' || status === 'done') list = list.filter((n) => n.status === status);
			if (frameId) list = list.filter((n) => n.frameId === frameId);
			return json({
				notes: list.map((n) => ({
					id: n.id,
					projectId: PROJECT_ID,
					authorUserId: 1,
					body: n.body,
					frameId: n.frameId,
					nodeId: null,
					pageUrl: null,
					status: n.status,
					tags: [],
					convertedToBacklogId: null,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				})),
			});
		}
		if (p === `/api/projects/${PROJECT_ID}/notes` && req.method() === 'POST') {
			const body = (await req.postDataJSON()) as { body?: string; frameId?: string };
			const note: StoredNote = {
				id: `note-${++noteSeq}`,
				body: body.body?.trim() ?? '',
				frameId: body.frameId ?? null,
				status: 'open',
			};
			notes.unshift(note);
			return json(
				{
					note: {
						id: note.id,
						projectId: PROJECT_ID,
						authorUserId: 1,
						body: note.body,
						frameId: note.frameId,
						nodeId: null,
						pageUrl: null,
						status: note.status,
						tags: [],
						convertedToBacklogId: null,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					},
				},
				201,
			);
		}
		const patchMatch = p.match(new RegExp(`^/api/projects/${PROJECT_ID}/notes/([^/]+)$`));
		if (patchMatch && req.method() === 'PATCH') {
			const noteId = patchMatch[1];
			const patch = (await req.postDataJSON()) as { status?: 'open' | 'done' };
			const target = notes.find((n) => n.id === noteId);
			if (!target) return json({ error: 'Not found' }, 404);
			if (patch.status) target.status = patch.status;
			return json({
				note: {
					id: target.id,
					projectId: PROJECT_ID,
					authorUserId: 1,
					body: target.body,
					frameId: target.frameId,
					nodeId: null,
					pageUrl: null,
					status: target.status,
					tags: [],
					convertedToBacklogId: null,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				},
			});
		}
		if (p.endsWith('/api/projects') && req.method() === 'GET') {
			return json({ projects: [{ id: PROJECT_ID, name: 'Notes demo', version: 1 }] });
		}
		return json({ error: 'not_found' }, 404);
	});
}

test.describe('project notes panel', () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript(() => {
			localStorage.setItem('bareframe.flowMapTour.v1', JSON.stringify({ dismissed: true }));
		});
		await mockNotesApi(page);
		await page.goto(`/#/app/project/${PROJECT_ID}`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
		await expect(page.getByTestId('flow-map-workspace')).toBeVisible({ timeout: 30_000 });
	});

	test('add, filter, and complete notes', async ({ page }) => {
		await page.getByTestId('flow-notes-toggle').click();
		await expect(page.getByTestId('project-notes-panel')).toBeVisible();

		const compose = page.getByTestId('project-note-compose');
		await compose.fill('Hero CTA is below the fold');
		await page.getByTestId('project-note-add').click();
		await expect(page.getByTestId('project-note-item')).toHaveCount(1);

		await compose.fill('Footer links are stale');
		await page.getByTestId('project-note-add').click();
		await expect(page.getByTestId('project-note-item')).toHaveCount(2);

		await page.getByTestId('project-notes-filter-done').click();
		await expect(page.getByTestId('project-note-item')).toHaveCount(0);

		await page.getByTestId('project-notes-filter-open').click();
		await page.getByTestId('project-note-toggle-done').first().click();
		await page.getByTestId('project-notes-filter-done').click();
		await expect(page.getByTestId('project-note-item')).toHaveCount(1);
	});
});