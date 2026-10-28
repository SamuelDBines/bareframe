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

/** RAC ModalOverlay inerts outside content; keep playground controls interactive for contained previews. */
function usePlaygroundPanelUnlock(portalRoot: HTMLElement | null) {
	useEffect(() => {
		const panel = document.querySelector('.playground-panel');
		if (!panel || !portalRoot) {
			return;
		}

		const unlockPanel = () => {
			const containedOpen = portalRoot.querySelector(
				'.bf-modal-overlay--contained, .bf-drawer-overlay--contained',
			);
			if (containedOpen) {
				panel.removeAttribute('inert');
				panel.removeAttribute('aria-hidden');
			}
		};

		unlockPanel();
		const observer = new MutationObserver(unlockPanel);
		observer.observe(panel, { attributes: true, attributeFilter: ['inert', 'aria-hidden'] });
		observer.observe(portalRoot, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
		return () => observer.disconnect();
	}, [portalRoot]);
}

/** Mounts playground overlays inside the preview frame (not document body). */
export function PlaygroundPortalRoot({ children, portalRoot, onPortalRootChange }: Props) {
	usePlaygroundPanelUnlock(portalRoot);

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
