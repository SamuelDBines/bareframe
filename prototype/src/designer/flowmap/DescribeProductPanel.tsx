import { DescribeProductForm } from './DescribeProductForm';
import { flowResultMessage, useGenerateFlow } from './flowGenApi';

type Props = {
	projectId: string;
	onGenerated: (message: string) => void;
};

/** Shown on an empty project: describe the product and the AI maps its screens and links. */
export function DescribeProductPanel({ projectId, onGenerated }: Props) {
	const { run, busy, error } = useGenerateFlow(projectId);

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
			<p className="describe-panel__alt bx-hint">Prefer to start by hand? Switch to Edit and add a screen.</p>
		</section>
	);
}
