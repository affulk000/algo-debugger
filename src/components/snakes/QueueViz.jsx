import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
import Icon from "../ui/Icon.jsx";
const { mono, display } = FONTS;

export default function QueueViz({ queue, visited, label, moves, phase, color, T }) {
  const _isDone = phase === "done_found" || phase === "done_fail";
  const showMax = 14;

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
        <Icon name="sort-by-time-bold" size={13} style={{ color: T.textDim }} />
        <span style={{ color: T.textDim, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
          BFS Queue  ({queue.length})
        </span>
        <span style={{ marginLeft: "auto", color: T.textDim, fontSize: 10, fontFamily: mono }}>
          moves so far: <span style={{ color, fontWeight: 700 }}>{moves ?? 0}</span>
        </span>
      </div>

      {/* Current cell banner */}
      {label != null && (
        <div style={{
          background: `${color}18`, border: `1.5px solid ${color}`,
          borderRadius: 8, padding: "7px 12px", marginBottom: 10,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <Icon name="arrow-right-bold" size={12} style={{ color }} />
          <span style={{ color, fontFamily: mono, fontSize: 12, fontWeight: 700 }}>
            Processing cell {label}
          </span>
          <span style={{ color: T.textDim, fontFamily: mono, fontSize: 10, marginLeft: "auto" }}>
            move #{moves}
          </span>
        </div>
      )}

      {/* Queue items */}
      {queue.length === 0 ? (
        <div style={{ color: `${T.textDim}66`, fontFamily: mono, fontSize: 11, fontStyle: "italic", padding: "6px 0" }}>
          queue empty
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {queue.slice(0, showMax).map(([lbl, mv], qi) => {
            const isNext = qi === 0;
            const itemColor = isNext ? color : T.textDim;
            return (
              <div key={qi} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: isNext ? `${color}12` : `${T.card}`,
                border: `1px solid ${isNext ? color : T.border}`,
                borderRadius: 7, padding: "5px 10px",
                transition: "all 0.12s",
              }}>
                <span style={{ color: `${T.textDim}55`, fontFamily: mono, fontSize: 9, minWidth: 14 }}>
                  {qi}
                </span>
                <span style={{ color: itemColor, fontFamily: mono, fontSize: 12, fontWeight: isNext ? 700 : 500 }}>
                  cell {lbl}
                </span>
                <span style={{ color: T.textDim, fontFamily: mono, fontSize: 10, marginLeft: "auto" }}>
                  move {mv}
                </span>
                {isNext && <Icon name="arrow-right-bold" size={10} style={{ color }} />}
              </div>
            );
          })}
          {queue.length > showMax && (
            <div style={{ color: T.textDim, fontFamily: mono, fontSize: 10, paddingLeft: 10 }}>
              +{queue.length - showMax} more…
            </div>
          )}
        </div>
      )}

      {/* Visited count */}
      <div style={{
        marginTop: 12, padding: "6px 10px",
        background: `${T.card}`, border: `1px solid ${T.border}`, borderRadius: 7,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <Icon name="check-circle-bold" size={11} style={{ color: PHASE_COLORS.store }} />
        <span style={{ color: T.textDim, fontFamily: mono, fontSize: 11 }}>
          visited: <span style={{ color: PHASE_COLORS.store, fontWeight: 700 }}>{visited.size}</span> cells
        </span>
        {phase === "done_found" && (
          <span style={{ marginLeft: "auto", color: PHASE_COLORS.found, fontFamily: mono, fontSize: 11, fontWeight: 700 }}>
            ✓ {moves} moves!
          </span>
        )}
        {phase === "done_fail" && (
          <span style={{ marginLeft: "auto", color: PHASE_COLORS.miss, fontFamily: mono, fontSize: 11, fontWeight: 700 }}>
            ✗ unreachable
          </span>
        )}
      </div>
    </div>
  );
}
