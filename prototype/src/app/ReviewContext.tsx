import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useDesigner } from '../designer/store';
import { DEMO_REVIEW_ISSUES } from '../designer/demoReviewProject';
import { FLOW_CARD_HEIGHT, FLOW_CARD_GAP_Y } from '../designer/flowmap/flowMapLayout';
import { friendlyError, isAiUnavailable } from './apiError';
import { getReviewRun, listReviewRuns, patchReviewIssue, startReview, type ReviewIssue } from './reviewApi';

export type Severity = 'critical' | 'major' | 'minor' | 'info';

export const SEVERITY_ORDER: Severity[] = ['critical', 'major', 'minor', 'info'];

export const CATEGORY_LABEL: Record<string, string> = {
	ux_problem: 'UX friction',
	missing_state: 'Missing screen',
	missing_screen: 'Missing screen',
	drop_off_estimate: 'Drop-off risk',
	accessibility: 'Accessibility',
	design_consistency: 'Consistency',
	alternative_solution: 'Idea',
};

export function severityOf(issue: { severity: string }): Severity {
	return (SEVERITY_ORDER as string[]).includes(issue.severity) ? (issue.severity as Severity) : 'info';
}

export type ReviewState = {
	issues: ReviewIssue[];
	status: 'idle' | 'running' | 'ready' | 'failed';
	aiUnavailable: boolean;
	notice: string | null;
	activeIssueId: string | null;
	demo: boolean;
	setActiveIssue: (id: string | null) => void;
	runReview: () => Promise<void>;
	applyFix: (issue: ReviewIssue) => void;
	dismiss: (issue: ReviewIssue) => void;
	canApply: (issue: ReviewIssue) => boolean;
};

const ReviewContext = createContext<ReviewState | null>(null);

/** Optional: the share page and plain canvases have no review. */
export function useReview() {
	return useContext(ReviewContext);
}

/** Demo issues reference screens by position in the Hookoh demo journey. */
const DEMO_FRAME_INDEX: Record<string, number> = { iss_ux_1: 0, iss_drop_1: 1, iss_missing_1: 2 };

export function ReviewProvider({
	projectId,
	demo = false,
	children,
}: {
	projectId?: string;
	demo?: boolean;
	children: ReactNode;
}) {
	const { state, dispatch } = useDesigner();
	const frames = state.project.frames;
	const [issues, setIssues] = useState<ReviewIssue[]>([]);
	const [runId, setRunId] = useState<string | null>(null);
	const [status, setStatus] = useState<ReviewState['status']>('idle');
	const [aiUnavailable, setAiUnavailable] = useState(false);
	const [notice, setNotice] = useState<string | null>(null);
	const [activeIssueId, setActiveIssue] = useState<string | null>(null);
	const pollRef = useRef<number | null>(null);

	// Demo: attach the fixed sample issues to the demo screens once they load.
	useEffect(() => {
		if (!demo || frames.length === 0 || issues.length > 0) return;
		const flowFrames = frames.filter((f) => !f.ghost);
		setIssues(
			DEMO_REVIEW_ISSUES.map((i) => ({
				...i,
				frameId: flowFrames[DEMO_FRAME_INDEX[i.id] ?? 0]?.id,
				annotationId: undefined,
			})),
		);
		setStatus('ready');
	}, [demo, frames, issues.length]);

	// Real project: show the latest completed review on open.
	useEffect(() => {
		if (demo || !projectId) return;
		let cancelled = false;
		listReviewRuns(projectId)
			.then(async ({ runs }) => {
				const latest = runs.find((r) => r.status === 'completed');
				if (!latest || cancelled) return;
				const run = await getReviewRun(projectId, latest.id);
				if (cancelled) return;
				setRunId(latest.id);
				setIssues(run.issues ?? []);
				setStatus('ready');
			})
			.catch(() => undefined);
		return () => {
			cancelled = true;
		};
	}, [demo, projectId]);

	useEffect(
		() => () => {
			if (pollRef.current) window.clearInterval(pollRef.current);
		},
		[],
	);

	const runReview = useCallback(async () => {
		if (demo || !projectId) return;
		setNotice(null);
		setStatus('running');
		try {
			const res = await startReview(projectId);
			setRunId(res.runId);
			if (pollRef.current) window.clearInterval(pollRef.current);
			pollRef.current = window.setInterval(() => {
				void getReviewRun(projectId, res.runId)
					.then((run) => {
						if (run.status !== 'completed' && run.status !== 'failed') return;
						if (pollRef.current) window.clearInterval(pollRef.current);
						setIssues(run.issues ?? []);
						setStatus(run.status === 'completed' ? 'ready' : 'failed');
						if (run.status === 'failed') setNotice('That review didn’t finish. Please run it again.');
					})
					.catch(() => undefined);
			}, 900);
		} catch (e) {
			if (isAiUnavailable(e)) setAiUnavailable(true);
			else setNotice(friendlyError(e, 'We couldn’t start the review. Please try again.'));
			setStatus(issues.length ? 'ready' : 'idle');
		}
	}, [demo, projectId, issues.length]);

	const setIssueStatus = useCallback(
		(issue: ReviewIssue, next: 'resolved' | 'dismissed') => {
			setIssues((prev) => prev.map((i) => (i.id === issue.id ? { ...i, status: next } : i)));
			if (!demo && projectId && runId) {
				void patchReviewIssue(projectId, runId, issue.id, next).catch(() =>
					setNotice('Saved on this device; we’ll sync the change when you’re back online.'),
				);
			}
		},
		[demo, projectId, runId],
	);

	const canApply = useCallback((issue: ReviewIssue) => Boolean(issue.frameId && frames.some((f) => f.id === issue.frameId)), [frames]);

	const applyFix = useCallback(
		(issue: ReviewIssue) => {
			const frame = frames.find((f) => f.id === issue.frameId);
			if (!frame) return;
			if (issue.category === 'missing_state' || issue.category === 'missing_screen') {
				const name = issue.title.length > 40 ? `${issue.title.slice(0, 38)}…` : issue.title;
				const newId = `frame-fix-${issue.id}`;
				// Drop the new screen under the lowest card in the same column so nothing overlaps.
				const column = frames.filter((f) => !f.ghost && Math.abs(f.x - frame.x) < 40);
				const below = Math.max(...column.map((f) => f.y)) + FLOW_CARD_HEIGHT + FLOW_CARD_GAP_Y;
				dispatch({
					type: 'addScreen',
					frameId: newId,
					name: `New: ${name}`,
					heading: name,
					body: issue.fix,
					x: frame.x,
					y: below,
					connectFrom: { frameId: frame.id, label: 'Edge case' },
				});
			} else {
				dispatch({
					type: 'addAnnotation',
					annotation: {
						frameId: frame.id,
						kind: 'note',
						target: { kind: 'rect', x: 16, y: 16, w: 280, h: 48 },
						text: `Fix: ${issue.fix}`,
					},
				});
			}
			setIssueStatus(issue, 'resolved');
		},
		[dispatch, frames, setIssueStatus],
	);

	const dismiss = useCallback((issue: ReviewIssue) => setIssueStatus(issue, 'dismissed'), [setIssueStatus]);

	const value = useMemo<ReviewState>(
		() => ({
			issues,
			status,
			aiUnavailable,
			notice,
			activeIssueId,
			demo,
			setActiveIssue,
			runReview,
			applyFix,
			dismiss,
			canApply,
		}),
		[issues, status, aiUnavailable, notice, activeIssueId, demo, runReview, applyFix, dismiss, canApply],
	);

	return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>;
}
