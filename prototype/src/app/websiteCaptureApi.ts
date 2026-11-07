async function parseJson<T>(res: Response): Promise<T> {
	if (!res.ok) {
		const data = (await res.json().catch(() => ({}))) as { message?: string };
		throw new Error(data.message ?? res.statusText);
	}
	return (await res.json()) as T;
}

export type WebsiteCaptureSetup = {
	tokenId: string;
	token: string;
	tokenPrefix: string;
	allowedOrigin: string;
	websiteUrl: string;
	ingestUrl: string;
	scopes: string[];
};

export async function setupWebsiteCapture(projectId: string, websiteUrl: string) {
	return parseJson<WebsiteCaptureSetup>(
		await fetch(`/api/projects/${projectId}/website-capture/setup`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ websiteUrl }),
		}),
	);
}

export type WebsiteCaptureStatus = {
	setupOrigin: string | null;
	setupUrl: string | null;
	flowPageId: string | null;
	eventCount: number;
	distinctUrlCount: number;
	screenshotCount: number;
	lastCapturedAt: string | null;
	captureTokens: { id: string; prefix: string; revoked: boolean }[];
};

export async function fetchWebsiteCaptureStatus(projectId: string) {
	return parseJson<WebsiteCaptureStatus>(
		await fetch(`/api/projects/${projectId}/website-capture/status`, {
			credentials: 'include',
		}),
	);
}

export type InstallPrPreview = {
	simulated: boolean;
	message: string;
	repo: string;
	baseBranch: string;
	files: { path: string; changeType: string; patch: string }[];
	requiredGitHubScopes: string[];
	githubAppConnected: boolean;
};

export async function previewInstallPr(
	projectId: string,
	body: { repo: string; branch: string; filePath?: string; snippetHtml: string },
) {
	return parseJson<InstallPrPreview>(
		await fetch(`/api/projects/${projectId}/website-capture/install-pr/preview`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		}),
	);
}
