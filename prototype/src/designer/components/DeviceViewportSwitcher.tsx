import {
	PROTOTYPE_VIEWPORT_PRESETS,
	type PrototypeViewportKind,
} from '../prototypeDeviceViewport';

const ICONS: Record<PrototypeViewportKind, string> = {
	phone: '📱',
	tablet: '📋',
	desktop: '🖥',
};

type Props = {
	value: PrototypeViewportKind;
	onChange: (kind: PrototypeViewportKind) => void;
	className?: string;
	'aria-label'?: string;
};

export function DeviceViewportSwitcher({
	value,
	onChange,
	className = '',
	'aria-label': ariaLabel = 'Preview device',
}: Props) {
	return (
		<div
			className={`device-viewport-switch${className ? ` ${className}` : ''}`}
			role="group"
			aria-label={ariaLabel}
			data-testid="device-viewport-switch"
		>
			{(Object.keys(PROTOTYPE_VIEWPORT_PRESETS) as PrototypeViewportKind[]).map((kind) => {
				const preset = PROTOTYPE_VIEWPORT_PRESETS[kind];
				const active = value === kind;
				return (
					<button
						key={kind}
						type="button"
						className={active ? 'is-active' : undefined}
						data-viewport={kind}
						aria-pressed={active}
						title={`${preset.label} · ${preset.width}×${preset.height}`}
						onClick={() => onChange(kind)}
					>
						<span aria-hidden>{ICONS[kind]}</span>
						<span className="device-viewport-switch__label">{preset.label}</span>
					</button>
				);
			})}
		</div>
	);
}
