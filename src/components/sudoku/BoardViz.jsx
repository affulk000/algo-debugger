import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
const { mono, display } = FONTS;

const BOX_COLORS = [
  "#f97316","#22c55e","#3b82f6",
  "#a855f7","#ec4899","#14b8a6",
  "#eab308","#6366f1","#f43f5e",
];

export default function BoardViz({ board, r, c, boxIndex, conflictIn, phase, color, T }) {
  const isConflict = phase === "conflict" || phase === "done_false";

  return (
    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:14 }}>
        <Icon name="hashtag-bold" size={13} style={{ color:T.textDim }} />
        <span style={{ color:T.textDim, fontSize:10, letterSpacing:2, textTransform:"uppercase", fontFamily:display }}>
          Board
        </span>
        {r!==null && c!==null && (
          <span style={{ marginLeft:"auto", color:T.textMid, fontSize:10, fontFamily:mono }}>
            ({r},{c})  box <span style={{ color:BOX_COLORS[boxIndex??0], fontWeight:700 }}>{boxIndex??0}</span>
          </span>
        )}
      </div>

      {/* 9×9 grid with 3×3 box borders */}
      <div style={{ display:"inline-flex", flexDirection:"column", gap:0 }}>
        {board.map((row, ri) => (
          <div key={ri} style={{ display:"flex" }}>
            {row.map((ch, ci) => {
              const isCur   = ri===r && ci===c;
              const bIdx    = Math.floor(ri/3)*3 + Math.floor(ci/3);
              const sameBox = bIdx === boxIndex && boxIndex !== null;
              const sameRow = ri===r && r!==null;
              const sameCol = ci===c && c!==null;

              // Thick borders at box boundaries
              const borderR = (ci+1)%3===0 && ci!==8 ? `2px solid ${T.textDim}88` : `1px solid ${T.border}`;
              const borderB = (ri+1)%3===0 && ri!==8 ? `2px solid ${T.textDim}88` : `1px solid ${T.border}`;

              let bg     = T.card;
              let textCol = T.textMid;
              let glow   = "none";

              const boxAccent = BOX_COLORS[bIdx];

              if (isCur && isConflict) {
                bg      = `${PHASE_COLORS.miss}30`;
                textCol = PHASE_COLORS.miss;
                glow    = `inset 0 0 0 2px ${PHASE_COLORS.miss}`;
              } else if (isCur) {
                bg      = `${color}28`;
                textCol = color;
                glow    = `inset 0 0 0 2px ${color}`;
              } else if (ch !== '.' && sameBox && isConflict && conflictIn==="box") {
                bg = `${PHASE_COLORS.miss}10`;
                textCol = PHASE_COLORS.miss;
              } else if (ch !== '.' && sameRow && isConflict && conflictIn==="row") {
                bg = `${PHASE_COLORS.miss}10`;
                textCol = PHASE_COLORS.miss;
              } else if (ch !== '.' && sameCol && isConflict && conflictIn==="col") {
                bg = `${PHASE_COLORS.miss}10`;
                textCol = PHASE_COLORS.miss;
              } else if (sameBox && phase !== "init" && phase !== "skip") {
                bg = `${boxAccent}10`;
              } else if ((sameRow || sameCol) && phase !== "init") {
                bg = `${color}07`;
              }

              return (
                <div key={ci} style={{
                  width:34, height:34,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  background: bg,
                  boxShadow: glow,
                  borderRight: borderR,
                  borderBottom: borderB,
                  borderLeft: ci===0 ? `2px solid ${T.textDim}88` : undefined,
                  borderTop: ri===0 ? `2px solid ${T.textDim}88` : undefined,
                  transition:"all 0.15s",
                  position:"relative",
                }}>
                  {/* tiny box-color pip top-left */}
                  <div style={{
                    position:"absolute", top:2, left:2,
                    width:4, height:4, borderRadius:"50%",
                    background: `${boxAccent}55`,
                  }} />
                  <span style={{
                    color: ch==='.' ? T.textDim : textCol,
                    fontSize: ch==='.' ? 10 : 14,
                    fontWeight: isCur ? 800 : 600,
                    fontFamily: mono,
                    opacity: ch==='.' ? 0.3 : 1,
                  }}>
                    {ch === '.' ? '·' : ch}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Conflict annotation */}
      {isConflict && conflictIn && (
        <div style={{
          marginTop:12, background:`${PHASE_COLORS.miss}12`,
          border:`1px solid ${PHASE_COLORS.miss}55`,
          borderRadius:8, padding:"8px 14px",
          display:"flex", alignItems:"center", gap:8,
        }}>
          <Icon name="danger-bold" size={13} style={{ color:PHASE_COLORS.miss }} />
          <span style={{ color:PHASE_COLORS.miss, fontFamily:mono, fontSize:12 }}>
            Duplicate in <strong>{conflictIn} {conflictIn==="row"?r:conflictIn==="col"?c:boxIndex}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
