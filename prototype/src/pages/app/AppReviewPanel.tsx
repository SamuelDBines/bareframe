import { useEffect, useMemo, useState } from 'react';
import { CATEGORY_LABEL, SEVERITY_ORDER, severityOf, useReview, type Severity } from '../../app/ReviewContext';
import type { ReviewIssue } from '../../app/reviewApi';
import { useDesigner } from '../../designer/store';

const SEV_LABEL: Record<Severity, string> = { critical: 'Critical', major: 'Major', minor: 'Minor', info: 'Info' };

type Tab = 'findings' | 'screen';

function FindingCard({ issue, frameName }: { issue: ReviewIssue; frameName?: string }) {
	const review = useReview()!;
	const { dispatch } = useDesigner();
	const sev = severityOf(issue);
	const active = review.activeIssueId === issue.id;
	const open = issue.status === 'open';

	return (
		<li
			className={`finding${active ? ' is-active' : ''}${open ? '' : ' is-closed'}`}
			data-testid="review-finding"
			id={`finding-${issue.id}`}
		>
			<button
				type="button"
				className="finding__head"
				aria-expanded={active}
				onClick={() => {
					review.setActiveIssue(active ? null : issue.id);
					if (issue.frameId) dispatch({ type: 'selectFrame', frameId: issue.frameId });
				}}
			>
				<span className="finding__chips">
					<span className={`bx-sev bx-sev--${open ? sev : 'ok'}`}>
						{open ? SEV_LABEL[sev] : issue.status === 'resolved' ? 'Fixed' : 'Dismissed'}
					</span>
					<span className="finding__cat">{CATEGORY_LABEL[issue.category] ?? issue.category.replace(/_/g, ' ')}</span>
				</span>
				<span className="finding__title">{issue.title}</span>
				{frameName ? <span className="finding__screen">on {frameName}</span> : null}
			</button>
			{active ? (
				<div className="finding__body bx-reveal">
					<p>{issue.explanation}</p>
					<div className="finding__fix">
						<strong>Suggested fix</strong>
						<p>{issue.fix}</p>
					</div>
					{open ? (
						<div className="finding__actions">
							{review.canApply(issue) ? (
								<button type="button" className="btn btn-primary btn-sm" onClick={() => review.applyFix(issue)}>
									{issue.category === 'missing_state' || issue.category === 'missing_screen' ? 'Add screen' : 'Apply fix'}
								</button>
							) : null}
							<button type="button" className="btn btn-ghost btn-sm" onClick={() => review.dismiss(issue)}>
								Dismiss
							</button>
						</div>
					) : null}
				</div>
			) : null}
		</li>
	);
}

function ScreenTab() {
	const { state, dispatch } = useDesigner();
	const { project, ui } = state;
	const frame = project.frames.find((f) => f.id === ui.selectedFrameId);
	const [name, setName] = useState(frame?.name ?? '');
	useEffect(() => setName(frame?.name ?? ''), [frame?.id, frame?.name]);

	if (!frame) {
		return (
			<div className="side-empty">
				<p>
					<strong>Select a screen</strong>
				</p>
				<p>Click a card on the map, or tab to it and press Enter, to see its details and connections.</p>
			</div>
		);
	}

	const nameOf = (id: string) => project.frames.find((f) => f.id === id)?.name ?? 'Unknown screen';
	const outgoing = project.connectors.filter((c) => c.fromFrameId === frame.id);
	const incoming = project.connectors.filter((c) => c.toFrameId === frame.id);
	const notes = project.annotations.filter((a) => a.frameId === frame.id && a.kind === 'note');

	return (
		<div className="screen-tab">
			<label className="field">
				<span>Screen name</span>
				<input
					value={name}
					readOnly={frame.readOnly}
					onChange={(e) => setName(e.target.value)}
					onBlur={() => name.trim() && name !== frame.name && dispatch({ type: 'renameFrame', frameId: frame.id, name: name.trim() })}
					onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
				/>
			</label>
			<section>
				<h3>Leads to</h3>
				{outgoing.length ? (
					<ul className="conn-list">
						{outgoing.map((c) => (
							<li key={c.id}>
								<span className="conn-list__label">{c.label ?? 'Next'}</span>
								<button type="button" className="btn-link" onClick={() => dispatch({ type: 'selectFrame', frameId: c.toFrameId })}>
									{nameOf(c.toFrameId)} →
								</button>
							</li>
						))}
					</ul>
				) : (
					<p className="bx-hint">No outgoing connections. Use “Connect” in Edit mode to add one.</p>
				)}
			</section>
			<section>
				<h3>Reached from</h3>
				{incoming.length ? (
					<ul className="conn-list">
						{incoming.map((c) => (
							<li key={c.id}>
								<button type="button" className="btn-link" onClick={() => dispatch({ type: 'selectFrame', frameId: c.fromFrameId })}>
									← {nameOf(c.fromFrameId)}
								</button>
								<span className="conn-list__label">{c.label ?? 'Next'}</span>
							</li>
						))}
					</ul>
				) : (
					<p className="bx-hint">This is an entry screen.</p>
				)}
			</section>
			{notes.length ? (
				<section>
					<h3>Fix notes</h3>
					<ul className="note-list">
						{notes.map((n) => (
							<li key={n.id}>{n.text.replace(/^Fix:\s*/, '')}</li>
						))}
					</ul>
				</section>
			) : null}
		</div>
	);
}

