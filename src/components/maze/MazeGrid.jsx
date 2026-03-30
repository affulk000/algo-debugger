import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
const { mono, display } = FONTS;

const CELL_SIZE = 48;

export default function MazeGrid({ maze, visited, cur, nx, ny, path, queue, phase, color, T }) {
  const _maze  = maze  ?? [];
  const _path  = path  ?? [];
  const _queue = queue ?? [];
  const m = _maze.length, n = _maze[0]?.length ?? 0;
  const pathSet  = new Set(_path.map(p => `${p.x},${p.y}`));
  const queueSet = new Set(_queue.map(c => `${c.x},${c.y}`));
  const isGoal   = phase === "goal";
  const isFail   = phase === "done_fail";

  const cellSize = Math.min(CELL_SIZE, Math.floor(280 / Math.max(m, n)));

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:14 }}>
        <Icon name="map-bold" size={13} style={{ color: T.textDim }} />
        <span style={{ color: T.textDim, fontSize:10, letterSpacing:2, textTransform:"uppercase", fontFamily:display }}>
          Maze  ({m}×{n})
        </span>
        {cur && (
          <span style={{ marginLeft:"auto", color:T.textMid, fontSize:10, fontFamily:mono }}>
            current: ({cur.x},{cur.y}) dist=
            <span style={{ color, fontWeight:700 }}>{cur.dist}</span>
          </span>
        )}
      </div>

      {/* Grid */}
      <div style={{ display:"inline-flex", flexDirection:"column", gap:3, marginBottom:14 }}>
        {_maze.map((row, r) => (
          <div key={r} style={{ display:"flex", gap:3 }}>
            {row.map((cell, c) => {
              const k = `${r},${c}`;
              const isStart   = r===0 && c===0;
              const isEnd     = r===m-1 && c===n-1;
              const isCur     = cur && cur.x===r && cur.y===c;
              const isNxt     = nx===r && ny===c;
              const isPath    = pathSet.has(k);
              const isQueued  = queueSet.has(k);
              const isVis     = visited[r]?.[c];
              const isWall    = cell === 0;

              let bg     = isWall ? T.code  : T.card;
              let border = isWall ? `${T.border}` : T.border;
              let text   = null;
              let glow   = "none";
              let emoji  = null;

              if (isWall) {
                bg = `${T.textDim}22`;
                border = `${T.border}`;
              } else if (isPath && isGoal) {
                bg     = `${PHASE_COLORS.found}30`;
                border = PHASE_COLORS.found;
                glow   = `0 0 10px ${PHASE_COLORS.found}55`;
              } else if (isEnd && isFail) {
                bg     = `${PHASE_COLORS.miss}25`;
                border = PHASE_COLORS.miss;
              } else if (isEnd) {
                bg     = `${PHASE_COLORS.found}18`;
                border = PHASE_COLORS.found;
              } else if (isStart) {
                bg     = `${PHASE_COLORS.store}18`;
                border = PHASE_COLORS.store;
              } else if (isCur) {
                bg     = `${color}30`;
                border = color;
                glow   = `0 0 14px ${color}66`;
              } else if (isNxt && phase === "enqueue") {
                bg     = `${PHASE_COLORS.found}20`;
                border = PHASE_COLORS.found;
                glow   = `0 0 10px ${PHASE_COLORS.found}44`;
              } else if (isNxt && phase === "skip") {
                bg     = `${PHASE_COLORS.miss}18`;
                border = PHASE_COLORS.miss;
              } else if (isNxt) {
                bg     = `${color}15`;
                border = `${color}88`;
              } else if (isQueued) {
                bg     = `${PHASE_COLORS.scan}15`;
                border = `${PHASE_COLORS.scan}66`;
              } else if (isVis) {
                bg     = `${T.textDim}12`;
                border = `${T.border}88`;
              }

              return (
                <div key={c} style={{
                  width: cellSize, height: cellSize, borderRadius: 6,
                  border: `2px solid ${border}`,
                  background: bg, boxShadow: glow,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  flexDirection:"column", transition:"all 0.2s",
                  position:"relative",
                }}>
                  {isStart && !isCur && (
                    <Icon name="rocket-bold" size={cellSize > 36 ? 14 : 10} style={{ color: PHASE_COLORS.store }} />
                  )}
                  {isEnd && (
                    <Icon name="flag-bold" size={cellSize > 36 ? 14 : 10}
                      style={{ color: isFail ? PHASE_COLORS.miss : PHASE_COLORS.found }} />
                  )}
                  {isCur && (
                    <Icon name="radio-minimalistic-bold" size={cellSize > 36 ? 16 : 12} style={{ color }} />
                  )}
                  {isWall && (
                    <div style={{ width:"60%", height:"60%", background:`${T.textDim}44`, borderRadius:3 }} />
                  )}
                  {/* dist label on visited open cells */}
                  {!isWall && !isCur && !isStart && !isEnd && isVis && (
                    <span style={{ fontSize: cellSize > 36 ? 9 : 7, fontFamily:mono, color:T.textDim, position:"absolute", bottom:2, right:3 }}>
                      {/* intentionally blank – distance shown in queue */}
                    </span>
                  )}
                  {/* row,col tiny label */}
                  <span style={{ fontSize: cellSize > 36 ? 7 : 6, fontFamily:mono, color:T.textDim, position:"absolute", top:1, left:3 }}>
                    {r},{c}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {[
          { col: PHASE_COLORS.store, label: "start"    },
          { col: PHASE_COLORS.found, label: "goal"      },
          { col: color,              label: "current"   },
          { col: PHASE_COLORS.scan,  label: "in queue"  },
          { col: `${T.textDim}55`,   label: "visited"   },
          { col: PHASE_COLORS.found, label: "path ✓", onlyGoal: true },
        ].filter(l => !l.onlyGoal || isGoal).map(({ col, label }) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:4 }}>
            <div style={{ width:10, height:10, borderRadius:2, background:col, border:`1px solid ${col}` }} />
            <span style={{ color:T.textDim, fontSize:9, fontFamily:mono }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
