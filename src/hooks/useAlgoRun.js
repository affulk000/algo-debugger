import { useCallback, useEffect, useRef } from "react";
import { saveRun } from "../api.js";

/**
 * Returns an onComplete(stepsLen) callback for useStepPlayer.
 * When auto-play finishes, saves the run to Supabase via the backend.
 * Silently ignores errors (e.g. 401 when not logged in).
 *
 * @param {string}   algorithmId  The TABS id, e.g. "twosum"
 * @param {function} getInput     Called at completion time, returns a JSON string of the input
 */
export default function useAlgoRun(algorithmId, getInput) {
  const getInputRef = useRef(getInput);
  useEffect(() => { getInputRef.current = getInput; });

  return useCallback((stepsLen) => {
    const input = getInputRef.current();
    saveRun(algorithmId, input, stepsLen).catch(() => {});
  }, [algorithmId]);
}
