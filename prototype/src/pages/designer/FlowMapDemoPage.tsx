import { LiveFlowDemo } from '../../marketing/LiveFlowDemo';
import { ExampleShell } from './DemoFlowMapExamplePage';

/** Standalone page for the interactive sample flow map (also embedded on the homepage). */
export function FlowMapDemoPage() {
	return (
		<ExampleShell
			kicker="Live demo"
			title="A flow map, reviewed"
			lead="Click a flag to read the finding, apply the suggested fix, then switch to Prototype to click through. This is a sample project, nothing here is saved."
			autoHeight
		>
			<LiveFlowDemo />
		</ExampleShell>
	);
}
