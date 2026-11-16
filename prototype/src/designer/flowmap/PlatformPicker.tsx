import { useId } from 'react';
import { FLOW_DEVICES, type FlowDevice } from '@bareframe/designer-core';
import { IconDesktop, IconPhone, IconTablet } from './FlowMapIcons';

const DEVICE_META: Record<FlowDevice, { label: string; Icon: typeof IconPhone }> = {
	mobile: { label: 'Mobile', Icon: IconPhone },
	tablet: { label: 'Tablet', Icon: IconTablet },
	desktop: { label: 'Desktop', Icon: IconDesktop },
};

type Props = {
	value: FlowDevice[];
	onChange: (value: FlowDevice[]) => void;
	disabled?: boolean;
	/** Shown once someone has tried to continue with nothing ticked. */
	showError?: boolean;
};

/** Pick one or more devices the product runs on. */
export function PlatformPicker({ value, onChange, disabled, showError }: Props) {
	const id = useId();
	const toggle = (device: FlowDevice, on: boolean) => {
		const next = on ? [...value, device] : value.filter((d) => d !== device);
		onChange(FLOW_DEVICES.filter((d) => next.includes(d)));
	};

	return (
		<fieldset
			className="describe-form__platforms"
			disabled={disabled}
			aria-describedby={showError ? `${id}-err` : undefined}
			aria-invalid={showError || undefined}
		>
			<legend>Platforms</legend>
			<p className="bx-hint">Choose every device people will use it on.</p>
			<div className="platform-picker" data-testid="describe-platform">
				{FLOW_DEVICES.map((device) => {
					const { label, Icon } = DEVICE_META[device];
					const checked = value.includes(device);
					return (
						<label key={device} className={`platform-picker__option${checked ? ' is-checked' : ''}`}>
							<input
								type="checkbox"
								className="platform-picker__input"
								checked={checked}
								onChange={(e) => toggle(device, e.target.checked)}
							/>
							<Icon size={22} />
							<span>{label}</span>
						</label>
					);
				})}
			</div>
			{showError ? (
				<p className="describe-form__field-error" id={`${id}-err`}>
					Choose at least one platform.
				</p>
			) : null}
		</fieldset>
	);
}
