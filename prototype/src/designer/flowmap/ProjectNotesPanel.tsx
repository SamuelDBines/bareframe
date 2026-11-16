import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
	createProjectNote,
	createProjectNotesBatch,
	deleteProjectNote,
	listProjectNotes,
	notesToMarkdown,
	updateProjectNote,
	type ProjectNote,
} from '../../app/notesApi';
import { parseBulkNotes, type ParsedBulkNote } from '../../app/parseBulkNotes';
import { friendlyError } from '../../app/apiError';
import { useDesigner } from '../store';
import { useProjectNotes } from './ProjectNotesContext';

type StatusFilter = 'all' | 'open' | 'done';

type Props = {
	projectId: string;
	onFocusFrame: (frameId: string) => void;
	onClose: () => void;
};

export function ProjectNotesPanel({ projectId, onFocusFrame, onClose }: Props) {
	const { state } = useDesigner();
	const notesCtx = useProjectNotes();
	const frameNameById = useMemo(() => new Map(state.project.frames.map((f) => [f.id, f.name])), [state.project.frames]);
	const [notes, setNotes] = useState<ProjectNote[]>([]);
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
	const [screenFilter, setScreenFilter] = useState<string>('');
	const [whereDraft, setWhereDraft] = useState('');
	const [issueDraft, setIssueDraft] = useState('');
	const lastWhereRef = useRef('');
	const [pinFrame, setPinFrame] = useState(Boolean(state.ui.selectedFrameId));
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editWhere, setEditWhere] = useState('');
	const [editIssue, setEditIssue] = useState('');
	const [pasteOpen, setPasteOpen] = useState(false);
	const [pasteText, setPasteText] = useState('');
	const [pastePreview, setPastePreview] = useState<ParsedBulkNote[]>([]);
	const issueRef = useRef<HTMLTextAreaElement>(null);
	const pinId = useId();
	const filterScreenId = useId();
	const whereComposeId = useId();
	const issueComposeId = useId();

	const selectedFrameId = state.ui.selectedFrameId;

	const load = useCallback(async () => {
		setError(null);
		try {
			const list = await listProjectNotes(projectId, {
				status: statusFilter,
				frameId: screenFilter || undefined,
			});
			setNotes(list);
		} catch (err) {
			setError(friendlyError(err, 'Could not load notes'));
		}
	}, [projectId, screenFilter, statusFilter]);

	useEffect(() => {
		void load();
	}, [load]);

	useEffect(() => {
		issueRef.current?.focus();
	}, []);

	useEffect(() => {
		if (pasteOpen) setPastePreview(parseBulkNotes(pasteText));
	}, [pasteOpen, pasteText]);

	async function submitDraft() {
		const body = issueDraft.trim();
		if (!body || busy) return;
		const where = whereDraft.trim() || lastWhereRef.current.trim() || null;
		setBusy(true);
		setError(null);
		try {
			const frameId = pinFrame && selectedFrameId ? selectedFrameId : null;
			const created = await createProjectNote(projectId, { where, body, frameId });
			setNotes((prev) => [...prev, created]);
			notesCtx?.mergeNote(created);
			if (where) lastWhereRef.current = where;
			setWhereDraft(where ?? '');
			setIssueDraft('');
		} catch (err) {
			setError(friendlyError(err, 'Could not save note'));
		} finally {
			setBusy(false);
		}
	}

	async function savePasteBatch() {
		if (!pastePreview.length || busy) return;
		setBusy(true);
		try {
			const created = await createProjectNotesBatch(
				projectId,
				pastePreview.map((p) => ({ where: p.where || null, body: p.issue })),
			);
			setNotes((prev) => [...prev, ...created]);
			for (const n of created) notesCtx?.mergeNote(n);
			const last = pastePreview[pastePreview.length - 1];
			if (last?.where) {
				lastWhereRef.current = last.where;
				setWhereDraft(last.where);
			}
			setPasteText('');
			setPastePreview([]);
			setPasteOpen(false);
			void load();
		} catch (err) {
			setError(friendlyError(err, 'Could not import notes'));
		} finally {
			setBusy(false);
		}
	}

	async function toggleDone(note: ProjectNote) {
		setBusy(true);
		try {
			const updated = await updateProjectNote(projectId, note.id, {
				status: note.status === 'open' ? 'done' : 'open',
			});
			setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)));
			notesCtx?.mergeNote(updated);
		} catch (err) {
			setError(friendlyError(err, 'Update failed'));
		} finally {
			setBusy(false);
		}
	}

	async function saveEdit(noteId: string) {
		const body = editIssue.trim();
		if (!body) return;
		setBusy(true);
		try {
			const updated = await updateProjectNote(projectId, noteId, {
				where: editWhere.trim() || null,
				body,
			});
			setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)));
			notesCtx?.mergeNote(updated);
			setEditingId(null);
		} catch (err) {
			setError(friendlyError(err, 'Update failed'));
		} finally {
			setBusy(false);
		}
	}

	async function remove(noteId: string) {
		if (!window.confirm('Delete this note?')) return;
		setBusy(true);
		try {
			await deleteProjectNote(projectId, noteId);
			setNotes((prev) => prev.filter((n) => n.id !== noteId));
			notesCtx?.removeNote(noteId);
		} catch (err) {
			setError(friendlyError(err, 'Delete failed'));
		} finally {
			setBusy(false);
		}
	}

	async function copyMarkdown() {
		const exportNotes = await listProjectNotes(projectId, { status: 'all' });
		const md = notesToMarkdown(exportNotes);
		try {
			await navigator.clipboard.writeText(md);
		} catch {
			window.prompt('Copy notes:', md);
		}
	}

	function handleIssueKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			void submitDraft();
		}
	}

	return (
		<aside className="flow-map-notes-panel" data-testid="project-notes-panel" aria-label="Project notes">
			<header className="flow-map-notes-panel__head">
				<div>
					<strong>Notes</strong>
					<p className="bx-hint">Where + Issue per row. Enter in Issue saves; Shift+Enter adds a line.</p>
				</div>
				<button type="button" className="btn btn-sm btn-secondary" onClick={onClose} aria-label="Close notes">
					Close
				</button>
			</header>
			{error ? (
				<p className="flow-map-notes-panel__error" role="alert">
					{error}
				</p>
			) : null}
			<div className="flow-map-notes-panel__compose">
				<div className="field">
					<label htmlFor={whereComposeId}>Where</label>
					<input
						id={whereComposeId}
						type="text"
						data-testid="project-note-where"
						placeholder="e.g. top navigation on root page"
						value={whereDraft}
						disabled={busy}
						onChange={(e) => setWhereDraft(e.target.value)}
					/>
				</div>
				<div className="field">
					<label htmlFor={issueComposeId}>Issue</label>
					<textarea
						id={issueComposeId}
						ref={issueRef}
						data-testid="project-note-compose"
						rows={3}
						placeholder="What is wrong here?"
						value={issueDraft}
						disabled={busy}
						onChange={(e) => setIssueDraft(e.target.value)}
						onKeyDown={handleIssueKey}
					/>
				</div>
				<div className="flow-map-notes-panel__compose-actions">
					<label className="flow-map-notes-panel__pin">
						<input
							id={pinId}
							type="checkbox"
							checked={pinFrame}
							disabled={!selectedFrameId}
							onChange={(e) => setPinFrame(e.target.checked)}
						/>
						Pin to selected screen
					</label>
					<button
						type="button"
						className="btn btn-primary btn-sm"
						data-testid="project-note-add"
						disabled={busy || !issueDraft.trim()}
						onClick={() => void submitDraft()}
					>
						Add
					</button>
				</div>
			</div>
			<div className="flow-map-notes-panel__filters">
				<div className="flow-seg" role="tablist" aria-label="Note status">
					{(['all', 'open', 'done'] as const).map((s) => (
						<button
							key={s}
							type="button"
							role="tab"
							aria-selected={statusFilter === s}
							data-testid={`project-notes-filter-${s}`}
							onClick={() => setStatusFilter(s)}
						>
							{s === 'all' ? 'All' : s === 'open' ? 'Open' : 'Done'}
						</button>
					))}
				</div>
				<div className="field flow-map-notes-panel__screen-filter">
					<label htmlFor={filterScreenId}>Screen</label>
					<select
						id={filterScreenId}
						data-testid="project-notes-filter-screen"
						value={screenFilter}
						onChange={(e) => setScreenFilter(e.target.value)}
					>
						<option value="">All screens</option>
						{state.project.frames
							.filter((f) => !f.ghost)
							.map((f) => (
								<option key={f.id} value={f.id}>
									{f.name}
								</option>
							))}
					</select>
				</div>
				<div className="flow-map-notes-panel__filter-row">
					<button
						type="button"
						className="btn btn-secondary btn-sm"
						data-testid="project-notes-paste-open"
						onClick={() => setPasteOpen((o) => !o)}
					>
						Paste notes
					</button>
					<button
						type="button"
						className="btn btn-secondary btn-sm"
						data-testid="project-notes-copy-md"
						onClick={() => void copyMarkdown()}
					>
						Copy all as Markdown
					</button>
				</div>
			</div>
			{pasteOpen ? (
				<div className="flow-map-notes-panel__paste" data-testid="project-notes-paste">
					<label className="sr-only" htmlFor="project-notes-paste-text">
						Paste bulk notes
					</label>
					<textarea
						id="project-notes-paste-text"
						rows={6}
						data-testid="project-notes-paste-text"
						placeholder="Paste numbered Where/Issue blocks…"
						value={pasteText}
						onChange={(e) => setPasteText(e.target.value)}
					/>
					{pastePreview.length ? (
						<ol className="flow-map-notes-panel__paste-preview" data-testid="project-notes-paste-preview">
							{pastePreview.map((p) => (
								<li key={`${p.index}-${p.where}-${p.issue.slice(0, 24)}`}>
									<strong>{p.index}.</strong> {p.where ? <span>Where: {p.where}. </span> : null}
									Issue: {p.issue}
								</li>
							))}
						</ol>
					) : (
						<p className="bx-hint">No blocks recognized yet.</p>
					)}
					<button
						type="button"
						className="btn btn-primary btn-sm"
						data-testid="project-notes-paste-save"
						disabled={busy || !pastePreview.length}
						onClick={() => void savePasteBatch()}
					>
						Save {pastePreview.length} note{pastePreview.length === 1 ? '' : 's'}
					</button>
				</div>
			) : null}
			<ol className="flow-map-notes-panel__list" data-testid="project-notes-list">
				{notes.length === 0 ? (
					<li className="flow-map-notes-panel__empty">No notes yet. Add the first issue above.</li>
				) : (
					notes.map((note, idx) => (
						<li
							key={note.id}
							className={`flow-map-notes-item${note.status === 'done' ? ' flow-map-notes-item--done' : ''}${
								note.frameId ? ' flow-map-notes-item--clickable' : ''
							}`}
							data-testid="project-note-item"
							data-note-id={note.id}
							onClick={() => {
								if (note.frameId) onFocusFrame(note.frameId);
							}}
							onKeyDown={(e) => {
								if (note.frameId && (e.key === 'Enter' || e.key === ' ')) {
									e.preventDefault();
									onFocusFrame(note.frameId);
								}
							}}
							role={note.frameId ? 'button' : undefined}
							tabIndex={note.frameId ? 0 : undefined}
						>
							<div className="flow-map-notes-item__meta">
								<span className="flow-map-notes-item__number" aria-hidden>
									{idx + 1}
								</span>
								<span className={`flow-map-notes-item__status flow-map-notes-item__status--${note.status}`}>
									{note.status}
								</span>
								{note.where ? <span className="flow-map-notes-item__where">{note.where}</span> : null}
								{note.frameId ? (
									<button
										type="button"
										className="flow-map-notes-item__screen"
										onClick={(e) => {
											e.stopPropagation();
											onFocusFrame(note.frameId!);
										}}
									>
										{frameNameById.get(note.frameId) ?? 'Screen'}
									</button>
								) : null}
							</div>
							{editingId === note.id ? (
								<div onClick={(e) => e.stopPropagation()}>
									<input
										type="text"
										value={editWhere}
										aria-label="Edit where"
										onChange={(e) => setEditWhere(e.target.value)}
									/>
									<textarea
										rows={3}
										value={editIssue}
										aria-label="Edit issue"
										data-testid="project-note-edit"
										onChange={(e) => setEditIssue(e.target.value)}
									/>
									<div className="flow-map-notes-item__actions">
										<button type="button" className="btn btn-primary btn-sm" onClick={() => void saveEdit(note.id)}>
											Save
										</button>
										<button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>
											Cancel
										</button>
									</div>
								</div>
							) : (
								<p className="flow-map-notes-item__body">{note.body}</p>
							)}
							{editingId !== note.id ? (
								<div className="flow-map-notes-item__actions" onClick={(e) => e.stopPropagation()}>
									<button
										type="button"
										className="btn btn-secondary btn-sm"
										data-testid="project-note-toggle-done"
										onClick={() => void toggleDone(note)}
									>
										{note.status === 'open' ? 'Mark done' : 'Reopen'}
									</button>
									<button
										type="button"
										className="btn btn-secondary btn-sm"
										onClick={() => {
											setEditingId(note.id);
											setEditWhere(note.where ?? '');
											setEditIssue(note.body);
										}}
									>
										Edit
									</button>
									<button type="button" className="btn btn-secondary btn-sm" onClick={() => void remove(note.id)}>
										Delete
									</button>
								</div>
							) : null}
						</li>
					))
				)}
			</ol>
		</aside>
	);
}