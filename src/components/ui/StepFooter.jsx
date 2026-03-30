import Icon from "./Icon.jsx";
import { FONTS } from "../../constants/fonts.js";

const { mono } = FONTS;

/**
 * Small footer showing step X / N, the current phase, and optional extras.
 *
 * @param {number}      stepIdx   0-based current step index
 * @param {number}      stepsLen  Total step count
 * @param {string}      phase     Current phase name
 * @param {ReactNode}   [extra]   Optional additional content after a separator
 * @param {string}      color     Phase accent color
 * @param {object}      T         Theme token object
 */
export default function StepFooter({ stepIdx, stepsLen, phase, extra, color, T }) {
  return (
    <div style={{
      textAlign: "center", marginTop: 16,
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 8, color: T.textDim, fontSize: 11, fontFamily: mono,
    }}>
      <Icon name="layers-bold" size={11} style={{ color: T.textDim }} />
      <span>
        Step <span style={{ color: T.textMid }}>{stepIdx + 1}</span> / {stepsLen}
      </span>
      <span style={{ color: T.border }}>·</span>
      <span style={{ color, fontWeight: 600 }}>{phase}</span>
      {extra && (
        <>
          <span style={{ color: T.border }}>·</span>
          {extra}
        </>
      )}
    </div>
  );
}
