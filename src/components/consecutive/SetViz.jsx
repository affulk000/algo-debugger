import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
const { mono, display } = FONTS;

export default function SetViz({ set, n, cur, streak, activeSeq, allSeqs, phase, longest, color, T }) {
  const _set      = set      ?? [];
  const _activeSeq = activeSeq ?? [];
  const _allSeqs  = allSeqs  ?? [];
  const activeSet  = new Set(_activeSeq);
  const isDone     = phase === "done";
  const isExtend   = phase === "extend";
  const isStart    = phase === "start";
  const isSkip     = phase === "skip";
  const isUpdate   = phase === "update";
  const isBreak    = phase === "break_loop";

  // All numbers in all completed sequences for persistent highlighting
  const completedNums = new Set(_allSeqs.flatMap(s => s.seq));
  // The latest completed sequence (last in allSeqs)
  const latestSeq = _allSeqs.length > 0 ? new Set(_allSeqs[_allSeqs.length-1].seq) : new Set();

  // Determine cell colour
  const cellStyle = (num) => {
    const inActive   = activeSet.has(num);
    const isCur      = num === n;
    const inLatest   = latestSeq.has(num) && (isUpdate || isBreak || isDone);
    const inDone     = completedNums.has(num) && isDone;

    if (inActive && isUpdate)  return { border:PHASE_COLORS.found, bg:`${PHASE_COLORS.found}28`, text:PHASE_COLORS.found };
    if (inActive)              return { border:color,              bg:`${color}22`,              text:color              };
    if (isCur && isSkip)       return { border:PHASE_COLORS.miss,  bg:`${PHASE_COLORS.miss}15`,  text:PHASE_COLORS.miss  };
    if (isCur && isStart)      return { border:color,              bg:`${color}28`,              text:color              };
    if (inDone)                return { border:`${PHASE_COLORS.found}66`, bg:`${PHASE_COLORS.found}10`, text:PHASE_COLORS.found };
    return { border:T.border, bg:T.card, text:T.textMid };
  };

  return (
    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:14 }}>
        <Icon name="database-bold" size={13} style={{ color:T.textDim }} />
        <span style={{ color:T.textDim, fontSize:10, letterSpacing:2, textTransform:"uppercase", fontFamily:display }}>
          Hash Set  ({_set.length} unique)
        </span>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ color:T.textDim, fontSize:10, fontFamily:mono }}>longest =</span>
          <span style={{ color:PHASE_COLORS.found, fontWeight:800, fontSize:14, fontFamily:mono }}>{longest}</span>
        </div>
      </div>

      {/* Number chips */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:14 }}>
        {_set.map(num => {
          const { border, bg, text } = cellStyle(num);
          const isN   = num === n;
          const isCurrent = activeSet.has(num) && num === cur;
          return (
            <div key={num} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
              {/* pointer label */}
              <span style={{ fontSize:8, fontFamily:mono, fontWeight:700, height:11,
                color: isN && !activeSet.has(num) ? color : isCurrent ? PHASE_COLORS.store : "transparent" }}>
                {isN && !activeSet.has(num) ? "n" : isCurrent ? "cur" : " "}
              </span>
              <div style={{
                minWidth:34, padding:"5px 8px", borderRadius:7,
                border:`1.5px solid ${border}`, background:bg,
                color:text, fontSize:13, fontWeight:700, fontFamily:mono,
                textAlign:"center", transition:"all 0.15s",
              }}>
                {num}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active sequence strip */}
      {_activeSeq.length > 0 && (
        <div style={{
          background:T.card, border:`1px solid ${isUpdate ? PHASE_COLORS.found : color}55`,
          borderRadius:8, padding:"8px 14px", marginBottom:10,
          display:"flex", alignItems:"center", gap:8, flexWrap:"wrap",
        }}>
          <Icon name={isUpdate ? "crown-bold" : "arrow-right-bold"} size={12}
            style={{ color: isUpdate ? PHASE_COLORS.found : color }} />
          <span style={{ color:T.textDim, fontSize:10, fontFamily:mono }}>current streak:</span>
          <div style={{ display:"flex", alignItems:"center", gap:4, flexWrap:"wrap" }}>
            {_activeSeq.map((num, i) => (
              <span key={num} style={{ display:"flex", alignItems:"center", gap:4 }}>
                <span style={{
                  color: isUpdate ? PHASE_COLORS.found : color,
                  fontWeight:800, fontFamily:mono, fontSize:14,
                }}>
                  {num}
                </span>
                {i < _activeSeq.length - 1 && (
                  <span style={{ color:T.textDim, fontSize:10 }}>→</span>
                )}
              </span>
            ))}
            <span style={{
              background:`${isUpdate?PHASE_COLORS.found:color}20`,
              border:`1px solid ${isUpdate?PHASE_COLORS.found:color}55`,
              borderRadius:20, padding:"1px 8px",
              color: isUpdate ? PHASE_COLORS.found : color,
              fontSize:11, fontFamily:mono, fontWeight:700, marginLeft:4,
            }}>
              {_activeSeq.length}
            </span>
          </div>
        </div>
      )}

      {/* All sequences found so far */}
      {_allSeqs.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          <span style={{ color:T.textDim, fontSize:9, fontFamily:mono, letterSpacing:1 }}>
            SEQUENCES FOUND
          </span>
          {_allSeqs.map(({ start, seq }) => {
            const isBest = seq.length === longest;
            return (
              <div key={start} style={{
                display:"flex", alignItems:"center", gap:8,
                background: isBest ? `${PHASE_COLORS.found}10` : T.card,
                border:`1px solid ${isBest ? PHASE_COLORS.found+"44" : T.border}`,
                borderRadius:7, padding:"5px 10px",
              }}>
                {isBest && <Icon name="crown-bold" size={10} style={{ color:PHASE_COLORS.found }} />}
                <span style={{ color: isBest ? PHASE_COLORS.found : T.textMid, fontFamily:mono, fontSize:12 }}>
                  [{seq.join(" → ")}]
                </span>
                <span style={{
                  marginLeft:"auto", color: isBest ? PHASE_COLORS.found : T.textDim,
                  fontFamily:mono, fontSize:10,
                }}>
                  len={seq.length}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
