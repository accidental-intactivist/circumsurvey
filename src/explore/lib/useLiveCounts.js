// ═══════════════════════════════════════════════════════════════════════════
// useLiveCounts — single source of truth for Explore's headline counts.
//
// The Explore surface is LIVE: every "N voices / N questions / pathway n="
// must come from the API, never a hardcoded literal (which silently drifts
// from the growing dataset). Fetches /count + the question list once; results
// are cached in api.js (5-min TTL) so calling this from several components is
// cheap. Observer respondents are stored with a null pathway, so the worker
// reports them under `unclassified` — we surface that as `observer`.
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { getCount, getQuestions } from "./api";

export function useLiveCounts() {
  const [state, setState] = useState({
    total: null,
    classified: null,
    byPathway: {},
    questionCount: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCount(), getQuestions({ counts: false })])
      .then(([count, q]) => {
        if (cancelled) return;
        const bp = { ...(count.by_pathway || {}) };
        if (bp.observer == null && bp.unclassified != null) bp.observer = bp.unclassified;
        setState({
          total: count.total ?? null,
          classified: count.classified ?? null,
          byPathway: bp,
          questionCount: (q.questions || []).length || null,
          loading: false,
          error: null,
        });
      })
      .catch((e) => {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: e.message || String(e) }));
      });
    return () => { cancelled = true; };
  }, []);

  return state;
}
