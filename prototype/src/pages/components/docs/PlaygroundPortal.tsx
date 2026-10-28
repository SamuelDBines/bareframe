import { createContext, useContext, type ReactNode } from 'react';

const PlaygroundPortalContext = createContext<HTMLElement | null>(null);

export function usePlaygroundPortal(): HTMLElement | null {
	return useContext(PlaygroundPortalContext);
}

type Props = {
	children: ReactNode;
	portalRoot: HTMLElement | null;
	onPortalRootChange: (el: HTMLElement | null) => void;
};

/** Supplies the playground overlay portal target to doc previews (modal, drawer, popover). */
export function PlaygroundPortalProvider({ children, portalRoot }: Omit<Props, 'onPortalRootChange'>) {
	return <PlaygroundPortalContext.Provider value={portalRoot}>{children}</PlaygroundPortalContext.Provider>;
}

/** Empty layer portaled modals/drawers render into; sits above preview content. */
export function PlaygroundOverlayLayer({
	onPortalRootChange,
}: {
	onPortalRootChange: (el: HTMLElement | null) => void;
}) {
	return (
		<div
			ref={onPortalRootChange}
			className="playground-overlay-root"
			data-testid="playground-overlay-root"
		/>
	);
}

/** @deprecated Use PlaygroundPortalProvider + PlaygroundOverlayLayer */
export function PlaygroundPortalRoot({ children, portalRoot, onPortalRootChange }: Props) {
	return (
		<PlaygroundPortalProvider portalRoot={portalRoot}>
			<PlaygroundOverlayLayer onPortalRootChange={onPortalRootChange} />
			<div className="playground-preview-content">{children}</div>
		</PlaygroundPortalProvider>
	);
}
