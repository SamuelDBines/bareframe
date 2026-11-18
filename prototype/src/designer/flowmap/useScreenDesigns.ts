import { useEffect, useState } from 'react';
import type { DesignDevice, DesignSpec } from '@bareframe/designer-core';

export type ScreenDesignRow = {
	screenKey: string;
	device: DesignDevice;
	spec: DesignSpec;
	repairs: string[];
};

export function useScreenDesigns(projectId: string | undefined) {
	const [byKey, setByKey] = useState<Map<string, DesignSpec>>(new Map());
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		if (!projectId) {
			setByKey(new Map());
			setLoaded(false);
			return;
		}
		let cancelled = false;
		setLoaded(false);
		void (async () => {
			try {
				const res = await fetch(`/api/projects/${projectId}/screen-designs`, { credentials: 'include' });
				if (!res.ok) return;
				const data = (await res.json()) as { designs: ScreenDesignRow[] };
				if (cancelled) return;
				const next = new Map<string, DesignSpec>();
				for (const row of data.designs ?? []) {
					next.set(`${row.screenKey}:${row.device}`, row.spec);
				}
				setByKey(next);
			} catch {
				/* ignore */
			} finally {
				if (!cancelled) setLoaded(true);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [projectId]);

	return { designsByKey: byKey, designsLoaded: loaded, mergeDesigns: (rows: ScreenDesignRow[]) => {
		setByKey((prev) => {
			const next = new Map(prev);
			for (const row of rows) next.set(`${row.screenKey}:${row.device}`, row.spec);
			return next;
		});
	} };
}