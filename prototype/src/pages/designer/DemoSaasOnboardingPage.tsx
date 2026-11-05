import { buildDemoSaasOnboardingProject } from '../../designer/demoSaasOnboardingProject';
import { DemoFlowMapExamplePage } from './DemoFlowMapExamplePage';

export function DemoSaasOnboardingPage() {
	return (
		<DemoFlowMapExamplePage
			title="Branching SaaS onboarding"
			lead="Welcome through dashboard with forgot-password and sign-up error branches. Review flags mark a few UX gaps on the map."
			buildProject={buildDemoSaasOnboardingProject}
		/>
	);
}
