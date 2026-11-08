import { buildDemoMedScheduleProject } from '../../designer/demoProjects/demoMedScheduleProject';
import { DemoFlowMapExamplePage } from './DemoFlowMapExamplePage';

export function DemoMedSchedulePage() {
	return (
		<DemoFlowMapExamplePage
			title="Healthcare scheduling"
			lead="Twenty-one screens: in-person vs video, insurance verify/error/manual recovery, slot conflict, pre-visit forms, reschedule, cancel policy, waitlist offer, and check-in — demo patients only."
			buildProject={buildDemoMedScheduleProject}
		/>
	);
}
