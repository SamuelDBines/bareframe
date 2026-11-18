type RecordedStep = {
	url: string;
	title?: string;
	click?: { name?: string };
};

const els = {
	apiBase: document.getElementById('apiBase') as HTMLInputElement,
	token: document.getElementById('token') as HTMLInputElement,
	projectId: document.getElementById('projectId') as HTMLSelectElement,
	reloadProjects: document.getElementById('reload-projects') as HTMLButtonElement,
	record: document.getElementById('record') as HTMLButtonElement,
	stop: document.getElementById('stop') as HTMLButtonElement,
	upload: document.getElementById('upload') as HTMLButtonElement,
	steps: document.getElementById('steps') as HTMLDivElement,
	recDot: document.getElementById('rec-dot') as HTMLSpanElement,
	noteWhere: document.getElementById('note-where') as HTMLInputElement,
	noteIssue: document.getElementById('note-issue') as HTMLTextAreaElement,
	noteShot: document.getElementById('note-shot') as HTMLInputElement,
	pick: document.getElementById('pick') as HTMLButtonElement,
	submitNote: document.getElementById('submit-note') as HTMLButtonElement,
	picked: document.getElementById('picked') as HTMLParagraphElement,
};

let localSteps: RecordedStep[] = [];
let pickedSelector = '';

function send<T>(msg: Record<string, unknown>): Promise<T> {
	return chrome.runtime.sendMessage(msg);
}

async function persistSettings() {
	await send({
		type: 'save-settings',
		token: els.token.value.trim(),
		apiBase: els.apiBase.value.trim(),
		projectId: els.projectId.value,
	});
}

function renderSteps(steps: RecordedStep[]) {
	localSteps = steps;
	els.steps.innerHTML = steps
		.map(
			(s, i) =>
				`<div>${i + 1}. ${s.title ?? s.url}${s.click?.name ? ` (${s.click.name})` : ''}</div>`,
		)
		.join('');
	els.upload.disabled = steps.length === 0;
}

chrome.storage.local.get(['bfToken', 'bfApiBase', 'bfProjectId'], (data) => {
	if (data.bfApiBase) els.apiBase.value = data.bfApiBase;
	if (data.bfToken) els.token.value = data.bfToken;
});

chrome.runtime.onMessage.addListener((msg) => {
	if (msg.type === 'steps-updated') renderSteps(msg.steps ?? []);
	if (msg.type === 'recording-state') {
		els.recDot.hidden = !msg.recording;
	}
	if (msg.type === 'element-picked') {
		pickedSelector = msg.selector ?? '';
		els.picked.textContent = pickedSelector ? `Picked: ${pickedSelector}` : '';
	}
});

document.querySelectorAll<HTMLButtonElement>('.tab').forEach((tab) => {
	tab.addEventListener('click', () => {
		document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
		tab.classList.add('active');
		const id = tab.dataset.tab;
		document.getElementById('tab-flow')?.classList.toggle('hidden', id !== 'flow');
		document.getElementById('tab-note')?.classList.toggle('hidden', id !== 'note');
	});
});

els.reloadProjects.addEventListener('click', async () => {
	await persistSettings();
	const res = await send<{ ok: boolean; projects: { id: string; name: string }[] }>({
		type: 'list-projects',
	});
	els.projectId.innerHTML = '<option value="">Pick a project</option>';
	for (const p of res.projects ?? []) {
		const opt = document.createElement('option');
		opt.value = p.id;
		opt.textContent = p.name;
		els.projectId.append(opt);
	}
	const saved = (await chrome.storage.local.get(['bfProjectId'])).bfProjectId;
	if (saved) els.projectId.value = saved;
});

els.record.addEventListener('click', async () => {
	await persistSettings();
	await send({ type: 'start-recording' });
	els.record.disabled = true;
	els.stop.disabled = false;
});

els.stop.addEventListener('click', async () => {
	const res = await send<{ steps: RecordedStep[] }>({ type: 'stop-recording' });
	renderSteps(res.steps ?? []);
	els.record.disabled = false;
	els.stop.disabled = true;
});

els.upload.addEventListener('click', async () => {
	await persistSettings();
	els.upload.disabled = true;
	els.upload.textContent = 'Uploading';
	const res = await send<{ ok: boolean; status: number }>({ type: 'upload-flow', steps: localSteps });
	els.upload.textContent = res.ok ? 'Uploaded' : `Failed (${res.status})`;
	els.upload.disabled = false;
});

els.pick.addEventListener('click', async () => {
	await send({ type: 'pick-element-on' });
});

els.submitNote.addEventListener('click', async () => {
	await persistSettings();
	els.submitNote.disabled = true;
	const res = await send<{ ok: boolean }>({
		type: 'submit-note',
		where: els.noteWhere.value.trim() || document.title,
		issue: els.noteIssue.value.trim(),
		includeScreenshot: els.noteShot.checked,
		elementSelector: pickedSelector || undefined,
	});
	els.submitNote.textContent = res.ok ? 'Saved' : 'Failed';
	els.submitNote.disabled = false;
});

void send<{ recording: boolean; steps: RecordedStep[] }>({ type: 'get-state' }).then((state) => {
	if (state?.steps?.length) renderSteps(state.steps);
	if (state?.recording) {
		els.record.disabled = true;
		els.stop.disabled = false;
		els.recDot.hidden = false;
	}
	if (state?.settings?.bfApiBase) els.apiBase.value = state.settings.bfApiBase;
	if (state?.settings?.bfToken) els.token.value = state.settings.bfToken;
	if (state?.settings?.bfProjectId) {
		void els.reloadProjects.click();
		els.projectId.value = state.settings.bfProjectId;
	}
});

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
	if (tab?.title && !els.noteWhere.value) els.noteWhere.placeholder = tab.title;
});