import { buildDemoMarketplaceFulfilmentProject } from '../../designer/demoProjects/demoMarketplaceFulfilmentProject';
import { DemoFlowMapExamplePage } from './DemoFlowMapExamplePage';

export function DemoMarketplaceFulfilmentPage() {
	return (
		<DemoFlowMapExamplePage
			title="Arbor Market purchase to return"
			lead="Browse through payment recovery, seller fulfilment, delivery issues, returns, and refunds — fictional Arbor Market listings only."
			buildProject={buildDemoMarketplaceFulfilmentProject}
		/>
	);
}
