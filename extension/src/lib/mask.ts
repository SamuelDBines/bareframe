export const INPUT_MASK_CSS =
	'input, textarea, [contenteditable="true"], [contenteditable=true] { filter: blur(8px) !important; }';

export const RECORDING_BADGE_ID = 'bareframe-recording-badge';

export function recordingBadgeHtml(): string {
	return `<div id="${RECORDING_BADGE_ID}" style="position:fixed;z-index:2147483646;top:8px;right:8px;padding:6px 10px;border-radius:6px;background:#dc2626;color:#fff;font:600 12px system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.25);">Bareframe recording</div>`;
}