(function () {
  'use strict';

  var script = document.currentScript;
  var token =
    (script && script.getAttribute('data-token')) ||
    window.BAREFRAME_TOKEN ||
    '';
  var endpoint =
    (script && script.getAttribute('data-endpoint')) ||
    window.BAREFRAME_CAPTURE_URL ||
    'https://bareframe.org/api/v1/capture/events';
  var screenshotsOn =
    (script && script.getAttribute('data-screenshots') === '1') ||
    window.BAREFRAME_CAPTURE_SCREENSHOTS === true;
  var redactOn = script ? script.getAttribute('data-redact') !== '0' : true;
  var consentRequired = script ? script.getAttribute('data-consent-required') !== '0' : true;
  var retentionDays = Number(script && script.getAttribute('data-retention-days')) || 90;
  var batchSize = 6;
  var flushMs = 4500;

  if (!token) {
    console.warn('[bareframe-capture] Missing data-token or window.BAREFRAME_TOKEN');
    return;
  }

  function privacyOptOut() {
    try {
      if (navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes') return true;
      if (navigator.msDoNotTrack === '1') return true;
      if (window.doNotTrack === '1') return true;
      if (navigator.globalPrivacyControl === true) return true;
    } catch (e) {}
    return false;
  }

  if (privacyOptOut()) {
    console.info('[bareframe-capture] Skipped — Do Not Track / Global Privacy Control is enabled.');
    return;
  }

  var consentGranted = !consentRequired;
  if (script && script.getAttribute('data-consent') === 'granted') {
    consentGranted = true;
  }
  if (window.BAREFRAME_CAPTURE_CONSENT === true) {
    consentGranted = true;
  }

  var queue = [];
  var sessionId =
    window.sessionStorage.getItem('bf_capture_session') ||
    'cap_' + Math.random().toString(36).slice(2, 12);
  window.sessionStorage.setItem('bf_capture_session', sessionId);
  try {
    window.sessionStorage.setItem(
      'bf_capture_expires',
      String(Date.now() + retentionDays * 24 * 60 * 60 * 1000),
    );
  } catch (e) {}

  var lastUrl = location.href;
  var captureBusy = false;
  var html2canvasLoader = null;

  var PII_EMAIL = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  var PII_PHONE = /(\+?\d[\d\s().-]{7,}\d)/g;
  var PII_CARD = /\b(?:\d[ -]*?){13,19}\b/g;

  function viewport() {
    return { width: window.innerWidth, height: window.innerHeight };
  }

  function sensitiveSelector() {
    return [
      'input',
      'textarea',
      'select',
      'input[type="password"]',
      'input[autocomplete*="cc"]',
      'input[name*="card"]',
      'input[name*="cvv"]',
      '[data-bareframe-mask]',
      '[data-bareframe-redact]',
      '[data-sensitive]',
    ].join(',');
  }

  function maskTextNode(text) {
    if (!text || !redactOn) return text;
    return text
      .replace(PII_EMAIL, '[email redacted]')
      .replace(PII_PHONE, '[phone redacted]')
      .replace(PII_CARD, '[number redacted]');
  }

  function loadHtml2Canvas() {
    if (html2canvasLoader) return html2canvasLoader;
    html2canvasLoader = import('https://esm.sh/html2canvas@1.4.1')
      .then(function (m) {
        return m.default || m;
      })
      .catch(function () {
        return null;
      });
    return html2canvasLoader;
  }

  function redactDocument(root) {
    if (!redactOn) return;
    root.querySelectorAll(sensitiveSelector()).forEach(function (el) {
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        el.value = '';
        el.setAttribute('value', '');
        el.placeholder = '';
      }
      el.setAttribute('data-bf-redacted', '1');
      if (el.textContent) {
        el.textContent = maskTextNode(el.textContent);
      }
    });
    root.querySelectorAll('p, span, li, label, h1, h2, h3, h4, h5, h6, td, th').forEach(function (el) {
      if (el.childNodes.length === 1 && el.childNodes[0] && el.childNodes[0].nodeType === 3) {
        var masked = maskTextNode(el.textContent || '');
        if (masked !== el.textContent) el.textContent = masked;
      }
    });
  }

  function sanitizeEvent(partial) {
    var out = Object.assign({}, partial);
    var blocked = [
      'password',
      'value',
      'card',
      'cvv',
      'ssn',
      'secret',
      'token',
      'email',
      'phone',
      'payment',
    ];
    Object.keys(out).forEach(function (key) {
      var lower = key.toLowerCase();
      if (blocked.some(function (b) { return lower.indexOf(b) !== -1; })) {
        delete out[key];
      }
      var val = out[key];
      if (typeof val === 'string' && val.length > 8000) {
        delete out[key];
      }
    });
    return out;
  }

  function captureScreenshot() {
    if (!screenshotsOn || captureBusy) return Promise.resolve(undefined);
    captureBusy = true;
    return loadHtml2Canvas()
      .then(function (html2canvas) {
        if (!html2canvas) return undefined;
        redactDocument(document.documentElement);
        return html2canvas(document.body, {
          logging: false,
          scale: Math.min(1, 720 / window.innerWidth),
          useCORS: true,
          ignoreElements: function (el) {
            return el && el.getAttribute && el.getAttribute('data-bf-redacted') === '1';
          },
          onclone: function (doc) {
            redactDocument(doc.documentElement);
          },
        }).then(function (canvas) {
          try {
            return canvas.toDataURL('image/jpeg', 0.55);
          } catch (e) {
            return undefined;
          }
        });
      })
      .catch(function () {
        return undefined;
      })
      .finally(function () {
        captureBusy = false;
      });
  }

  function enqueue(partial) {
    if (!consentGranted) return;
    var base = sanitizeEvent(
      Object.assign(
        {
          sessionId: sessionId,
          url: location.href,
          title: document.title,
          viewport: viewport(),
          ts: Date.now(),
        },
        partial,
      ),
    );
    queue.push(base);
    if (queue.length >= batchSize) flush();
  }

  function flush() {
    if (!consentGranted || !queue.length) return;
    var batch = queue.splice(0, batchSize);
    var body = JSON.stringify({ events: batch, sync: true });
    fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: body,
      keepalive: true,
      mode: 'cors',
      credentials: 'omit',
    }).catch(function () {
      queue = batch.concat(queue);
    });
  }

  var captureStarted = false;
  function startCapture() {
    if (captureStarted) return;
    captureStarted = true;
    setInterval(flush, flushMs);
    window.addEventListener('pagehide', flush);

    function onNavigate(from, to) {
      lastUrl = to;
      if (screenshotsOn) {
        captureScreenshot().then(function (shot) {
          enqueue({
            url: to,
            title: document.title,
            navigatedFrom: from,
            screenshot: shot,
          });
        });
      } else {
        enqueue({ url: to, title: document.title, navigatedFrom: from });
      }
    }

    document.addEventListener(
      'click',
      function (ev) {
        var t = ev.target;
        if (!(t instanceof Element)) return;
        var anchor = t.closest('a[href]');
        if (!anchor) return;
        var sel = '';
        try {
          sel = anchor.id ? '#' + anchor.id : anchor.tagName.toLowerCase();
        } catch (e) {}
        enqueue({
          clickedSelector: sel,
          navigatedFrom: location.href,
        });
      },
      true,
    );

    var pushState = history.pushState;
    history.pushState = function () {
      var prev = location.href;
      var ret = pushState.apply(history, arguments);
      onNavigate(prev, location.href);
      return ret;
    };
    var replaceState = history.replaceState;
    history.replaceState = function () {
      var prev = location.href;
      var ret = replaceState.apply(history, arguments);
      onNavigate(prev, location.href);
      return ret;
    };
    window.addEventListener('popstate', function () {
      onNavigate(lastUrl, location.href);
    });

    if (screenshotsOn) {
      captureScreenshot().then(function (shot) {
        enqueue({ navigatedFrom: null, screenshot: shot });
      });
    } else {
      enqueue({ navigatedFrom: null });
    }
  }

  window.Bareframe = window.Bareframe || {};
  window.Bareframe.consent = function (granted) {
    consentGranted = Boolean(granted);
    if (consentGranted) startCapture();
  };
  window.Bareframe.revoke = function () {
    consentGranted = false;
    queue = [];
  };
  window.Bareframe.captureConfig = {
    screenshotsOn: screenshotsOn,
    redactOn: redactOn,
    consentRequired: consentRequired,
    retentionDays: retentionDays,
    dataLocationNote: 'EU/UK processing when using bareframe.org cloud — confirm your DPA.',
  };

  if (consentGranted) {
    startCapture();
  }
})();
