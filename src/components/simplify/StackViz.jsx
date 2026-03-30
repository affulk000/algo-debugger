import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
const { mono, display } = FONTS;

/**
 * Shows the stack as vertical slots (bottom=index 0) and the parts array
 * with the current part highlighted.
 */
export default function StackViz({ parts, stack, partIdx, phase, popped, color, T }) {
  const _parts = parts ?? [];
  const _stack = stack ?? [];
  const isPush     = phase === "push";
  const isPop      = phase === "pop";
  const _isSkip    = phase === "skip";
  const _isPopEmpty = phase === "pop_empty";

  // Build path from stack for the running path display
  const currentPath = "/" + _stack.join("/");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Parts strip */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <Icon name="layers-bold" size={13} style={{ color: T.textDim }} />
          <span style={{ color: T.textDim, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
            Parts  (strings.Split result)
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {_parts.map((p, i) => {
            const isCurrent = i === partIdx;
            const isPast    = partIdx !== null && i < partIdx;

            let borderColor = T.border;
            let bgColor     = T.card;
            let textColor   = T.textDim;

            if (isCurrent) {
              borderColor = color;
              bgColor     = `${color}20`;
              textColor   = color;
            } else if (isPast) {
              borderColor = `${T.border}88`;
              textColor   = T.textDim;
              bgColor     = `${T.surface}`;
            }

            return (
              <div key={i} style={{
                border: `1.5px solid ${borderColor}`, background: bgColor,
                borderRadius: 7, padding: "4px 10px",
                display: "flex", alignItems: "center", gap: 4,
                opacity: isPast ? 0.45 : 1,
                transition: "all 0.2s",
              }}>
                <span style={{ color: T.textDim, fontSize: 9, fontFamily: mono }}>{i}:</span>
                <span style={{
                  color: textColor,
                  fontSize: p === "" ? 9 : 12,
                  fontWeight: isCurrent ? 700 : 500,
                  fontFamily: mono,
                  fontStyle: p === "" ? "italic" : "normal",
                }}>
                  {p === "" ? '""' : p === "." ? '"."' : p === ".." ? '".."' : `"${p}"`}
                </span>
                {isCurrent && (
                  <Icon name="arrow-down-bold" size={10} style={{ color }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stack visualization */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <Icon name="inbox-bold" size={13} style={{ color: T.textDim }} />
          <span style={{ color: T.textDim, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
            Stack  (directory segments)
          </span>
          <span style={{
            marginLeft: "auto", background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 20, padding: "2px 8px", color: T.textMid, fontSize: 10, fontFamily: mono,
          }}>
            len = {_stack.length}
          </span>
        </div>

        {/* Stack slots rendered top→bottom (top of stack = last element) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minHeight: 48 }}>
          {_stack.length === 0 ? (
            <div style={{
              border: `1px dashed ${T.border}`, borderRadius: 8,
              padding: "10px 14px", textAlign: "center",
              color: T.textDim, fontFamily: mono, fontSize: 11,
            }}>
              empty stack
            </div>
          ) : (
            [..._stack].reverse().map((seg, revIdx) => {
              const realIdx   = _stack.length - 1 - revIdx;
              const isTop     = realIdx === _stack.length - 1;
              const isNew      = isPush && isTop;
              const _wasPopped = isPop && popped === seg && isTop;

              let borderColor = `${PHASE_COLORS.store}55`;
              let bgColor     = `${PHASE_COLORS.store}0e`;
              let textColor   = PHASE_COLORS.store;

              if (isNew) {
                borderColor = PHASE_COLORS.found;
                bgColor     = `${PHASE_COLORS.found}18`;
                textColor   = PHASE_COLORS.found;
              }

              return (
                <div key={realIdx}
                  className={isNew ? "map-new" : ""}
                  style={{
                    border: `1.5px solid ${borderColor}`, background: bgColor,
                    borderRadius: 8, padding: "8px 14px",
                    display: "flex", alignItems: "center", gap: 10,
                    transition: "all 0.25s",
                  }}>
                  <span style={{ color: T.textDim, fontSize: 9, fontFamily: mono, minWidth: 16 }}>
                    [{realIdx}]
                  </span>
                  <span style={{ color: textColor, fontSize: 14, fontWeight: 700, fontFamily: mono }}>
                    "{seg}"
                  </span>
                  {isTop && (
                    <span style={{
                      marginLeft: "auto", fontSize: 9, fontFamily: mono,
                      color: T.textDim, background: T.card,
                      border: `1px solid ${T.border}`, borderRadius: 10,
                      padding: "1px 6px",
                    }}>
                      top
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Popped ghost */}
        {isPop && popped && (
          <div style={{
            border: `1px dashed ${PHASE_COLORS.miss}55`, background: `${PHASE_COLORS.miss}08`,
            borderRadius: 8, padding: "6px 14px", marginBottom: 10,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <Icon name="alt-arrow-up-bold" size={12} style={{ color: PHASE_COLORS.miss }} />
            <span style={{ color: PHASE_COLORS.miss, fontSize: 12, fontFamily: mono }}>
              popped: "{popped}"
            </span>
          </div>
        )}

        {/* Current canonical path */}
        <div style={{
          background: T.card, border: `1px solid ${color}44`,
          borderRadius: 8, padding: "8px 14px",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <Icon name="folder-open-bold" size={12} style={{ color: T.textDim }} />
          <span style={{ color: T.textMid, fontSize: 11, fontFamily: mono }}>current path:</span>
          <span style={{ color: color, fontSize: 14, fontWeight: 700, fontFamily: mono }}>
            {currentPath}
          </span>
        </div>
      </div>
    </div>
  );
}
