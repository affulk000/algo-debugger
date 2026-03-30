import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";

const { mono, display } = FONTS;

/**
 * Visualizes the `seen` hash map, highlighting new entries and matches.
 *
 * @param {object}   seen        Current seen map snapshot { [value]: index }
 * @param {object}   prevSeen    Previous step's seen map (for "new" detection)
 * @param {number}   needed      Current needed value (to detect match highlight)
 * @param {string}   phase       Current step phase
 * @param {object}   T           Theme token object
 */
export default function SeenMap({ seen, prevSeen, needed, phase, T }) {
  const seenObj    = seen     ?? {};
  const prevSeenObj = prevSeen ?? {};
  const newMapKeys = Object.keys(seenObj).filter(k => prevSeenObj[k] === undefined);

  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: 16, flex: 1,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        <Icon name="database-bold" size={13} style={{ color: T.textDim }} />
        <span style={{
          color: T.textDim, fontSize: 10,
          letterSpacing: 2, textTransform: "uppercase", fontFamily: display,
        }}>
          Seen Map
        </span>
        <span style={{
          marginLeft: "auto",
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 20, padding: "2px 8px",
          color: T.textMid, fontSize: 10, fontFamily: mono,
        }}>
          {Object.keys(seenObj).length}
        </span>
      </div>

      {/* Empty state */}
      {Object.keys(seenObj).length === 0 ? (
        <div style={{ color: T.textDim, fontSize: 12, padding: "6px 0", fontFamily: mono }}>
          {"{ } "}<span style={{ opacity: 0.5 }}>— empty</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {Object.entries(seenObj).map(([k, v]) => {
            const isNew    = newMapKeys.includes(k);
            const isNeeded = String(needed) === k && phase === "found";

            return (
              <div
                key={k}
                className={isNew ? "map-new" : ""}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: isNeeded
                    ? `${PHASE_COLORS.found}18`
                    : isNew ? `${PHASE_COLORS.store}12` : T.card,
                  border: `1px solid ${
                    isNeeded ? PHASE_COLORS.found
                    : isNew   ? `${PHASE_COLORS.store}66`
                    : T.border
                  }`,
                  borderRadius: 8, padding: "7px 12px",
                  transition: "all 0.28s",
                }}
              >
                <span style={{
                  color: isNeeded ? PHASE_COLORS.found : PHASE_COLORS.store,
                  fontSize: 14, fontWeight: 700, minWidth: 28, fontFamily: mono,
                }}>
                  {k}
                </span>

                <Icon name="arrow-right-bold" size={10} style={{ color: T.textDim }} />
                <span style={{ color: T.textMid, fontSize: 10, fontFamily: mono }}>idx</span>

                <span style={{ color: "#f59e0b", fontSize: 14, fontWeight: 700, fontFamily: mono }}>
                  {v}
                </span>

                {isNeeded && (
                  <span style={{
                    color: PHASE_COLORS.found, fontSize: 10,
                    marginLeft: "auto", display: "flex", alignItems: "center",
                    gap: 3, fontWeight: 600,
                  }}>
                    <Icon name="check-circle-bold" size={11} style={{ color: PHASE_COLORS.found }} />
                    match!
                  </span>
                )}

                {isNew && !isNeeded && (
                  <span style={{
                    color: PHASE_COLORS.store, fontSize: 10,
                    marginLeft: "auto", display: "flex", alignItems: "center", gap: 3,
                  }}>
                    <Icon name="add-circle-bold" size={11} style={{ color: PHASE_COLORS.store }} />
                    new
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
