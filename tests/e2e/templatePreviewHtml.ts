import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	buildScreenVariantTree,
	createEmptyProjectDocument,
	designToNodes,
	defaultNewId,
	type DesignDevice,
} from '../../packages/designer-core/dist/index.js';
import { buildFramePreviewDoc } from '../../prototype/src/designer/framePreviewDoc.ts';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const SIZES: Record<DesignDevice, { width: number; height: number }> = {
	phone: { width: 390, height: 844 },
	tablet: { width: 768, height: 1024 },
	desktop: { width: 1440, height: 900 },
};

const BUNDLE_PATH = path.join(REPO_ROOT, 'tests/e2e/templatePreviewCss.bundle.css');

/** CSS bundled on CI immediately before Playwright; committed copy keeps local runs aligned. */
export function templatePreviewCss(): string {
	return fs.readFileSync(BUNDLE_PATH, 'utf8');
}

export function deviceForPlaywrightProject(projectName: string): DesignDevice {
	if (projectName.includes('mobile')) return 'phone';
	return 'desktop';
}

export function templatePreviewSrcDoc(
	templateId: 'login' | 'register',
	variantId: string,
	device: DesignDevice,
	assetBase: string,
): string {
	const tree = buildScreenVariantTree(templateId, variantId, device);
	const rootId = defaultNewId('node');
	const pageId = defaultNewId('page');
	const doc = createEmptyProjectDocument('preview', 'Preview', 'light', { newId: defaultNewId });
	const page = designToNodes(
		{
			id: pageId,
			name: templateId,
			routePath: '/',
			rootNodeId: rootId,
			nodes: doc.project.pages[0]?.nodes ?? {},
			brief: { key: templateId, purpose: '', keyContent: [], states: ['default'] },
		},
		tree,
		defaultNewId,
	);
	const { width, height } = SIZES[device];
	return buildFramePreviewDoc({
		page,
		frameWidth: width,
		frameHeight: height,
		themeId: 'light',
		tokenOverrides: {
			'--bf-theme-font-family': 'ui-sans-serif, system-ui, sans-serif',
		},
		previewCss: templatePreviewCss(),
		selectedNodeId: null,
		assetBase,
	});
}