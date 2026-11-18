import { defaultNewId, swapScreenVariant, variantsForPage, type DesignDevice } from '@bareframe/designer-core';
import { fromProjectDocument, toProjectDocument } from '../projectApi';
import { useDesigner } from '../store';
import type { Frame } from '../types';
import { viewportToDesignDevice } from './designViewport';
import type { PrototypeViewportKind } from '../prototypeDeviceViewport';

type Props = {
	frame: Frame;
	previewDevice: DesignDevice;
};

export function VariantSwapPanel({ frame, previewDevice }: Props) {
	const { state, dispatch } = useDesigner();
	const page = state.project.pages.find((p) => p.id === frame.pageId);
	if (!page) return null;
	const info = variantsForPage(page);
	if (!info || info.variants.length < 2) return null;

	return (
		<div className="variant-swap" data-testid="variant-swap-panel">
			<label className="field">
				<span>Template variant</span>
				<select
					value={info.currentVariantId ?? info.variants[0]!.id}
					data-testid="variant-swap-select"
					onChange={(e) => {
						const variantId = e.target.value;
						const doc = swapScreenVariant(
							toProjectDocument(state.project),
							page.id,
							frame.id,
							variantId,
							previewDevice,
							defaultNewId,
						);
						dispatch({ type: 'hydrateProject', project: fromProjectDocument(doc), preserveSelection: true });
					}}
				>
					{info.variants.map((v) => (
						<option key={v.id} value={v.id}>
							{v.title}
						</option>
					))}
				</select>
			</label>
			<p className="bx-hint">
				{info.title}: connectors keep working when button labels match ({info.variants.length} layouts).
			</p>
		</div>
	);
}

export function swapVariantMenuItems(
	frame: Frame,
	previewDevice: DesignDevice,
	onDone: () => void,
	dispatch: ReturnType<typeof useDesigner>['dispatch'],
	project: ReturnType<typeof useDesigner>['state']['project'],
) {
	const page = project.pages.find((p) => p.id === frame.pageId);
	if (!page) return [];
	const info = variantsForPage(page);
	if (!info) return [];
	const current = info.currentVariantId ?? info.variants[0]!.id;
	return info.variants
		.filter((v) => v.id !== current)
		.map((v) => ({
			label: `Swap to ${v.title}`,
			action: () => {
				const doc = swapScreenVariant(toProjectDocument(project), page.id, frame.id, v.id, previewDevice, defaultNewId);
				dispatch({ type: 'hydrateProject', project: fromProjectDocument(doc), preserveSelection: true });
				onDone();
			},
		}));
}

/** Map viewport kind to design device for swap when only kind is known. */
export function designDeviceFromViewportKind(kind: PrototypeViewportKind): DesignDevice {
	return viewportToDesignDevice(kind);
}