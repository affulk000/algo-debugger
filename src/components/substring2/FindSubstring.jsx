import { useState } from "react";
import { CodePanel, Controls, DragGrid, MsgBar, PresetBar, ProgressBar, StepFooter, StatusBanner } from "../ui/index.js";
import { PHASE_COLORS } from "../../constants/themes.js";
import { useStepPlayer, useAlgoRun, useBackendSteps, useAlgoMeta } from "../../hooks/index.js";
import CustomInput from "./CustomInput.jsx";
import StringViz   from "./StringViz.jsx";
import CountsViz   from "./CountsViz.jsx";

export default function FindSubstring({ T }) {
  const [presetIdx, setPresetIdx] = useState(0);
  const [custom,    setCustom]    = useState(null);

  const { meta } = useAlgoMeta("substring2");
  const presets   = meta?.presets    ?? [];
  const codeLines = meta?.codeLines  ?? [];
  const lineActive = meta?.lineActive ?? {};

  const activeS     = custom ? custom.s     : (presets[presetIdx]?.s     ?? "");
  const activeWords = custom ? custom.words  : (presets[presetIdx]?.words ?? []);
  const { steps, loading, error } = useBackendSteps("substring2", { s: activeS, words: activeWords }, [presetIdx, custom], { enabled: presets.length > 0 });

  const onComplete = useAlgoRun("substring2", () => JSON.stringify({ s: activeS, words: activeWords }));
  const { stepIdx, playing, setPlaying, speed, setSpeed, goTo } =
    useStepPlayer(steps.length, [steps], { onComplete });

  const step        = steps[Math.min(stepIdx, steps.length - 1)];
  const color       = PHASE_COLORS[step.phase] || PHASE_COLORS.init;
  const activeLines = lineActive[step.line]   || [];

  const wordLen  = activeWords[0]?.length ?? 0;
  const numWords = activeWords.length;

  return (
    <div>
      <PresetBar
        presets={presets}
        getLabel={p => p.label}
        getSublabel={p => `s="${p.s.slice(0,18)}${p.s.length>18?"…":""}"  words=[${p.words.join(",")}]`}
        activeIndex={presetIdx}
        isCustomActive={custom !== null}
        onSelect={i => { setPresetIdx(i); setCustom(null); }}
        color={color}
        T={T}
      />

      <CustomInput onApply={(s, words) => setCustom({ s, words })} T={T} />
      <StatusBanner loading={loading} error={error} T={T} />
      <DragGrid cols={2} T={T}>
        <CodePanel lines={codeLines} activeLineIdxs={activeLines} color={color} T={T} />

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <StringViz
            s={activeS} wordLen={wordLen} numWords={numWords}
            i={step.i} j={step.j} left={step.left} count={step.count}
            word={step.word} leftWord={step.leftWord}
            phase={step.phase} results={step.results}
            color={color} T={T}
          />
          <CountsViz
            counts={step.counts} currCounts={step.currCounts}
            word={step.word} phase={step.phase} T={T}
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
          step.results?.length > 0
            ? <span>found: <span style={{ color: PHASE_COLORS.found, fontWeight: 700 }}>[{step.results.join(", ")}]</span></span>
            : null
        }
      />
    </div>
  );
}
