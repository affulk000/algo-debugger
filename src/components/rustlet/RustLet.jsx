import { useState } from "react";
import { CodePanel, Controls, DragGrid, Icon, MsgBar, PresetBar, ProgressBar, StepFooter, StatusBanner } from "../ui/index.js";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
import { useStepPlayer, useAlgoRun, useBackendSteps, useAlgoMeta } from "../../hooks/index.js";

const { mono, display } = FONTS;

export default function RustLet({ T }) {
  const [presetIdx, setPresetIdx] = useState(0);
  const [custom,    setCustom]    = useState(null); // { nums, target } | null

  const { meta } = useAlgoMeta("rustlet");
  const presets   = meta?.presets    ?? [];
  const codeLines = meta?.codeLines  ?? [];
  const lineActive = meta?.lineActive ?? {};

  const activeNums   = custom ? custom.nums   : (presets[presetIdx]?.nums   ?? []);
  const activeTarget = custom ? custom.target : (presets[presetIdx]?.target ?? 0);

  const { steps, loading, error } = useBackendSteps(
    "rustlet",
    { nums: activeNums, target: activeTarget },
    [presetIdx, custom],
    { enabled: presets.length > 0 }
  );

  const onComplete = useAlgoRun("rustlet", () =>
    JSON.stringify({ nums: activeNums, target: activeTarget })
  );

  const { stepIdx, playing, setPlaying, speed, setSpeed, goTo } =
    useStepPlayer(steps.length, [steps], { onComplete });

  const step        = steps[Math.min(stepIdx, steps.length - 1)];
  const color       = PHASE_COLORS[step.phase] ?? PHASE_COLORS.scan;
  const activeLines = lineActive[step.line] || [];

  return (
    <div>
      <PresetBar
        presets={presets}
        getLabel={p => p.label}
        getSublabel={p => `[${p.nums.join(",")}] t=${p.target}`}
        activeIndex={presetIdx}
        isCustomActive={!!custom}
        onSelect={i => { setPresetIdx(i); setCustom(null); }}
        color={color}
        T={T}
      />

      <StatusBanner loading={loading} error={error} T={T} />

      <DragGrid cols={2} T={T}>
        {/* Left — Rust source code */}
        <CodePanel
          lines={codeLines}
          activeLineIdxs={activeLines}
          color={color}
          T={T}
        />

        {/* Right — array visualization */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Array cells */}
          <div style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 12, padding: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
              <Icon name="list-bold" size={13} style={{ color: T.textDim }} />
              <span style={{
                color: T.textDim, fontSize: 10,
                letterSpacing: 2, textTransform: "uppercase", fontFamily: display,
              }}>
                Array &nbsp;
                <span style={{ color: T.textMid, letterSpacing: 0, textTransform: "none" }}>
                  (sorted, len={activeNums.length})
                </span>
              </span>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {activeNums.map((n, i) => {
                const isMid     = step.mid >= 0 && step.mid === i;
                const inWindow  = i >= step.lo && i < step.hi;
                const isResult  = step.result !== null && step.result >= 0 && step.result === i;
                const isHighlit = (step.highlight ?? []).includes(i);

                const cellColor = isResult
                  ? PHASE_COLORS.found
                  : isMid
                    ? color
                    : isHighlit && inWindow
                      ? color
                      : T.border;

                return (
                  <div
                    key={i}
                    className={isMid ? "cell-active" : ""}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
                  >
                    <div style={{
                      width: 46, height: 46, borderRadius: 10,
                      border: `2px solid ${cellColor}`,
                      background: isResult
                        ? `${PHASE_COLORS.found}22`
                        : isMid ? `${color}1a` : inWindow ? `${color}0a` : T.card,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: isResult ? PHASE_COLORS.found : isMid ? color : inWindow ? T.text : T.textDim,
                      fontSize: 15, fontWeight: 700, fontFamily: mono,
                      boxShadow: (isMid || isResult) ? `0 0 14px ${cellColor}55` : "none",
                      transition: "all 0.22s",
                      opacity: inWindow ? 1 : 0.35,
                    }}>
                      {n}
                    </div>
                    {/* pointer labels */}
                    <div style={{ display: "flex", gap: 2, height: 14, justifyContent: "center" }}>
                      {i === step.lo && (
                        <span style={{ color: PHASE_COLORS.right, fontSize: 8, fontFamily: mono, fontWeight: 700 }}>lo</span>
                      )}
                      {step.mid >= 0 && i === step.mid && (
                        <span style={{ color: color, fontSize: 8, fontFamily: mono, fontWeight: 700 }}>mid</span>
                      )}
                      {i === step.hi - 1 && step.hi > step.lo && (
                        <span style={{ color: PHASE_COLORS.left, fontSize: 8, fontFamily: mono, fontWeight: 700 }}>hi-1</span>
                      )}
                    </div>
                    <span style={{ color: T.textDim, fontSize: 9, fontFamily: mono }}>[{i}]</span>
                  </div>
                );
              })}
            </div>

            {/* Variable chips */}
            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { icon: "alt-arrow-left-bold",  label: "lo",     val: step.lo,     col: PHASE_COLORS.right },
                { icon: "alt-arrow-right-bold", label: "hi",     val: step.hi,     col: PHASE_COLORS.left  },
                ...(step.mid >= 0
                  ? [{ icon: "hashtag-bold", label: "mid", val: step.mid, col: color }]
                  : []),
                ...(step.val !== null && step.val !== undefined
                  ? [{ icon: "box-bold", label: "val", val: step.val, col: "#c084fc" }]
                  : []),
                { icon: "target-bold", label: "target", val: activeTarget, col: T.accent },
              ].map(({ icon, label, val, col }) => (
                <div key={label} style={{
                  background: T.card, border: `1px solid ${T.border}`,
                  borderRadius: 7, padding: "5px 10px",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <Icon name={icon} size={11} style={{ color: T.textDim }} />
                  <span style={{ color: T.textMid, fontSize: 10, fontFamily: mono }}>{label} =</span>
                  <span style={{ color: col, fontSize: 13, fontWeight: 700, fontFamily: mono }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DragGrid>

      <MsgBar  step={step} stepIdx={stepIdx} color={color} T={T} />
      <ProgressBar stepIdx={stepIdx} stepsLen={steps.length} color={color} T={T} />
      <Controls
        stepIdx={stepIdx} stepsLen={steps.length}
        playing={playing} setPlaying={setPlaying}
        goTo={goTo} speed={speed} setSpeed={setSpeed}
        color={color} T={T}
      />
      <StepFooter
        stepIdx={stepIdx} stepsLen={steps.length}
        phase={step.phase} color={color} T={T}
        extra={
          <span>
            target = <span style={{ color: T.accent, fontWeight: 700 }}>{activeTarget}</span>
          </span>
        }
      />
    </div>
  );
}
