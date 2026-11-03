import type { ReactNode } from 'react';

export function DsPage({ children }: { children: ReactNode }) {
	return <div className="ds-page">{children}</div>;
}

export function DsHero({
	eyebrow,
	title,
	lead,
	actions,
}: {
	eyebrow?: string;
	title: string;
	lead?: ReactNode;
	actions?: ReactNode;
}) {
	return (
		<header className="ds-hero">
			<div>
				{eyebrow ? <p className="ds-eyebrow">{eyebrow}</p> : null}
				<h1>{title}</h1>
				{lead ? <p className="ds-lead">{lead}</p> : null}
			</div>
			{actions ? <div className="ds-actions">{actions}</div> : null}
		</header>
	);
}

export function DsCard({
	children,
	className,
	style,
}: {
	children: ReactNode;
	className?: string;
	style?: React.CSSProperties;
}) {
	return (
		<div className={`ds-card ${className ?? ''}`.trim()} style={style}>
			{children}
		</div>
	);
}
