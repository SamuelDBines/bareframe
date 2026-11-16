import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
	createProjectNote,
	deleteProjectNote,
	listProjectNotes,
	notesToMarkdown,
	updateProjectNote,
	type ProjectNote,
} from '../../app/notesApi';
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
	const [draft, setDraft] = useState('');
	const [pinFrame, setPinFrame] = useState(Boolean(state.ui.selectedFrameId));
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editBody, setEditBody] = useState('');
	const composeRef = useRef<HTMLTextAreaElement>(null);
	const pinId = useId();
	const filterScreenId = useId();

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
		composeRef.current?.focus();
	}, []);

	async function submitDraft() {
		const body = draft.trim();
		if (!body || busy) return;
		setBusy(true);
		setError(null);
		try {
			const frameId = pinFrame && selectedFrameId ? selectedFrameId : null;
			const created = await createProjectNote(projectId, { body, frameId });
			setNotes((prev) => [created, ...prev]);
			notesCtx?.mergeNote(created);
			setDraft('');
		} catch (err) {
			setError(friendlyError(err, 'Could not save note'));
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
		const body = editBody.trim();
		if (!body) return;
		setBusy(true);
		try {
			const updated = await updateProjectNote(projectId, noteId, { body });
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
		const md = notesToMarkdown(exportNotes, frameNameById);
		try {
			await navigator.clipboard.writeText(md);
		} catch {
			window.prompt('Copy notes:', md);
		}
	}

	function handleComposeKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
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
					<p className="bx-hint">Capture issues while you review. Enter saves; Shift+Enter adds a line.</p>
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
				<label className="sr-only" htmlFor="project-note-compose">
					New note
				</label>
				<textarea
					id="project-note-compose"
					ref={composeRef}
					data-testid="project-note-compose"
					rows={3}
					placeholder="Describe an issue on this site…"
					value={draft}
					disabled={busy}
					onChange={(e) => setDraft(e.target.value)}
					onKeyDown={handleComposeKey}
				/>
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
						disabled={busy || !draft.trim()}
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
				<button
					type="button"
					className="btn btn-secondary btn-sm"
					data-testid="project-notes-copy-md"
					onClick={() => void copyMarkdown()}
				>
					Copy all as Markdown
				</button>
			</div>
			<ul className="flow-map-notes-panel__list" data-testid="project-notes-list">
				{notes.length === 0 ? (
					<li className="flow-map-notes-panel__empty">No notes yet. Add the first issue above.</li>
				) : (
					notes.map((note) => (
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
								<span className={`flow-map-notes-item__status flow-map-notes-item__status--${note.status}`}>
									{note.status}
								</span>
								{note.frameId ? (
									<button
										type="button"
										className="flow-map-notes-item__screen"
										onClick={() => onFocusFrame(note.frameId!)}
									>
										{frameNameById.get(note.frameId) ?? 'Screen'}
									</button>
								) : null}
							</div>
							{editingId === note.id ? (
								<>
									<textarea
										rows={3}
										value={editBody}
										onChange={(e) => setEditBody(e.target.value)}
										data-testid="project-note-edit"
									/>
									<div className="flow-map-notes-item__actions">
										<button type="button" className="btn btn-primary btn-sm" onClick={() => void saveEdit(note.id)}>
											Save
										</button>
										<button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>
											Cancel
										</button>
									</div>
								</>
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
											setEditBody(note.body);
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
			</ul>
		</aside>
	);
}