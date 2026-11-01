export type ProjectUpdateEvent = {
	type: 'project_updated';
	projectId: string;
	version: number;
};

type Listener = (event: ProjectUpdateEvent) => void;

const listeners = new Map<string, Set<Listener>>();

export function subscribeProject(projectId: string, listener: Listener): () => void {
	let set = listeners.get(projectId);
	if (!set) {
		set = new Set();
		listeners.set(projectId, set);
	}
	set.add(listener);
	return () => {
		set!.delete(listener);
		if (set!.size === 0) listeners.delete(projectId);
	};
}

export function publishProjectUpdate(projectId: string, version: number) {
	const set = listeners.get(projectId);
	if (!set) return;
	const event: ProjectUpdateEvent = { type: 'project_updated', projectId, version };
	for (const listener of set) listener(event);
}

export function resetProjectEventBusForTests() {
	listeners.clear();
}
