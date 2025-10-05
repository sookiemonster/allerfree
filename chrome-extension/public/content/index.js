// Entry: top-window guard, page observer, wiring (classic script)
(function (g) {
  if (window.top !== window) return;

  const ns = (g.__allerfree ||= {});
  const {
    TIMINGS, debounce, buildSignature,
    getTarget, isMenuTabSelected, attachMenuObserverIfNeeded, detachMenuObserver, emitMenu
  } = ns;

  let lastSig = null;

  function emit(reason) {
    const sig = buildSignature(getTarget);
    if (sig === lastSig) return;

    lastSig = sig;

    if (!isMenuTabSelected()) {
      detachMenuObserver();
      return;
    }

    attachMenuObserverIfNeeded();
    emitMenu('from-emit');
  }

  setTimeout(function () {
    emit("initial");

    const observer = new MutationObserver(
      debounce(() => emit('dom-mutation'), TIMINGS.pageDebounce)
    );

    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true
    });

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') emit('visible');
    });

    const poll = setInterval(function () { emit('poll'); }, TIMINGS.poll);

    window.addEventListener('beforeunload', function () {
      observer.disconnect();
      detachMenuObserver();
      clearInterval(poll);
    });
  }, TIMINGS.initialDelay);
})(self);
