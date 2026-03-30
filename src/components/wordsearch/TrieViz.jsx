import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
const { mono, display } = FONTS;

// Build children map from flat node list (supports both frontend tree nodes and backend flat nodes).
function layerNodes(allNodes) {
  if (!allNodes.length) return [];

  // Reconstruct children from parentId / parent references
  const nodeMap = {};
  allNodes.forEach(n => nodeMap[n.id] = { ...n, children: {} });
  allNodes.forEach(n => {
    const pid = n.parentId ?? n.parent;
    if (pid != null && pid !== -1 && nodeMap[pid] && n.char) {
      nodeMap[pid].children[n.char] = nodeMap[n.id];
    }
  });

  const root = nodeMap[0];
  if (!root) return [];

  const layers = [[root]];
  let current = [root];
  while (true) {
    const next = [];
    for (const node of current) {
      for (const ch of Object.keys(node.children).sort()) {
        next.push(node.children[ch]);
      }
    }
    if (!next.length) break;
    layers.push(next);
    current = next;
  }
  return layers;
}

export default function TrieViz({ trieAllNodes, trieActiveIds, found, phase, color, T }) {
  const _found = found ?? [];
  if (!(trieAllNodes ?? []).length) return null;

  const layers   = layerNodes(trieAllNodes);
  const activeSet = Array.isArray(trieActiveIds) ? new Set(trieActiveIds) : trieActiveIds;
  const isDone   = phase === "done";

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        <Icon name="branching-paths-up-bold" size={13} style={{ color: T.textDim }} />
        <span style={{ color: T.textDim, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
          Trie  ({trieAllNodes.length - 1} nodes)
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        {layers.map((layer, li) => (
          <div key={li} style={{ display: "flex", gap: 4, marginBottom: 6, flexWrap: li === 0 ? "nowrap" : "wrap" }}>
            {layer.map((node) => {
              const isActive = activeSet.has(node.id);
              const isWord   = node.word !== null && node.word !== undefined && node.word !== "";
              const isRoot   = node.id === 0;

              let bg     = T.card;
              let border = T.border;
              let txt    = T.textDim;

              if (isRoot) {
                bg = `${T.textDim}15`; border = T.textDim; txt = T.textMid;
              } else if (isActive) {
                bg = `${color}22`; border = color; txt = color;
              } else if (isWord) {
                bg = `${PHASE_COLORS.found}18`; border = `${PHASE_COLORS.found}88`; txt = PHASE_COLORS.found;
              }

              return (
                <div key={node.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                  <div style={{
                    minWidth: 28, height: 28, borderRadius: 6,
                    border: `1.5px solid ${border}`, background: bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s", position: "relative",
                  }}>
                    <span style={{ color: txt, fontSize: isRoot ? 9 : 13, fontWeight: 700, fontFamily: mono }}>
                      {isRoot ? "root" : node.char}
                    </span>
                    {isWord && (
                      <div style={{
                        position: "absolute", top: -6, right: -6,
                        width: 10, height: 10, borderRadius: "50%",
                        background: PHASE_COLORS.found, border: `1.5px solid ${T.bg}`,
                      }} />
                    )}
                  </div>
                  {isWord && (
                    <span style={{ color: PHASE_COLORS.found, fontSize: 7, fontFamily: mono, whiteSpace: "nowrap" }}>
                      {node.word}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Active path breadcrumb */}
      {activeSet.size > 0 && (
        <div style={{
          marginTop: 8, padding: "6px 10px",
          background: `${color}10`, border: `1px solid ${color}33`, borderRadius: 7,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <Icon name="arrow-right-bold" size={10} style={{ color }} />
          <span style={{ color, fontFamily: mono, fontSize: 11 }}>
            active: {trieAllNodes
              .filter(n => activeSet.has(n.id) && n.char)
              .sort((a, b) => a.depth - b.depth)
              .map(n => n.char)
              .join(" → ")}
          </span>
        </div>
      )}

      {/* Found words */}
      {_found.length > 0 && (
        <div style={{ marginTop: 8, display: "flex", gap: 5, flexWrap: "wrap" }}>
          {_found.map(w => (
            <span key={w} style={{
              background: `${PHASE_COLORS.found}18`,
              border: `1px solid ${PHASE_COLORS.found}55`,
              borderRadius: 6, padding: "3px 8px",
              color: PHASE_COLORS.found, fontFamily: mono, fontSize: 11, fontWeight: 700,
            }}>
              ✓ {w}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
