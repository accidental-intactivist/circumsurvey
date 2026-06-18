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
  } else if (segments[0] === "tools" && segments[1] === "cultural-alignment") {
    route = "cultural-alignment";
  } else if (segments[0] === "correlations") {
    route = "correlations";
  } else if (segments[0] === "pairs") {
    route = "pairs";
  } else if (segments[0] === "demographics") {
    route = "demographics";
  } else if (segments[0] === "religious-mirrors") {
    route = "religious-mirrors";
  } else if (segments[0] === "narrative-mirrors") {
    route = "narrative-mirrors";
  } else if (segments[0] === "generational-faultlines") {
    route = "generational-faultlines";
  } else if (segments[0] === "observer-triad") {
    route = "observer-triad";
  } else if (segments[0] === "numbers") {
    route = "numbers";
  } else if (segments[0] === "pleasure-gap") {
    route = "pleasure-gap";
  } else if (segments[0] === "methodology") {
    route = "methodology";
  } else if (segments[0] === "report") {
    route = "report";
  } else if (segments[0] === "restoration-journey") {
    route = "restoration-journey";
  } else if (segments[0] === "culture") {
    route = "culture";
  } else if (segments[0] === "generational-faultlines") {
    route = "culture"; // redirect: merged into Culture & Generations
  } else if (segments[0] === "the-decision") {
    route = "the-decision";
  } else if (segments[0] === "cognizant-alteration" || segments[0] === "adult-experience") {
    route = "adult-experience";
  } else if (segments[0] === "final-thoughts") {
    route = "final-thoughts";
  } else if (segments[0] === "trans-intersex") {
    route = "trans-intersex";
  } else if (segments[0] === "for-parents") {
    route = "for-parents";
  }

  // Extract standardized query state
  const rawPathway = query.get("pathway");
  const state = {
    pathway: rawPathway ? (rawPathway.includes(",") ? rawPathway.split(",") : [rawPathway]) : null,
    view: query.get("view") || "all", // mine | relevant | all
    search: query.get("s") || "",
    section: query.get("section") || null,
    observerRole: query.get("role") || null,
    format: query.get("format") || null,
    ai_query: query.get("ai_query") || "",
  };

  // Cohort filters (demographic): prefix "c_"
  const cohort = {};
  for (const [key, val] of query.entries()) {
    if (key.startsWith("c_") && val) {
      cohort[key.slice(2)] = val.includes(",") ? val.split(",") : val;
    }
  }
  state.cohort = Object.keys(cohort).length > 0 ? cohort : null;

  return { route, params, state };
}

function serializeState(route, params, state) {
  let path;
  if (route === "pathways") path = "/pathways";
  else if (route === "question") path = `/q/${params.id}`;
  else if (route === "cultural-alignment") path = "/tools/cultural-alignment";
  else if (route === "correlations") path = "/correlations";
  else if (route === "pairs") path = "/pairs";
  else if (route === "demographics") path = "/demographics";
  else if (route === "pleasure-gap") path = "/pleasure-gap";
  else if (route === "methodology") path = "/methodology";
  else if (route === "report") path = "/report";
  else if (route === "numbers") path = "/numbers";
  else if (route === "restoration-journey") path = "/restoration-journey";
  else if (route === "religious-mirrors") path = "/religious-mirrors";
  else if (route === "narrative-mirrors") path = "/narrative-mirrors";
  else if (route === "generational-faultlines") path = "/culture"; // redirect
  else if (route === "observer-triad") path = "/observer-triad";
  else if (route === "culture") path = "/culture";
  else if (route === "the-decision") path = "/the-decision";
  else if (route === "adult-experience") path = "/adult-experience";
  else if (route === "final-thoughts") path = "/final-thoughts";
  else if (route === "trans-intersex") path = "/trans-intersex";
  else if (route === "for-parents") path = "/for-parents";
  else path = "/";

  const q = new URLSearchParams();
  if (state.pathway) {
    if (Array.isArray(state.pathway)) {
      if (state.pathway.length > 0) q.set("pathway", state.pathway.join(","));
    } else {
      q.set("pathway", state.pathway);
    }
  }
  if (state.view && state.view !== "relevant") q.set("view", state.view);
  if (state.search) q.set("s", state.search);
  if (state.section) q.set("section", state.section);
  if (state.observerRole) q.set("role", state.observerRole);
  if (state.format) q.set("format", state.format);
  if (state.ai_query) q.set("ai_query", state.ai_query);
  if (state.cohort) {
    for (const [k, v] of Object.entries(state.cohort)) {
      if (v) {
        if (Array.isArray(v)) {
          if (v.length > 0) q.set(`c_${k}`, v.join(","));
        } else {
          q.set(`c_${k}`, v);
        }
      }
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
