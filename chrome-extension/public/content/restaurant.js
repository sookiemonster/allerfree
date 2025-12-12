// public/content/restaurant.js

(function (g) {
  const ns = (g.__allerfree ||= {});

  // Local "state" holding the most recently computed restaurant info
  let currentRestaurant = null;

  /**
   * function to get restaruant name and 
   */
  function parseRestaurantFromUrl(url) {
    try {
      const u = new URL(url);

      if (!u.hostname.includes("google.") || !u.pathname.includes("/maps")) {
        return null;
      }

      const path = u.pathname || "";
      let name = null;
      let lat = null;
      let lng = null;

      // Primary pattern: /maps/place/<Name>/@<lat>,<lng>
      // (coords may be decimals; we normalize them to whole numbers below)
      const placeMatch = path.match(
        /\/maps\/place\/([^/]+)\/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/
      );

      if (placeMatch) {
        name = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
        lat = parseFloat(placeMatch[2]);
        lng = parseFloat(placeMatch[3]);
      } else {
        // Fallback: still try to grab coords from an "/@lat,lng" segment
        const atIdx = path.indexOf("/@");
        if (atIdx >= 0) {
          const afterAt = path.slice(atIdx + 2);
          const coordMatch = afterAt.match(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
          if (coordMatch) {
            lat = parseFloat(coordMatch[1]);
            lng = parseFloat(coordMatch[2]);
          }
        }

        const qName = u.searchParams.get("q") || u.searchParams.get("query");
        if (qName) {
          name = decodeURIComponent(qName.replace(/\+/g, " "));
        } else {
          const placeIdx = path.indexOf("/maps/place/");
          if (placeIdx >= 0) {
            const afterPlace = path.slice(placeIdx + "/maps/place/".length);
            const frag = afterPlace.split("/")[0];
            if (frag) name = decodeURIComponent(frag.replace(/\+/g, " "));
          }
        }
      }

      if (!name && lat == null && lng == null) return null;

      // Round to nearest whole number so decimal precision differences don’t create new keys
      const roundCoord = (v) =>
        typeof v === "number" && Number.isFinite(v) ? Math.round(v) : null;

      lat = roundCoord(lat);
      lng = roundCoord(lng);

      return { name: name || "", lat, lng };
    } catch (_e) {
      return null;
    }
  }


  /**
   * Public helper: compute current restaurant metadata for this tab,
   * derived from the URL.
   */
  ns.getRestaurantInfo = function () {
    const parsed = parseRestaurantFromUrl(location.href);
    if (!parsed) return null;

    return {
      name: parsed.name,
      coordinates:
        parsed.lat != null && parsed.lng != null
          ? { lat: parsed.lat, lng: parsed.lng }
          : null,
      url: location.href,
    };
  };

  /**
   * Public helper: get last stored restaurant info (stateful).
   */
  ns.getCurrentRestaurant = function () {
    return currentRestaurant;
  };

  /**
   * Clear the stored restaurant info (used when there is no menu).
   */
  ns.clearRestaurantInfo = function () {
    currentRestaurant = null;
		console.log("[Allerfree] Restaurant info from URL:", currentRestaurant);
  };


  /**
   * "Send" restaurant info — currently only stores it and logs it.
   * The actual chrome.runtime.sendMessage line is commented out so
   * nothing is sent to the background yet.
   */
  ns.sendRestaurantInfoToBackground = function (info) {
    try {
      const restaurant =
        info || (ns.getRestaurantInfo && ns.getRestaurantInfo()) || null;

      currentRestaurant = restaurant;

      console.log("[Allerfree] Restaurant info from URL:", restaurant);

      // If/when you want to actually send this to the service worker,
      // uncomment this block:
      //
      // chrome.runtime?.sendMessage({
      //   type: "RESTAURANT_INFO_UPDATE",
      //   restaurant,
      //   url: location.href,
      // });
    } catch (_e) {
      // ignore
    }
  };

  /**
   * Optional: allow the background to request restaurant info.
   * Left fully commented out so there is no messaging for now.
   */

  // if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
  //   chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  //     if (msg && msg.type === "REQUEST_RESTAURANT_INFO") {
  //       try {
  //         const info = ns.getRestaurantInfo ? ns.getRestaurantInfo() : null;
  //         sendResponse({ restaurant: info });
  //       } catch (_e) {
  //         sendResponse({ restaurant: null });
  //       }
  //       // synchronous response
  //       return false;
  //     }
  //
  //     // let other listeners run
  //     return undefined;
  //   });
  // }
})(self);
