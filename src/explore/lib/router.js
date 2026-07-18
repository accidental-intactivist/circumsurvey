// ═══════════════════════════════════════════════════════════════════════════
// Minimal router with URL-addressable search params using History API.
// Routes: /, /pathways, /q/:id
// Query params: /q/foo?pathway=intact&view=relevant
// Includes backwards compatibility for legacy hash URLs.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from "react";

function parseLocation() {
  // Backwards compatibility: if a user visits a legacy hash URL (#/culture), 
  // immediately rewrite the URL to use the path API without reloading.
  if (typeof window !== "undefined" && window.location.hash && window.location.hash.startsWith("#/")) {
    const newUrl = window.location.hash.replace(/^#/, "");
    try {
      window.history.replaceState(null, "", newUrl);
    } catch (e) {
      console.warn("Ignored invalid legacy hash URL rewrite");
    }
  }

  const path = (typeof window !== "undefined" ? window.location.pathname : "/") || "/";
  const query = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");

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
  } else if (segments[0] === "observer-triad" || segments[0] === "observer-lens") {
    route = "observer-lens";
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
  } else if (
    segments[0] === "the-decision" ||
    segments[0] === "final-thoughts" ||
    segments[0] === "trans-intersex"
  ) {
    // Phase 2 stubs: gated from the public until real content exists.
    route = "index";
  } else if (segments[0] === "cognizant-alteration" || segments[0] === "adult-experience") {
    route = "adult-experience";
  } else if (segments[0] === "for-parents") {
    route = "for-parents";
  } else if (segments[0] === "about") {
    route = "about";
  } else if (segments[0] === "faq") {
    route = "faq";
  } else if (segments[0] === "contact") {
    route = "contact";
  } else if (segments[0] === "the-forward-view") {
    route = "the-forward-view";
  } else if (segments.length > 0 && segments[0] !== "index" && segments[0] !== "explore") {
    route = "not-found";
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
    x: query.get("x") || null,
    y: query.get("y") || null,
    z: query.get("z") || null,
    mode: query.get("mode") || null,
  };

  // Cohort filters (demographic): prefix "c_"
  const cohort = Object.create(null);
  for (const [key, val] of query.entries()) {
    if (key.startsWith("c_") && val && key !== "c___proto__" && key !== "c_constructor") {
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
  else if (route === "observer-lens") path = "/observer-lens";
  else if (route === "culture") path = "/culture";
  else if (route === "the-decision") path = "/the-decision";
  else if (route === "adult-experience") path = "/adult-experience";
  else if (route === "final-thoughts") path = "/final-thoughts";
  else if (route === "trans-intersex") path = "/trans-intersex";
  else if (route === "for-parents") path = "/for-parents";
  else if (route === "about") path = "/about";
  else if (route === "faq") path = "/faq";
  else if (route === "the-forward-view") path = "/the-forward-view";
  else if (route === "not-found") path = "/404";
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
  if (state.x) q.set("x", state.x);
  if (state.y) q.set("y", state.y);
  if (state.z) q.set("z", state.z);
  if (state.mode) q.set("mode", state.mode);
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
  return `${path}${qs ? "?" + qs : ""}`;
}

export function useRouter() {
  const [current, setCurrent] = useState(parseLocation());

  useEffect(() => {
    const onLocationChange = () => setCurrent(parseLocation());
    window.addEventListener("popstate", onLocationChange);

    // Global click interceptor for internal links
    const handleGlobalClick = (e) => {
      // Find closest anchor tag
      const anchor = e.target.closest("a");
      if (!anchor) return;
      
      // Ignore external links, mailto, open in new tab, etc
      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.getAttribute("rel")?.includes("external") ||
        anchor.href.startsWith("mailto:") ||
        anchor.href.startsWith("http") && new URL(anchor.href).origin !== window.location.origin
      ) {
        return;
      }

      // Check if it's an internal path 
      // (sometimes href is absolute on the same domain, so we check origin)
      const url = new URL(anchor.href, window.location.origin);
      if (url.origin === window.location.origin) {
        e.preventDefault();
        window.history.pushState(null, "", url.pathname + url.search);
        window.dispatchEvent(new Event("popstate"));
      }
    };

    document.addEventListener("click", handleGlobalClick);

    return () => {
      window.removeEventListener("popstate", onLocationChange);
      document.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  const navigate = useCallback((route, params = {}, stateOverrides = {}) => {
    const nextState = { ...current.state, ...stateOverrides };
    const nextUrl = serializeState(route, params, nextState);
    window.history.pushState(null, "", nextUrl);
    window.dispatchEvent(new Event("popstate"));
  }, [current]);

  const updateState = useCallback((overrides) => {
    const nextUrl = serializeState(current.route, current.params, {
      ...current.state,
      ...overrides,
    });
    // Replace state instead of push so we don't spam history when tweaking filters
    window.history.replaceState(null, "", nextUrl);
    window.dispatchEvent(new Event("popstate"));
  }, [current]);

  return { ...current, navigate, updateState };
}

// Exported helper for building links inside components
// IMPORTANT: We keep the name hashLink temporarily so we don't have to rename it in 50 files yet,
// but it now returns standard paths!
export function hashLink(route, params = {}, state = {}) {
  return serializeState(route, params, state);
}
