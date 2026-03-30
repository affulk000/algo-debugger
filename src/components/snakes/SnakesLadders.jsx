import { useState } from "react";
import { CodePanel, Controls, DragGrid, MsgBar, PresetBar, ProgressBar, StepFooter, StatusBanner } from "../ui/index.js";
import { PHASE_COLORS } from "../../constants/themes.js";
import { useStepPlayer, useAlgoRun, useBackendSteps, useAlgoMeta } from "../../hooks/index.js";
import BoardViz from "./BoardViz.jsx";
import QueueViz from "./QueueViz.jsx";

export default function SnakesLadders({ T }) {
  const [presetIdx, setPresetIdx] = useState(0);

  const { meta } = useAlgoMeta("snakes");
  const presets   = meta?.presets    ?? [];
  const codeLines = meta?.codeLines  ?? [];
  const lineActive = meta?.lineActive ?? {};

  const p     = presets[presetIdx];
  const { steps, loading, error } = useBackendSteps("snakes", { board: p?.board }, [presetIdx], { enabled: presets.length > 0 });

  const onComplete = useAlgoRun("snakes", () => JSON.stringify({ preset: presetIdx }));
  const { stepIdx, playing, setPlaying, speed, setSpeed, goTo } =
    useStepPlayer(steps.length, [steps], { onComplete });

  const step  = steps[Math.min(stepIdx, steps.length - 1)];
  const color = step.phase === "done_found" ? PHASE_COLORS.found
              : step.phase === "done_fail"  ? PHASE_COLORS.miss
              : step.phase === "teleport"   ? (step.isLadder ? PHASE_COLORS.enqueue : PHASE_COLORS.miss)
              : PHASE_COLORS[step.phase]    || PHASE_COLORS.init;
  const activeLines = lineActive[step.line] || [];

  return (
    <div>
      <PresetBar
        presets={presets}
        getLabel={pr => pr.label}
        getSublabel={pr => `${pr.board.length}×${pr.board.length}  → ${pr.answer === -1 ? "impossible" : pr.answer + " moves"}`}
        activeIndex={presetIdx}
        isCustomActive={false}
        onSelect={i => setPresetIdx(i)}
        color={color}
        T={T}
      />

      {/* 3-column: code | board | queue */}
      <StatusBanner loading={loading} error={error} T={T} />
      <DragGrid cols={3} T={T}>
        <CodePanel lines={codeLines} activeLineIdxs={activeLines} color={color} T={T} />
        <BoardViz
          board={step.board}
          n={step.n}
          visited={step.visited}
          label={step.label}
          next={step.next}
          dest={step.dest}
          diceVal={step.diceVal}
          phase={step.phase}
          isSnake={step.isSnake}
          isLadder={step.isLadder}
          color={color}
          T={T}
        />
        <QueueViz
          queue={step.queue}
          visited={step.visited}
          label={step.label}
          dest={step.dest}
          moves={step.moves}
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
          ? <span>return <span style={{ color, fontWeight: 700 }}>{step.result}</span></span>
          : null}
      />
    </div>
  );
}
