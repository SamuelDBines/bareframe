import type { DesignerProject } from './types';
import type { ProjectDocument } from '@bareframe/designer-core';

const LOCAL_KEY = 'bareframe.designer.localProject.v1';

export type StoredLocalProject = {
	document: ProjectDocument;
	version: number;
	updatedAt: string;
};

export function loadLocalProject(): StoredLocalProject | null {
	try {
		const raw = localStorage.getItem(LOCAL_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as StoredLocalProject;
	} catch {
		return null;
	}
}

export function saveLocalProject(document: ProjectDocument, version = 1) {
	const payload: StoredLocalProject = {
		document,
		version,
		updatedAt: new Date().toISOString(),
	};
	localStorage.setItem(LOCAL_KEY, JSON.stringify(payload));
}

export function toProjectDocument(project: DesignerProject): ProjectDocument {
	return {
		schemaVersion: 1,
		project: {
			...project,
			connectors: project.connectors ?? [],
			annotations: project.annotations ?? [],
		},
	};
}

export function fromProjectDocument(document: ProjectDocument): DesignerProject {
	const p = document.project;
	return {
		...p,
		connectors: p.connectors ?? [],
		annotations: p.annotations ?? [],
	} as DesignerProject;
}

export function clearLocalProject() {
	localStorage.removeItem(LOCAL_KEY);
}
