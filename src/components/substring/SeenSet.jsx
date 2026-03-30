import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";

const { mono, display } = FONTS;

/**
 * Visualizes the `lastSeen` map: char → last-seen index.
 *
 * Highlights:
 * - Newly updated entry (update_map phase)
 * - The duplicate entry that triggered a jump (check_in / jump_left)
 *
 * @param {Map}    lastSeen      Current map snapshot
 * @param {Map}    prevLastSeen  Previous step's map (for new/changed detection)
 * @param {string} phase         Current step phase
 * @param {string} dupChar       The character being checked at `right`
 * @param {number} left          Current left boundary (to show in/out of window)
 * @param {object} T             Theme token object
 */
export default function SeenSet({ lastSeen, prevLastSeen, phase, dupChar, left, T }) {
  // Normalize to plain objects (backend returns plain objects, local steps use Maps)
  const seen     = lastSeen     instanceof Map ? Object.fromEntries(lastSeen)     : (lastSeen     ?? {});
  const prevSeen = prevLastSeen instanceof Map ? Object.fromEntries(prevLastSeen) : (prevLastSeen ?? {});

  const entries = Object.entries(seen).sort((a, b) => a[0].localeCompare(b[0]));
  const size    = Object.keys(seen).length;

  const isDupPhase = phase === "check_in" || phase === "jump_left";

  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: 16, flex: 1,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        <Icon name="database-bold" size={13} style={{ color: T.textDim }} />
        <span style={{ color: T.textDim, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
          lastSeen Map
        </span>
        <span style={{ marginLeft: "auto", background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: "2px 8px", color: T.textMid, fontSize: 10, fontFamily: mono }}>
          {size}
        </span>
      </div>

      {/* Empty state */}
      {size === 0 ? (
        <div style={{ color: T.textDim, fontSize: 12, fontFamily: mono }}>
          {"{ } "}<span style={{ opacity: 0.5 }}>— empty</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {entries.map(([ch, idx]) => {
            const prevIdx  = prevSeen[ch];
            const isNew    = prevIdx === undefined;
            const isUpdate = !isNew && prevIdx !== idx;
            const isDup    = isDupPhase && ch === dupChar;
            const inWindow = idx >= left;

            let borderColor = `${PHASE_COLORS.store}55`;
            let bgColor     = `${PHASE_COLORS.store}0e`;
            let keyColor    = PHASE_COLORS.store;
            let badge       = null;

            if (isDup) {
              borderColor = PHASE_COLORS.miss;
              bgColor     = `${PHASE_COLORS.miss}18`;
              keyColor    = PHASE_COLORS.miss;
              badge = (
                <span style={{ color: PHASE_COLORS.miss, fontSize: 10, display: "flex", alignItems: "center", gap: 3 }}>
                  <Icon name="danger-bold" size={10} style={{ color: PHASE_COLORS.miss }} />
                  {phase === "jump_left" ? "→ jump!" : "dup!"}
                </span>
              );
            } else if (isNew || isUpdate) {
              borderColor = PHASE_COLORS.found;
              bgColor     = `${PHASE_COLORS.found}12`;
              keyColor    = PHASE_COLORS.found;
              badge = (
                <span style={{ color: PHASE_COLORS.found, fontSize: 10, display: "flex", alignItems: "center", gap: 3 }}>
                  <Icon name={isNew ? "add-circle-bold" : "refresh-bold"} size={10} style={{ color: PHASE_COLORS.found }} />
                  {isNew ? "new" : "updated"}
                </span>
              );
            }

            return (
              <div key={ch}
                className={(isNew || isUpdate) ? "map-new" : ""}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: bgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 8, padding: "7px 12px",
                  transition: "all 0.25s",
                }}>
                {/* char */}
                <span style={{ color: keyColor, fontSize: 14, fontWeight: 700, fontFamily: mono, minWidth: 24 }}>
                  '{ch}'
                </span>
                <Icon name="arrow-right-bold" size={10} style={{ color: T.textDim }} />
                {/* index */}
                <span style={{ color: T.textMid, fontSize: 10, fontFamily: mono }}>idx</span>
                <span style={{ color: "#f59e0b", fontSize: 14, fontWeight: 700, fontFamily: mono }}>{idx}</span>
                {/* in/out of window indicator */}
                <span style={{
                  fontSize: 9, fontFamily: mono,
                  color: inWindow ? PHASE_COLORS.found : T.textDim,
                  opacity: inWindow ? 1 : 0.5,
                }}>
                  {inWindow ? "in window" : "out of window"}
                </span>
                {badge && <span style={{ marginLeft: "auto" }}>{badge}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
