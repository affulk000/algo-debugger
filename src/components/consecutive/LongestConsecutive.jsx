import { useState } from "react";
import { CodePanel, Controls, DragGrid, MsgBar, PresetBar, ProgressBar, StepFooter, StatusBanner } from "../ui/index.js";
import { PHASE_COLORS } from "../../constants/themes.js";
import { useStepPlayer, useAlgoRun, useBackendSteps, useAlgoMeta } from "../../hooks/index.js";
import CustomInput from "./CustomInput.jsx";
import SetViz      from "./SetViz.jsx";

export default function LongestConsecutive({ T }) {
  const [presetIdx, setPresetIdx] = useState(0);
  const [custom,    setCustom]    = useState(null);

  const { meta } = useAlgoMeta("consecutive");
  const presets   = meta?.presets    ?? [];
  const codeLines = meta?.codeLines  ?? [];
  const lineActive = meta?.lineActive ?? {};

  const activeNums = custom !== null ? custom : (presets[presetIdx]?.nums ?? []);
  const { steps, loading, error } = useBackendSteps("consecutive", { nums: activeNums }, [presetIdx, custom], { enabled: presets.length > 0 });

  const onComplete = useAlgoRun("consecutive", () => JSON.stringify(activeNums));
  const { stepIdx, playing, setPlaying, speed, setSpeed, goTo } =
    useStepPlayer(steps.length, [steps], { onComplete });

  const step        = steps[Math.min(stepIdx, steps.length - 1)];
  const color       = PHASE_COLORS[step.phase] || PHASE_COLORS.init;
  const activeLines = lineActive[step.line]   || [];

  return (
    <div>
      <PresetBar
        presets={presets}
        getLabel={p => p.label}
        getSublabel={p => `[${p.nums.slice(0,6).join(",")}${p.nums.length>6?"…":""}]  ans=${p.answer}`}
        activeIndex={presetIdx}
        isCustomActive={custom !== null}
        onSelect={i => { setPresetIdx(i); setCustom(null); }}
        color={color}
        T={T}
      />

      <CustomInput onApply={n => setCustom(n)} T={T} />
      <StatusBanner loading={loading} error={error} T={T} />
      <DragGrid cols={2} T={T}>
        <CodePanel lines={codeLines} activeLineIdxs={activeLines} color={color} T={T} />
        <SetViz
          set={step.set}
          n={step.n}
          cur={step.cur}
          streak={step.streak}
          activeSeq={step.activeSeq}
          allSeqs={step.allSeqs}
          phase={step.phase}
          longest={step.longest}
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
          ? <span>result = <span style={{ color:PHASE_COLORS.found, fontWeight:700 }}>{step.result}</span></span>
          : null}
      />
    </div>
  );
}
