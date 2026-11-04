import { useState } from 'react';
import { useDesigner } from '../store';
import { FlowMapCanvas } from './FlowMapCanvas';
import { FlowMapToolbar, type FlowWorkspaceMode } from './FlowMapToolbar';
import { PrototypePlayer } from './PrototypePlayer';
import './flow-map-ui.css';

type Props = {
	readOnly?: boolean;
};

export function FlowMapProjectWorkspace({ readOnly }: Props) {
	const { dispatch } = useDesigner();
	const [mode, setMode] = useState<Exclude<FlowWorkspaceMode, 'prototype'>>('map');
	const [playing, setPlaying] = useState(false);
	const [connectMode, setConnectMode] = useState(false);
	const [connectFrom, setConnectFrom] = useState<string | null>(null);

	return (
		<div className="flow-map-workspace" data-testid="flow-map-workspace">
			<FlowMapToolbar
				mode={mode}
				onModeChange={(m) => {
					if (m === 'prototype') {
						setPlaying(true);
						return;
					}
					setMode(m);
					setConnectMode(false);
					setConnectFrom(null);
				}}
				connectMode={connectMode}
				onConnectModeChange={(on) => {
					setConnectMode(on);
					setConnectFrom(null);
				}}
				readOnly={readOnly}
			/>
			<div className="flow-map-stage">
				<FlowMapCanvas
					readOnly={readOnly}
					connectMode={mode === 'edit' && connectMode && !readOnly}
					connectFromFrameId={connectFrom}
					onConnectFrameSelect={(frameId) => {
						if (!connectFrom) {
							setConnectFrom(frameId);
							return;
						}
						if (connectFrom !== frameId) {
							dispatch({
								type: 'addConnector',
								fromFrameId: connectFrom,
								toFrameId: frameId,
								label: 'Next',
							});
						}
						setConnectFrom(null);
					}}
				/>
			</div>
			{playing ? <PrototypePlayer onExit={() => setPlaying(false)} /> : null}
		</div>
	);
}
