import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
const { mono, display } = FONTS;

const SLOW_COLOR = "#22c55e";
const FAST_COLOR = "#f97316";
const MEET_COLOR = "#facc15";

// Lay nodes out: linear chain left-to-right, then cycle arc back
// Returns { positions: [{x,y}], arrowSets: [{from, to, isCycle}] }
function layout(n, cyclePos) {
  const NODE_R = 22;
  const H_GAP  = 72;
  const LIN_Y  = 60;

  const positions = Array.from({length: n}, (_, i) => ({
    x: 24 + i * H_GAP,
    y: LIN_Y,
  }));

  const arrowSets = [];
  for (let i = 0; i < n - 1; i++) {
    arrowSets.push({ from: i, to: i + 1, isCycle: false });
  }
  if (cyclePos >= 0) {
    arrowSets.push({ from: n - 1, to: cyclePos, isCycle: true });
  }

  const width  = 24 + (n - 1) * H_GAP + NODE_R * 2 + 20;
  const height = cyclePos >= 0 ? 150 : 110;

  return { positions, arrowSets, width, height, NODE_R };
}

export default function ListViz({ nodeVals, cyclePos, slow, fast, meet, phase, T }) {
  const _nodeVals = nodeVals ?? [];
  const n = _nodeVals.length;
  if (n === 0) return null;
  const { positions, arrowSets, width, height, NODE_R } = layout(n, cyclePos);
  const isMeet   = meet >= 0;
  const isDoneFalse = phase === "done_false";

  const nodeColor = (i) => {
    if (isMeet && i === meet) return MEET_COLOR;
    if (i === slow && i === fast) return MEET_COLOR;
    if (i === slow) return SLOW_COLOR;
    if (i === fast) return FAST_COLOR;
    return null;
  };

  // SVG arrow path between two positions (straight or arc for cycle)
  const arrowPath = (from, to, isCycle) => {
    const fx = positions[from].x + NODE_R;
    const fy = positions[from].y;
    const tx = positions[to].x + NODE_R;
    const ty = positions[to].y;

    if (!isCycle) {
      // straight horizontal arrow
      return `M${fx + NODE_R} ${fy} L${tx - NODE_R - 6} ${ty}`;
    }
    // Cycle arc: dip below the nodes
    const midX = (fx + tx) / 2;
    const arcY  = fy + 70;
    return `M${fx + NODE_R*0.7} ${fy + NODE_R*0.7} Q${midX} ${arcY} ${tx + NODE_R*0.7} ${ty + NODE_R*0.7}`;
  };

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
        <Icon name="link-circle-bold" size={13} style={{ color: T.textDim }} />
        <span style={{ color: T.textDim, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
          Linked List  ({n} nodes{cyclePos >= 0 ? `, cycle→${cyclePos}` : ", no cycle"})
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <svg width={width} height={height} style={{ display: "block", minWidth: width }}>
          <defs>
            <marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 Z" fill={T.textDim} />
            </marker>
            <marker id="arr-cycle" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 Z" fill={PHASE_COLORS.miss} />
            </marker>
            <marker id="arr-meet" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 Z" fill={MEET_COLOR} />
            </marker>
          </defs>

          {/* Arrows */}
          {arrowSets.map(({ from, to, isCycle }, ai) => (
            <path
              key={ai}
              d={arrowPath(from, to, isCycle)}
              fill="none"
              stroke={isCycle ? PHASE_COLORS.miss : `${T.textDim}88`}
              strokeWidth={isCycle ? 2 : 1.5}
              strokeDasharray={isCycle ? "5,3" : undefined}
              markerEnd={`url(#${isCycle ? "arr-cycle" : "arr"})`}
            />
          ))}

          {/* Nodes */}
          {_nodeVals.map((val, i) => {
            const { x, y } = positions[i];
            const nc  = nodeColor(i);
            const isS = i === slow;
            const isF = i === fast;
            const isM = isMeet && i === meet;
            const cx  = x + NODE_R;

            return (
              <g key={i}>
                {/* Circle */}
                <circle
                  cx={cx} cy={y} r={NODE_R}
                  fill={nc ? `${nc}22` : T.card}
                  stroke={nc || T.border}
                  strokeWidth={nc ? 2.5 : 1.5}
                  style={{ filter: nc ? `drop-shadow(0 0 6px ${nc}88)` : "none", transition:"all 0.2s" }}
                />
                {/* Value */}
                <text
                  x={cx} y={y + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={13} fontWeight={700}
                  fontFamily={mono}
                  fill={nc || T.textMid}
                >
                  {val}
                </text>
                {/* Index below */}
                <text
                  x={cx} y={y + NODE_R + 12}
                  textAnchor="middle"
                  fontSize={9} fontFamily={mono}
                  fill={T.textDim}
                >
                  [{i}]
                </text>

                {/* Pointer badges */}
                {isM && (
                  <text x={cx} y={y - NODE_R - 8} textAnchor="middle" fontSize={9} fontFamily={mono} fontWeight={700} fill={MEET_COLOR}>MEET</text>
                )}
                {!isM && isS && isF && (
                  <text x={cx} y={y - NODE_R - 8} textAnchor="middle" fontSize={9} fontFamily={mono} fontWeight={700} fill={MEET_COLOR}>S=F</text>
                )}
                {!isM && !(isS && isF) && isS && (
                  <text x={cx - 8} y={y - NODE_R - 8} textAnchor="middle" fontSize={9} fontFamily={mono} fontWeight={700} fill={SLOW_COLOR}>S</text>
                )}
                {!isM && !(isS && isF) && isF && isF >= 0 && (
                  <text x={cx + 8} y={y - NODE_R - 8} textAnchor="middle" fontSize={9} fontFamily={mono} fontWeight={700} fill={FAST_COLOR}>F</text>
                )}

                {/* Cycle target badge */}
                {cyclePos >= 0 && i === cyclePos && !nc && (
                  <circle cx={cx + NODE_R - 4} cy={y - NODE_R + 4} r={5}
                    fill={PHASE_COLORS.miss} stroke={T.bg} strokeWidth={1.5} />
                )}
              </g>
            );
          })}

          {/* nil terminus for non-cycle lists */}
          {cyclePos < 0 && (
            <g>
              <text
                x={positions[n-1].x + NODE_R * 2 + 20}
                y={positions[n-1].y + 4}
                fontSize={11} fontFamily={mono}
                fill={isDoneFalse ? PHASE_COLORS.miss : T.textDim}
                fontWeight={isDoneFalse ? 700 : 400}
              >nil</text>
            </g>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
        {[
          { col: SLOW_COLOR, label: "slow" },
          { col: FAST_COLOR, label: "fast" },
          { col: MEET_COLOR, label: "meeting point" },
          { col: PHASE_COLORS.miss, label: "cycle edge" },
        ].map(({ col, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: col }} />
            <span style={{ color: T.textDim, fontSize: 9, fontFamily: mono }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
