export type CaptureEventRow = {
	url: string;
	title: string | null;
	asset_id: string | null;
	navigated_from: string | null;
	clicked_selector: string | null;
};

export type CaptureShot = {
	assetId: string;
	title?: string;
	url: string;
};

export type CaptureLink = {
	fromAssetId: string;
	toAssetId: string;
	label?: string;
	trigger?: string;
};

/** Latest event per URL wins; edges map navigatedFrom URL → url. */
export function mapCaptureEventsToFlow(
	events: CaptureEventRow[],
): { shots: CaptureShot[]; links: CaptureLink[] } {
	const latestByUrl = new Map<string, CaptureEventRow>();
	for (const ev of events) {
		if (!ev.asset_id) continue;
		latestByUrl.set(ev.url, ev);
	}

	const urlToAsset = new Map<string, string>();
	const shots: CaptureShot[] = [];
	for (const [url, ev] of latestByUrl) {
		const assetId = ev.asset_id!;
		urlToAsset.set(url, assetId);
		shots.push({
			assetId,
			url,
			title: ev.title?.trim() || url,
		});
	}

	const linkKeys = new Set<string>();
	const links: CaptureLink[] = [];
	for (const ev of events) {
		if (!ev.navigated_from || !ev.asset_id) continue;
		const fromAsset = urlToAsset.get(ev.navigated_from);
		const toAsset = urlToAsset.get(ev.url);
		if (!fromAsset || !toAsset || fromAsset === toAsset) continue;
		const key = `${fromAsset}:${toAsset}`;
		if (linkKeys.has(key)) continue;
		linkKeys.add(key);
		links.push({
			fromAssetId: fromAsset,
			toAssetId: toAsset,
			label: ev.clicked_selector ?? 'Navigate',
			trigger: 'click',
		});
	}

	return { shots, links };
}
