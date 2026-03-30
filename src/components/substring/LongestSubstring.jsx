import { useState } from "react";
import { CodePanel, Controls, DragGrid, MsgBar, PresetBar, ProgressBar, StepFooter, StatusBanner } from "../ui/index.js";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
import { useStepPlayer, useAlgoRun, useBackendSteps, useAlgoMeta } from "../../hooks/index.js";
import CustomInput from "./CustomInput.jsx";
import WindowViz   from "./WindowViz.jsx";
import SeenSet     from "./SeenSet.jsx";

const { mono } = FONTS;

export default function LongestSubstring({ T }) {
  const [presetIdx, setPresetIdx] = useState(0);
  const [custom,    setCustom]    = useState(null); // string | null

  const { meta } = useAlgoMeta("substring");
  const presets   = meta?.presets    ?? [];
  const codeLines = meta?.codeLines  ?? [];
  const lineActive = meta?.lineActive ?? {};

  const activeStr = custom !== null ? custom : (presets[presetIdx]?.s ?? "");
  const chars     = [...(activeStr ?? "")];
  const { steps, loading, error } = useBackendSteps("substring", { s: activeStr }, [presetIdx, custom], { enabled: presets.length > 0 });

  const onComplete = useAlgoRun("substring", () => JSON.stringify({ s: activeStr }));
  const { stepIdx, playing, setPlaying, speed, setSpeed, goTo } =
    useStepPlayer(steps.length, [steps], { onComplete });

  const step        = steps[Math.min(stepIdx, steps.length - 1)];
  const color       = PHASE_COLORS[step.phase] || PHASE_COLORS.init;
  const activeLines = lineActive[step.line]   || [];

  // prevLastSeen is always a Map (never a Set)
  const prevLastSeen = (stepIdx > 0 && steps[stepIdx - 1])
    ? steps[stepIdx - 1].lastSeen
    : new Map();

  // The char currently under the right pointer (for dup highlight)
  const dupChar = step.right !== null ? chars[step.right] : null;

  return (
    <div>
      {/* Preset pills */}
      <PresetBar
        presets={presets}
        getLabel={p => p.label}
        getSublabel={p => `"${p.s}"  ans=${p.answer}`}
        activeIndex={presetIdx}
        isCustomActive={custom !== null}
        onSelect={i => { setPresetIdx(i); setCustom(null); }}
        color={color}
        T={T}
      />

      {/* Custom input */}
      <CustomInput onApply={s => setCustom(s)} T={T} />

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

        {/* Right — window + lastSeen map */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <WindowViz
            chars={chars}
            left={step.left}
            right={step.right}
            lastSeen={step.lastSeen}
            maxLength={step.maxLength}
            phase={step.phase}
            color={color}
            T={T}
          />

          <SeenSet
            lastSeen={step.lastSeen}
            prevLastSeen={prevLastSeen}
            phase={step.phase}
            dupChar={dupChar}
            left={step.left}
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
            maxLength = <span style={{ color: PHASE_COLORS.found, fontWeight: 700 }}>{step.maxLength}</span>
          </span>
        }
      />
    </div>
  );
}
