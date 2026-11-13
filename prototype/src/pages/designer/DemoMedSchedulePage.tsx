import { buildDemoMedScheduleProject } from '../../designer/demoProjects/demoMedScheduleProject';
import { DemoFlowMapExamplePage } from './DemoFlowMapExamplePage';

export function DemoMedSchedulePage() {
	return (
		<DemoFlowMapExamplePage
			title="MedSchedule appointments"
			lead="In-person vs video paths, insurance recovery, scheduling conflicts, reschedule and cancel policy, waitlist offers, and check-in — demo patients only."
			buildProject={buildDemoMedScheduleProject}
		/>
	);
}
