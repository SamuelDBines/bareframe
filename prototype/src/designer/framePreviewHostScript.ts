/** Inline script injected into frame preview iframes to forward canvas gestures to the parent. */
export const FRAME_PREVIEW_MESSAGE_SOURCE = 'bareframe-frame-preview';

export function framePreviewHostScript(): string {
	return `<script>
(function () {
  var SOURCE = ${JSON.stringify(FRAME_PREVIEW_MESSAGE_SOURCE)};

  function post(msg) {
    try {
      parent.postMessage(Object.assign({ source: SOURCE }, msg), '*');
    } catch (err) {}
  }

  function screenPoint(clientX, clientY) {
    return { clientX: clientX, clientY: clientY, iframeLocal: true };
  }

  function onWheel(e) {
    e.preventDefault();
    e.stopPropagation();
    post({
      type: 'wheel',
      deltaX: e.deltaX,
      deltaY: e.deltaY,
      deltaMode: e.deltaMode,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey,
      clientX: e.clientX,
      clientY: e.clientY,
    });
  }

  window.addEventListener('wheel', onWheel, { passive: false, capture: true });
  document.addEventListener('wheel', onWheel, { passive: false, capture: true });

  var gestureStartZoom = 1;
  function onGestureStart(e) {
    e.preventDefault();
    gestureStartZoom = 1;
    post({ type: 'gesture-start', clientX: e.clientX, clientY: e.clientY });
  }
  function onGestureChange(e) {
    e.preventDefault();
    post({
      type: 'gesture-change',
      clientX: e.clientX,
      clientY: e.clientY,
      scale: e.scale,
    });
  }
  function onGestureEnd(e) {
    e.preventDefault();
    post({ type: 'gesture-end', clientX: e.clientX, clientY: e.clientY });
    gestureStartZoom = 1;
  }
  document.addEventListener('gesturestart', onGestureStart, { passive: false, capture: true });
  document.addEventListener('gesturechange', onGestureChange, { passive: false, capture: true });
  document.addEventListener('gestureend', onGestureEnd, { passive: false, capture: true });

  var panActive = false;
  function shouldPan(e) {
    return e.getModifierState(' ') || e.button === 1 || (e.buttons & 4) === 4;
  }
  function beginPan(e) {
    panActive = true;
    post({ type: 'pan', phase: 'start', clientX: e.clientX, clientY: e.clientY, button: e.button });
  }
  function onPointerDown(e) {
    if (!shouldPan(e)) return;
    e.preventDefault();
    e.stopPropagation();
    beginPan(e);
  }
  function onPointerMove(e) {
    if (!panActive && shouldPan(e) && e.buttons > 0) {
      beginPan(e);
    }
    if (!panActive) return;
    e.preventDefault();
    post({ type: 'pan', phase: 'move', clientX: e.clientX, clientY: e.clientY, button: e.button });
  }
  function onPointerUp(e) {
    if (!panActive) return;
    panActive = false;
    post({ type: 'pan', phase: 'end', clientX: e.clientX, clientY: e.clientY, button: e.button });
  }
  window.addEventListener('pointerdown', onPointerDown, true);
  window.addEventListener('pointermove', onPointerMove, true);
  window.addEventListener('pointerup', onPointerUp, true);
  window.addEventListener('pointercancel', onPointerUp, true);
})();
</script>`;
}
