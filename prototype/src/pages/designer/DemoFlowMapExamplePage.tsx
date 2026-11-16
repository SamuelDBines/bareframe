import { Link } from 'react-router-dom';
import { useMemo, type ReactNode } from 'react';
import { DesignerWorkspace } from '../../designer/DesignerWorkspace';
import { toProjectDocument } from '../../designer/projectApi';
import type { DesignerProject } from '../../designer/types';
import '../../app-ui.css';
import '../../marketing/marketing.css';

type ShellProps = {
	kicker?: string;
	title: string;
	lead: string;
	children: ReactNode;
	/** For content that sizes itself (the interactive homepage demo) instead of filling the stage. */
	autoHeight?: boolean;
};

/** Shared layout for every example: heading, a way back to all examples, and the map in a stage. */
export function ExampleShell({ kicker = 'Example flow map', title, lead, children, autoHeight }: ShellProps) {
	return (
		<div className="bx-page demo-flow-example">
			<header className="bx-page-head demo-head">
				<div>
					<span className="bx-kicker">{kicker}</span>
					<h1>{title}</h1>
					<p className="bx-lead">{lead}</p>
				</div>
				<div className="demo-head__actions">
					<Link to="/examples" className="btn btn-ghost">
						All examples
					</Link>
					<Link to="/app" className="btn btn-primary">
						Map your own flow
					</Link>
				</div>
			</header>
			<div
				className={`demo-flow-example__stage${autoHeight ? ' demo-flow-example__stage--auto' : ''}`}
				data-testid="example-stage"
			>
				{children}
			</div>
		</div>
	);
}

type Props = {
	title: string;
	lead: string;
	buildProject: () => DesignerProject;
};

export function DemoFlowMapExamplePage({ title, lead, buildProject }: Props) {
	const initialDocument = useMemo(() => toProjectDocument(buildProject()), [buildProject]);

	return (
		<ExampleShell title={title} lead={lead}>
			<DesignerWorkspace readOnly compactChrome embedded initialDocument={initialDocument} />
		</ExampleShell>
	);
}
