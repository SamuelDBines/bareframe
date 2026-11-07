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
  var batchSize = 6;
  var flushMs = 4500;

  if (!token) {
    console.warn('[bareframe-capture] Missing data-token or window.BAREFRAME_TOKEN');
    return;
  }

  var queue = [];
  var sessionId =
    window.sessionStorage.getItem('bf_capture_session') ||
    'cap_' + Math.random().toString(36).slice(2, 12);
  window.sessionStorage.setItem('bf_capture_session', sessionId);

  var lastUrl = location.href;
  var captureBusy = false;
  var html2canvasLoader = null;

  function viewport() {
    return { width: window.innerWidth, height: window.innerHeight };
  }

  function sensitiveSelector() {
    return [
      'input[type="password"]',
      'input[autocomplete*="cc"]',
      'input[name*="card"]',
      'input[name*="cvv"]',
      '[data-bareframe-redact]',
      '[data-sensitive]',
    ].join(',');
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
      }
      el.setAttribute('data-bf-redacted', '1');
      el.textContent = el.textContent ? '••••' : '';
    });
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
    var base = Object.assign(
      {
        sessionId: sessionId,
        url: location.href,
        title: document.title,
        viewport: viewport(),
        ts: Date.now(),
      },
      partial,
    );
    queue.push(base);
    if (queue.length >= batchSize) flush();
  }

  function flush() {
    if (!queue.length) return;
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
    }).catch(function () {
      queue = batch.concat(queue);
    });
  }

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
})();
