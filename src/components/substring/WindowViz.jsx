import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";

const { mono, display } = FONTS;

/**
 * Sliding-window visualizer for the lastSeen-map algorithm.
 *
 * Differences from the shrink-loop version:
 * - No "shrink" highlight — instead shows an instant "jump" on left pointer.
 * - The duplicate cell (right pointer) is highlighted in miss-color when
 *   phase === "check_in" or "jump_left".
 * - The old left position is shown as a ghost cell during "jump_left".
 */
export default function WindowViz({ chars, left, right, lastSeen, maxLength, phase, color, T }) {
  const isDupPhase  = phase === "check_in" || phase === "jump_left";
  const isJump      = phase === "jump_left";

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        <Icon name="window-bold" size={13} style={{ color: T.textDim }} />
        <span style={{ color: T.textDim, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
          Sliding Window
        </span>
        <span style={{ marginLeft: "auto", color: T.textMid, fontSize: 10, fontFamily: mono }}>
          {chars.length} chars
        </span>
      </div>

      {/* Cells */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 16 }}>
        {chars.map((ch, i) => {
          const inWindow   = right !== null && i >= left && i <= right;
          const isLeft     = i === left  && right !== null;
          const isRight    = i === right && right !== null;
          const isDupCell  = isRight && isDupPhase;
          const isJumpDest = isLeft && isJump;

          let borderColor = T.border;
          let bgColor     = T.card;
          let textColor   = T.textMid;
          let shadow      = "none";
          let extraClass  = "";

          if (isDupCell) {
            borderColor = PHASE_COLORS.miss;
            bgColor     = `${PHASE_COLORS.miss}20`;
            textColor   = PHASE_COLORS.miss;
            shadow      = `0 0 14px ${PHASE_COLORS.miss}66`;
          } else if (isJumpDest) {
            borderColor = PHASE_COLORS.compute;
            bgColor     = `${PHASE_COLORS.compute}20`;
            textColor   = PHASE_COLORS.compute;
            shadow      = `0 0 14px ${PHASE_COLORS.compute}55`;
            extraClass  = "cell-active";
          } else if (isRight) {
            borderColor = color;
            bgColor     = `${color}20`;
            textColor   = color;
            shadow      = `0 0 12px ${color}55`;
            extraClass  = "cell-active";
          } else if (inWindow) {
            borderColor = `${color}66`;
            bgColor     = `${color}0e`;
            textColor   = T.text;
          }

          return (
            <div key={i} className={extraClass}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 9,
                border: `2px solid ${borderColor}`,
                background: bgColor,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: textColor,
                fontSize: 16, fontWeight: 700, fontFamily: mono,
                boxShadow: shadow,
                transition: "all 0.22s",
              }}>
                {ch}
              </div>
              <span style={{
                fontSize: 9, fontFamily: mono,
                color: (isLeft || isRight) ? color : T.textDim,
                fontWeight: (isLeft || isRight) ? 700 : 400,
              }}>
                {isLeft && isRight
                  ? `l=r=${i}`
                  : isLeft  ? `L=${i}`
                  : isRight ? `R=${i}`
                  : `[${i}]`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Variable chips */}
      {right !== null && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {[
            { icon: "arrow-right-bold",              label: "left",      val: left,            col: PHASE_COLORS.store   },
            { icon: "arrow-left-bold",               label: "right",     val: right,           col: color                },
            { icon: "ruler-bold",                    label: "window",    val: right-left+1,    col: PHASE_COLORS.compute },
            { icon: "crown-bold",                    label: "maxLength", val: maxLength,        col: PHASE_COLORS.found   },
          ].map(({ icon, label, val, col }) => (
            <div key={label} style={{
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 7, padding: "5px 10px",
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <Icon name={icon} size={11} style={{ color: T.textDim }} />
              <span style={{ color: T.textMid, fontSize: 10, fontFamily: mono }}>{label} =</span>
              <span style={{ color: col, fontSize: 13, fontWeight: 700, fontFamily: mono }}>{val}</span>
            </div>
          ))}
        </div>
      )}

      {/* Current window string */}
      {right !== null && right >= left && (
        <div style={{
          background: T.card, border: `1px solid ${color}44`,
          borderRadius: 8, padding: "8px 14px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Icon name="text-bold" size={12} style={{ color: T.textDim }} />
          <span style={{ color: T.textMid, fontSize: 11, fontFamily: mono }}>window:</span>
          <span style={{ color: color, fontSize: 14, fontWeight: 700, fontFamily: mono, letterSpacing: 2 }}>
            "{chars.slice(left, right + 1).join("")}"
          </span>
          <span style={{ color: T.textDim, fontSize: 10, fontFamily: mono, marginLeft: "auto" }}>
            len = {right - left + 1}
          </span>
        </div>
      )}
    </div>
  );
}
