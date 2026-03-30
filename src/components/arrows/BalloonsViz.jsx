import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
const { mono, display } = FONTS;

const BALLOON_COLORS = ["#f97316","#22c55e","#38bdf8","#c084fc","#f472b6","#34d399","#facc15","#818cf8",
                        "#fb923c","#a78bfa","#2dd4bf","#e879f9","#f87171","#4ade80","#60a5fa","#fbbf24"];

export default function BalloonsViz({ sorted, i, arrows, currentEnd, burst, phase, color, T }) {
  const _sorted = sorted ?? [];
  const _burst  = burst  ?? [];
  if (!_sorted.length) return null;

  const isSort  = phase === "sort";
  const burstSet = new Set(_burst);

  // Compute display range
  const allVals = _sorted.flat();
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const range = maxV - minV || 1;
  const PAD   = 0.08;

  const toX = (v) => `${((v - minV) / range) * (1 - 2*PAD) * 100 + PAD*100}%`;

  // Group balloons by which arrow burst them (index in burst array = arrow index)
  // arrow 0 → first time burst contains an index, arrow 1 = next new_arrow push, etc.
  const arrowGroups = [];
  let arrowIdx = 0;
  for (let bi = 0; bi < _burst.length; bi++) {
    // a new arrow was added when burst[bi] matches a "new_arrow" group start
    // We'll just colour by modular arrow index
    if (!arrowGroups[arrowIdx]) arrowGroups[arrowIdx] = [];
    arrowGroups[arrowIdx].push(_burst[bi]);
    // If this is the last in a group before next arrow — detect by gap in burst sequence
    if (bi < _burst.length - 1 && !burstSet.has(_burst[bi] + 1)) arrowIdx++;
  }

  // Map balloon index → its arrow group color
  const balloonArrow = {};
  arrowGroups.forEach((group, ai) => group.forEach(bi => { balloonArrow[bi] = ai; }));

  const ROW_H = 32;

  return (
    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:16 }}>
        <Icon name="arrow-down-bold" size={13} style={{ color:T.textDim }} />
        <span style={{ color:T.textDim, fontSize:10, letterSpacing:2, textTransform:"uppercase", fontFamily:display }}>
          Balloons  (sorted by end)
        </span>
        <span style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ color:T.textDim, fontSize:10, fontFamily:mono }}>arrows =</span>
          <span style={{ color:PHASE_COLORS.found, fontWeight:800, fontSize:15, fontFamily:mono }}>{arrows}</span>
        </span>
      </div>

      {/* Timeline */}
      <div style={{ position:"relative", marginBottom:8 }}>

        {/* Axis line */}
        <div style={{ position:"absolute", left:0, right:0, top:ROW_H*_sorted.length + 10,
          height:2, background:`${T.border}88`, borderRadius:1 }} />

        {/* Current arrow vertical line */}
        {currentEnd !== null && !isSort && (
          <div style={{
            position:"absolute",
            left:toX(currentEnd),
            top:0, bottom: -14,
            width:2, background: color,
            borderRadius:1,
            boxShadow:`0 0 10px ${color}88`,
            zIndex:10,
          }}>
            <div style={{
              position:"absolute", bottom:-20, left:"50%", transform:"translateX(-50%)",
              color, fontFamily:mono, fontSize:9, fontWeight:700, whiteSpace:"nowrap",
            }}>
              x={currentEnd}
            </div>
          </div>
        )}

        {/* Balloons */}
        {_sorted.map(([start, end], bi) => {
          const isCurrent = bi === i;
          const isBurst   = burstSet.has(bi);
          const arrowGrp  = balloonArrow[bi] ?? -1;
          const bColor    = BALLOON_COLORS[arrowGrp % BALLOON_COLORS.length];
          const isHit     = isCurrent && phase === "hit";
          const isMiss    = isCurrent && phase === "check_hit" && !isHit;

          const barColor  = isBurst
            ? bColor
            : isCurrent
              ? color
              : T.textDim;

          return (
            <div key={bi} style={{ position:"relative", height:ROW_H, marginBottom:2 }}>
              {/* Bar */}
              <div style={{
                position:"absolute",
                left:toX(start), right:`${100 - parseFloat(toX(end))}%`,
                top:"50%", transform:"translateY(-50%)",
                height:isCurrent ? 16 : 12,
                borderRadius:8,
                background: isBurst ? `${bColor}30` : `${barColor}18`,
                border:`2px solid ${isBurst ? bColor : isMiss ? PHASE_COLORS.miss : barColor}`,
                transition:"all 0.18s",
                boxShadow: isCurrent ? `0 0 12px ${color}55` : "none",
                display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden",
              }}>
                {/* Balloon emoji in center if burst */}
                {isBurst && (
                  <span style={{ fontSize:10 }}>🎈</span>
                )}
              </div>
              {/* Start/end labels */}
              <span style={{
                position:"absolute", left:toX(start),
                top:"50%", transform:"translate(-50%,-50%) translateY(12px)",
                color:T.textDim, fontSize:7, fontFamily:mono,
              }}>{start}</span>
              <span style={{
                position:"absolute", left:toX(end),
                top:"50%", transform:"translate(-50%,-50%) translateY(12px)",
                color:T.textDim, fontSize:7, fontFamily:mono,
              }}>{end}</span>
              {/* Balloon index */}
              <span style={{
                position:"absolute", right:"calc(100% - " + toX(start) + " + 4px)",
                top:"50%", transform:"translateY(-50%)",
                color: isCurrent ? color : T.textDim, fontSize:9, fontFamily:mono, fontWeight:700,
              }}>
                {bi}
              </span>
            </div>
          );
        })}

        {/* Axis tick labels */}
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:16 }}>
          <span style={{ color:T.textDim, fontSize:8, fontFamily:mono }}>{minV}</span>
          <span style={{ color:T.textDim, fontSize:8, fontFamily:mono }}>{maxV}</span>
        </div>
      </div>

      {/* Arrow summary chips */}
      {arrows > 0 && !isSort && (
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:14 }}>
          {Array.from({length:arrows}, (_,ai) => {
            // Find the end value for this arrow = end of first balloon in its group
            const groupBalloonIdx = arrowGroups[ai]?.[0] ?? 0;
            const arrowX = _sorted[groupBalloonIdx]?.[1] ?? "?";
            const isLast = ai === arrows - 1;
            return (
              <div key={ai} style={{
                background: isLast ? `${color}18` : `${BALLOON_COLORS[ai%BALLOON_COLORS.length]}18`,
                border:`1.5px solid ${isLast ? color : BALLOON_COLORS[ai%BALLOON_COLORS.length]}66`,
                borderRadius:8, padding:"5px 10px",
                display:"flex", alignItems:"center", gap:5,
              }}>
                <Icon name="arrow-down-bold" size={11}
                  style={{ color: isLast ? color : BALLOON_COLORS[ai%BALLOON_COLORS.length] }} />
                <span style={{ color: isLast ? color : BALLOON_COLORS[ai%BALLOON_COLORS.length],
                  fontFamily:mono, fontSize:11, fontWeight:700 }}>
                  Arrow {ai+1}  x={arrowX}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
