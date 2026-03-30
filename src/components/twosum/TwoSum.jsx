import { useState } from "react";
import { CodePanel, Controls, DragGrid, Icon, MsgBar, PresetBar, ProgressBar, StepFooter, StatusBanner } from "../ui/index.js";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
import { useStepPlayer, useAlgoRun, useBackendSteps, useAlgoMeta } from "../../hooks/index.js";
import CustomInput from "./CustomInput.jsx";
import SeenMap     from "./SeenMap.jsx";

const { mono, display } = FONTS;

export default function TwoSum({ T }) {
  const [presetIdx, setPresetIdx] = useState(0);
  const [custom,    setCustom]    = useState(null); // { nums, target } | null

  const { meta } = useAlgoMeta("twosum");
  const presets   = meta?.presets    ?? [];
  const codeLines = meta?.codeLines  ?? [];
  const lineActive = meta?.lineActive ?? {};

  const activeNums   = custom ? custom.nums   : (presets[presetIdx]?.nums   ?? []);
  const activeTarget = custom ? custom.target : (presets[presetIdx]?.target ?? 0);
  const { steps, loading, error } = useBackendSteps("twosum", { nums: activeNums, target: activeTarget }, [presetIdx, custom], { enabled: presets.length > 0 });

  const onComplete = useAlgoRun("twosum", () => JSON.stringify({ nums: activeNums, target: activeTarget }));
  const { stepIdx, playing, setPlaying, speed, setSpeed, goTo } =
    useStepPlayer(steps.length, [steps], { onComplete });

  const step        = steps[Math.min(stepIdx, steps.length - 1)];
  const color       = PHASE_COLORS[step.phase];
  const activeLines = lineActive[step.line] || [];
  const prevSeen    = (stepIdx > 0 && steps[stepIdx - 1])
    ? steps[stepIdx - 1].seen
    : {};

  return (
    <div>
      {/* Preset pills */}
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

      {/* Custom input */}
      <CustomInput
        onApply={(nums, target) => setCustom({ nums, target })}
        T={T}
      />

      {/* Main two-column grid */}
      <StatusBanner loading={loading} error={error} T={T} />
      <DragGrid cols={2} T={T}>
        {/* Left — source code */}
        <CodePanel
          lines={codeLines}
          activeLineIdxs={activeLines}
          color={color}
          T={T}
        />

        {/* Right — array + seen map */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Array visualizer */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
              <Icon name="list-bold" size={13} style={{ color: T.textDim }} />
              <span style={{ color: T.textDim, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
                Array
              </span>
            </div>

            {/* Cells */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {activeNums.map((n, i) => {
                const isCurrent = step.i === i;
                const isResult  = step.result && step.result.includes(i);
                const cellColor = isResult
                  ? PHASE_COLORS.found
                  : isCurrent || step.highlight.includes(i) ? color : T.border;

                return (
                  <div
                    key={i}
                    className={isCurrent ? "cell-active" : ""}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
                  >
                    <div style={{
                      width: 46, height: 46, borderRadius: 10,
                      border: `2px solid ${cellColor}`,
                      background: isResult
                        ? `${PHASE_COLORS.found}20`
                        : isCurrent ? `${color}1a` : T.card,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: isResult ? PHASE_COLORS.found : isCurrent ? color : T.textMid,
                      fontSize: 16, fontWeight: 700, fontFamily: mono,
                      boxShadow: (isCurrent || isResult) ? `0 0 14px ${cellColor}55` : "none",
                      transition: "all 0.22s",
                    }}>
                      {n}
                    </div>
                    <span style={{ color: T.textDim, fontSize: 9, fontFamily: mono }}>[{i}]</span>
                  </div>
                );
              })}
            </div>

            {/* Variable chips */}
            {step.i !== null && (
              <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { icon: "hashtag-bold",               label: "i",      val: step.i,      col: "#f59e0b" },
                  { icon: "box-bold",                   label: "num",    val: step.num,    col: "#c084fc" },
                  ...(step.needed !== null
                    ? [{ icon: "target-bold", label: "needed", val: step.needed, col: "#ec4899" }]
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
            )}
          </div>

          {/* Hash map */}
          <SeenMap
            seen={step.seen}
            prevSeen={prevSeen}
            needed={step.needed}
            phase={step.phase}
            T={T}
          />
        </div>
      </DragGrid>

      <MsgBar step={step} stepIdx={stepIdx} color={color} T={T} />
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

