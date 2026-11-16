import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { listProjectNotes, type ProjectNote } from '../../app/notesApi';

type Value = {
	notes: ProjectNote[];
	openCountByFrame: Map<string, number>;
	refresh: () => Promise<void>;
	mergeNote: (note: ProjectNote) => void;
	removeNote: (noteId: string) => void;
	reloadFromPanel: (next: ProjectNote[]) => void;
};

const ProjectNotesContext = createContext<Value | null>(null);

export function ProjectNotesProvider({ projectId, children }: { projectId: string; children: ReactNode }) {
	const [notes, setNotes] = useState<ProjectNote[]>([]);

	const refresh = useCallback(async () => {
		const list = await listProjectNotes(projectId, { status: 'all' });
		setNotes(list);
	}, [projectId]);

	useEffect(() => {
		void refresh().catch(() => undefined);
	}, [refresh]);

	const openCountByFrame = useMemo(() => {
		const map = new Map<string, number>();
		for (const note of notes) {
			if (note.status !== 'open' || !note.frameId) continue;
			map.set(note.frameId, (map.get(note.frameId) ?? 0) + 1);
		}
		return map;
	}, [notes]);

	const value = useMemo<Value>(
		() => ({
			notes,
			openCountByFrame,
			refresh,
			mergeNote: (note) =>
				setNotes((prev) =>
					[...prev.filter((n) => n.id !== note.id), note].sort(
						(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
					),
				),
			removeNote: (noteId) => setNotes((prev) => prev.filter((n) => n.id !== noteId)),
			reloadFromPanel: (next) => setNotes(next),
		}),
		[notes, openCountByFrame, refresh],
	);

	return <ProjectNotesContext.Provider value={value}>{children}</ProjectNotesContext.Provider>;
}

export function useProjectNotes() {
	return useContext(ProjectNotesContext);
}