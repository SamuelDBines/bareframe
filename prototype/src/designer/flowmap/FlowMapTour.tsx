import { createPortal } from 'react-dom';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { readFlowMapTourState, writeFlowMapTourDismissed } from './flowMapTourStorage';

export type FlowMapTourStep = {
	id: string;
	title: string;
	body: string;
	/** CSS selector for the spotlight target */
	target: string;
	placement?: 'bottom' | 'top' | 'left' | 'right';
};

const STEPS: FlowMapTourStep[] = [
	{
		id: 'edit-mode',
		title: 'Edit your flow',
		body: 'Switch to Edit when you want to add screens, move cards, or draw connections between them.',
		target: '[data-testid="flow-mode-edit"]',
		placement: 'bottom',
	},
	{
		id: 'add-screen',
		title: 'Add a screen',
		body: 'Drop a new device frame on the map. Each screen is backed by a page you can design later.',
		target: '[data-testid="flow-add-screen"]',
		placement: 'bottom',
	},
	{
		id: 'connect',
		title: 'Connect the journey',
		body: 'Turn on Connect, pick a starting screen, then the screen it leads to. Labels show on the arrows.',
		target: '[data-testid="flow-connect-screens"]',
		placement: 'bottom',
	},
	{
		id: 'import',
		title: 'Import or capture',
		body: 'Pull frames from Figma or use sitemap capture to seed the map faster.',
		target: '[data-testid="flow-more-menu"]',
		placement: 'bottom',
	},
	{
		id: 'review',
		title: 'Run AI review',
		body: 'AI findings flag problems on the map and in this panel — fix gaps before you ship.',
		target: '[data-testid="run-review"]',
		placement: 'left',
	},
	{
		id: 'prototype',
		title: 'Try the prototype',
		body: 'Play through the flow like a user. Hotspots follow your connectors.',
		target: '[data-testid="flow-mode-prototype"]',
		placement: 'bottom',
	},
];

type Spotlight = { top: number; left: number; width: number; height: number };

function measureTarget(selector: string): Spotlight | null {
	const el = document.querySelector(selector);
	if (!el) return null;
	const r = el.getBoundingClientRect();
	return { top: r.top, left: r.left, width: r.width, height: r.height };
}

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** When true, auto-open once for new empty maps if not dismissed */
	autoEligible: boolean;
};

export function FlowMapTour({ open, onOpenChange, autoEligible }: Props) {
	const [stepIndex, setStepIndex] = useState(0);
	const [spot, setSpot] = useState<Spotlight | null>(null);
	const step = STEPS[stepIndex];
	const isLast = stepIndex >= STEPS.length - 1;

	const remeasure = useCallback(() => {
		if (!open || !step) {
			setSpot(null);
			return;
		}
		setSpot(measureTarget(step.target));
	}, [open, step]);

	useEffect(() => {
		if (!autoEligible || readFlowMapTourState().dismissed) return;
		const t = window.setTimeout(() => onOpenChange(true), 600);
		return () => window.clearTimeout(t);
	}, [autoEligible, onOpenChange]);

	useLayoutEffect(() => {
		remeasure();
	}, [remeasure, stepIndex]);

	useEffect(() => {
		if (!open) return;
		const onResize = () => remeasure();
		window.addEventListener('resize', onResize);
		window.addEventListener('scroll', onResize, true);
		return () => {
			window.removeEventListener('resize', onResize);
			window.removeEventListener('scroll', onResize, true);
		};
	}, [open, remeasure]);

	const finish = (dismissForever: boolean) => {
		if (dismissForever) writeFlowMapTourDismissed(true);
		setStepIndex(0);
		onOpenChange(false);
	};

	const cardStyle = useMemo(() => {
		if (!spot) return { top: '20%', left: '50%', transform: 'translateX(-50%)' } as const;
		const pad = 12;
		const gap = 14;
		const cardW = 320;
		const placement = step?.placement ?? 'bottom';
		let top = spot.top + spot.height + gap;
		let left = spot.left + spot.width / 2 - cardW / 2;
		if (placement === 'top') top = spot.top - gap - 160;
		if (placement === 'left') {
			left = spot.left - gap - cardW;
			top = spot.top + spot.height / 2 - 80;
		}
		if (placement === 'right') {
			left = spot.left + spot.width + gap;
			top = spot.top + spot.height / 2 - 80;
		}
		left = Math.max(pad, Math.min(left, window.innerWidth - cardW - pad));
		top = Math.max(pad, Math.min(top, window.innerHeight - 200));
		return { top, left, width: cardW };
	}, [spot, step?.placement]);

	if (!open || !step) return null;

	const hole = spot
		? {
				x: spot.left - 6,
				y: spot.top - 6,
				w: spot.width + 12,
				h: spot.height + 12,
		  }
		: null;

	return createPortal(
		<div className="flow-tour" data-testid="flow-map-tour">
			<div
				className="flow-tour__shade"
				style={
					hole
						? {
								boxShadow: `0 0 0 9999px rgba(15, 12, 35, 0.55)`,
								borderRadius: 12,
								position: 'fixed',
								top: hole.y,
								left: hole.x,
								width: hole.w,
								height: hole.h,
								pointerEvents: 'none',
						  }
						: undefined
				}
				aria-hidden
			/>
			{!hole ? <div className="flow-tour__shade flow-tour__shade--full" aria-hidden /> : null}
			<div className="flow-tour__card bx-card" style={cardStyle} role="dialog" aria-labelledby="flow-tour-title">
				<p className="flow-tour__step">
					Step {stepIndex + 1} of {STEPS.length}
				</p>
				<h2 id="flow-tour-title">{step.title}</h2>
				<p>{step.body}</p>
				<div className="flow-tour__actions">
					<button type="button" className="btn btn-ghost btn-sm" onClick={() => finish(true)}>
						Don&apos;t show again
					</button>
					<div className="flow-tour__actions-right">
						<button type="button" className="btn btn-ghost btn-sm" onClick={() => finish(false)}>
							Skip
						</button>
						<button
							type="button"
							className="btn btn-primary btn-sm"
							data-testid="flow-tour-next"
							onClick={() => {
								if (isLast) finish(true);
								else setStepIndex((i) => i + 1);
							}}
						>
							{isLast ? 'Done' : 'Next'}
						</button>
					</div>
				</div>
			</div>
		</div>,
		document.body,
	);
}

export function useFlowMapTourReplay() {
	return useCallback(() => {
		writeFlowMapTourDismissed(false);
	}, []);
}
