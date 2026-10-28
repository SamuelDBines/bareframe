import { useEffect, useRef, useState, type ReactNode } from 'react';

const MIN_SCALE = 0.75;
const MAX_SCALE = 1;

export function GalleryPreviewScaler({ children }: { children: ReactNode }) {
	const stageRef = useRef<HTMLDivElement>(null);
	const measureRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(0.92);

	useEffect(() => {
		const stage = stageRef.current;
		const measure = measureRef.current;
		if (!stage || !measure) return;

		const update = () => {
			const pad = 8;
			const availW = stage.clientWidth - pad;
			const availH = stage.clientHeight - pad;
			const contentW = measure.offsetWidth;
			const contentH = measure.offsetHeight;
			if (contentW <= 0 || contentH <= 0) return;
			const fit = Math.min(availW / contentW, availH / contentH, MAX_SCALE);
			const next = Math.max(MIN_SCALE, fit);
			setScale(Number(next.toFixed(3)));
		};

		update();
		const ro = new ResizeObserver(update);
		ro.observe(stage);
		ro.observe(measure);
		return () => ro.disconnect();
	}, [children]);

	return (
		<div ref={stageRef} className="docs-gallery-card__preview" data-bf-theme="light">
			<div
				className="docs-gallery-card__preview-scaler"
				style={{ transform: `scale(${scale})` }}
			>
				<div ref={measureRef} className="docs-gallery-card__preview-measure">
					<div className="bf-docs-preview bf-docs-preview--gallery">{children}</div>
				</div>
			</div>
		</div>
	);
}
