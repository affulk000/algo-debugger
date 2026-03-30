import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
import Icon from "../ui/Icon.jsx";
const { mono, display } = FONTS;

const SLOW_COLOR = "#38bdf8";
const FAST_COLOR = "#f97316";
const MET_COLOR  = "#22c55e";

const NODE_R = 26;
const H_GAP  = 80;
const V_GAP  = 110;
const PAD    = 50;

// Layout: straight line, then cycle nodes arc below
function layoutNodes(nodes, tailIdx) {
  const n = nodes.length;
  const hasCycle = tailIdx >= 0 && tailIdx < n;

  // Find where cycle starts
  // Linear part: 0..tailIdx-1 straight, then cycle nodes in a circle
  const positions = {};

  if (!hasCycle) {
    // Simple straight line
    nodes.forEach((node, i) => {
      positions[node.id] = { x: PAD + i * H_GAP, y: PAD + NODE_R };
    });
  } else {
    // Linear part: 0 to tailIdx on top row
    for (let i = 0; i < tailIdx; i++) {
      positions[i] = { x: PAD + i * H_GAP, y: PAD + NODE_R };
    }
    // Cycle nodes in a horizontal loop below
    const cycleNodes = [];
    for (let i = tailIdx; i < n; i++) cycleNodes.push(i);
    // Add last node (which points back to tailIdx)
    const cycleCount = cycleNodes.length;

    // Lay cycle out: forward along top, then arc back below
    // Simple: cycle nodes form a U-shape
    const halfCycle = Math.ceil(cycleCount / 2);
    const cycleStartX = PAD + tailIdx * H_GAP;

    // Top row of cycle
    for (let ci = 0; ci < halfCycle; ci++) {
      positions[cycleNodes[ci]] = { x: cycleStartX + ci * H_GAP, y: PAD + NODE_R };
    }
    // Bottom row of cycle (right to left)
    for (let ci = halfCycle; ci < cycleCount; ci++) {
      const btm = cycleCount - 1 - ci; // reverse
      positions[cycleNodes[ci]] = {
        x: cycleStartX + (cycleCount - 1 - ci) * H_GAP + (tailIdx === 0 && ci === halfCycle ? H_GAP : 0),
        y: PAD + NODE_R + V_GAP,
      };
    }
    // Recalculate bottom row properly
    const bottomNodes = cycleNodes.slice(halfCycle);
    bottomNodes.reverse().forEach((nodeId, bi) => {
      positions[nodeId] = {
        x: cycleStartX + bi * H_GAP,
        y: PAD + NODE_R + V_GAP,
      };
    });
  }

  return positions;
}

function svgWidth(positions) {
  const xs = Object.values(positions).map(p => p.x);
  return Math.max(...xs) + NODE_R + PAD;
}
function svgHeight(positions) {
  const ys = Object.values(positions).map(p => p.y);
  return Math.max(...ys) + NODE_R + PAD;
}

// Arrow path between two nodes
function arrowPath(from, to, isCycleBack) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx*dx + dy*dy);
  const nx = dx / dist, ny = dy / dist;
  const sx = from.x + nx * NODE_R;
  const sy = from.y + ny * NODE_R;
  const ex = to.x   - nx * NODE_R;
  const ey = to.y   - ny * NODE_R;

  if (!isCycleBack) {
    return `M ${sx} ${sy} L ${ex} ${ey}`;
  }
  // Curved arc for cycle-back pointer
  const mx = (sx + ex) / 2;
  const my = Math.min(sy, ey) - 40;
  return `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`;
}

