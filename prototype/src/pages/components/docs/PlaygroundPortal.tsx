import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { UNSAFE_PortalProvider } from 'react-aria';

const PlaygroundPortalContext = createContext<HTMLElement | null>(null);

export function usePlaygroundPortal(): HTMLElement | null {
	return useContext(PlaygroundPortalContext);
}

type Props = {
	children: ReactNode;
	portalRoot: HTMLElement | null;
	onPortalRootChange: (el: HTMLElement | null) => void;
};

function useKeepPlaygroundPanelUnlocked(portalRoot: HTMLElement | null) {
	useEffect(() => {
		const unlock = () => {
			const panel = document.querySelector('.playground-panel');
			if (!panel) return;
			const trapped =
				portalRoot?.querySelector('.bf-modal-overlay, .bf-drawer-overlay, .bf-popover, [role="dialog"]') !=
				null;
			if (trapped) {
			 panel.removeAttribute('inert');
			 panel.removeAttribute('aria-hidden');
			}
		};
		unlock();
		const id = window.setInterval(unlock, 50);
		return () => window.clearInterval(id);
	}, [portalRoot]);
}

/** Mounts playground overlays inside the preview frame (not document body). */
export function PlaygroundPortalRoot({ children, portalRoot, onPortalRootChange }: Props) {
	useKeepPlaygroundPanelUnlocked(portalRoot);

	return (
		<PlaygroundPortalContext.Provider value={portalRoot}>
			<div
				ref={onPortalRootChange}
				className="playground-overlay-root"
				data-testid="playground-overlay-root"
			>
				{portalRoot ? (
					<UNSAFE_PortalProvider getContainer={() => portalRoot}>{children}</UNSAFE_PortalProvider>
				) : null}
			</div>
		</PlaygroundPortalContext.Provider>
	);
}
