import { useEffect, useRef } from 'react';
import { useDesigner } from './store';
import { shouldRunDemoReviewAutoFit } from './demoReviewCameraFitLogic';

/** Fits the demo canvas once on load. Skipped on flow maps — pan/zoom must not be reset by store updates. */
export function DemoReviewCameraFit({ useFlowMap = false }: { useFlowMap?: boolean }) {
	const { fitAll } = useDesigner();
	const fitAllRef = useRef(fitAll);
	fitAllRef.current = fitAll;

	useEffect(() => {
		if (!shouldRunDemoReviewAutoFit(useFlowMap)) return;
		const t = window.setTimeout(() => fitAllRef.current(), 120);
		return () => window.clearTimeout(t);
	}, [useFlowMap]);

	return null;
}
