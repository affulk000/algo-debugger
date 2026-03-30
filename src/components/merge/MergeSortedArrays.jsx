import { useState } from "react";
import { ArrayViz, CodePanel, Controls, DragGrid, MsgBar, PresetBar, ProgressBar, StepFooter, StatusBanner } from "../ui/index.js";
import { PHASE_COLORS } from "../../constants/themes.js";
import { useStepPlayer, useAlgoRun, useBackendSteps, useAlgoMeta } from "../../hooks/index.js";
import CustomInput from "./CustomInput.jsx";
import ResultArray from "./ResultArray.jsx";

export default function MergeSortedArrays({ T }) {
  const [presetIdx, setPresetIdx] = useState(0);
  const [custom,    setCustom]    = useState(null); // { a, b } | null

  const { meta } = useAlgoMeta("merge");
  const presets   = meta?.presets    ?? [];
  const codeLines = meta?.codeLines  ?? [];
  const lineActive = meta?.lineActive ?? {};

  const activeA = custom ? custom.a : (presets[presetIdx]?.a ?? []);
  const activeB = custom ? custom.b : (presets[presetIdx]?.b ?? []);
  const { steps, loading, error } = useBackendSteps("merge", { a: activeA, b: activeB }, [presetIdx, custom], { enabled: presets.length > 0 });

  const onComplete = useAlgoRun("merge", () => JSON.stringify({ a: activeA, b: activeB }));
  const { stepIdx, playing, setPlaying, speed, setSpeed, goTo } =
    useStepPlayer(steps.length, [steps], { onComplete });

  const step        = steps[Math.min(stepIdx, steps.length - 1)];
  const color       = PHASE_COLORS[step.phase] || PHASE_COLORS.init;
  const activeLines = lineActive[step.line]   || [];

  return (
    <div>
      {/* Preset pills */}
      <PresetBar
        presets={presets}
        getLabel={p => p.label}
        getSublabel={p => `[${p.a.join(",")}]+[${p.b.join(",")}]`}
        activeIndex={presetIdx}
        isCustomActive={!!custom}
        onSelect={i => { setPresetIdx(i); setCustom(null); }}
        color={color}
        T={T}
      />

      {/* Custom input */}
      <CustomInput onApply={(a, b) => setCustom({ a, b })} T={T} />

      {/* Main two-column grid */}
      <StatusBanner loading={loading} error={error} T={T} />
      <DragGrid cols={2} T={T}>
        {/* Left — source code */}
        <CodePanel lines={codeLines} activeLineIdxs={activeLines} color={color} T={T} />

        {/* Right — Array A, Array B, Result */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Array A */}
          <div style={{
            background: T.surface,
            border: `1px solid ${PHASE_COLORS.pick_a}44`,
            borderRadius: 12, padding: "14px 16px",
          }}>
            <ArrayViz
              label="Array A"
              arr={activeA}
              highlight={step.highlightA}
              pointer={step.ia}
              pointerLabel={`i=${step.ia}`}
              color={PHASE_COLORS.pick_a}
              T={T}
              dimBefore={step.ia}
            />
          </div>

          {/* Array B */}
          <div style={{
            background: T.surface,
            border: `1px solid ${PHASE_COLORS.pick_b}44`,
            borderRadius: 12, padding: "14px 16px",
          }}>
            <ArrayViz
              label="Array B"
              arr={activeB}
              highlight={step.highlightB}
              pointer={step.ib}
              pointerLabel={`j=${step.ib}`}
              color={PHASE_COLORS.pick_b}
              T={T}
              dimBefore={step.ib}
            />
          </div>

          {/* Growing result */}
          <ResultArray res={step.res} phase={step.phase} color={color} T={T} />
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
      />
    </div>
  );
}

