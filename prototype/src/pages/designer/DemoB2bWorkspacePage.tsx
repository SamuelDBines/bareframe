import { buildDemoB2bWorkspaceProject } from '../../designer/demoProjects/demoB2bWorkspaceProject';
import { DemoFlowMapExamplePage } from './DemoFlowMapExamplePage';

export function DemoB2bWorkspacePage() {
	return (
		<DemoFlowMapExamplePage
			title="LatticeDesk workspace & approvals"
			lead="Admin SSO through IT provisioning: invites, purchase requests, manager decisions, appeals, and provisioning — sample Acme Robotics data only."
			buildProject={buildDemoB2bWorkspaceProject}
		/>
	);
}
