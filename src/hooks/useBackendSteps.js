import { useReducer, useEffect, useRef } from "react";
import { getAlgorithmSteps } from "../api.js";

export const LOADING_STEP = {
  phase: "init", line: 1,
  icon: "refresh-bold",
  msg: "Computing steps on server…",
  detail: "",
  result: null,
  // Safe defaults so components don't crash before steps arrive
  highlight: [],
  seen: {},
  lastSeen: {},
  counts: {},
  currCounts: {},
  arr: [],
  grid: [],
  board: [],
  path: [],
  queue: [],
  visited: [],
  found: [],
  i: null, j: null, num: null, needed: null,
  left: null, right: null, maxLength: null,
  slow: null, fast: null, meet: null,
  isSnake: false, isLadder: false,
  trieAllNodes: [], trieActiveIds: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'fetch':   return { steps: [LOADING_STEP], loading: true,  error: null         };
    case 'success': return { steps: action.steps,   loading: false, error: null         };
    case 'error':   return { steps: [LOADING_STEP], loading: false, error: action.error };
    default:        return state;
  }
}

/**
 * Fetches algorithm steps from the backend.
 *
 * @param {string}  algoName  Backend route name, e.g. "twosum"
 * @param {object}  input     Request body sent to the backend
 * @param {any[]}   deps      Re-fetch when any value in this array changes
 *
 * @returns {{ steps, loading, error }}
 */
export default function useBackendSteps(algoName, input, deps, { enabled = true } = {}) {
  const [state, dispatch] = useReducer(reducer, { steps: [LOADING_STEP], loading: true, error: null });

  const abortRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    dispatch({ type: 'fetch' });

    getAlgorithmSteps(algoName, input)
      .then(data => {
        if (!ctrl.signal.aborted) {
          dispatch({ type: 'success', steps: data.steps });
        }
      })
      .catch(err => {
        if (!ctrl.signal.aborted) {
          dispatch({ type: 'error', error: err.message });
        }
      });

    return () => ctrl.abort();
  }, [...deps, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
