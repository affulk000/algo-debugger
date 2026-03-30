import { useState } from "react";
import { CodePanel, Controls, DragGrid, MsgBar, PresetBar, ProgressBar, StepFooter, StatusBanner } from "../ui/index.js";
import { PHASE_COLORS } from "../../constants/themes.js";
import { useStepPlayer, useAlgoRun, useBackendSteps, useAlgoMeta } from "../../hooks/index.js";
import ExprViz from "./ExprViz.jsx";

export default function Calculator({ T }) {
  const [presetIdx, setPresetIdx] = useState(0);
  const [custom,    setCustom]    = useState(null);

  const { meta } = useAlgoMeta("calculator");
  const presets   = meta?.presets    ?? [];
  const codeLines = meta?.codeLines  ?? [];
  const lineActive = meta?.lineActive ?? {};

  const expr  = custom !== null ? custom : (presets[presetIdx]?.s ?? "");
  const { steps, loading, error } = useBackendSteps("calculator", { s: expr }, [presetIdx, custom], { enabled: presets.length > 0 });

  const onComplete = useAlgoRun("calculator", () => JSON.stringify({ expr }));
  const { stepIdx, playing, setPlaying, speed, setSpeed, goTo } =
    useStepPlayer(steps.length, [steps], { onComplete });

  const step        = steps[Math.min(stepIdx, steps.length - 1)];
  const color       = PHASE_COLORS[step.phase] || PHASE_COLORS.init;
  const activeLines = lineActive[step.line]   || [];

  return (
    <div>
      <PresetBar
        presets={presets}
        getLabel={pr => pr.label}
        getSublabel={pr => `"${pr.s}" → ${pr.answer}`}
        activeIndex={presetIdx}
        isCustomActive={custom !== null}
        onSelect={i => { setPresetIdx(i); setCustom(null); }}
        color={color}
        T={T}
      />

      {/* Custom input */}
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 10, padding: "10px 14px", marginBottom: 14,
        display: "flex", gap: 8, alignItems: "center",
      }}>
        <span style={{ color: T.textDim, fontFamily: "monospace", fontSize: 11 }}>s =</span>
        <input
          defaultValue=""
          placeholder='e.g. "-(2+(3-1))"'
          onKeyDown={e => { if (e.key === "Enter" && e.target.value.trim()) setCustom(e.target.value.trim()); }}
          style={{ flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 6,
            padding: "5px 10px", color: T.text, fontSize: 12, fontFamily: "monospace", outline: "none" }} />
        <span style={{ color: T.textDim, fontSize: 10, fontFamily: "monospace" }}>↵ to run</span>
      </div>
      <StatusBanner loading={loading} error={error} T={T} />
      <DragGrid cols={2} T={T}>
        <CodePanel lines={codeLines} activeLineIdxs={activeLines} color={color} T={T} />
        <ExprViz
          s={step.s}
          i={step.i}
          char={step.char}
          result={step.result}
          sign={step.sign}
          stack={step.stack}
          phase={step.phase}
          numStart={step.numStart}
          numEnd={step.numEnd}
          color={color}
          T={T}
        />
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
        extra={step.result_final != null
          ? <span>return <span style={{ color, fontWeight: 700 }}>{step.result_final}</span></span>
          : null}
      />
    </div>
  );
}
