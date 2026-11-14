import { expect, test } from '@playwright/test';
import {
	applyFlowSpec,
	createEmptyProjectDocument,
	designToNodes,
	repairFlowSpec,
	type ProjectDocument,
} from '../../packages/designer-core/dist/index.js';

const PROJECT_ID = 'p-proto-link';
let idSeq = 0;
const newId = (prefix: string) => `${prefix}-e2e-${++idSeq}`;

const AI_FLOW = {
	screens: [
		{ id: 'home', name: 'Home', purpose: 'Start', keyContent: ['CTA'], states: ['default'] },
		{ id: 'next', name: 'Next', purpose: 'Step two', keyContent: [], states: ['default'] },
	],
	connections: [{ from: 'home', to: 'next', trigger: 'Continue' }],
};

test('linking a button navigates in prototype and share ?play=1 opens player', async ({ page }) => {
	let document: ProjectDocument = createEmptyProjectDocument(PROJECT_ID, 'Link test', 'light', { newId });
	const { spec } = repairFlowSpec(AI_FLOW);
	document = applyFlowSpec(document, spec, { platform: 'mobile', description: 'Test app', newId }).document;
	const homePage = document.project.pages[0]!;
	document.project.pages[0] = designToNodes(
		homePage,
		{
			type: 'stack',
			gap: 12,
			children: [{ type: 'button', props: { label: 'Continue', variant: 'primary' } }],
		},
		newId,
	);
	const homeFrame = document.project.frames.find((f) => f.pageId === homePage.id)!;
	const btn = Object.values(document.project.pages[0]!.nodes).find(
		(n) => n.type === 'instance' && n.instance?.definitionId === 'button',
	)!;
	const conn = document.project.connectors.find((c) => c.fromFrameId === homeFrame.id);
	expect(conn).toBeTruthy();
	conn!.fromNodeId = btn.id;

	let version = 1;
	const shareToken = 'share-test-token';

	await page.route('**/api/**', async (route) => {
		const p = new URL(route.request().url()).pathname;
		const json = (body: unknown, status = 200) =>
			route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
		if (p.endsWith('/api/share/share-test-token')) {
			return json({ document, readOnly: true });
		}
		if (p.includes(`/api/projects/${PROJECT_ID}`)) {
			return json({ id: PROJECT_ID, name: 'Link test', version, document });
		}
		return json({});
	});

	await page.goto(`/#/share/${shareToken}?play=1`);
	await expect(page.getByTestId('share-play-layout')).toBeVisible({ timeout: 15_000 });
	await expect(page.getByTestId('prototype-player')).toBeVisible();
	const iframe = page.getByTestId('prototype-player').frameLocator('iframe.frame-preview-iframe');
	await expect(iframe.getByRole('button', { name: 'Continue' })).toBeVisible({ timeout: 15_000 });
	await iframe.getByRole('button', { name: 'Continue' }).click();
	await expect(page.getByText(/Next · step 2/i)).toBeVisible({ timeout: 10_000 });
});