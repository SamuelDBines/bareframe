import { buildDemoMarketplaceFulfilmentProject } from '../../designer/demoProjects/demoMarketplaceFulfilmentProject';
import { DemoFlowMapExamplePage } from './DemoFlowMapExamplePage';

export function DemoMarketplaceFulfilmentPage() {
	return (
		<DemoFlowMapExamplePage
			title="Marketplace purchase → return"
			lead="Twenty-one screens from browse through payment decline/retry, seller fulfilment, delivery issue, return label, refund, and seller closure — fictional Arbor Market listings."
			buildProject={buildDemoMarketplaceFulfilmentProject}
		/>
	);
}
