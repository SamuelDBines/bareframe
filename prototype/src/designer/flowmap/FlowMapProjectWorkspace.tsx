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
  const [mode, setMode] = useState<FlowWorkspaceMode>('map');
  const [connectMode, setConnectMode] = useState(false);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);

  return (
    <div className="flow-map-workspace" data-testid="flow-map-workspace">
      <FlowMapToolbar
        mode={mode}
        onModeChange={(m) => {
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
      {mode === 'prototype' ? (
        <PrototypePlayer />
      ) : (
        <FlowMapCanvas
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
      )}
    </div>
  );
}
