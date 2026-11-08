import type { ThemeId } from '../../theme/themes';
import { createDemoFlowScreen, type DemoScreenSpec } from '../demoFlowMapScreen';
import { autoLayoutFlowMap } from '../flowmap/flowMapLayout';
import type { Annotation, Connector, DesignerProject } from '../types';

export type DemoEdgeSpec = {
	from: string;
	to: string;
	label: string;
	id?: string;
};

export type DemoScreenInput = Omit<DemoScreenSpec, 'productName' | 'extraFieldPlaceholders'> & {
	extraFieldPlaceholders?: readonly string[];
};

export function demoFrameId(key: string) {
	return `frame-${key}`;
}

export function assembleDemoProject(config: {
	id: string;
	name: string;
	defaultThemeId: ThemeId;
	productName: string;
	screens: DemoScreenInput[];
	edges: DemoEdgeSpec[];
	annotations?: Annotation[];
	prototypeEntryFrameKey?: string;
	canvas?: { zoom: number; x: number; y: number };
}): DesignerProject {
	const built = config.screens.map((spec) =>
		createDemoFlowScreen({
			...spec,
			extraFieldPlaceholders: spec.extraFieldPlaceholders
				? [...spec.extraFieldPlaceholders]
				: undefined,
			productName: config.productName,
		}),
	);
	const pages = built.map((b) => b.page);
	let frames = built.map((b) => ({ ...b.frame }));

	const connectors: Connector[] = config.edges.map((e, index) => ({
		id: e.id ?? `c-${e.from}-${e.to}-${index}`,
		fromFrameId: demoFrameId(e.from),
		toFrameId: demoFrameId(e.to),
		label: e.label,
		trigger: 'tap',
	}));

	for (const u of autoLayoutFlowMap({ frames, connectors, pages } as DesignerProject)) {
		const f = frames.find((fr) => fr.id === u.frameId);
		if (f) {
			f.x = u.x;
			f.y = u.y;
		}
	}

	return {
		id: config.id,
		name: config.name,
		defaultThemeId: config.defaultThemeId,
		pages,
		frames,
		trials: [],
		customTokenOverrides: {},
		connectors,
		annotations: config.annotations ?? [],
		prototypeEntryFrameId: config.prototypeEntryFrameKey
			? demoFrameId(config.prototypeEntryFrameKey)
			: undefined,
		canvas: config.canvas ?? { zoom: 0.52, x: 24, y: 12 },
	};
}
