import { type ReactNode, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FocusScope, useKeyboard } from 'react-aria';
import { useOverlayTriggerState } from 'react-stately';
import { OverlayTriggerStateContext } from 'react-aria-components';

type ContainedOverlayProps = {
	isOpen: boolean;
	onOpenChange?: (open: boolean) => void;
	isDismissable?: boolean;
	portalContainer?: Element | null;
	overlayClassName: string;
	children: ReactNode;
	overlayRef?: React.Ref<HTMLDivElement>;
};

/** Docs preview overlay: no ModalOverlay, no page inert — local focus scope only. */
export function ContainedOverlay({
	isOpen,
	onOpenChange,
	isDismissable = true,
	portalContainer,
	overlayClassName,
	children,
	overlayRef,
}: ContainedOverlayProps) {
	const state = useOverlayTriggerState({ isOpen, onOpenChange });
	const localRef = useRef<HTMLDivElement | null>(null);
	const setRef = (node: HTMLDivElement | null) => {
		localRef.current = node;
		if (typeof overlayRef === 'function') {
			overlayRef(node);
		} else if (overlayRef && 'current' in overlayRef) {
			overlayRef.current = node;
		}
	};

	const { keyboardProps } = useKeyboard({
		onKeyDown: (event) => {
			if (isDismissable && event.key === 'Escape') {
				event.stopPropagation();
				state.close();
			}
		},
	});

	if (!state.isOpen) {
		return null;
	}

	const layer = (
		<OverlayTriggerStateContext.Provider value={state}>
			<FocusScope contain restoreFocus autoFocus>
				<div
					{...keyboardProps}
					ref={setRef}
					className={overlayClassName}
					data-bf-contained-overlay=""
				>
					{children}
				</div>
			</FocusScope>
		</OverlayTriggerStateContext.Provider>
	);

	if (portalContainer) {
		return createPortal(layer, portalContainer);
	}

	return layer;
}
