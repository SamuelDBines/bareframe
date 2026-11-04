import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { DesignerWorkspace } from '../../designer/DesignerWorkspace';
import { toProjectDocument } from '../../designer/projectApi';
import type { DesignerProject } from '../../designer/types';
import '../../app-ui.css';
import '../../marketing/marketing.css';

type Props = {
	title: string;
	lead: string;
	buildProject: () => DesignerProject;
};

export function DemoFlowMapExamplePage({ title, lead, buildProject }: Props) {
	const initialDocument = useMemo(() => toProjectDocument(buildProject()), [buildProject]);

	return (
		<div className="bx-page demo-flow-example">
			<header className="bx-page-head demo-head">
				<div>
					<span className="bx-kicker">Example flow map</span>
					<h1>{title}</h1>
					<p className="bx-lead">{lead}</p>
				</div>
				<Link to="/examples" className="btn btn-ghost">
					All examples
				</Link>
			</header>
			<div className="demo-flow-example__stage">
				<DesignerWorkspace readOnly compactChrome initialDocument={initialDocument} />
			</div>
		</div>
	);
}
