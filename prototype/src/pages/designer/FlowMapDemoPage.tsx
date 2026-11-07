import { Link } from 'react-router-dom';
import { LiveFlowDemo } from '../../marketing/LiveFlowDemo';
import '../../marketing/marketing.css';

/** Standalone page for the interactive sample flow map (also embedded on the homepage). */
export function FlowMapDemoPage() {
	return (
		<div className="bx-page">
			<header className="bx-page-head demo-head">
				<div>
					<span className="bx-kicker">Live demo</span>
					<h1>A flow map, reviewed</h1>
					<p className="bx-lead">
						Click a flag to read the finding, apply the suggested fix, then switch to Prototype to click
						through. This is a sample project — nothing here is saved.
					</p>
				</div>
				<Link to="/app" className="btn btn-primary">
					Map your own flow
				</Link>
			</header>
			<LiveFlowDemo />
		</div>
	);
}
