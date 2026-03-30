import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
const { mono, display } = FONTS;

const PASS_COLORS = {
  ltr:  PHASE_COLORS.found,
  rtl:  PHASE_COLORS.compute,
  sum:  PHASE_COLORS.scan,
  null: PHASE_COLORS.init,
};

const MAX_BAR_H = 100;

export default function CandyViz({ ratings, candies, activeIdx, passDir, total, color, T }) {
  const _ratings = ratings ?? [];
  const _candies = candies ?? [];
  const maxCandies = Math.max(..._candies, 1);
  const passColor  = PASS_COLORS[passDir] || color;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Pass indicator banner */}
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 10, padding: "10px 16px",
        display: "flex", gap: 16, alignItems: "center",
      }}>
        {[
          { key: "ltr",  label: "Pass 1: Left → Right", icon: "arrow-right-bold",  col: PHASE_COLORS.found   },
          { key: "rtl",  label: "Pass 2: Right → Left", icon: "arrow-left-bold",   col: PHASE_COLORS.compute },
          { key: "sum",  label: "Pass 3: Sum",           icon: "calculator-minimalistic-bold", col: PHASE_COLORS.scan },
        ].map(({ key, label, icon, col }) => {
          const active = passDir === key;
          return (
            <div key={key} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 12px", borderRadius: 7,
              border: `1.5px solid ${active ? col : T.border}`,
              background: active ? `${col}18` : T.card,
              opacity: active ? 1 : 0.45,
              transition: "all 0.2s",
            }}>
              <Icon name={icon} size={12} style={{ color: active ? col : T.textDim }} />
              <span style={{ color: active ? col : T.textDim, fontSize: 10, fontFamily: mono, fontWeight: active ? 700 : 400 }}>
                {label}
              </span>
            </div>
          );
        })}
        {total !== null && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="crown-bold" size={13} style={{ color: PHASE_COLORS.found }} />
            <span style={{ color: PHASE_COLORS.found, fontFamily: mono, fontSize: 14, fontWeight: 800 }}>
              {total}
            </span>
          </div>
        )}
      </div>

      {/* Bar chart — candies height, rating labels */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
          <Icon name="chart-bold" size={13} style={{ color: T.textDim }} />
          <span style={{ color: T.textDim, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
            Candy Distribution
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: MAX_BAR_H + 60, marginBottom: 8 }}>
          {_ratings.map((r, i) => {
            const isActive = i === activeIdx;
            const barH     = Math.max(Math.round((_candies[i] / maxCandies) * MAX_BAR_H), 8);

            let barCol    = `${T.border}`;
            let barBg     = T.card;
            let glow      = "none";

            if (isActive) {
              barCol = passColor;
              barBg  = `${passColor}28`;
              glow   = `0 0 14px ${passColor}55`;
            } else if (passDir === "sum" && activeIdx !== null && i <= activeIdx) {
              barCol = `${PHASE_COLORS.scan}88`;
              barBg  = `${PHASE_COLORS.scan}12`;
            }

            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                {/* Candy count label */}
                <span style={{
                  fontSize: 11, fontWeight: 700, fontFamily: mono,
                  color: isActive ? passColor : T.textMid,
                  marginBottom: 3,
                }}>
                  {_candies[i]}
                </span>

                {/* Bar + candy emojis */}
                <div style={{
                  width: "100%", height: barH,
                  background: barBg, border: `2px solid ${barCol}`,
                  borderRadius: "5px 5px 0 0",
                  boxShadow: glow, transition: "all 0.22s",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "flex-end",
                  paddingBottom: 2,
                }}>
                  {_candies[i] <= 5 && Array.from({ length: _candies[i] }).map((_, ci) => (
                    <span key={ci} style={{ fontSize: 9, lineHeight: 1 }}>🍬</span>
                  ))}
                </div>

                {/* Rating label */}
                <div style={{
                  marginTop: 4, width: "100%", textAlign: "center",
                  background: isActive ? `${passColor}18` : T.card,
                  border: `1px solid ${isActive ? passColor : T.border}`,
                  borderRadius: 5, padding: "3px 0",
                }}>
                  <span style={{ color: isActive ? passColor : T.textMid, fontSize: 11, fontWeight: 700, fontFamily: mono }}>
                    {r}
                  </span>
                </div>
                <span style={{ color: T.textDim, fontSize: 8, fontFamily: mono }}>[{i}]</span>
              </div>
            );
          })}
        </div>

        {/* Arrow showing scan direction */}
        {(passDir === "ltr" || passDir === "rtl") && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, padding: "6px 0",
            color: passColor, fontSize: 10, fontFamily: mono,
          }}>
            <Icon name={passDir === "ltr" ? "arrow-right-bold" : "arrow-left-bold"} size={12} style={{ color: passColor }} />
            {passDir === "ltr" ? "scanning left → right" : "scanning right ← left"}
          </div>
        )}
      </div>
    </div>
  );
}
