import { buildDemoCommerceBookingProject } from '../../designer/demoCommerceBookingProject';
import { DemoFlowMapExamplePage } from './DemoFlowMapExamplePage';

export function DemoCommerceBookingPage() {
	return (
		<DemoFlowMapExamplePage
			title="Studio booking with retries"
			lead="Guest vs account paths, payment, confirmation, and a loop when a hot slot disappears. Pan the map — your viewport stays put until you click Fit."
			buildProject={buildDemoCommerceBookingProject}
		/>
	);
}
