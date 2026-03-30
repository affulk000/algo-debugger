import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";

const { mono, display } = FONTS;

const MAX_BAR_H = 140;

/**
 * Renders the height array as a bar chart with:
 * - Left/right pointer highlights
 * - Active window fill (water area shaded between the pointers)
 * - Current area rectangle overlay
 * - Best-ever area badge
 */
export default function BarChart({ height, left, right, area, currentHeight, width, maxWater, phase, color, T }) {
  const _height = height ?? [];
  const maxH   = Math.max(..._height, 1);
  const showWater = left !== null && right !== null && left < right;

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        <Icon name="chart-bold" size={13} style={{ color: T.textDim }} />
        <span style={{ color: T.textDim, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
          Container Visualizer
        </span>
        <span style={{ marginLeft: "auto", color: T.textMid, fontSize: 10, fontFamily: mono }}>
          {_height.length} bars
        </span>
      </div>

      {/* Bar chart */}
      <div style={{
        display: "flex", alignItems: "flex-end", gap: 4,
        height: MAX_BAR_H + 28, position: "relative", marginBottom: 12,
      }}>
        {_height.map((h, i) => {
          const isLeft    = i === left;
          const isRight   = i === right;
          const inWindow  = left !== null && right !== null && i >= left && i <= right;
          const barH      = Math.round((h / maxH) * MAX_BAR_H);
          const waterLineH = currentHeight !== null ? Math.round((currentHeight / maxH) * MAX_BAR_H) : 0;

          let barColor  = T.border;
          let barBg     = T.card;
          let glow      = "none";
          let label     = null;

          if (isLeft) {
            barColor = PHASE_COLORS.found;
            barBg    = `${PHASE_COLORS.found}30`;
            glow     = `0 0 14px ${PHASE_COLORS.found}66`;
            label    = "L";
          } else if (isRight) {
            barColor = PHASE_COLORS.compute;
            barBg    = `${PHASE_COLORS.compute}30`;
            glow     = `0 0 14px ${PHASE_COLORS.compute}66`;
            label    = "R";
          } else if (inWindow) {
            barColor = `${color}44`;
            barBg    = `${color}0a`;
          }

          // Water fill — blue from bottom up to currentHeight, only inside window
          const showWaterFill = showWater && inWindow && !isLeft && !isRight && currentHeight !== null;

          return (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              flex: 1, position: "relative",
            }}>
              {/* Water fill behind bar */}
              {showWaterFill && waterLineH > 0 && (
                <div style={{
                  position: "absolute", bottom: 18,
                  width: "100%", height: Math.min(waterLineH, barH),
                  background: `${PHASE_COLORS.store}22`,
                  borderTop: `1px dashed ${PHASE_COLORS.store}66`,
                  zIndex: 0,
                }} />
              )}

              {/* Bar */}
              <div style={{
                width: "100%", height: barH,
                background: barBg,
                border: `2px solid ${barColor}`,
                borderRadius: "4px 4px 0 0",
                boxShadow: glow,
                transition: "all 0.2s",
                position: "relative", zIndex: 1,
                display: "flex", alignItems: "flex-start", justifyContent: "center",
              }}>
                {label && (
                  <span style={{
                    position: "absolute", top: -18,
                    fontSize: 10, fontWeight: 800, fontFamily: mono,
                    color: isLeft ? PHASE_COLORS.found : PHASE_COLORS.compute,
                    background: T.bg, padding: "1px 4px", borderRadius: 3,
                    border: `1px solid ${isLeft ? PHASE_COLORS.found : PHASE_COLORS.compute}`,
                  }}>
                    {label}
                  </span>
                )}
              </div>

              {/* Index + value */}
              <span style={{ fontSize: 8, fontFamily: mono, color: T.textDim, marginTop: 2 }}>{i}</span>
              <span style={{
                fontSize: 9, fontWeight: 700, fontFamily: mono,
                color: (isLeft || isRight) ? barColor : T.textMid,
              }}>
                {h}
              </span>
            </div>
          );
        })}
      </div>

      {/* Variable chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { icon: "arrow-right-bold", label: "left",          val: left  ?? "—",  col: PHASE_COLORS.found   },
          { icon: "arrow-left-bold",  label: "right",         val: right ?? "—",  col: PHASE_COLORS.compute },
          { icon: "ruler-bold",       label: "width",         val: width  != null ? width  : "—", col: PHASE_COLORS.store   },
          { icon: "arrow-to-top-down-bold", label: "minH",    val: currentHeight != null ? currentHeight : "—", col: color },
          { icon: "box-bold",         label: "area",          val: area   != null ? area   : "—", col: PHASE_COLORS.scan    },
          { icon: "crown-bold",       label: "maxWater",      val: maxWater,                       col: PHASE_COLORS.found  },
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

      {/* Current area annotation */}
      {area != null && (
        <div style={{
          marginTop: 10,
          background: T.card, border: `1px solid ${color}44`,
          borderRadius: 8, padding: "8px 14px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Icon name="box-bold" size={12} style={{ color: T.textDim }} />
          <span style={{ color: T.textMid, fontSize: 11, fontFamily: mono }}>
            area = {width} × {currentHeight} =
          </span>
          <span style={{ color: color, fontSize: 15, fontWeight: 800, fontFamily: mono }}>
            {area}
          </span>
          {area === maxWater && phase === "new_max" && (
            <span style={{
              marginLeft: "auto", background: `${PHASE_COLORS.found}20`,
              border: `1px solid ${PHASE_COLORS.found}55`,
              borderRadius: 20, padding: "2px 10px",
              color: PHASE_COLORS.found, fontSize: 10, fontFamily: mono,
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <Icon name="crown-bold" size={10} style={{ color: PHASE_COLORS.found }} /> new max
            </span>
          )}
        </div>
      )}
    </div>
  );
}
