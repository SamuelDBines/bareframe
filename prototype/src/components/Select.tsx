import type { SelectHTMLAttributes } from 'react';

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
	label?: string;
};

export function Select({ label, className = '', id, children, ...rest }: Props) {
	const selectId = id ?? (label ? `select-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
	return (
		<label className={`bf-select-field ${className}`.trim()}>
			{label && <span className="bf-select-label">{label}</span>}
			<span className="bf-select-wrap">
				<select id={selectId} className="bf-select" {...rest}>{children}</select>
			</span>
		</label>
	);
}
