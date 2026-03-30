import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
import Icon from "../ui/Icon.jsx";
function buildLabelMap(n) {
  const labels = Array.from({ length: n }, () => Array(n).fill(0));
  let num = 1;
  for (let row = n - 1; row >= 0; row--) {
    const rowFromBottom = n - 1 - row;
    const reversed = rowFromBottom % 2 === 1;
    for (let ci = 0; ci < n; ci++) {
      const col = reversed ? n - 1 - ci : ci;
      labels[row][col] = num++;
    }
  }
  return labels;
}
const { mono, display } = FONTS;

const MOVE_COLORS = [
  "#f97316","#22c55e","#38bdf8","#c084fc",
  "#f472b6","#facc15","#2dd4bf","#818cf8",
];

export default function BoardViz({ board, n, visited, label, next, dest, diceVal, phase, color, T }) {
  const labels = buildLabelMap(n);
  const CELL   = Math.min(62, Math.floor(340 / n));
  const target = n * n;
  const _isDone = phase === "done_found" || phase === "done_fail";

  // Normalize visited to a Set (backend returns arrays, local steps return Sets)
  const visitedSet  = Array.isArray(visited) ? new Set(visited) : visited;

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
        <Icon name="map-point-bold" size={13} style={{ color: T.textDim }} />
        <span style={{ color: T.textDim, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
          Board ({n}×{n})
        </span>
        <span style={{ marginLeft: "auto", color: T.textDim, fontFamily: mono, fontSize: 10 }}>
          visited: <span style={{ color, fontWeight: 700 }}>{visitedSet.size}</span>
          {diceVal != null && (
            <span style={{ marginLeft: 12 }}>
              🎲 <span style={{ color, fontWeight: 700 }}>{diceVal}</span>
            </span>
          )}
        </span>
      </div>

      <div style={{ display: "inline-flex", flexDirection: "column", gap: 2 }}>
        {board.map((row, r) => (
          <div key={r} style={{ display: "flex", gap: 2 }}>
            {row.map((cell, c) => {
              const cellLabel = labels[r][c];
              const isCurrent = cellLabel === label;
              const isNext    = cellLabel === next;
              const isDest    = cellLabel === dest && phase === "teleport";
              const isVisited = visitedSet.has(cellLabel);
              const isTarget  = cellLabel === target;
              const hasSnakeOrLadder = cell !== -1;
              const _isTeleportSrc = hasSnakeOrLadder && cell > cellLabel; // ladder start
              const _isTeleportDst = hasSnakeOrLadder && cell < cellLabel; // snake start

              let bg     = T.card;
              let border = T.border;
              let txt    = T.textDim;
              let scale  = 1;
              let glow   = "none";

              if (isTarget) {
                bg = `${PHASE_COLORS.found}18`; border = `${PHASE_COLORS.found}88`; txt = PHASE_COLORS.found;
              }
              if (isVisited && !isCurrent) {
                bg = `${PHASE_COLORS.store}15`; border = `${PHASE_COLORS.store}44`; txt = PHASE_COLORS.store;
              }
              if (isNext && phase === "dice") {
                bg = `${color}20`; border = color; txt = color; scale = 1.1;
                glow = `0 0 10px ${color}55`;
              }
              if (isDest) {
                bg = `${PHASE_COLORS.enqueue}25`; border = PHASE_COLORS.enqueue; txt = PHASE_COLORS.enqueue;
                scale = 1.15; glow = `0 0 14px ${PHASE_COLORS.enqueue}77`;
              }
              if (isCurrent) {
                bg = `${color}30`; border = color; txt = color;
                scale = 1.18; glow = `0 0 16px ${color}88`;
              }
              if (phase === "done_found" && isCurrent) {
                bg = `${PHASE_COLORS.found}30`; border = PHASE_COLORS.found; txt = PHASE_COLORS.found;
                glow = `0 0 20px ${PHASE_COLORS.found}99`;
              }

              const teleportArrow = hasSnakeOrLadder
                ? (cell > cellLabel ? "🪜" : "🐍")
                : null;

              return (
                <div key={c} style={{
                  width: CELL, height: CELL, borderRadius: 6,
                  border: `2px solid ${border}`,
                  background: bg,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  transform: `scale(${scale})`,
                  boxShadow: glow,
                  transition: "all 0.14s",
                  position: "relative",
                }}>
                  <span style={{ fontSize: CELL > 44 ? 11 : 9, fontWeight: 700, fontFamily: mono, color: txt, lineHeight: 1 }}>
                    {cellLabel}
                  </span>
                  {teleportArrow && (
                    <span style={{ fontSize: 9, lineHeight: 1 }}>{teleportArrow}</span>
                  )}
                  {hasSnakeOrLadder && CELL > 40 && (
                    <span style={{ fontSize: 7, fontFamily: mono, color: cell > cellLabel ? PHASE_COLORS.enqueue : PHASE_COLORS.miss, lineHeight: 1 }}>
                      →{cell}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12, fontSize: 10, fontFamily: mono }}>
        {[
          [color, "current"],
          [PHASE_COLORS.store, "visited"],
          [PHASE_COLORS.found, "target"],
          [PHASE_COLORS.enqueue, "ladder →"],
          [PHASE_COLORS.miss, "snake →"],
        ].map(([col, lbl]) => (
          <span key={lbl} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: col, display: "inline-block" }} />
            <span style={{ color: T.textDim }}>{lbl}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
