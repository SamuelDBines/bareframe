import { buildDemoB2bWorkspaceProject } from '../../designer/demoProjects/demoB2bWorkspaceProject';
import { DemoFlowMapExamplePage } from './DemoFlowMapExamplePage';

export function DemoB2bWorkspacePage() {
	return (
		<DemoFlowMapExamplePage
			title="B2B workspace setup & approvals"
			lead="Twenty screens across admin SSO, member onboarding, purchase requests, manager approve/deny/appeal, and IT provisioning — sample Acme Robotics data only."
			buildProject={buildDemoB2bWorkspaceProject}
		/>
	);
}
