"use client";

import * as React from "react";

/**
 * Tiny client island that scrolls the #result element into view as soon
 * as the page hydrates. Used when the page rendered with ?url= in the
 * query — the server emitted the result inline, but the user just
 * arrived at the top of the document via form navigation, so without
 * this they'd have to scroll past the form to see what they fetched.
 *
 * The result wrapper sets `scroll-mt-16` so the navbar doesn't cover
 * the top edge after the scroll lands.
 */
export function ScrollToResult() {
  React.useEffect(() => {
    const target = document.getElementById("result");
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  return null;
}
