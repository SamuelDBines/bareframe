import { memo, useEffect, useRef, useState } from 'react';
import type { ThemeId } from '../../theme/themes';
import { buildFramePreviewDoc } from '../framePreviewDoc';
import { loadFramePreviewStyles } from '../framePreviewStyles';
import type { Frame, Page, StyleTrial } from '../types';

type Props = {
	frame: Frame;
	page: Page;
	themeId: ThemeId;
	customTokens: Record<string, string>;
	trial?: StyleTrial;
	selectedNodeId: string | null;
	onSelectNode: (nodeId: string) => void;
	/** Lock iframe document to frame height (prototype player — avoids iframe clipping tall trees). */
	lockDocumentHeight?: boolean;
};

function designerAssetBase(): string {
	return new URL(import.meta.env.BASE_URL, window.location.href).href;
}

export const FramePreview = memo(function FramePreview({
	frame,
	page,
	themeId,
	customTokens,
	trial,
	selectedNodeId,
	onSelectNode,
	lockDocumentHeight,
}: Props) {
	const ref = useRef<HTMLIFrameElement>(null);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		let cancelled = false;
		setReady(false);

		void (async () => {
			const assetBase = designerAssetBase();
			const previewCss = await loadFramePreviewStyles(assetBase, themeId);
			if (cancelled) return;
			el.srcdoc = buildFramePreviewDoc({
				page,
				frameWidth: frame.width,
				frameHeight: lockDocumentHeight ? frame.height : undefined,
				themeId,
				tokenOverrides: customTokens,
				trial,
				selectedNodeId,
				assetBase,
				previewCss,
			});
		})();

		return () => {
			cancelled = true;
		};
	}, [page, frame.width, frame.height, themeId, customTokens, trial, selectedNodeId, lockDocumentHeight]);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const onLoad = () => {
			setReady(true);
			const win = el.contentWindow;
			if (!win) return;
			const handler = (e: MouseEvent) => {
				const t = e.target as HTMLElement | null;
				const node = t?.closest?.('[data-node-id]') as HTMLElement | null;
				if (node?.dataset.nodeId) {
					e.preventDefault();
					onSelectNode(node.dataset.nodeId);
				}
			};
			win.document.addEventListener('click', handler);
			return () => win.document.removeEventListener('click', handler);
		};
		el.addEventListener('load', onLoad);
		return () => el.removeEventListener('load', onLoad);
	}, [onSelectNode, page, frame.width, themeId]);

	return (
		<div className={`frame-preview-shell${ready ? ' frame-preview-shell--ready' : ''}`}>
			<iframe
				ref={ref}
				title={`Preview ${frame.name}`}
				className="frame-preview-iframe"
				style={{
					width: frame.width,
					height: frame.heightMode === 'hug' ? 'auto' : frame.height,
					minHeight: frame.height,
					border: 'none',
					display: 'block',
					background: 'var(--bf-theme-surface-1, #fff)',
				}}
			/>
		</div>
	);
});
