import { useState } from "react";
import { CodePanel, Controls, DragGrid, MsgBar, PresetBar, ProgressBar, StepFooter, StatusBanner } from "../ui/index.js";
import { PHASE_COLORS } from "../../constants/themes.js";
import { useStepPlayer, useAlgoRun, useBackendSteps, useAlgoMeta } from "../../hooks/index.js";
import CustomInput from "./CustomInput.jsx";
import ArrayViz2   from "./ArrayViz2.jsx";

export default function TwoSumII({ T }) {
  const [presetIdx, setPresetIdx] = useState(0);
  const [custom,    setCustom]    = useState(null); // { numbers, target } | null

  const { meta } = useAlgoMeta("twosum2");
  const presets   = meta?.presets    ?? [];
  const codeLines = meta?.codeLines  ?? [];
  const lineActive = meta?.lineActive ?? {};

  const activeNums   = custom ? custom.numbers : (presets[presetIdx]?.numbers ?? []);
  const activeTarget = custom ? custom.target  : (presets[presetIdx]?.target  ?? 0);
  const { steps, loading, error } = useBackendSteps("twosum2", { numbers: activeNums, target: activeTarget }, [presetIdx, custom], { enabled: presets.length > 0 });

  const onComplete = useAlgoRun("twosum2", () => JSON.stringify({ nums: activeNums, target: activeTarget }));
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
        getSublabel={p => `[${p.numbers.join(",")}] t=${p.target}  ans=${p.answer}`}
        activeIndex={presetIdx}
        isCustomActive={custom !== null}
        onSelect={i => { setPresetIdx(i); setCustom(null); }}
        color={color}
        T={T}
      />

      <CustomInput
        onApply={(numbers, target) => setCustom({ numbers, target })}
        T={T}
      />
      <StatusBanner loading={loading} error={error} T={T} />
      <DragGrid cols={2} T={T}>
        <CodePanel
          lines={codeLines}
          activeLineIdxs={activeLines}
          color={color}
          T={T}
        />
        <ArrayViz2
          numbers={activeNums}
          target={activeTarget}
          left={step.left}
          right={step.right}
          sum={step.sum}
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
        extra={
          step.result
            ? <span>answer = <span style={{ color: PHASE_COLORS.found, fontWeight: 700 }}>
                [{step.result.join(", ")}]
              </span></span>
            : null
        }
      />
    </div>
  );
}
