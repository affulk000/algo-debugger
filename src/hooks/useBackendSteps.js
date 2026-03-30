import { useState, useEffect, useRef } from "react";
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
  const [steps,   setSteps]   = useState([LOADING_STEP]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const abortRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);
    setSteps([LOADING_STEP]);

    getAlgorithmSteps(algoName, input)
      .then(data => {
        if (!ctrl.signal.aborted) {
          setSteps(data.steps);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!ctrl.signal.aborted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => ctrl.abort();
  }, [...deps, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return { steps, loading, error };
}
