import { useState } from "react";
import { CodePanel, Controls, DragGrid, MsgBar, PresetBar, ProgressBar, StepFooter, StatusBanner } from "../ui/index.js";
import { PHASE_COLORS } from "../../constants/themes.js";
import { useStepPlayer, useAlgoRun, useBackendSteps, useAlgoMeta } from "../../hooks/index.js";
import BoardViz    from "./BoardViz.jsx";
import TrackingViz from "./TrackingViz.jsx";

export default function IsValidSudoku({ T }) {
  const [presetIdx, setPresetIdx] = useState(0);

  const { meta } = useAlgoMeta("sudoku");
  const presets   = meta?.presets    ?? [];
  const codeLines = meta?.codeLines  ?? [];
  const lineActive = meta?.lineActive ?? {};

  const activeBoard = presets[presetIdx]?.board ?? [];
  const { steps, loading, error } = useBackendSteps("sudoku", { board: activeBoard }, [presetIdx], { enabled: presets.length > 0 });

  const onComplete = useAlgoRun("sudoku", () => JSON.stringify(activeBoard));
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
        getSublabel={p => `→ ${p.answer}`}
        activeIndex={presetIdx}
        isCustomActive={false}
        onSelect={i => setPresetIdx(i)}
        color={color}
        T={T}
      />

      {/* Top row: code | board */}
      <StatusBanner loading={loading} error={error} T={T} />
      <DragGrid cols={2} T={T}>
        <CodePanel lines={codeLines} activeLineIdxs={activeLines} color={color} T={T} />

        <BoardViz
          board={activeBoard}
          r={step.r} c={step.c}
          boxIndex={step.boxIndex}
          conflict={step.conflict}
          conflictIn={step.conflictIn}
          rows={step.rows} cols={step.cols} boxes={step.boxes}
          phase={step.phase}
          color={color} T={T}
        />
      </DragGrid>

      {/* Bottom: tracking arrays full width */}
      <TrackingViz
        rows={step.rows} cols={step.cols} boxes={step.boxes}
        r={step.r} c={step.c}
        num={step.num} boxIndex={step.boxIndex}
        conflict={step.conflict} conflictIn={step.conflictIn}
        T={T}
      />

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
          step.result != null
            ? <span>result = <span style={{
                color: step.result === true ? PHASE_COLORS.found : PHASE_COLORS.miss,
                fontWeight:700,
              }}>{String(step.result)}</span></span>
            : null
        }
      />
    </div>
  );
}
