const STORAGE_KEY = 'bareframe.flowMapTour.v1';

export type FlowMapTourState = {
	dismissed: boolean;
	completedAt?: string;
};

export function readFlowMapTourState(): FlowMapTourState {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { dismissed: false };
		const parsed = JSON.parse(raw) as FlowMapTourState;
		return { dismissed: Boolean(parsed.dismissed), completedAt: parsed.completedAt };
	} catch {
		return { dismissed: false };
	}
}

export function writeFlowMapTourDismissed(dismissed: boolean) {
	try {
		const prev = readFlowMapTourState();
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				...prev,
				dismissed,
				completedAt: dismissed ? new Date().toISOString() : prev.completedAt,
			} satisfies FlowMapTourState),
		);
	} catch {
		/* ignore quota / private mode */
	}
}
