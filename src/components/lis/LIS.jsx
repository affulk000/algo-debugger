
import { useState } from "react";
import { CodePanel, Controls, DragGrid, MsgBar, PresetBar, ProgressBar, StepFooter, StatusBanner } from "../ui/index.js";
import { PHASE_COLORS } from "../../constants/themes.js";
import { useStepPlayer, useAlgoRun, useBackendSteps, useAlgoMeta } from "../../hooks/index.js";
import LISViz from "./LISViz.jsx";

export default function LIS({ T }) {
  const [presetIdx, setPresetIdx] = useState(0);
  const [custom, setCustom] = useState(null);

  const { meta } = useAlgoMeta("lis");
  const presets   = meta?.presets    ?? [];
  const codeLines = meta?.codeLines  ?? [];
  const lineActive = meta?.lineActive ?? {};

  const nums  = custom !== null ? custom : (presets[presetIdx]?.nums ?? []);
  const { steps, loading, error } = useBackendSteps("lis", { nums: nums }, [presetIdx, custom], { enabled: presets.length > 0 });

  const onComplete = useAlgoRun("lis", () => JSON.stringify(nums));
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
        getSublabel={pr => `[${pr.nums.join(",")}]  → ${pr.answer}`}
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
        <span style={{ color: T.textDim, fontFamily: "monospace", fontSize: 11 }}>nums =</span>
        <input
          name="lis-nums" placeholder="e.g. 10,9,2,5,3,7,101,18"
          onKeyDown={e => {
            if (e.key !== "Enter") return;
            const parsed = e.target.value.split(",").map(Number).filter(n => !isNaN(n));
            if (parsed.length > 0 && parsed.length <= 30) { setCustom(parsed); }
          }}
          style={{ flex:1, background: T.card, border:`1px solid ${T.border}`, borderRadius:6,
            padding:"5px 10px", color:T.text, fontSize:12, fontFamily:"monospace", outline:"none" }} />
        <span style={{ color: T.textDim, fontSize:10, fontFamily:"monospace" }}>↵  (max 30)</span>
      </div>
      <StatusBanner loading={loading} error={error} T={T} />
      <DragGrid cols={2} T={T}>
        <CodePanel lines={codeLines} activeLineIdxs={activeLines} color={color} T={T} />
        <LISViz
          nums={step.nums}
          tails={step.tails}
          xi={step.xi}
          x={step.x}
          left={step.left}
          right={step.right}
          mid={step.mid}
          action={step.action}
          phase={step.phase}
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
        extra={step.result != null
          ? <span>return <span style={{ color: PHASE_COLORS.found, fontWeight: 700 }}>{step.result}</span></span>
          : null}
      />
    </div>
  );
}