export default function LinkedListViz({ nodes, slowId, fastId, tailIdx, met, phase, color, T }) {
  const positions = layoutNodes(nodes, tailIdx);
  const w = svgWidth(positions);
  const h = svgHeight(positions);
  const hasCycle = tailIdx >= 0 && tailIdx < nodes.length;
  const isDone = phase === "done_true" || phase === "done_false" || phase === "met" || phase === "no_cycle";

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
        <Icon name="link-bold" size={13} style={{ color: T.textDim }} />
        <span style={{ color: T.textDim, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
          Linked List  ({nodes.length} nodes{hasCycle ? `, cycle→${tailIdx}` : ", no cycle"})
        </span>
        {/* Legend */}
        <span style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          {[["S", SLOW_COLOR, "slow"], ["F", FAST_COLOR, "fast"]].map(([lbl, col, name]) => (
            <span key={lbl} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: `${col}30`,
                border: `2px solid ${col}`, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 700, color: col, fontFamily: mono }}>{lbl}</span>
              <span style={{ color: T.textDim, fontSize: 10, fontFamily: mono }}>{name}</span>
            </span>
          ))}
        </span>
      </div>

      <svg width={w} height={h} style={{ overflow: "visible", display: "block" }}>
        <defs>
          {[["arr-default", T.textDim], ["arr-slow", SLOW_COLOR], ["arr-fast", FAST_COLOR], ["arr-met", MET_COLOR], ["arr-cycle", "#f472b6"]].map(([id, col]) => (
            <marker key={id} id={id} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill={col} />
            </marker>
          ))}
        </defs>

        {/* Edges */}
        {nodes.map(node => {
          if (node.nextId === -1) return null;
          const from = positions[node.id];
          const to   = positions[node.nextId];
          if (!from || !to) return null;
          const isCycleBack = node.id === nodes.length - 1 && node.nextId === tailIdx;
          const markerId = isCycleBack ? "arr-cycle" : "arr-default";
          const strokeColor = isCycleBack ? "#f472b6" : T.textDim;
          return (
            <path key={node.id}
              d={arrowPath(from, to, isCycleBack)}
              stroke={strokeColor} strokeWidth={isCycleBack ? 2 : 1.5}
              fill="none" strokeDasharray={isCycleBack ? "6 3" : "none"}
              markerEnd={`url(#${markerId})`}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const { x, y } = positions[node.id];
          const isSlow = node.id === slowId;
          const isFast = node.id === fastId;
          const isBoth = isSlow && isFast;
          const isHead = node.id === 0;

          let fill = `${T.card}`, stroke = T.border, textColor = T.textMid, glow = "none";
          if (isBoth || met) {
            fill = `${MET_COLOR}30`; stroke = MET_COLOR; textColor = MET_COLOR;
            glow = `0 0 16px ${MET_COLOR}99`;
          } else if (isSlow) {
            fill = `${SLOW_COLOR}25`; stroke = SLOW_COLOR; textColor = SLOW_COLOR;
            glow = `0 0 12px ${SLOW_COLOR}66`;
          } else if (isFast) {
            fill = `${FAST_COLOR}25`; stroke = FAST_COLOR; textColor = FAST_COLOR;
            glow = `0 0 12px ${FAST_COLOR}66`;
          }

          return (
            <g key={node.id}>
              {/* Glow filter workaround via extra circle */}
              {(isSlow || isFast) && (
                <circle cx={x} cy={y} r={NODE_R + 6}
                  fill={isBoth ? `${MET_COLOR}12` : isSlow ? `${SLOW_COLOR}12` : `${FAST_COLOR}12`}
                  stroke="none" />
              )}
              <circle cx={x} cy={y} r={NODE_R}
                fill={fill} stroke={stroke} strokeWidth={isSlow || isFast ? 2.5 : 1.5} />

              {/* Node value */}
              <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
                fontFamily={mono} fontSize={14} fontWeight={700} fill={textColor}>
                {node.val}
              </text>

              {/* Index label below */}
              <text x={x} y={y + NODE_R + 12} textAnchor="middle"
                fontFamily={mono} fontSize={9} fill={T.textDim}>
                [{node.id}]
              </text>

              {/* Pointer badges */}
              {isBoth && (
                <text x={x} y={y - NODE_R - 8} textAnchor="middle"
                  fontFamily={mono} fontSize={11} fontWeight={800} fill={MET_COLOR}>S+F</text>
              )}
              {isSlow && !isBoth && (
                <text x={x} y={y - NODE_R - 8} textAnchor="middle"
                  fontFamily={mono} fontSize={11} fontWeight={800} fill={SLOW_COLOR}>S</text>
              )}
              {isFast && !isBoth && (
                <text x={x} y={y - NODE_R - 8} textAnchor="middle"
                  fontFamily={mono} fontSize={11} fontWeight={800} fill={FAST_COLOR}>F</text>
              )}

              {/* HEAD label */}
              {isHead && (
                <text x={x - NODE_R - 6} y={y + 4} textAnchor="end"
                  fontFamily={mono} fontSize={9} fill={T.textDim}>head→</text>
              )}

              {/* Cycle re-entry marker */}
              {node.id === tailIdx && hasCycle && (
                <circle cx={x} cy={y} r={NODE_R + 10}
                  fill="none" stroke="#f472b6" strokeWidth={1.5} strokeDasharray="4 3" />
              )}
            </g>
          );
        })}

        {/* NULL terminator for no-cycle lists */}
        {!hasCycle && nodes.length > 0 && (() => {
          const last = positions[nodes.length - 1];
          const nullX = last.x + H_GAP;
          return (
            <g>
              <line x1={last.x + NODE_R} y1={last.y} x2={nullX - 8} y2={last.y}
                stroke={T.textDim} strokeWidth={1.5} markerEnd="url(#arr-default)" />
              <text x={nullX} y={last.y + 4} fontFamily={mono} fontSize={11} fill={T.textDim}>nil</text>
            </g>
          );
        })()}
      </svg>

      {/* Step distance counter */}
      <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
        {[
          [SLOW_COLOR, "slow", slowId, "+1 / step"],
          [FAST_COLOR, "fast", fastId, "+2 / step"],
        ].map(([col, name, id, rate]) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 6,
            background: `${col}10`, border: `1px solid ${col}30`,
            borderRadius: 7, padding: "5px 10px" }}>
            <span style={{ color: col, fontFamily: mono, fontSize: 11, fontWeight: 700 }}>
              {name} @ [{id ?? "nil"}]
            </span>
            <span style={{ color: T.textDim, fontSize: 9, fontFamily: mono }}>{rate}</span>
          </div>
        ))}
        {met && (
          <div style={{ display: "flex", alignItems: "center", gap: 6,
            background: `${MET_COLOR}15`, border: `1px solid ${MET_COLOR}`,
            borderRadius: 7, padding: "5px 12px", marginLeft: "auto" }}>
            <Icon name="check-circle-bold" size={13} style={{ color: MET_COLOR }} />
            <span style={{ color: MET_COLOR, fontFamily: mono, fontSize: 12, fontWeight: 800 }}>
              Cycle detected!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
