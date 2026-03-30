import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
const { mono, display } = FONTS;

const PATH_COLORS = ["#f97316","#22c55e","#38bdf8","#c084fc","#f472b6","#facc15","#2dd4bf","#f87171"];

export default function BoardViz({ board, path, r, c, found, phase, wordJustFound, color, T }) {
  const _board = board ?? [];
  const _path  = path  ?? [];
  const _found = found ?? [];
  const m = _board.length, n = _board[0]?.length ?? 0;
  const pathSet  = new Map(_path.map((p, i) => [`${p.r},${p.c}`, i]));
  const _isDone    = phase === "done";
  const isFound    = phase === "found_word";
  const _isRestore = phase === "restore";

  const CELL = Math.min(52, Math.floor(260 / Math.max(m, n)));

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        <Icon name="map-bold" size={13} style={{ color: T.textDim }} />
        <span style={{ color: T.textDim, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
          Board ({m}×{n})
        </span>
        {_found.length > 0 && (
          <span style={{ marginLeft: "auto", color: PHASE_COLORS.found, fontFamily: mono, fontSize: 10, fontWeight: 700 }}>
            ✓ {_found.join(", ")}
          </span>
        )}
      </div>

      <div style={{ display: "inline-flex", flexDirection: "column", gap: 3, marginBottom: 12 }}>
        {_board.map((row, ri) => (
          <div key={ri} style={{ display: "flex", gap: 3 }}>
            {row.map((ch, ci) => {
              const key     = `${ri},${ci}`;
              const pathIdx = pathSet.get(key);
              const inPath  = pathIdx !== undefined;
              const isCur   = ri === r && ci === c;
              const isVisited = ch === '#';

              let bg = T.card, border = T.border, txt = T.textMid, glow = "none", scale = 1;

              if (isFound && inPath) {
                bg = `${PHASE_COLORS.found}28`; border = PHASE_COLORS.found; txt = PHASE_COLORS.found;
                glow = `0 0 14px ${PHASE_COLORS.found}66`; scale = 1.1;
              } else if (inPath) {
                const pathColor = PATH_COLORS[pathIdx % PATH_COLORS.length];
                bg = `${pathColor}22`; border = pathColor; txt = pathColor;
              } else if (isCur && !isVisited) {
                bg = `${color}22`; border = color; txt = color;
                glow = `0 0 12px ${color}55`;
              } else if (isVisited) {
                bg = `${T.textDim}10`; border = `${T.border}55`; txt = T.textDim;
              }

              return (
                <div key={ci} style={{
                  width: CELL, height: CELL, borderRadius: 8,
                  border: `2px solid ${border}`, background: bg,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  boxShadow: glow, transform: `scale(${scale})`,
                  transition: "all 0.15s", position: "relative",
                }}>
                  {inPath && (
                    <span style={{ position: "absolute", top: 2, right: 3, fontSize: 7, fontFamily: mono, color: txt, opacity: 0.7 }}>
                      {pathIdx + 1}
                    </span>
                  )}
                  <span style={{ fontSize: isVisited ? 11 : 15, fontWeight: 700, fontFamily: mono, color: txt }}>
                    {isVisited ? "·" : ch}
                  </span>
                  <span style={{ fontSize: 7, fontFamily: mono, color: T.textDim, lineHeight: 1 }}>
                    {ri},{ci}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Word just found banner */}
      {isFound && wordJustFound && (
        <div className="pop" style={{
          background: `${PHASE_COLORS.found}18`, border: `1.5px solid ${PHASE_COLORS.found}`,
          borderRadius: 8, padding: "8px 14px",
          display: "flex", alignItems: "center", gap: 8, animation: "pop 0.4s ease",
        }}>
          <Icon name="crown-bold" size={14} style={{ color: PHASE_COLORS.found }} />
          <span style={{ color: PHASE_COLORS.found, fontFamily: mono, fontSize: 14, fontWeight: 800 }}>
            "{wordJustFound}" found!
          </span>
          <span style={{ color: T.textDim, fontSize: 10, fontFamily: mono, marginLeft: "auto" }}>
            path: {_path.map(p => `(${p.r},${p.c})`).join("→")}
          </span>
        </div>
      )}

      {/* Path strip */}
      {_path.length > 0 && !isFound && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
          {_path.map((p, idx) => (
            <span key={idx} style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{
                background: `${PATH_COLORS[idx % PATH_COLORS.length]}22`,
                border: `1px solid ${PATH_COLORS[idx % PATH_COLORS.length]}66`,
                borderRadius: 5, padding: "2px 7px",
                color: PATH_COLORS[idx % PATH_COLORS.length],
                fontSize: 11, fontWeight: 700, fontFamily: mono,
              }}>{p.ch}</span>
              {idx < _path.length - 1 && <span style={{ color: T.textDim, fontSize: 9 }}>→</span>}
            </span>
          ))}
          <span style={{ color: T.textDim, fontSize: 10, fontFamily: mono, marginLeft: 4 }}>
            "{_path.map(p => p.ch).join("")}"
          </span>
        </div>
      )}
    </div>
  );
}
