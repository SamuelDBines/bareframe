import { stepsToCapturePayload, type RecordedStep } from './lib/flowSteps.js';
import { INPUT_MASK_CSS } from './lib/mask.js';

type Settings = {
	bfToken: string;
	bfApiBase: string;
	bfProjectId: string;
};

let recording = false;
let recordingTabId: number | undefined;
let steps: RecordedStep[] = [];
let pendingNavClick: RecordedStep['click'] | undefined;
let lastCaptureAt = 0;

function broadcast(type: string, extra: Record<string, unknown> = {}) {
	chrome.runtime.sendMessage({ type, ...extra }).catch(() => {});
}

async function settings(): Promise<Settings> {
	const data = await chrome.storage.local.get(['bfToken', 'bfApiBase', 'bfProjectId']);
	return {
		bfToken: String(data.bfToken ?? '').trim(),
		bfApiBase: String(data.bfApiBase ?? 'https://bareframe.org').trim().replace(/\/$/, ''),
		bfProjectId: String(data.bfProjectId ?? '').trim(),
	};
}

async function injectMask(tabId: number) {
	await chrome.scripting.insertCSS({ target: { tabId }, css: INPUT_MASK_CSS });
}

async function removeMask(tabId: number) {
	await chrome.scripting.removeCSS({ target: { tabId }, css: INPUT_MASK_CSS }).catch(() => {});
}

async function captureStep(tabId: number, clickMeta?: RecordedStep['click']) {
	if (!recording || tabId !== recordingTabId) return;
	const now = Date.now();
	if (now - lastCaptureAt < 400) return;
	lastCaptureAt = now;

	const tab = await chrome.tabs.get(tabId);
	if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;

	const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
	const [{ result }] = await chrome.scripting.executeScript({
		target: { tabId },
		func: () => ({
			w: window.innerWidth,
			h: window.innerHeight,
			dpr: window.devicePixelRatio,
			title: document.title,
		}),
	});

	steps.push({
		url: tab.url,
		title: result.title ?? tab.title ?? tab.url,
		capturedAt: new Date().toISOString(),
		viewport: { width: result.w, height: result.h, devicePixelRatio: result.dpr },
		click: clickMeta ?? pendingNavClick,
		dataUrl,
	});
	pendingNavClick = undefined;
	broadcast('steps-updated', { steps });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	void (async () => {
		switch (msg.type) {
			case 'get-state':
				sendResponse({ recording, steps, settings: await settings() });
				return;
			case 'save-settings':
				await chrome.storage.local.set({
					bfToken: msg.token,
					bfApiBase: msg.apiBase,
					bfProjectId: msg.projectId,
				});
				sendResponse({ ok: true });
				return;
			case 'list-projects': {
				const cfg = await settings();
				const res = await fetch(`${cfg.bfApiBase}/api/projects`, {
					headers: { Authorization: `Bearer ${cfg.bfToken}` },
				});
				const body = (await res.json()) as { projects?: { id: string; name: string }[]; error?: string };
				sendResponse({ ok: res.ok, projects: body.projects ?? [], error: body.error });
				return;
			}
			case 'start-recording': {
				const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
				if (!tab?.id) {
					sendResponse({ ok: false, error: 'No active tab' });
					return;
				}
				steps = [];
				recording = true;
				recordingTabId = tab.id;
				chrome.action.setBadgeText({ text: 'REC' });
				chrome.action.setBadgeBackgroundColor({ color: '#dc2626' });
				await chrome.tabs.sendMessage(tab.id, { type: 'recording-on' });
				await injectMask(tab.id);
				await captureStep(tab.id, undefined);
				broadcast('recording-state', { recording: true });
				sendResponse({ ok: true });
				return;
			}
			case 'stop-recording': {
				recording = false;
				chrome.action.setBadgeText({ text: '' });
				broadcast('recording-state', { recording: false });
				if (recordingTabId != null) {
					await chrome.tabs.sendMessage(recordingTabId, { type: 'recording-off' }).catch(() => {});
					await removeMask(recordingTabId);
				}
				sendResponse({ steps });
				recordingTabId = undefined;
				return;
			}
			case 'click-capture': {
				if (!recording || sender.tab?.id !== recordingTabId) return;
				pendingNavClick = msg.click;
				sendResponse({ ok: true });
				return;
			}
			case 'nav-capture': {
				const tabId = typeof msg.tabId === 'number' ? msg.tabId : recordingTabId;
				if (!recording || tabId == null || tabId !== recordingTabId) return;
				await captureStep(tabId, pendingNavClick);
				sendResponse({ ok: true });
				return;
			}
			case 'upload-flow': {
				const cfg = await settings();
				const selected: RecordedStep[] = msg.steps ?? steps;
				const projectRes = await fetch(`${cfg.bfApiBase}/api/projects/${cfg.bfProjectId}`, {
					headers: { Authorization: `Bearer ${cfg.bfToken}` },
				});
				if (!projectRes.ok) {
					sendResponse({ ok: false, error: 'Auth or project failed' });
					return;
				}
				const project = (await projectRes.json()) as { version: number };
				const payload = stepsToCapturePayload(selected);
				for (let i = 0; i < payload.length; i++) {
					const dataUrl = selected[i]?.dataUrl;
					if (!dataUrl) continue;
					const blob = await (await fetch(dataUrl)).blob();
					const buf = await blob.arrayBuffer();
					const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
					payload[i]!.imageBase64 = b64;
				}
				const res = await fetch(`${cfg.bfApiBase}/api/projects/${cfg.bfProjectId}/capture/flow`, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${cfg.bfToken}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						name: msg.name ?? `Recording ${new Date().toLocaleString()}`,
						baseVersion: project.version,
						steps: payload,
					}),
				});
				const body = await res.json().catch(() => ({}));
				sendResponse({ ok: res.ok, status: res.status, body });
				return;
			}
			case 'submit-note': {
				const cfg = await settings();
				let screenshot: string | undefined;
				if (msg.includeScreenshot) {
					const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
					if (tab?.windowId != null && tab.id != null) {
						await injectMask(tab.id);
						screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
						await removeMask(tab.id);
					}
				}
				const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
				const res = await fetch(`${cfg.bfApiBase}/api/projects/${cfg.bfProjectId}/notes/capture`, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${cfg.bfToken}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						where: msg.where,
						issue: msg.issue,
						pageUrl: tab?.url,
						elementSelector: msg.elementSelector,
						screenshot,
					}),
				});
				sendResponse({ ok: res.ok, status: res.status });
				return;
			}
			case 'pick-element-on':
				if (sender.tab?.id) await chrome.tabs.sendMessage(sender.tab.id, { type: 'pick-on' });
				sendResponse({ ok: true });
				return;
			case 'pick-element-off':
				if (sender.tab?.id) await chrome.tabs.sendMessage(sender.tab.id, { type: 'pick-off' });
				sendResponse({ ok: true });
				return;
			case 'element-picked':
				broadcast('element-picked', { selector: msg.selector });
				sendResponse({ ok: true });
				return;
			default:
				return;
		}
	})();
	return true;
});

chrome.webNavigation.onCommitted.addListener((details) => {
	if (details.frameId !== 0 || !recording || details.tabId !== recordingTabId) return;
	void captureStep(details.tabId, pendingNavClick);
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
	if (details.frameId !== 0 || !recording || details.tabId !== recordingTabId) return;
	void captureStep(details.tabId, pendingNavClick);
});

chrome.commands.onCommand.addListener((command) => {
	if (command === 'quick-note') {
		chrome.action.openPopup();
	}
});