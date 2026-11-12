export type WebsiteImportMethod = 'capture' | 'github-pr' | 'server-crawl' | 'server-sitemap';

export type WebsiteImportWizardState = {
	v: 1;
	step: number;
	method: WebsiteImportMethod | null;
	screenshots: boolean;
	privacyAcknowledged: boolean;
	repo: string;
	branch: string;
	filePath: string;
	tokenIssued: boolean;
};

export const WIZARD_STEPS = ['Choose method', 'Configure', 'Install & verify', 'Review'] as const;

export function wizardStorageKey(projectId: string): string {
	return `bf_website_import_${projectId}`;
}

export function defaultWizardState(): WebsiteImportWizardState {
	return {
		v: 1,
		step: 0,
		method: null,
		screenshots: false,
		privacyAcknowledged: false,
		repo: '',
		branch: 'main',
		filePath: 'src/index.html',
		tokenIssued: false,
	};
}

export function loadWizardState(projectId: string): WebsiteImportWizardState {
	try {
		const raw = sessionStorage.getItem(wizardStorageKey(projectId));
		if (!raw) return defaultWizardState();
		const parsed = JSON.parse(raw) as WebsiteImportWizardState;
		if (parsed.v !== 1) return defaultWizardState();
		return { ...defaultWizardState(), ...parsed };
	} catch {
		return defaultWizardState();
	}
}

export function saveWizardState(projectId: string, state: WebsiteImportWizardState): void {
	sessionStorage.setItem(wizardStorageKey(projectId), JSON.stringify(state));
}

export function maxStepForMethod(method: WebsiteImportMethod | null): number {
	if (!method) return 0;
	if (method === 'server-crawl' || method === 'server-sitemap') return 2;
	return WIZARD_STEPS.length - 1;
}

export function reviewStepIndex(method: WebsiteImportMethod | null): number {
	if (method === 'server-crawl' || method === 'server-sitemap') return 2;
	return 3;
}
