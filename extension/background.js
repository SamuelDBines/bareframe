let recording = false;
let paused = false;
let steps = [];
let lastCaptureAt = 0;

const MASK_STYLE_ID = 'bf-record-mask-style';

function broadcast(type, extra = {}) {
  chrome.runtime.sendMessage({ type, ...extra }).catch(() => {});
}

async function injectMask(tabId) {
  await chrome.scripting.insertCSS({
    target: { tabId },
    css: `input, textarea, [contenteditable=true] { filter: blur(6px) !important; }`,
  });
}

async function removeMask(tabId) {
  await chrome.scripting.removeCSS({
    target: { tabId },
    css: `input, textarea, [contenteditable=true] { filter: blur(6px) !important; }`,
  });
}

async function captureStep(tab, clickMeta) {
  if (paused) return;
  const now = Date.now();
  if (now - lastCaptureAt < 500) return;
  lastCaptureAt = now;
  const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({
      w: window.innerWidth,
      h: window.innerHeight,
      dpr: window.devicePixelRatio,
    }),
  });
  steps.push({
    url: tab.url,
    capturedAt: new Date().toISOString(),
    viewport: { width: result.w, height: result.h, devicePixelRatio: result.dpr },
    click: clickMeta,
    dataUrl,
  });
  broadcast('steps-updated', { steps });
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    if (msg.type === 'get-state') {
      sendResponse({ recording, steps });
      return;
    }
    if (msg.type === 'start-recording') {
      steps = [];
      recording = true;
      paused = false;
      chrome.action.setBadgeText({ text: 'REC' });
      chrome.action.setBadgeBackgroundColor({ color: '#dc2626' });
      broadcast('recording-state', { recording: true });
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await injectMask(tab.id);
        await captureStep(tab, undefined);
      }
      sendResponse({ ok: true });
      return;
    }
    if (msg.type === 'toggle-pause') {
      paused = !paused;
      sendResponse(paused);
      return;
    }
    if (msg.type === 'stop-recording') {
      recording = false;
      paused = false;
      chrome.action.setBadgeText({ text: '' });
      broadcast('recording-state', { recording: false });
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) await removeMask(tab.id);
      sendResponse(steps);
      return;
    }
    if (msg.type === 'click-capture') {
      if (!recording || paused) return;
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) await captureStep(tab, msg.click);
      return;
    }
    if (msg.type === 'nav-capture') {
      if (!recording || paused) return;
      const tab = await chrome.tabs.get(msg.tabId);
      await captureStep(tab, undefined);
      return;
    }
    if (msg.type === 'upload-recording') {
      const kept = new Set(msg.keptIndexes ?? steps.map((_, i) => i));
      const selected = steps.filter((_, i) => kept.has(i));
      const projectRes = await fetch(`${msg.apiBase}/api/projects/${msg.projectId}`, {
        headers: { Authorization: `Bearer ${msg.token}` },
      });
      if (!projectRes.ok) throw new Error('auth failed');
      const project = await projectRes.json();
      const payloadSteps = [];
      for (let i = 0; i < selected.length; i++) {
        const s = selected[i];
        const blob = await (await fetch(s.dataUrl)).blob();
        const buf = await blob.arrayBuffer();
        const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
        payloadSteps.push({
          stepIndex: i,
          url: s.url,
          capturedAt: s.capturedAt,
          viewport: s.viewport,
          click: s.click,
          imageBase64: b64,
          contentType: 'image/png',
        });
      }
      const res = await fetch(`${msg.apiBase}/api/projects/${msg.projectId}/recordings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${msg.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Recording ${new Date().toLocaleString()}`,
          baseVersion: project.version,
          build: true,
          steps: payloadSteps,
        }),
      });
      sendResponse({ ok: res.ok });
      return;
    }
  })();
  return true;
});

chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId !== 0) return;
  if (!recording) return;
  chrome.runtime.sendMessage({ type: 'nav-capture', tabId: details.tabId }).catch(() => {});
});
