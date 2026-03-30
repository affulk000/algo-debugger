import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Manages step index, play/pause, and speed for any step-based visualizer.
 *
 * @param {number}   stepsLen  Total number of steps in the current sequence.
 * @param {any[]}    deps      Reset dependencies — resets to step 0 when any change.
 * @param {object}   [opts]
 * @param {function} [opts.onComplete]  Called with (stepsLen) when auto-play reaches the last step.
 *
 * @returns {{ stepIdx, playing, setPlaying, speed, setSpeed, goTo }}
 */
export default function useStepPlayer(stepsLen, deps = [], { onComplete } = {}) {
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed,   setSpeed]   = useState(900);   // ms between steps
  const timerRef      = useRef(null);
  const onCompleteRef = useRef(onComplete);

  // Keep ref up-to-date without re-creating the interval
  useEffect(() => { onCompleteRef.current = onComplete; });

  /** Jump to a clamped index and stop playback. */
  const goTo = useCallback((idx) => {
    setStepIdx(Math.max(0, Math.min(idx, stepsLen - 1)));
  }, [stepsLen]);

  // Auto-advance interval
  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStepIdx(s => {
          if (s >= stepsLen - 1) {
            setPlaying(false);
            onCompleteRef.current?.(stepsLen);
            return s;
          }
          return s + 1;
        });
      }, speed);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, speed, stepsLen]);

  // Reset to start whenever inputs change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setStepIdx(0); setPlaying(false); }, deps);

  return { stepIdx, playing, setPlaying, speed, setSpeed, goTo };
}