export function AppReviewPanel() {
	const review = useReview();
	const { state } = useDesigner();
	const [tab, setTab] = useState<Tab>('findings');
	const [filter, setFilter] = useState<Severity | 'all'>('all');

	useEffect(() => {
		if (review?.activeIssueId) {
			setTab('findings');
			document.getElementById(`finding-${review.activeIssueId}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
		}
	}, [review?.activeIssueId]);

	const issues = review?.issues ?? [];
	const counts = useMemo(() => {
		const c: Record<Severity, number> = { critical: 0, major: 0, minor: 0, info: 0 };
		for (const i of issues) if (i.status === 'open') c[severityOf(i)]++;
		return c;
	}, [issues]);
	const openCount = SEVERITY_ORDER.reduce((n, s) => n + counts[s], 0);

	const visible = issues
		.filter((i) => filter === 'all' || severityOf(i) === filter)
		.sort(
			(a, b) =>
				Number(a.status !== 'open') - Number(b.status !== 'open') ||
				SEVERITY_ORDER.indexOf(severityOf(a)) - SEVERITY_ORDER.indexOf(severityOf(b)),
		);

	if (!review) return null;
	const frameName = (id?: string) => state.project.frames.find((f) => f.id === id)?.name;
	const running = review.status === 'running';

	return (
		<aside className="side-panel" aria-label="Project details">
			<div className="side-panel__tabs flow-seg" role="tablist" aria-label="Panel">
				<button type="button" role="tab" aria-selected={tab === 'findings'} onClick={() => setTab('findings')}>
					AI findings{openCount ? <span className="side-panel__count">{openCount}</span> : null}
				</button>
				<button type="button" role="tab" aria-selected={tab === 'screen'} onClick={() => setTab('screen')}>
					Screen
				</button>
			</div>

			{tab === 'screen' ? (
				<ScreenTab />
			) : (
				<div className="side-panel__body">
					<div className="review-head">
						<div>
							<h2>AI review</h2>
							<p>Problems, missing screens, drop-off risk and accessibility, pinned to the map.</p>
						</div>
						{review.demo ? null : (
							<button
								type="button"
								className="btn btn-primary btn-sm"
								onClick={() => void review.runReview()}
								disabled={running || review.aiUnavailable}
								data-testid="run-review"
							>
								{running ? 'Reviewing…' : issues.length ? 'Re-run review' : 'Run review'}
							</button>
						)}
					</div>

					{review.aiUnavailable ? (
						<div className="bx-notice" role="status" data-testid="review-unavailable">
							<span className="bx-notice__icon" aria-hidden>
								i
							</span>
							<p>
								<strong>AI review is paused for now.</strong> Your map, edits and prototype still work. Try a
								review again later.
							</p>
						</div>
					) : null}
					{review.notice ? (
						<div className="bx-notice bx-notice--warn" role="status">
							<span className="bx-notice__icon" aria-hidden>
								!
							</span>
							<p>{review.notice}</p>
						</div>
					) : null}

					{running ? (
						<div className="review-running" role="status">
							<span className="review-running__bar" />
							Checking every screen and connection…
						</div>
					) : null}

					{issues.length > 0 ? (
						<>
							<div className="sev-filter" role="group" aria-label="Filter by severity">
								<button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
									All <b>{openCount}</b>
								</button>
								{SEVERITY_ORDER.filter((s) => counts[s] > 0 || filter === s).map((s) => (
									<button
										key={s}
										type="button"
										className={`sev-filter__btn sev-filter__btn--${s}`}
										aria-pressed={filter === s}
										onClick={() => setFilter(filter === s ? 'all' : s)}
									>
										{SEV_LABEL[s]} <b>{counts[s]}</b>
									</button>
								))}
							</div>
							<ol className="findings">
								{visible.map((issue) => (
									<FindingCard key={issue.id} issue={issue} frameName={frameName(issue.frameId)} />
								))}
							</ol>
						</>
					) : !running && review.status !== 'running' ? (
						<div className="side-empty">
							<p>
								<strong>No findings yet</strong>
							</p>
							<p>Run a review to have AI check this flow. Findings appear here and as flags on the map.</p>
						</div>
					) : null}
				</div>
			)}
		</aside>
	);
}
