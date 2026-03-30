import { useState } from "react";
import {
  Controls, ProgressBar, MsgBar,
  CodePanel, PresetBar, StepFooter,
} from "../ui/index.js";
import { PHASE_COLORS } from "../../constants/themes.js";
import { useStepPlayer, useAlgoRun } from "../../hooks/index.js";
import { PRESETS, CODE_LINES, LINE_ACTIVE } from "./constants.js";
import LinkedListViz from "./LinkedListViz.jsx";

export default function HasCycle({ T }) {
  const [presetIdx, setPresetIdx] = useState(0);

  const p     = PRESETS[presetIdx];
  const steps = buildSteps(p.nodes, p.tail);

  const onComplete = useAlgoRun("linkedcycle", () => JSON.stringify({ preset: presetIdx }));
  const { stepIdx, playing, setPlaying, speed, setSpeed, goTo } =
    useStepPlayer(steps.length, [presetIdx], { onComplete });

  const step        = steps[Math.min(stepIdx, steps.length - 1)];
  const color       = step.phase === "met"      ? PHASE_COLORS.done_true
                    : step.phase === "no_cycle" ? PHASE_COLORS.done_false
                    : PHASE_COLORS[step.phase]  || PHASE_COLORS.init;
  const activeLines = LINE_ACTIVE[step.line] || [];

  return (
    <div>
      <PresetBar
        presets={PRESETS}
        getLabel={pr => pr.label}
        getSublabel={pr =>
          `[${pr.nodes.join(",")}]  tail→${pr.tail < 0 ? "nil" : pr.tail}  → ${pr.answer}`}
        activeIndex={presetIdx}
        isCustomActive={false}
        onSelect={i => setPresetIdx(i)}
        color={color}
        T={T}
      />

      <div className="viz-grid" style={{ marginBottom: 14 }}>
        <CodePanel lines={CODE_LINES} activeLineIdxs={activeLines} color={color} T={T} />
        <LinkedListViz
          nodes={step.nodes}
          slowId={step.slowId}
          fastId={step.fastId}
          tailIdx={p.tail}
          met={step.met}
          phase={step.phase}
          color={color}
          T={T}
        />
      </div>

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
          ? <span>return <span style={{ color, fontWeight: 700 }}>
              {String(step.result)}
            </span></span>
          : null}
      />
    </div>
  );
}
