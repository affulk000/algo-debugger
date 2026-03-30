import { useState } from "react";
import { CodePanel, Controls, DragGrid, Icon, MsgBar, PresetBar, ProgressBar, StepFooter, StatusBanner } from "../ui/index.js";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
import { useStepPlayer, useAlgoRun, useBackendSteps, useAlgoMeta } from "../../hooks/index.js";

const { mono, display } = FONTS;

export default function RustBubbleSort({ T }) {
  const [presetIdx, setPresetIdx] = useState(0);

  const { meta } = useAlgoMeta("rustbubble");
  const presets   = meta?.presets    ?? [];
  const codeLines = meta?.codeLines  ?? [];
  const lineActive = meta?.lineActive ?? {};

  const activeNums = presets[presetIdx]?.nums ?? [];
  const { steps, loading, error } = useBackendSteps("rustbubble", { nums: activeNums }, [presetIdx], { enabled: presets.length > 0 });

  const onComplete = useAlgoRun("rustbubble", () => JSON.stringify({ nums: activeNums }));
  const { stepIdx, playing, setPlaying, speed, setSpeed, goTo } =
    useStepPlayer(steps.length, [steps], { onComplete });

  const step        = steps[Math.min(stepIdx, steps.length - 1)];
  const color       = PHASE_COLORS[step.phase] ?? PHASE_COLORS.scan;
  const activeLines = lineActive[step.phase]  ?? [];

  return (
    <div>
      <PresetBar
        presets={presets}
        getLabel={p => p.label}
        getSublabel={p => `[${p.nums.join(", ")}]`}
        activeIndex={presetIdx}
        isCustomActive={false}
        onSelect={i => setPresetIdx(i)}
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
          <div style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 12, padding: 16,
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
              <Icon name="sort-by-number-bold" size={13} style={{ color: T.textDim }} />
              <span style={{
                color: T.textDim, fontSize: 10,
                letterSpacing: 2, textTransform: "uppercase", fontFamily: display,
              }}>
                Vec&lt;i32&gt;&nbsp;
                <span style={{ color: T.textMid, letterSpacing: 0, textTransform: "none" }}>
                  len={activeNums.length}
                </span>
              </span>
            </div>

            {/* Array cells */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {(step.arr ?? []).map((n, i) => {
                const isSorted    = step.sortedFrom != null && i >= step.sortedFrom;
                const isJ         = step.j !== null && i === step.j;
                const isJ1        = step.j !== null && i === step.j + 1;
                const isCompare   = isJ || isJ1;
                const isSwapping  = step.phase === "swap" && isCompare;
                const isDone      = step.result !== null;

                const borderColor = isDone
                  ? PHASE_COLORS.found
                  : isSorted
                    ? `${PHASE_COLORS.found}88`
                    : isCompare
                      ? color
                      : T.border;

                const bgColor = isDone
                  ? `${PHASE_COLORS.found}22`
                  : isSorted
                    ? `${PHASE_COLORS.found}11`
                    : isCompare
                      ? `${color}18`
                      : T.card;

                const textColor = isDone
                  ? PHASE_COLORS.found
                  : isSorted
                    ? `${PHASE_COLORS.found}99`
                    : isCompare
                      ? color
                      : T.textMid;

                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    {/* Swap arrow above cell */}
                    <div style={{ height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isSwapping && (
                        <Icon
                          name={isJ ? "alt-arrow-right-bold" : "alt-arrow-left-bold"}
                          size={10}
                          style={{ color }}
                        />
                      )}
                    </div>

                    <div
                      className={isSwapping ? "cell-active" : ""}
                      style={{
                        width: 46, height: 46, borderRadius: 10,
                        border: `2px solid ${borderColor}`,
                        background: bgColor,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: textColor,
                        fontSize: 15, fontWeight: 700, fontFamily: mono,
                        boxShadow: isCompare ? `0 0 12px ${color}55` : "none",
                        transition: "all 0.22s",
                      }}
                    >
                      {n}
                    </div>

                    {/* Pointer labels below cell */}
                    <div style={{ height: 14, display: "flex", gap: 2, alignItems: "center", justifyContent: "center" }}>
                      {isJ  && <span style={{ color, fontSize: 8, fontFamily: mono, fontWeight: 700 }}>j</span>}
                      {isJ1 && <span style={{ color, fontSize: 8, fontFamily: mono, fontWeight: 700 }}>j+1</span>}
                      {!isJ && !isJ1 && isSorted && (
                        <span style={{ color: PHASE_COLORS.found, fontSize: 8, fontFamily: mono }}>✓</span>
                      )}
                    </div>

                    <span style={{ color: T.textDim, fontSize: 9, fontFamily: mono }}>[{i}]</span>
                  </div>
                );
              })}
            </div>

            {/* Variable chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { icon: "list-bold",    label: "n", val: step.n ?? "—", col: T.accent },
                ...(step.i !== null
                  ? [{ icon: "refresh-bold", label: "i", val: step.i, col: PHASE_COLORS.compute }]
                  : []),
                ...(step.j !== null
                  ? [{ icon: "hashtag-bold", label: "j", val: step.j, col: color }]
                  : []),
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
          step.result
            ? <span>sorted = <span style={{ color: PHASE_COLORS.found, fontWeight: 700 }}>[{(step.result ?? []).join(", ")}]</span></span>
            : null
        }
      />
    </div>
  );
}
