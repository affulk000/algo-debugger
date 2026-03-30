import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
const { mono, display } = FONTS;

export default function WordsViz({ words, left, right, swapping, phase, color, T }) {
  const _words = words ?? [];
  const isDone = phase === "done";

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
        <Icon name="text-bold" size={13} style={{ color: T.textDim }} />
        <span style={{ color: T.textDim, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
          Words Array
        </span>
        <span style={{ marginLeft: "auto", color: T.textDim, fontSize: 10, fontFamily: mono }}>
          len={_words.length}
        </span>
      </div>

      {/* Words row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "flex-end", marginBottom: 20 }}>
        {_words.map((w, i) => {
          const isLeft     = i === left  && !isDone;
          const isRight    = i === right && !isDone;
          const isSwapping = swapping && (i === swapping[0] || i === swapping[1]);

          let bg      = T.card;
          let border  = T.border;
          let txtCol  = T.textMid;
          let glow    = "none";
          let scale   = "scale(1)";

          if (isDone) {
            bg = `${PHASE_COLORS.found}12`; border = `${PHASE_COLORS.found}44`; txtCol = PHASE_COLORS.found;
          } else if (isSwapping) {
            bg = `${PHASE_COLORS.scan}22`; border = PHASE_COLORS.scan; txtCol = PHASE_COLORS.scan;
            glow = `0 0 14px ${PHASE_COLORS.scan}55`; scale = "scale(1.08)";
          } else if (isLeft) {
            bg = `${color}20`; border = color; txtCol = color;
          } else if (isRight) {
            bg = `${PHASE_COLORS.store}20`; border = PHASE_COLORS.store; txtCol = PHASE_COLORS.store;
          }

          const isFinalized = !isDone && (i < left || i > right);

          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              {/* Pointer label */}
              <div style={{ height: 16, display: "flex", gap: 3, justifyContent: "center" }}>
                {isLeft && (
                  <span style={{ fontSize: 9, fontFamily: mono, fontWeight: 700, color }}>L</span>
                )}
                {isRight && !isLeft && (
                  <span style={{ fontSize: 9, fontFamily: mono, fontWeight: 700, color: PHASE_COLORS.store }}>R</span>
                )}
                {isLeft && isRight && (
                  <span style={{ fontSize: 9, fontFamily: mono, fontWeight: 700, color }}>L=R</span>
                )}
              </div>

              {/* Word chip */}
              <div style={{
                padding: "7px 12px", borderRadius: 8,
                border: `2px solid ${isFinalized ? `${PHASE_COLORS.found}40` : border}`,
                background: isFinalized ? `${PHASE_COLORS.found}08` : bg,
                color: isFinalized ? `${PHASE_COLORS.found}aa` : txtCol,
                fontSize: 14, fontWeight: 700, fontFamily: mono,
                boxShadow: glow, transform: scale,
                transition: "all 0.18s",
                whiteSpace: "nowrap",
                opacity: isFinalized ? 0.6 : 1,
              }}>
                {w}
              </div>

              {/* Index */}
              <span style={{ fontSize: 9, fontFamily: mono, color: T.textDim }}>[{i}]</span>
            </div>
          );
        })}
      </div>

      {/* Swap arrow annotation */}
      {swapping && (
        <div style={{
          background: `${PHASE_COLORS.scan}12`, border: `1px solid ${PHASE_COLORS.scan}44`,
          borderRadius: 8, padding: "8px 14px", marginBottom: 12,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Icon name="transfer-horizontal-bold" size={14} style={{ color: PHASE_COLORS.scan }} />
          <span style={{ color: PHASE_COLORS.scan, fontFamily: mono, fontSize: 12, fontWeight: 600 }}>
            "{_words[swapping[0]]}"
          </span>
          <span style={{ color: T.textDim, fontSize: 10 }}>↔</span>
          <span style={{ color: PHASE_COLORS.scan, fontFamily: mono, fontSize: 12, fontWeight: 600 }}>
            "{_words[swapping[1]]}"
          </span>
          <span style={{ color: T.textDim, fontSize: 10, marginLeft: 4 }}>
            [{swapping[0]}] ↔ [{swapping[1]}]
          </span>
        </div>
      )}

      {/* Result string */}
      {isDone && (
        <div style={{
          background: `${PHASE_COLORS.found}12`, border: `1px solid ${PHASE_COLORS.found}55`,
          borderRadius: 8, padding: "10px 16px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Icon name="flag-bold" size={13} style={{ color: PHASE_COLORS.found }} />
          <span style={{ color: T.textDim, fontSize: 10, fontFamily: mono }}>result:</span>
          <span style={{ color: PHASE_COLORS.found, fontFamily: mono, fontSize: 14, fontWeight: 700 }}>
            "{_words.join(" ")}"
          </span>
        </div>
      )}

      {/* Pointer status */}
      {!isDone && (
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          {[
            { label: "left",  val: left,  col: color              },
            { label: "right", val: right, col: PHASE_COLORS.store },
            { label: "left < right", val: String(left < right), col: left < right ? PHASE_COLORS.found : PHASE_COLORS.miss },
          ].map(({ label, val, col }) => (
            <div key={label} style={{
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 7, padding: "4px 10px",
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <span style={{ color: T.textDim, fontSize: 10, fontFamily: mono }}>{label} =</span>
              <span style={{ color: col, fontWeight: 700, fontSize: 13, fontFamily: mono }}>{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
