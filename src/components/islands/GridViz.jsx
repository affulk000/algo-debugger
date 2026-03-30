import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
const { mono, display } = FONTS;

const ISLAND_COLORS = [
  "#f97316","#22c55e","#38bdf8","#c084fc","#f472b6",
  "#facc15","#2dd4bf","#818cf8","#f87171","#34d399",
];

export default function GridViz({ grid, islandMap, scanR, scanC, activeR, activeC, count, phase, color, T }) {
  const _grid      = grid      ?? [];
  const _islandMap = islandMap ?? [];
  const rows = _grid.length;
  const cols = _grid[0]?.length ?? 0;
  const CELL = Math.min(56, Math.floor(320 / Math.max(rows, cols)));
  const _isDone      = phase === "done";
  const _isNewIsland = phase === "new_island";

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        <Icon name="map-bold" size={13} style={{ color: T.textDim }} />
        <span style={{ color: T.textDim, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
          Grid  ({rows}×{cols})
        </span>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: T.textDim, fontSize: 10, fontFamily: mono }}>islands =</span>
          <span style={{ color: PHASE_COLORS.found, fontWeight: 800, fontSize: 16, fontFamily: mono }}>
            {count}
          </span>
        </span>
      </div>

      <div style={{ display: "inline-flex", flexDirection: "column", gap: 3 }}>
        {_grid.map((row, r) => (
          <div key={r} style={{ display: "flex", gap: 3 }}>
            {row.map((cell, c) => {
              const islandIdx  = _islandMap[r]?.[c] ?? 0;
              const isScan     = r === scanR && c === scanC && phase === "scan";
              const isActive   = r === activeR && c === activeC;
              const isLand     = cell === '1';
              const isSunk     = cell === '0' && islandIdx > 0;
              const isWater    = cell === '0' && islandIdx === 0;
              const islandColor = islandIdx > 0 ? ISLAND_COLORS[(islandIdx - 1) % ISLAND_COLORS.length] : null;

              let bg = `#1e3a5f`, border = `#1e40af44`, txt = "#60a5fa";   // water default
              let glow = "none", scale = 1;

              if (isWater) {
                bg = T.card; border = T.border; txt = T.textDim;
              }
              if (isSunk && islandColor) {
                bg = `${islandColor}22`; border = `${islandColor}77`; txt = islandColor;
              }
              if (isLand && !isActive) {
                bg = "#d97706"; border = "#f59e0b"; txt = "#fff";
              }
              if (isActive && phase === "dfs_sink") {
                bg = `${color}30`; border = color; txt = color;
                glow = `0 0 14px ${color}77`; scale = 1.15;
              } else if (isActive && phase === "new_island") {
                bg = `${PHASE_COLORS.found}28`; border = PHASE_COLORS.found; txt = PHASE_COLORS.found;
                glow = `0 0 16px ${PHASE_COLORS.found}88`; scale = 1.2;
              } else if (isActive) {
                bg = `${color}22`; border = color; txt = color;
                glow = `0 0 10px ${color}55`;
              }
              if (isScan) {
                border = T.textMid;
              }

              return (
                <div key={c} style={{
                  width: CELL, height: CELL, borderRadius: 8,
                  border: `2px solid ${border}`,
                  background: bg, color: txt,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  boxShadow: glow,
                  transform: `scale(${scale})`,
                  transition: "all 0.15s",
                  position: "relative",
                  cursor: "default",
                }}>
                  <span style={{ fontSize: CELL > 40 ? 16 : 12, fontWeight: 700, fontFamily: mono, lineHeight: 1 }}>
                    {isSunk ? "·" : cell}
                  </span>
                  {islandIdx > 0 && CELL > 36 && (
                    <span style={{ fontSize: 8, fontFamily: mono, opacity: 0.7, lineHeight: 1 }}>
                      #{islandIdx}
                    </span>
                  )}
                  <span style={{ position: "absolute", bottom: 1, right: 2, fontSize: 6, fontFamily: mono, opacity: 0.45 }}>
                    {r},{c}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Island color legend */}
      {count > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
          {Array.from({ length: count }, (_, i) => {
            const col = ISLAND_COLORS[i % ISLAND_COLORS.length];
            return (
              <div key={i} style={{
                background: `${col}18`, border: `1.5px solid ${col}66`,
                borderRadius: 7, padding: "4px 10px",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: col, display: "inline-block" }} />
                <span style={{ color: col, fontFamily: mono, fontSize: 11, fontWeight: 700 }}>
                  Island {i + 1}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
