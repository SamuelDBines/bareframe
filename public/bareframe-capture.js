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
  var batchSize = 8;
  var flushMs = 4000;

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
  var navigatedFrom = null;

  function viewport() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  function enqueue(partial) {
    queue.push(
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
    navigatedFrom = from;
    lastUrl = to;
    enqueue({ url: to, title: document.title, navigatedFrom: from });
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

  enqueue({ navigatedFrom: null });
})();
