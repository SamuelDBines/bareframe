import { useDesigner } from '../store';

const EXAMPLE_ACTIONS = [
	{ label: 'create_frame (iPhone 15)', action: 'create_frame', args: { devicePresetId: 'iphone-15' } },
	{
		label: 'duplicate_frame_to_devices',
		action: 'duplicate_frame_to_devices',
		args: { devicePresetIds: ['iphone-15', 'ipad-mini', 'desktop-1440'] },
	},
	{ label: 'set_frame_theme → aurora', action: 'set_frame_theme', args: { themeId: 'aurora' } },
	{ label: 'create_style_trial', action: 'create_style_trial', args: { name: 'Ocean CTA' } },
];

export function AssistantFab() {
	const { state, dispatch } = useDesigner();
	const open = state.ui.assistantOpen;
	const frameId = state.ui.selectedFrameId;

	return (
		<>
			<button
				type="button"
				className="assistant-fab"
				aria-label="AI assistant"
				onClick={() => dispatch({ type: 'assistantOpen', open: !open })}
			>
				✦
			</button>
			{open && (
				<div className="assistant-drawer" role="dialog" aria-label="AI assistant">
					<header>
						<strong>Bareframe assistant</strong>
						<button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: 'assistantOpen', open: false })}>
							Close
						</button>
					</header>
					<p className="sidebar-hint">Example MCP actions applied to the canvas (mock).</p>
					<div className="assistant-actions">
						{EXAMPLE_ACTIONS.map((ex) => (
							<button
								key={ex.label}
								type="button"
								className="btn btn-secondary"
								onClick={() =>
									dispatch({
										type: 'applyAgentAction',
										action: ex.action,
										args: { ...ex.args, frameId },
									})
								}
							>
								{ex.label}
							</button>
						))}
					</div>
					<div className="chat-thread">
						<div className="chat-bubble chat-user">Duplicate Home to phone, tablet and desktop.</div>
						<div className="chat-bubble chat-agent">
							Applied duplicate_frame_to_devices on the selected frame. All three share one page tree.
						</div>
					</div>
					<input className="assistant-input" placeholder="Ask Bareframe to edit this screen…" />
				</div>
			)}
		</>
	);
}
