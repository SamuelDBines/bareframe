import type { DesignDevice } from '@bareframe/designer-core';
import { DeviceViewportSwitcher } from '../components/DeviceViewportSwitcher';
import type { DesignQueueState } from './designGenApi';
import { IconSparkle } from './FlowMapIcons';

type Props = {
	device: DesignDevice;
	onDeviceChange: (device: DesignDevice) => void;
	queue: DesignQueueState;
	screenCount: number;
	onGenerateAll: () => void;
	onCancel: () => void;
	onDismiss: () => void;
};

/** Device for AI designs, "Generate all screens", and the queue's progress. */
export function DesignBar({ device, onDeviceChange, queue, screenCount, onGenerateAll, onCancel, onDismiss }: Props) {
	return (
		<section className="design-bar" aria-label="Screen designs" data-testid="design-bar">
			<DeviceViewportSwitcher value={device} onChange={onDeviceChange} aria-label="Design device" className="design-bar__devices" />
			{queue.running ? (
				<div className="design-bar__progress">
					<p role="status" data-testid="design-progress">
						Designing {Math.min(queue.done + 1, queue.total)} of {queue.total}
						{queue.currentName ? `: ${queue.currentName}` : ''}…
					</p>
					<progress max={queue.total} value={queue.done} aria-label="Design progress" />
					<button type="button" className="btn btn-secondary btn-sm" data-testid="design-cancel" onClick={onCancel}>
						Cancel
					</button>
				</div>
			) : (
				<button
					type="button"
					className="btn btn-primary btn-sm"
					data-testid="design-all"
					disabled={screenCount === 0}
					onClick={onGenerateAll}
				>
					<IconSparkle size={16} />
					<span>Generate all screens</span>
				</button>
			)}
			{!queue.running && (queue.message || queue.error) ? (
				<div className={`design-bar__result${queue.error ? ' is-error' : ''}`} role={queue.error ? 'alert' : 'status'} data-testid="design-result">
					<p>{[queue.message, queue.error].filter(Boolean).join(' ')}</p>
					<button type="button" className="btn btn-ghost btn-sm" onClick={onDismiss} aria-label="Dismiss">
						×
					</button>
				</div>
			) : null}
		</section>
	);
}
