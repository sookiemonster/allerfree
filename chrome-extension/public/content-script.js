// Script to run on google maps
// if the dom of the visiable page change (or the page changes)
// then we emit an event, we can use this to know when we are looking
// at a restrant and also if the menu tab is open

(() => {
  // Only run in the top page to avoid duplicate alerts
  if (window.top !== window) return;

	// used to see if the user is selected on smth, if not just grab body   
  function getTarget() {
    return document.querySelector('#pane') ||
			document.querySelector('[role="main"]') ||
			document.body;
  }

  // Build a dom state tracker but tracking the inner text for the body
  // used to see if the dom changes and if it does we mark those events
  function buildSignature() {
    const href = location.href;

    const t = getTarget();
    // Use trimmed innerText to uniformly track state
    // Cap length to keep it fast.
    const text = (t?.innerText || "").trim();
    const len = text.length;

    // also grab specific ui elements
    const h1 = t?.querySelectorAll('h1, [role="heading"][aria-level="1"]').length || 0;
    const tabs = t?.querySelectorAll('[role="tab"]').length || 0;
    const buttons = t?.querySelectorAll('button').length || 0;
    const lists = t?.querySelectorAll('ul, ol').length || 0;

    // resist tiny edits/noise
    const head = text.slice(0, 200);
    const tail = text.slice(-200);

    return JSON.stringify({ href, len, h1, tabs, buttons, lists, head, tail });
  }

  // Allows for mutliple changes (temporally close to each other) to be listed as one
	// so there isnt multiple calls on a series of changes
  const debounce = (fn, ms) => {
    let id = 0;
    return (...args) => {
      clearTimeout(id);
      id = setTimeout(() => fn(...args), ms);
    };
  };

  let lastSig = null;

  let buttonInjected = false;

  function emit(reason) {
    const sig = buildSignature();
    if (sig !== lastSig) {
      lastSig = sig;

      if(!isMenuTabSelected()) 
      {
        buttonInjected = false;
        return;
      }

      if(buttonInjected)
      {
        return;
      }

      buttonInjected = injectButton();

      console.log(buttonInjected ? "Button injectd" : "inection failed");
    }
  }

  function injectButton()
  {
    const menuDiv = document.querySelector('div[aria-label="Menu"]');
      if (!menuDiv) {
        return false;
      }
      
      const h2 = document.createElement("h2");
      h2.textContent = "weefdeee";
      h2.style.color = "red";
      menuDiv.prepend(h2);
      buttonInjected = true;
      return true;
      
  }

  // first time run
  emit('initial');

  // Observe broad DOM mutations; debounce to reduce spam.
  const observer = new MutationObserver(
    debounce(() => emit('dom-mutation'), 200)
  );

  // Observe the whole document: Maps re-parents nodes frequently.
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true
  });

  // emit on coming back to the tab
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') emit('visible');
  });

  // Fallback: periodic check in case some changes dodge MutationObserver (rare).
  const poll = setInterval(() => emit('poll'), 1000);

  // Clean up if page unloads
  window.addEventListener('beforeunload', () => {
    observer.disconnect();
    clearInterval(poll);
  });

  // check if the menu is open so we can inject if it is
  function isMenuTabSelected() {
    // grab any menu button/tab
    const menuBtn = document.querySelector('[role="tab"][aria-selected][aria-label="Menu"]')
              || [...document.querySelectorAll('[role="tab"]')]
                   .find(el => el.textContent.trim() === "Menu");

    // if found and 
    if (!menuBtn) {
      console.log("Menu tab not found");
      return false;
      
    } 
    
    if (menuBtn.getAttribute("aria-selected") === "true") {
      console.log("Menu tab is open");
      return true;
    }
    
    console.log("Menu tab is not open");
    return false;
    
  }
})();
