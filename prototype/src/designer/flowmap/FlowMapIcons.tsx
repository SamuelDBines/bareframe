import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 18, children, ...rest }: IconProps & { children: ReactNode }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden {...rest}>
			{children}
		</svg>
	);
}

export function IconAddScreen(props: IconProps) {
	return (
		<Base {...props}>
			<rect x="5" y="3" width="14" height="18" rx="2.5" stroke="currentColor" strokeWidth="1.75" />
			<path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
		</Base>
	);
}

export function IconConnect(props: IconProps) {
	return (
		<Base {...props}>
			<circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.75" />
			<circle cx="18" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.75" />
			<path d="M8.5 12h7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
			<path d="M14 10l2 2-2 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
		</Base>
	);
}

export function IconTrash(props: IconProps) {
	return (
		<Base {...props}>
			<path
				d="M9 4h6M5 7h14M8 7l1 13h6l1-13"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Base>
	);
}

export function IconShare(props: IconProps) {
	return (
		<Base {...props}>
			<path
				d="M16 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM8 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm8 6.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
				stroke="currentColor"
				strokeWidth="1.75"
			/>
			<path d="M10.2 13.2l3.6-2.1M10.2 10.8l3.6 2.1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
		</Base>
	);
}

export function IconPlay(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M8 6.5v11l9-5.5-9-5.5Z" fill="currentColor" />
		</Base>
	);
}

export function IconFigma(props: IconProps) {
	return (
		<Base {...props}>
			<path
				d="M8 4h4a3 3 0 0 1 0 6H8V4Zm0 6h4a3 3 0 1 1 0 6H8v-6Zm0 6h4a3 3 0 0 1-3 2.82V20a3 3 0 0 1-6 0v-1.18A3 3 0 0 1 8 16Z"
				fill="currentColor"
			/>
		</Base>
	);
}

export function IconMore(props: IconProps) {
	return (
		<Base {...props}>
			<circle cx="6" cy="12" r="1.5" fill="currentColor" />
			<circle cx="12" cy="12" r="1.5" fill="currentColor" />
			<circle cx="18" cy="12" r="1.5" fill="currentColor" />
		</Base>
	);
}

export function IconHelp(props: IconProps) {
	return (
		<Base {...props}>
			<circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
			<path
				d="M9.5 9.2a2.8 2.8 0 0 1 5.3 1c0 1.8-2.8 1.6-2.8 3.3"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="round"
			/>
			<circle cx="12" cy="17" r="1" fill="currentColor" />
		</Base>
	);
}

export function IconUpgrade(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M12 4v16M12 4l-4 4M12 4l4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
		</Base>
	);
}

export function IconSparkle(props: IconProps) {
	return (
		<Base {...props}>
			<path
				d="M12 3.5l1.7 4.6 4.6 1.7-4.6 1.7L12 16.1l-1.7-4.6L5.7 9.8l4.6-1.7L12 3.5z"
				stroke="currentColor"
				strokeWidth="1.6"
				strokeLinejoin="round"
			/>
			<path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" fill="currentColor" />
		</Base>
	);
}
