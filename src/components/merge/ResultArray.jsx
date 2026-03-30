import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";

const { mono, display } = FONTS;

/**
 * Displays the growing result array for MergeSortedArrays.
 * The most recently appended element animates in with the "map-new" class.
 * On the "done" phase, all cells switch to the success color.
 *
 * @param {number[]} res    Current result array snapshot
 * @param {string}   phase  Current step phase
 * @param {string}   color  Current phase accent color
 * @param {object}   T      Theme token object
 */
export default function ResultArray({ res, phase, color, T }) {
  const safeRes = res ?? [];
  const isDone = phase === "done";

  return (
    <div style={{
      background: T.surface, border: `1px solid ${color}44`,
      borderRadius: 12, padding: "14px 16px", flex: 1,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Icon name="inbox-bold" size={12} style={{ color: T.textDim }} />
        <span style={{
          color: T.textDim, fontSize: 10,
          letterSpacing: 2, textTransform: "uppercase", fontFamily: display,
        }}>
          Result
        </span>
        <span style={{
          marginLeft: "auto",
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 20, padding: "2px 8px",
          color: T.textMid, fontSize: 10, fontFamily: mono,
        }}>
          {safeRes.length}
        </span>
      </div>

      {/* Empty state */}
      {safeRes.length === 0 ? (
        <div style={{ color: T.textDim, fontSize: 12, fontFamily: mono }}>
          [ ] — empty
        </div>
      ) : (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {safeRes.map((n, i) => {
            const isLastAdded = !isDone && i === safeRes.length - 1;
            const borderColor = isLastAdded ? color : isDone ? PHASE_COLORS.done : T.border;

            return (
              <div
                key={i}
                className={isLastAdded ? "map-new" : ""}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 8,
                  border: `2px solid ${borderColor}`,
                  background: isLastAdded
                    ? `${color}1c`
                    : isDone ? `${PHASE_COLORS.done}12` : T.card,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: isLastAdded ? color : isDone ? PHASE_COLORS.done : T.textMid,
                  fontSize: 14, fontWeight: 700, fontFamily: mono,
                  boxShadow: isLastAdded
                    ? `0 0 10px ${color}55`
                    : isDone ? `0 0 8px ${PHASE_COLORS.done}44` : "none",
                  transition: "all 0.22s",
                }}>
                  {n}
                </div>
                <span style={{ color: T.textDim, fontSize: 9, fontFamily: mono }}>[{i}]</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
