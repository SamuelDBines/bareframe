const STORAGE_KEYS = ['bfUploadToken', 'bfApiBase', 'bfProjectId'];

const els = {
  token: document.getElementById('token'),
  apiBase: document.getElementById('apiBase'),
  projectId: document.getElementById('projectId'),
  record: document.getElementById('record'),
  pause: document.getElementById('pause'),
  stop: document.getElementById('stop'),
  upload: document.getElementById('upload'),
  steps: document.getElementById('steps'),
  recDot: document.getElementById('rec-dot'),
};

chrome.storage.local.get(STORAGE_KEYS, (data) => {
  if (data.bfUploadToken) els.token.value = data.bfUploadToken;
  if (data.bfApiBase) els.apiBase.value = data.bfApiBase;
  if (data.bfProjectId) els.projectId.value = data.bfProjectId;
});

function persist() {
  chrome.storage.local.set({
    bfUploadToken: els.token.value.trim(),
    bfApiBase: els.apiBase.value.trim().replace(/\/$/, ''),
    bfProjectId: els.projectId.value.trim(),
  });
}

async function send(msg) {
  return chrome.runtime.sendMessage(msg);
}

function renderSteps(steps) {
  els.steps.innerHTML = steps
    .map(
      (s, i) =>
        `<div><label><input type="checkbox" data-i="${i}" checked /> ${i + 1}. ${s.url}${
          s.click?.name ? ` — ${s.click.name}` : ''
        }</label></div>`,
    )
    .join('');
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'steps-updated') renderSteps(msg.steps);
  if (msg.type === 'recording-state') {
    document.body.classList.toggle('recording', msg.recording);
    els.recDot.textContent = msg.recording ? ' ● REC' : '';
  }
});

els.record.addEventListener('click', async () => {
  persist();
  await send({ type: 'start-recording' });
  els.record.disabled = true;
  els.pause.disabled = false;
  els.stop.disabled = false;
});

els.pause.addEventListener('click', async () => {
  const paused = await send({ type: 'toggle-pause' });
  els.pause.textContent = paused ? 'Resume' : 'Pause';
});

els.stop.addEventListener('click', async () => {
  const steps = await send({ type: 'stop-recording' });
  renderSteps(steps ?? []);
  els.record.disabled = false;
  els.pause.disabled = true;
  els.stop.disabled = true;
  els.upload.disabled = !(steps?.length);
});

els.upload.addEventListener('click', async () => {
  persist();
  const kept = [...els.steps.querySelectorAll('input[type=checkbox]')]
    .filter((c) => c.checked)
    .map((c) => Number(c.dataset.i));
  els.upload.disabled = true;
  els.upload.textContent = 'Uploading…';
  try {
    const result = await send({
      type: 'upload-recording',
      token: els.token.value.trim(),
      apiBase: els.apiBase.value.trim(),
      projectId: els.projectId.value.trim(),
      keptIndexes: kept,
    });
    els.upload.textContent = result.ok ? 'Uploaded ✓' : 'Failed';
  } catch {
    els.upload.textContent = 'Failed';
  }
});

send({ type: 'get-state' }).then((state) => {
  if (state?.steps) renderSteps(state.steps);
  if (state?.recording) {
    els.record.disabled = true;
    els.pause.disabled = false;
    els.stop.disabled = false;
    document.body.classList.add('recording');
    els.recDot.textContent = ' ● REC';
  }
});
