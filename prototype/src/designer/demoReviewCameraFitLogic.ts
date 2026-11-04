/** Hookoh journey review uses the flow map; legacy auto-fit targeted the single-frame canvas. */
export function shouldRunDemoReviewAutoFit(useFlowMap: boolean): boolean {
	return !useFlowMap;
}
