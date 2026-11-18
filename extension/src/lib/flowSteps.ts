export type CaptureClick = {
	x: number;
	y: number;
	w?: number;
	h?: number;
	selector?: string;
	role?: string;
	name?: string;
	text?: string;
};

export type RecordedStep = {
	url: string;
	title: string;
	capturedAt: string;
	viewport: { width: number; height: number; devicePixelRatio?: number };
	click?: CaptureClick;
	dataUrl?: string;
};

export function normalizePageUrl(url: string): string {
	try {
		const u = new URL(url);
		u.hash = u.hash || '';
		return u.toString();
	} catch {
		return url.trim();
	}
}

/** Drop duplicate URLs when uploading, but keep first occurrence order. */
export function dedupeStepsForUpload(steps: RecordedStep[]): RecordedStep[] {
	const seen = new Set<string>();
	const out: RecordedStep[] = [];
	for (const step of steps) {
		const key = normalizePageUrl(step.url);
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(step);
	}
	return out;
}

export function normalizeCaptureClick(click?: CaptureClick): CaptureClick | undefined {
	if (!click) return undefined;
	if (!Number.isFinite(click.x) || !Number.isFinite(click.y)) return undefined;
	return {
		...click,
		w: Number.isFinite(click.w) ? click.w : undefined,
		h: Number.isFinite(click.h) ? click.h : undefined,
	};
}

export function stepsToCapturePayload(steps: RecordedStep[]): {
	stepIndex: number;
	url: string;
	title?: string;
	capturedAt: string;
	viewport: RecordedStep['viewport'];
	click?: CaptureClick;
	imageBase64?: string;
	contentType: string;
}[] {
	return steps.map((step, stepIndex) => ({
		stepIndex,
		url: normalizePageUrl(step.url),
		title: step.title,
		capturedAt: step.capturedAt,
		viewport: step.viewport,
		click: normalizeCaptureClick(step.click),
		contentType: 'image/png',
	}));
}