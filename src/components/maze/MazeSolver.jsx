import { useState } from "react";
import { CodePanel, Controls, DragGrid, MsgBar, PresetBar, ProgressBar, StepFooter, StatusBanner } from "../ui/index.js";
import { PHASE_COLORS } from "../../constants/themes.js";
import { useStepPlayer, useAlgoRun, useBackendSteps, useAlgoMeta } from "../../hooks/index.js";
import CustomInput from "./CustomInput.jsx";
import MazeGrid    from "./MazeGrid.jsx";
import QueueViz    from "./QueueViz.jsx";

export default function MazeSolver({ T }) {
  const [presetIdx, setPresetIdx] = useState(0);
  const [custom,    setCustom]    = useState(null);

  const { meta } = useAlgoMeta("maze");
  const presets   = meta?.presets    ?? [];
  const codeLines = meta?.codeLines  ?? [];
  const lineActive = meta?.lineActive ?? {};

  const activeMaze = custom !== null ? custom : (presets[presetIdx]?.maze ?? []);
  const { steps, loading, error } = useBackendSteps("maze", { maze: activeMaze }, [presetIdx, custom], { enabled: presets.length > 0 });

  const onComplete = useAlgoRun("maze", () => JSON.stringify(activeMaze));
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
        getSublabel={p => `${p.maze.length}×${p.maze[0].length}  ans=${p.answer}`}
        activeIndex={presetIdx}
        isCustomActive={custom !== null}
        onSelect={i => { setPresetIdx(i); setCustom(null); }}
        color={color}
        T={T}
      />

      <CustomInput onApply={m => setCustom(m)} T={T} />
      <StatusBanner loading={loading} error={error} T={T} />
      <DragGrid cols={2} T={T}>
        <CodePanel lines={codeLines} activeLineIdxs={activeLines} color={color} T={T} />

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <MazeGrid
            maze={activeMaze}
            visited={step.visited.length ? step.visited : activeMaze.map(r => r.map(()=>false))}
            cur={step.cur}
            nx={step.nx}
            ny={step.ny}
            path={step.path}
            queue={step.queue}
            phase={step.phase}
            color={color}
            T={T}
          />
          <QueueViz
            queue={step.queue}
            cur={step.cur}
            nx={step.nx}
            ny={step.ny}
            phase={step.phase}
            color={color}
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
          step.result != null
            ? <span>
                result = <span style={{ color: step.result === -1 ? PHASE_COLORS.miss : PHASE_COLORS.found, fontWeight:700 }}>
                  {step.result}
                </span>
              </span>
            : null
        }
      />
    </div>
  );
}
