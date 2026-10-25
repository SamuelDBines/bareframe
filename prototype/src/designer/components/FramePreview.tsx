import { useEffect, useRef } from 'react';
import type { ThemeId } from '../../theme/themes';
import { buildFramePreviewDoc } from '../framePreviewDoc';
import type { Frame, Page, StyleTrial } from '../types';

type Props = {
	frame: Frame;
	page: Page;
	themeId: ThemeId;
	customTokens: Record<string, string>;
	trial?: StyleTrial;
	selectedNodeId: string | null;
	onSelectNode: (nodeId: string) => void;
};

export function FramePreview({
	frame,
	page,
	themeId,
	customTokens,
	trial,
	selectedNodeId,
	onSelectNode,
}: Props) {
	const ref = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const doc = buildFramePreviewDoc({
			page,
			frameWidth: frame.width,
			themeId,
			tokenOverrides: customTokens,
			trial,
			selectedNodeId,
		});
		el.srcdoc = doc;
	}, [page, frame.width, themeId, customTokens, trial, selectedNodeId]);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const onLoad = () => {
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
				background: 'var(--bf-theme-surface-1)',
			}}
		/>
	);
}
