import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useReducer,
	type ReactNode,
} from 'react';
import type { ThemeId } from '../theme/themes';
import { breakpointForWidth } from './breakpoints';
import { deviceDimensions, DUPLICATE_TO_DEVICES_DEFAULT, getDevicePreset } from './devicePresets';
import {
	autoPlaceFrame,
	boundsForFrames,
	cameraToFitBounds,
	findPlacementBesideCluster,
	layoutCompareMatrix,
	relayoutFrameSet,
} from './frameLayout';
import { createInitialProject, PAGE_ID } from './initialProject';
import type {
	CompareMode,
	DesignerProject,
	DesignerState,
	DesignNode,
	Frame,
	LayoutModel,
	StyleTrial,
} from './types';

function cloneProject(p: DesignerProject): DesignerProject {
	return JSON.parse(JSON.stringify(p)) as DesignerProject;
}

function pushHistory(state: DesignerState, project: DesignerProject): DesignerState {
	const next = cloneProject(project);
	const trimmed = state.history.slice(0, state.historyIndex + 1);
	trimmed.push(next);
	if (trimmed.length > 50) trimmed.shift();
	return { ...state, project: next, history: trimmed, historyIndex: trimmed.length - 1 };
}

function newId(prefix: string) {
	return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

type Action =
	| { type: 'undo' }
	| { type: 'redo' }
	| { type: 'selectFrame'; frameId: string | null }
	| { type: 'selectNode'; nodeId: string | null }
	| { type: 'setEditScope'; scope: 'base' | 'breakpoint' }
	| { type: 'setCamera'; patch: Partial<DesignerProject['canvas']> }
	| { type: 'moveFrame'; frameId: string; x: number; y: number }
	| { type: 'setFrameDevice'; frameId: string; presetId: string; landscape?: boolean }
	| { type: 'setFrameTheme'; frameId: string; themeId: ThemeId | null }
	| { type: 'setFrameSize'; frameId: string; width: number; height: number }
	| { type: 'duplicateFrameToDevices'; frameId: string; presetIds: string[] }
	| { type: 'addFrame'; pageId?: string; presetId?: string; x?: number; y?: number }
	| { type: 'deleteFrame'; frameId: string }
	| { type: 'setDefaultTheme'; themeId: ThemeId }
	| { type: 'updateNodeLayout'; nodeId: string; layout: Partial<LayoutModel> }
	| { type: 'updateNodeContent'; nodeId: string; text: string }
	| { type: 'updateNodeVariant'; nodeId: string; variantKey: string }
	| { type: 'addComponent'; parentId: string; definitionId: string }
	| { type: 'setCompare'; compare: CompareMode | null }
	| { type: 'exitCompare' }
	| { type: 'makeCompareReal' }
	| { type: 'createStyleTrial'; frameId: string; name?: string }
	| { type: 'promoteTrial'; trialId: string; to: 'page' | 'new-theme' }
	| { type: 'setTrialToken'; token: string; value: string }
	| { type: 'setCustomToken'; token: string; value: string }
	| { type: 'assistantOpen'; open: boolean }
	| { type: 'applyAgentAction'; action: string; args?: Record<string, unknown> };

function reducer(state: DesignerState, action: Action): DesignerState {
	switch (action.type) {
		case 'undo': {
			if (state.historyIndex <= 0) return state;
			const idx = state.historyIndex - 1;
			return { ...state, project: cloneProject(state.history[idx]), historyIndex: idx };
		}
		case 'redo': {
			if (state.historyIndex >= state.history.length - 1) return state;
			const idx = state.historyIndex + 1;
			return { ...state, project: cloneProject(state.history[idx]), historyIndex: idx };
		}
		case 'selectFrame':
			return { ...state, ui: { ...state.ui, selectedFrameId: action.frameId, selectedNodeId: null } };
		case 'selectNode':
			return { ...state, ui: { ...state.ui, selectedNodeId: action.nodeId } };
		case 'setEditScope':
			return { ...state, ui: { ...state.ui, editScope: action.scope } };
		case 'setCamera': {
			const project = cloneProject(state.project);
			project.canvas = { ...project.canvas, ...action.patch };
			return { ...state, project };
		}
		case 'assistantOpen':
			return { ...state, ui: { ...state.ui, assistantOpen: action.open } };
		default:
			break;
	}

	const project = cloneProject(state.project);
	const ui = state.ui;

	const commit = (p: DesignerProject, u = ui) =>
		pushHistory({ ...state, ui: u }, p);

	switch (action.type) {
		case 'moveFrame': {
			const f = project.frames.find((x) => x.id === action.frameId);
			if (f && !f.readOnly) {
				f.x = action.x;
				f.y = action.y;
			}
			return commit(project);
		}
		case 'setFrameDevice': {
			const f = project.frames.find((x) => x.id === action.frameId);
			const preset = getDevicePreset(action.presetId);
			if (f && preset && !f.readOnly) {
				const dim = deviceDimensions(preset, action.landscape ?? f.landscape);
				f.devicePresetId = preset.id;
				f.width = dim.width;
				f.height = dim.height;
				f.landscape = action.landscape ?? f.landscape;
			}
			return commit(project);
		}
		case 'setFrameTheme': {
			const f = project.frames.find((x) => x.id === action.frameId);
			if (f && !f.readOnly) f.themeId = action.themeId ?? undefined;
			return commit(project);
		}
		case 'setFrameSize': {
			const f = project.frames.find((x) => x.id === action.frameId);
			if (f && !f.readOnly) {
				f.width = Math.max(280, action.width);
				f.height = Math.max(400, action.height);
				f.devicePresetId = 'custom';
			}
			return commit(project);
		}
		case 'setDefaultTheme':
			project.defaultThemeId = action.themeId;
			return commit(project);
		case 'setCustomToken':
			project.customTokenOverrides[action.token] = action.value;
			return commit(project);
		case 'addFrame': {
			const pageId = action.pageId ?? ui.activePageId;
			const preset = getDevicePreset(action.presetId ?? 'iphone-15')!;
			const dim = deviceDimensions(preset);
			const place =
				action.x != null && action.y != null
					? { x: action.x, y: action.y }
					: autoPlaceFrame(project.frames, dim.width, dim.height);
			const frame: Frame = {
				id: newId('frame'),
				name: 'New frame',
				pageId,
				x: place.x,
				y: place.y,
				width: dim.width,
				height: dim.height,
				devicePresetId: preset.id,
				heightMode: 'fixed',
			};
			project.frames.push(frame);
			return commit(project, { ...ui, selectedFrameId: frame.id });
		}
		case 'deleteFrame': {
			project.frames = project.frames.filter((f) => f.id !== action.frameId);
			if (ui.compare) {
				/* exit compare if needed */
			}
			return commit(project, { ...ui, selectedFrameId: null });
		}
		case 'duplicateFrameToDevices': {
			const source = project.frames.find((f) => f.id === action.frameId);
			if (!source) return state;
			const frameSetId = source.frameSetId ?? newId('fs');
			source.frameSetId = frameSetId;
			for (const pid of action.presetIds) {
				if (pid === source.devicePresetId) continue;
				if (project.frames.some((f) => f.frameSetId === frameSetId && f.devicePresetId === pid))
					continue;
				const preset = getDevicePreset(pid);
				if (!preset) continue;
				const dim = deviceDimensions(preset);
				project.frames.push({
					id: newId('frame'),
					name: source.name,
					pageId: source.pageId,
					x: 0,
					y: 0,
					width: dim.width,
					height: dim.height,
					devicePresetId: pid,
					heightMode: source.heightMode,
					themeId: source.themeId,
					frameSetId,
				});
			}
			relayoutFrameSet(project.frames, frameSetId);
			return commit(project);
		}
		case 'updateNodeLayout': {
			const page = project.pages.find((p) => p.id === ui.activePageId);
			if (!page) return state;
			const node = page.nodes[action.nodeId];
			if (!node) return state;
			const bp = ui.editScope === 'breakpoint'
				? breakpointForWidth(
						project.frames.find((f) => f.id === ui.selectedFrameId)?.width ?? 393,
					)
				: null;
			if (bp && ui.editScope === 'breakpoint') {
				node.overrides = node.overrides ?? {};
				node.overrides[bp] = {
					...node.overrides[bp],
					layout: { ...node.overrides[bp]?.layout, ...action.layout },
				};
			} else {
				node.layout = { ...node.layout, ...action.layout };
			}
			return commit(project);
		}
		case 'updateNodeContent': {
			const page = project.pages.find((p) => p.id === ui.activePageId);
			const node = page?.nodes[action.nodeId];
			if (node) node.content = { ...node.content, text: action.text };
			return commit(project);
		}
		case 'updateNodeVariant': {
			const page = project.pages.find((p) => p.id === ui.activePageId);
			const node = page?.nodes[action.nodeId];
			if (node?.instance) node.instance.variantKey = action.variantKey;
			return commit(project);
		}
		case 'addComponent': {
			const page = project.pages.find((p) => p.id === ui.activePageId);
			if (!page) return state;
			const parent = page.nodes[action.parentId];
			if (!parent) return state;
			const id = newId('node');
			const labels: Record<string, string> = {
				button: 'Button',
				card: 'Card',
				input: 'Input',
				badge: 'Badge',
				alert: 'Alert',
			};
			const node: DesignNode = {
				id,
				name: labels[action.definitionId] ?? action.definitionId,
				type: 'instance',
				parentId: action.parentId,
				children: [],
				instance: {
					definitionId: action.definitionId,
					variantKey: 'primary',
					props: { children: 'Label' },
				},
				layout: {
					mode: 'stack',
					gap: 0,
					padding: [0, 0, 0, 0],
					align: 'start',
					justify: 'start',
					widthMode: 'hug',
					heightMode: 'hug',
				},
			};
			page.nodes[id] = node;
			parent.children.push(id);
			return commit(project, { ...ui, selectedNodeId: id });
		}
		case 'createStyleTrial': {
			const frame = project.frames.find((f) => f.id === action.frameId);
			if (!frame) return state;
			const trial: StyleTrial = {
				id: newId('trial'),
				name: action.name ?? `Trial ${project.trials.length + 1}`,
				pageId: frame.pageId,
				baseThemeId: frame.themeId ?? project.defaultThemeId,
				tokenOverrides: {},
				variantSwaps: [],
				status: 'draft',
			};
			project.trials.push(trial);
			const place = findPlacementBesideCluster(
				project.frames,
				frame.width,
				frame.height,
				{ x: frame.x, y: frame.y },
			);
			const trialFrame: Frame = {
				...frame,
				id: newId('frame'),
				x: place.x,
				y: place.y,
				trialId: trial.id,
				name: `${frame.name} (trial)`,
			};
			project.frames.push(trialFrame);
			return commit(project, { ...ui, selectedFrameId: trialFrame.id });
		}
		case 'setTrialToken': {
			const frame = project.frames.find((f) => f.id === ui.selectedFrameId);
			const trial = project.trials.find((t) => t.id === frame?.trialId);
			if (trial) trial.tokenOverrides[action.token] = action.value;
			return commit(project);
		}
		case 'promoteTrial': {
			const trial = project.trials.find((t) => t.id === action.trialId);
			if (!trial) return state;
			const page = project.pages.find((p) => p.id === trial.pageId);
			if (action.to === 'page' && page) {
				for (const swap of trial.variantSwaps) {
					const n = page.nodes[swap.nodeId];
					if (n?.instance) n.instance.variantKey = swap.variantKey;
				}
			}
			if (action.to === 'new-theme') {
				Object.assign(project.customTokenOverrides, trial.tokenOverrides);
			}
			trial.status = 'promoted';
			return commit(project);
		}
		case 'setCompare': {
			if (!action.compare) {
				return { ...state, ui: { ...ui, compare: null } };
			}
			const compareReq = action.compare;
			project.frames = project.frames.filter((f) => !f.ghost);
			if (compareReq.kind === 'themes') {
				const src = project.frames.find((f) => f.id === compareReq.sourceFrameId);
				if (!src) return state;
				const ghostFrameIds: string[] = [];
				const placed = [...project.frames];
				for (const themeId of compareReq.themeIds) {
					const gid = newId('ghost');
					ghostFrameIds.push(gid);
					const pos = findPlacementBesideCluster(placed, src.width, src.height, {
						x: src.x,
						y: src.y,
					});
					const ghost: Frame = {
						...src,
						id: gid,
						x: pos.x,
						y: pos.y,
						themeId,
						ghost: true,
						readOnly: true,
					};
					project.frames.push(ghost);
					placed.push(ghost);
				}
				return pushHistory(
					{ ...state, ui: { ...ui, compare: { ...compareReq, ghostFrameIds } } },
					project,
				);
			}
			if (compareReq.kind === 'devices') {
				const page = project.pages.find((p) => p.id === compareReq.pageId);
				if (!page) return state;
				const existing = project.frames.filter((f) => f.pageId === page.id && !f.ghost);
				const tempFrameIds: string[] = [];
				for (const pid of DUPLICATE_TO_DEVICES_DEFAULT) {
					if (existing.some((f) => f.devicePresetId === pid)) continue;
					const preset = getDevicePreset(pid)!;
					const dim = deviceDimensions(preset);
					const id = newId('temp');
					tempFrameIds.push(id);
					project.frames.push({
						id,
						name: page.name,
						pageId: page.id,
						x: 40,
						y: 40,
						width: dim.width,
						height: dim.height,
						devicePresetId: pid,
						heightMode: 'fixed',
						ghost: true,
						readOnly: true,
					});
				}
				return pushHistory(
					{
						...state,
						ui: { ...ui, compare: { ...compareReq, tempFrameIds } },
					},
					project,
				);
			}
			if (compareReq.kind === 'matrix') {
				const page = project.pages.find((p) => p.id === compareReq.pageId);
				if (!page) return state;
				const layout = layoutCompareMatrix(
					project.frames,
					page.id,
					compareReq.themeIds,
					compareReq.devicePresetIds,
					() => newId('ghost'),
				);
				return pushHistory(
					{
						...state,
						ui: {
							...ui,
							compare: { ...compareReq, ghostFrameIds: layout.cellFrames, layout },
						},
					},
					project,
				);
			}
			return { ...state, ui: { ...ui, compare: compareReq } };
		}
		case 'exitCompare': {
			project.frames = project.frames.filter((f) => !f.ghost);
			return commit(project, { ...ui, compare: null });
		}
		case 'makeCompareReal': {
			for (const f of project.frames) {
				if (f.ghost) {
					f.ghost = false;
					f.readOnly = false;
				}
			}
			return commit(project, { ...ui, compare: null });
		}
		case 'applyAgentAction': {
			const a = action.action;
			const args = action.args ?? {};
			if (a === 'create_frame') {
				return reducer(state, {
					type: 'addFrame',
					pageId: args.pageId as string,
					presetId: args.devicePresetId as string,
				});
			}
			if (a === 'duplicate_frame_to_devices') {
				return reducer(state, {
					type: 'duplicateFrameToDevices',
					frameId: args.frameId as string,
					presetIds: args.devicePresetIds as string[],
				});
			}
			if (a === 'set_frame_theme') {
				return reducer(state, {
					type: 'setFrameTheme',
					frameId: args.frameId as string,
					themeId: args.themeId as ThemeId | null,
				});
			}
			if (a === 'create_style_trial') {
				return reducer(state, {
					type: 'createStyleTrial',
					frameId: args.frameId as string,
					name: args.name as string,
				});
			}
			return state;
		}
		default:
			return state;
	}
}

const initialState: DesignerState = {
	project: createInitialProject(),
	ui: {
		activePageId: PAGE_ID,
		selectedFrameId: 'frame-iphone',
		selectedNodeId: null,
		editScope: 'base',
		compare: null,
		assistantOpen: false,
		panning: false,
	},
	history: [createInitialProject()],
	historyIndex: 0,
};

type DesignerContextValue = {
	state: DesignerState;
	dispatch: React.Dispatch<Action>;
	fitAll: () => void;
	fitSelection: () => void;
};

const DesignerContext = createContext<DesignerContextValue | null>(null);

export function DesignerProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(reducer, initialState);

	const getCanvasViewport = () => {
		const el = document.querySelector('.infinite-canvas');
		return {
			w: el?.clientWidth ?? Math.max(400, window.innerWidth - 560),
			h: el?.clientHeight ?? Math.max(300, window.innerHeight - 160),
		};
	};

	const fitAll = useCallback(() => {
		const { ui, project } = state;
		const frames = project.frames.filter(
			(f) => f.ghost || f.pageId === ui.activePageId,
		);
		let bounds = boundsForFrames(frames);
		if (ui.compare?.kind === 'matrix' && ui.compare.layout) {
			const l = ui.compare.layout;
			const headerBounds = {
				x: l.originX,
				y: l.originY,
				w: l.headerW,
				h: l.headerH,
			};
			if (bounds) {
				bounds = {
					x: Math.min(bounds.x, headerBounds.x),
					y: Math.min(bounds.y, headerBounds.y),
					w: Math.max(bounds.x + bounds.w, headerBounds.x + l.headerW + 800) - Math.min(bounds.x, headerBounds.x),
					h: Math.max(bounds.y + bounds.h, l.originY + l.headerH + 400) - Math.min(bounds.y, headerBounds.y),
				};
			}
		}
		if (!bounds) return;
		const { w: viewW, h: viewH } = getCanvasViewport();
		const cam = cameraToFitBounds(bounds, viewW, viewH, 40);
		dispatch({ type: 'setCamera', patch: cam });
	}, [state]);

	const fitSelection = useCallback(() => {
		const f = state.project.frames.find((fr) => fr.id === state.ui.selectedFrameId);
		if (!f) {
			fitAll();
			return;
		}
		const { w: viewW, h: viewH } = getCanvasViewport();
		const cam = cameraToFitBounds(
			{
				x: f.x,
				y: f.y - 28,
				w: f.width,
				h: f.height + 28,
			},
			viewW,
			viewH,
			48,
		);
		dispatch({ type: 'setCamera', patch: cam });
	}, [state, fitAll]);

	const value = useMemo(
		() => ({ state, dispatch, fitAll, fitSelection }),
		[state, fitAll, fitSelection],
	);

	return <DesignerContext.Provider value={value}>{children}</DesignerContext.Provider>;
}

export function useDesigner() {
	const ctx = useContext(DesignerContext);
	if (!ctx) throw new Error('useDesigner requires DesignerProvider');
	return ctx;
}
