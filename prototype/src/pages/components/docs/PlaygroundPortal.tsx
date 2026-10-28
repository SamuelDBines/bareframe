import { createContext, useContext, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const PlaygroundPortalContext = createContext<HTMLElement | null>(null);
const PlaygroundFloatingPortalContext = createContext<HTMLElement | null>(null);

export function usePlaygroundPortal(): HTMLElement | null {
	return useContext(PlaygroundPortalContext);
}

/** Portal target for combobox/select listboxes above the docs playground chrome. */
export function usePlaygroundFloatingPortal(): HTMLElement | null {
	return useContext(PlaygroundFloatingPortalContext);
}

type Props = {
	children: ReactNode;
	portalRoot: HTMLElement | null;
	floatingPortalRoot: HTMLElement | null;
	onPortalRootChange: (el: HTMLElement | null) => void;
};

/** Supplies playground portal targets to doc previews (modal overlay + floating listboxes). */
export function PlaygroundPortalProvider({
	children,
	portalRoot,
	floatingPortalRoot,
}: Omit<Props, 'onPortalRootChange'>) {
	return (
		<PlaygroundPortalContext.Provider value={portalRoot}>
			<PlaygroundFloatingPortalContext.Provider value={floatingPortalRoot}>
				{children}
			</PlaygroundFloatingPortalContext.Provider>
		</PlaygroundPortalContext.Provider>
	);
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

/** Portals combobox listboxes to `document.body` so they sit above the docs shell (tab panel clips overflow). */
export function PlaygroundFloatingPortalLayer({
	onPortalRootChange,
}: {
	onPortalRootChange: (el: HTMLElement | null) => void;
}) {
	return createPortal(
		<div
			ref={onPortalRootChange}
			className="playground-floating-portal"
			data-testid="playground-floating-portal"
		/>,
		document.body,
	);
}

/** @deprecated Use PlaygroundPortalProvider + PlaygroundOverlayLayer */
export function PlaygroundPortalRoot({ children, portalRoot, floatingPortalRoot, onPortalRootChange }: Props) {
	return (
		<PlaygroundPortalProvider portalRoot={portalRoot} floatingPortalRoot={floatingPortalRoot}>
			<PlaygroundOverlayLayer onPortalRootChange={onPortalRootChange} />
			<div className="playground-preview-content">{children}</div>
		</PlaygroundPortalProvider>
	);
}
