import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
const { mono, display } = FONTS;

export default function CountsViz({ counts, currCounts, word, phase, T }) {
  const safeCounts     = counts     ?? {};
  const safeCurrCounts = currCounts ?? {};
  const allKeys = [...new Set([...Object.keys(safeCounts), ...Object.keys(safeCurrCounts)])].sort();

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
        <Icon name="database-bold" size={13} style={{ color: T.textDim }} />
        <span style={{ color: T.textDim, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
          Word Counts
        </span>
      </div>

      {/* Header row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 6 }}>
        {["word", "need (counts)", "have (currCounts)"].map(h => (
          <span key={h} style={{ color: T.textDim, fontSize: 9, fontFamily: mono, letterSpacing: 1 }}>{h.toUpperCase()}</span>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {allKeys.map(w => {
          const need = safeCounts[w] || 0;
          const have = safeCurrCounts[w] || 0;
          const isActive  = w === word;
          const isTooMany = have > need;
          const isSatisfied = have === need && need > 0;

          let rowBorder = T.border;
          let rowBg     = T.card;

          if (isActive && isTooMany)   { rowBorder = PHASE_COLORS.miss;  rowBg = `${PHASE_COLORS.miss}12`;  }
          else if (isActive)            { rowBorder = PHASE_COLORS.found; rowBg = `${PHASE_COLORS.found}10`; }
          else if (isSatisfied)         { rowBorder = `${PHASE_COLORS.store}55`; rowBg = `${PHASE_COLORS.store}08`; }

          return (
            <div key={w} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, alignItems: "center",
              border: `1.5px solid ${rowBorder}`, background: rowBg,
              borderRadius: 8, padding: "7px 12px", transition: "all 0.2s",
            }}>
              <span style={{ color: isActive ? PHASE_COLORS.found : PHASE_COLORS.store, fontSize: 13, fontWeight: 700, fontFamily: mono }}>
                "{w}"
              </span>
              <span style={{ color: T.textMid, fontSize: 13, fontWeight: 700, fontFamily: mono, textAlign: "center" }}>
                {need}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  color: isTooMany ? PHASE_COLORS.miss : isSatisfied ? PHASE_COLORS.found : T.textMid,
                  fontSize: 13, fontWeight: 700, fontFamily: mono,
                }}>
                  {have}
                </span>
                {isTooMany   && <Icon name="danger-bold"       size={11} style={{ color: PHASE_COLORS.miss  }} />}
                {isSatisfied && <Icon name="check-circle-bold" size={11} style={{ color: PHASE_COLORS.found }} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
