// ═══════════════════════════════════════════════════════════════════════════
// Minimal hash router with URL-addressable search params.
// Routes: #/, #/pathways, #/q/:id
// Query params live in the hash too: #/q/foo?pathway=intact&view=relevant
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from "react";

function parseHash() {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  const [pathPart, queryPart] = hash.split("?");
  const path = pathPart || "/";
  const query = new URLSearchParams(queryPart || "");

  // Parse path into route + params
  const segments = path.split("/").filter(Boolean);
  let route = "index";
  let params = {};
  if (segments[0] === "pathways") {
    route = "pathways";
  } else if (segments[0] === "q" && segments[1]) {
    route = "question";
    params.id = segments[1];
  }

  // Extract standardized query state
  const state = {
    pathway: query.get("pathway") || null,
    view: query.get("view") || "relevant", // mine | relevant | all
    search: query.get("s") || "",
    section: query.get("section") || null,
    observerRole: query.get("role") || null,
  };

  // Cohort filters (demographic): prefix "c_"
  const cohort = {};
  for (const [key, val] of query.entries()) {
    if (key.startsWith("c_") && val) {
      cohort[key.slice(2)] = val;
    }
  }
  state.cohort = Object.keys(cohort).length > 0 ? cohort : null;

  return { route, params, state };
}

function serializeState(route, params, state) {
  let path;
  if (route === "pathways") path = "/pathways";
  else if (route === "question") path = `/q/${params.id}`;
  else path = "/";

  const q = new URLSearchParams();
  if (state.pathway) q.set("pathway", state.pathway);
  if (state.view && state.view !== "relevant") q.set("view", state.view);
  if (state.search) q.set("s", state.search);
  if (state.section) q.set("section", state.section);
  if (state.observerRole) q.set("role", state.observerRole);
  if (state.cohort) {
    for (const [k, v] of Object.entries(state.cohort)) {
      if (v) q.set(`c_${k}`, v);
    }
  }
  const qs = q.toString();
  return `#${path}${qs ? "?" + qs : ""}`;
}

export function useRouter() {
  const [current, setCurrent] = useState(parseHash());

  useEffect(() => {
    const onHash = () => setCurrent(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((route, params = {}, stateOverrides = {}) => {
    const nextState = { ...current.state, ...stateOverrides };
    window.location.hash = serializeState(route, params, nextState);
  }, [current]);

  const updateState = useCallback((overrides) => {
    window.location.hash = serializeState(current.route, current.params, {
      ...current.state,
      ...overrides,
    });
  }, [current]);

  return { ...current, navigate, updateState };
}

// Exported helper for building hash links inside components
export function hashLink(route, params = {}, state = {}) {
  return serializeState(route, params, state);
}
