import { useState } from "react";
import { CodePanel, Controls, DragGrid, MsgBar, PresetBar, ProgressBar, StepFooter, StatusBanner } from "../ui/index.js";
import { PHASE_COLORS } from "../../constants/themes.js";
import { useStepPlayer, useAlgoRun, useBackendSteps, useAlgoMeta } from "../../hooks/index.js";
import BoardViz from "./BoardViz.jsx";
import TrieViz  from "./TrieViz.jsx";

export default function WordSearch({ T }) {
  const [presetIdx, setPresetIdx] = useState(0);

  const { meta } = useAlgoMeta("wordsearch");
  const presets   = meta?.presets    ?? [];
  const codeLines = meta?.codeLines  ?? [];
  const lineActive = meta?.lineActive ?? {};

  const p          = presets[presetIdx];
  const { steps, loading, error } = useBackendSteps("wordsearch", { board: p?.board, words: p?.words }, [presetIdx], { enabled: presets.length > 0 });

  const onComplete = useAlgoRun("wordsearch", () => JSON.stringify({ preset: presetIdx }));
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
        getSublabel={pr => `words: [${pr.words.join(", ")}]  → ${pr.answer}`}
        activeIndex={presetIdx}
        isCustomActive={false}
        onSelect={i => setPresetIdx(i)}
        color={color}
        T={T}
      />

      {/* 3-column layout: code | board | trie */}
      <StatusBanner loading={loading} error={error} T={T} />
      <DragGrid cols={3} T={T}>
        <CodePanel lines={codeLines} activeLineIdxs={activeLines} color={color} T={T} />
        <BoardViz
          board={step.board}
          path={step.path}
          r={step.r} c={step.c}
          found={step.found}
          phase={step.phase}
          wordJustFound={step.wordJustFound}
          color={color} T={T}
        />
        <TrieViz
          trieAllNodes={step.trieAllNodes}
          trieActiveIds={step.trieActiveIds}
          found={step.found}
          phase={step.phase}
          color={color} T={T}
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
          ? <span>result = <span style={{ color: PHASE_COLORS.found, fontWeight: 700 }}>
              [{step.result.map(w => `"${w}"`).join(", ")}]
            </span></span>
          : null}
      />
    </div>
  );
}
