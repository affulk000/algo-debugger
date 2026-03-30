import { useState } from "react";
import { CodePanel, Controls, DragGrid, MsgBar, PresetBar, ProgressBar, StepFooter, StatusBanner } from "../ui/index.js";
import { PHASE_COLORS } from "../../constants/themes.js";
import { useStepPlayer, useAlgoRun, useBackendSteps, useAlgoMeta } from "../../hooks/index.js";
import GridViz from "./GridViz.jsx";

export default function NumIslands({ T }) {
  const [presetIdx, setPresetIdx] = useState(0);

  const { meta } = useAlgoMeta("islands");
  const presets   = meta?.presets    ?? [];
  const codeLines = meta?.codeLines  ?? [];
  const lineActive = meta?.lineActive ?? {};

  const p     = presets[presetIdx];
  const { steps, loading, error } = useBackendSteps("islands", { grid: p?.grid }, [presetIdx], { enabled: presets.length > 0 });

  const onComplete = useAlgoRun("islands", () => JSON.stringify({ preset: presetIdx }));
  const { stepIdx, playing, setPlaying, speed, setSpeed, goTo } =
    useStepPlayer(steps.length, [steps], { onComplete });

  const step        = steps[Math.min(stepIdx, steps.length - 1)];
  const color       = PHASE_COLORS[step.phase] || PHASE_COLORS.init;
  const activeLines = lineActive[step.line] || [];

  return (
    <div>
      <PresetBar
        presets={presets}
        getLabel={pr => pr.label}
        getSublabel={pr => `${pr.grid.length}×${pr.grid[0].length}  → ${pr.answer} island${pr.answer !== 1 ? "s" : ""}`}
        activeIndex={presetIdx}
        isCustomActive={false}
        onSelect={i => setPresetIdx(i)}
        color={color}
        T={T}
      />
      <StatusBanner loading={loading} error={error} T={T} />
      <DragGrid cols={2} T={T}>
        <CodePanel lines={codeLines} activeLineIdxs={activeLines} color={color} T={T} />
        <GridViz
          grid={step.grid}
          islandMap={step.islandMap}
          scanR={step.scanR}
          scanC={step.scanC}
          activeR={step.activeR}
          activeC={step.activeC}
          count={step.count}
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
