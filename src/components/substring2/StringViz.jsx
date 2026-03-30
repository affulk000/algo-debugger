import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
const { mono, display } = FONTS;

export default function StringViz({ s, wordLen, numWords, i, j, left, count, word, leftWord, phase, results, color, T }) {
  const _results = results ?? [];
  const chars = (s ?? "").split("");
  const totalLen = wordLen * numWords;
  const isFound  = phase === "found";
  const isReset  = phase === "reset";
  const isShrink = phase === "shrink";

  // Group chars into word-sized chunks for a cleaner view when wordLen > 1
  const chunks = [];
  for (let ci = 0; ci < chars.length; ci += wordLen) {
    chunks.push({ start: ci, text: s.slice(ci, ci + wordLen) });
  }

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
        <Icon name="text-bold" size={13} style={{ color: T.textDim }} />
        <span style={{ color: T.textDim, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
          String  (wordLen={wordLen})
        </span>
        {_results.length > 0 && (
          <span style={{ marginLeft: "auto", color: PHASE_COLORS.found, fontFamily: mono, fontSize: 11, fontWeight: 700 }}>
            found: [{_results.join(", ")}]
          </span>
        )}
      </div>

      {/* Word-chunk cells */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 14 }}>
        {chunks.map(({ start, text }) => {
          const { border, bg, textCol } = (() => {
            const isJChunk = j !== null && start === j;
            const isLChunk = isShrink && left !== null && start === left - wordLen;
            const inWin    = left !== null && j !== null && start >= left && start < j + wordLen;
            const inRes    = isFound && left !== null && start >= left && start < left + totalLen;
            if (inRes)    return { border: PHASE_COLORS.found, bg: `${PHASE_COLORS.found}22`, textCol: PHASE_COLORS.found };
            if (isJChunk && isReset) return { border: PHASE_COLORS.miss, bg: `${PHASE_COLORS.miss}18`, textCol: PHASE_COLORS.miss };
            if (isJChunk) return { border: color, bg: `${color}22`, textCol: color };
            if (isLChunk) return { border: PHASE_COLORS.miss, bg: `${PHASE_COLORS.miss}15`, textCol: PHASE_COLORS.miss };
            if (inWin)    return { border: `${color}55`, bg: `${color}0a`, textCol: T.text };
            return { border: T.border, bg: T.card, textCol: T.textDim };
          })();

          const isJ = j !== null && start === j;
          const isL = left !== null && start === left;

          return (
            <div key={start} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 8, fontFamily: mono, height: 11, fontWeight: 700,
                color: isJ ? color : isL ? PHASE_COLORS.store : "transparent" }}>
                {isJ && isL ? "j=L" : isJ ? "j" : isL ? "L" : " "}
              </span>
              <div style={{
                padding: "5px 7px", borderRadius: 6,
                border: `1.5px solid ${border}`, background: bg,
                color: textCol, fontSize: wordLen <= 3 ? 13 : 11,
                fontWeight: 700, fontFamily: mono,
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}>
                {text}
              </div>
              <span style={{ fontSize: 7, fontFamily: mono, color: T.textDim }}>{start}</span>
            </div>
          );
        })}
      </div>

      {/* Variable chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        {[
          { label: "offset i", val: i ?? "—",     col: T.textMid          },
          { label: "left",     val: left ?? "—",   col: PHASE_COLORS.store },
          { label: "j",        val: j ?? "—",      col: color              },
          { label: "count",    val: count,          col: count === numWords ? PHASE_COLORS.found : color },
          { label: "numWords", val: numWords,       col: T.textDim          },
        ].map(({ label, val, col }) => (
          <div key={label} style={{ background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 7, padding: "4px 10px", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: T.textDim, fontSize: 10, fontFamily: mono }}>{label} =</span>
            <span style={{ color: col, fontSize: 13, fontWeight: 700, fontFamily: mono }}>{val}</span>
          </div>
        ))}
      </div>

      {/* Current word annotation */}
      {word && (
        <div style={{
          background: T.card,
          border: `1px solid ${isReset ? PHASE_COLORS.miss : isFound ? PHASE_COLORS.found : color}44`,
          borderRadius: 8, padding: "7px 14px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Icon name={isReset ? "close-circle-bold" : isFound ? "crown-bold" : "magnifer-bold"} size={12}
            style={{ color: isReset ? PHASE_COLORS.miss : isFound ? PHASE_COLORS.found : color }} />
          <span style={{ color: T.textMid, fontSize: 11, fontFamily: mono }}>word:</span>
          <span style={{ color: isReset ? PHASE_COLORS.miss : isFound ? PHASE_COLORS.found : color,
            fontSize: 15, fontWeight: 800, fontFamily: mono }}>"{word}"</span>
          {isShrink && leftWord && (
            <>
              <span style={{ color: T.textDim, fontSize: 10 }}>  evict:</span>
              <span style={{ color: PHASE_COLORS.miss, fontSize: 15, fontWeight: 800, fontFamily: mono }}>"{leftWord}"</span>
            </>
          )}
          {isReset && <span style={{ color: PHASE_COLORS.miss, fontSize: 11, fontFamily: mono }}>not in dict → reset</span>}
        </div>
      )}
    </div>
  );
}
