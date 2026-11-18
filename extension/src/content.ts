import { RECORDING_BADGE_ID, recordingBadgeHtml } from './lib/mask.js';
import { clickMetaFromTarget } from './lib/selector.js';

let pickMode = false;

function showRecordingBadge() {
	if (document.getElementById(RECORDING_BADGE_ID)) return;
	const wrap = document.createElement('div');
	wrap.innerHTML = recordingBadgeHtml();
	document.documentElement.appendChild(wrap.firstElementChild!);
}

function hideRecordingBadge() {
	document.getElementById(RECORDING_BADGE_ID)?.remove();
}

function installSpaHooks() {
	const notify = () => chrome.runtime.sendMessage({ type: 'nav-capture' });
	const patch = (method: 'pushState' | 'replaceState') => {
		const original = history[method].bind(history);
		history[method] = (...args: Parameters<History['pushState']>) => {
			const result = original(...args);
			notify();
			return result;
		};
	};
	patch('pushState');
	patch('replaceState');
	window.addEventListener('popstate', notify);
	window.addEventListener('hashchange', notify);
}

installSpaHooks();

document.addEventListener(
	'click',
	(ev) => {
		const target = ev.target;
		if (!(target instanceof Element)) return;
		if (pickMode) {
			ev.preventDefault();
			ev.stopPropagation();
			pickMode = false;
			document.body.style.cursor = '';
			chrome.runtime.sendMessage({
				type: 'element-picked',
				selector: clickMetaFromTarget(target, { x: ev.clientX, y: ev.clientY }).selector,
			});
			return;
		}
		chrome.runtime.sendMessage({
			type: 'click-capture',
			click: clickMetaFromTarget(target, { x: ev.clientX, y: ev.clientY }),
		});
	},
	true,
);

chrome.runtime.onMessage.addListener((msg) => {
	if (msg.type === 'recording-on') showRecordingBadge();
	if (msg.type === 'recording-off') hideRecordingBadge();
	if (msg.type === 'pick-on') {
		pickMode = true;
		document.body.style.cursor = 'crosshair';
	}
	if (msg.type === 'pick-off') {
		pickMode = false;
		document.body.style.cursor = '';
	}
});