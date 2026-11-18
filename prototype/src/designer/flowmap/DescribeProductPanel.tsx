import { useState } from 'react';
import type { FlowDevice } from '@bareframe/designer-core';
import { useDesigner } from '../store';
import { DescribeProductForm } from './DescribeProductForm';
import { flowResultMessage, useGenerateFlow } from './flowGenApi';
import { PlatformPicker } from './PlatformPicker';
import { projectWithStarterFlow, randomStarterIndex, STARTER_FLOWS } from './starterFlows';

type Props = {
	projectId: string;
	/** AI can map a flow from a description; without it, only starter flows and adding screens are offered. */
	aiAvailable: boolean;
	onGenerated: (message: string) => void;
	onAddScreen: () => void;
};

/** Shown on an empty project: describe the product for the AI to map, or start from a starter flow. */
export function DescribeProductPanel({ projectId, aiAvailable, onGenerated, onAddScreen }: Props) {
	const { run, busy, error } = useGenerateFlow(projectId);
	const [mode, setMode] = useState<'describe' | 'starter'>(aiAvailable ? 'describe' : 'starter');

	if (mode === 'starter' || !aiAvailable) {
		return (
			<section className="describe-panel" aria-labelledby="describe-panel-title" data-testid="describe-product-panel">
				<h2 id="describe-panel-title">Start your flow</h2>
				<p className="bx-hint">
					Start from a common journey, then rename, add or remove screens and links to match your product.
				</p>
				<StarterFlowChooser onCreated={onGenerated} />
				<div className="describe-panel__choices">
					<button type="button" className="btn btn-ghost" onClick={onAddScreen} data-testid="start-blank">
						Add a screen yourself
					</button>
					{aiAvailable ? (
						<button type="button" className="btn btn-ghost" onClick={() => setMode('describe')}>
							Describe your product instead
						</button>
					) : null}
				</div>
			</section>
		);
	}

	return (
		<section className="describe-panel" aria-labelledby="describe-panel-title" data-testid="describe-product-panel">
			<h2 id="describe-panel-title">Start with your product</h2>
			<p className="bx-hint">
				Bareframe maps the screens and the links between them. You can rename, add or remove anything afterwards.
			</p>
			<DescribeProductForm
				busy={busy}
				error={error}
				submitLabel="Map my flow"
				busyLabel="Mapping your screens…"
				onSubmit={async (value) => {
					const result = await run(value);
					if (result) onGenerated(flowResultMessage(result));
				}}
			/>
			{busy ? (
				<div className="describe-panel__skeleton" aria-hidden>
					<span />
					<span />
					<span />
				</div>
			) : null}
			<p className="describe-panel__or">or</p>
			<div className="describe-panel__choices">
				<button
					type="button"
					className="btn btn-secondary"
					onClick={() => setMode('starter')}
					disabled={busy}
					data-testid="use-starter-flow"
				>
					Start from a template
				</button>
				<button type="button" className="btn btn-ghost" onClick={onAddScreen} disabled={busy} data-testid="start-blank">
					Add a screen yourself
				</button>
			</div>
			<p className="describe-panel__alt bx-hint">
				Prefer to start by hand? Switch to Edit and add a screen.
			</p>
		</section>
	);
}

/** Lays out one of the starter flows, picked at random, on the chosen devices. */
function StarterFlowChooser({ onCreated }: { onCreated: (message: string) => void }) {
	const { state, dispatch } = useDesigner();
	const [platforms, setPlatforms] = useState<FlowDevice[]>(['mobile']);
	const [tried, setTried] = useState(false);

	const create = () => {
		setTried(true);
		if (platforms.length === 0) return;
		const index = randomStarterIndex();
		const starter = STARTER_FLOWS[index]!;
		dispatch({ type: 'hydrateProject', project: projectWithStarterFlow(state.project, index, platforms) });
		onCreated(`Started from “${starter.name}”. Rename, add or remove anything to fit your product.`);
	};

	return (
		<div className="describe-form">
			<PlatformPicker value={platforms} onChange={setPlatforms} showError={tried && platforms.length === 0} />
			<div className="bx-dialog__actions">
				<button type="button" className="btn btn-primary" onClick={create} data-testid="create-starter-flow">
					Create a starter flow
				</button>
			</div>
		</div>
	);
}
