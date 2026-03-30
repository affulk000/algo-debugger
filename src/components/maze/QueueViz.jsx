import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
const { mono, display } = FONTS;

export default function QueueViz({ queue, cur, nx, ny, phase, color, T }) {
  const isEnqueue  = phase === "enqueue";
  const _isDequeue = phase === "dequeue";

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12 }}>
        <Icon name="sort-by-time-bold" size={13} style={{ color: T.textDim }} />
        <span style={{ color:T.textDim, fontSize:10, letterSpacing:2, textTransform:"uppercase", fontFamily:display }}>
          BFS Queue
        </span>
        <span style={{ marginLeft:"auto", background:T.card, border:`1px solid ${T.border}`,
          borderRadius:20, padding:"2px 8px", color:T.textMid, fontSize:10, fontFamily:mono }}>
          {queue.length}
        </span>
      </div>

      {/* Current cell being processed */}
      {cur && (
        <div style={{
          background:`${color}18`, border:`1.5px solid ${color}`,
          borderRadius:8, padding:"8px 12px", marginBottom:10,
          display:"flex", alignItems:"center", gap:8,
        }}>
          <Icon name="radio-minimalistic-bold" size={13} style={{ color }} />
          <span style={{ color:T.textMid, fontSize:10, fontFamily:mono }}>dequeued:</span>
          <span style={{ color, fontWeight:700, fontFamily:mono, fontSize:13 }}>
            ({cur.x},{cur.y})
          </span>
          <span style={{ color:T.textMid, fontSize:10, fontFamily:mono }}>dist=</span>
          <span style={{ color:PHASE_COLORS.found, fontWeight:700, fontFamily:mono }}>{cur.dist}</span>
        </div>
      )}

      {/* Queue items */}
      <div style={{ display:"flex", flexDirection:"column", gap:4, maxHeight:180, overflowY:"auto" }}>
        {queue.length === 0 ? (
          <div style={{ color:T.textDim, fontFamily:mono, fontSize:11, padding:"6px 0" }}>queue is empty</div>
        ) : (
          queue.map((cell, idx) => {
            const isNext    = idx === 0;
            const isNew     = isEnqueue && nx===cell.x && ny===cell.y && idx===queue.length-1;

            return (
              <div key={`${cell.x},${cell.y}`}
                className={isNew ? "map-new" : ""}
                style={{
                  background: isNext ? `${color}15` : T.card,
                  border: `1.5px solid ${isNext ? color : isNew ? PHASE_COLORS.found : T.border}`,
                  borderRadius:7, padding:"6px 12px",
                  display:"flex", alignItems:"center", gap:8,
                  transition:"all 0.2s",
                }}>
                <span style={{ color:T.textDim, fontSize:9, fontFamily:mono, minWidth:20 }}>[{idx}]</span>
                <span style={{
                  color: isNext ? color : isNew ? PHASE_COLORS.found : T.textMid,
                  fontWeight: 700, fontFamily:mono, fontSize:13,
                }}>
                  ({cell.x},{cell.y})
                </span>
                <span style={{ color:T.textDim, fontSize:10, fontFamily:mono }}>dist=</span>
                <span style={{ color:PHASE_COLORS.found, fontWeight:700, fontFamily:mono }}>{cell.dist}</span>
                {isNext && <span style={{ marginLeft:"auto", color:color, fontSize:9, fontFamily:mono }}>← next</span>}
                {isNew  && <span style={{ marginLeft:"auto", color:PHASE_COLORS.found, fontSize:9, fontFamily:mono }}>← new</span>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
