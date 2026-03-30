import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";

const { mono, display } = FONTS;
const CELL_W = 44;

/**
 * Visualizes the sorted numbers array with left/right pointer highlights,
 * sum annotation, and sorted-order indicator arrows between cells.
 */
export default function ArrayViz2({ numbers, target, left, right, sum, phase, color, T }) {
  const _numbers = numbers ?? [];
  const isFound = phase === "found" || phase === "done";

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        <Icon name="sort-by-time-bold" size={13} style={{ color: T.textDim }} />
        <span style={{ color: T.textDim, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
          Sorted Array
        </span>
        <span style={{ marginLeft: "auto", background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 20, padding: "2px 10px", color: T.textMid, fontSize: 10, fontFamily: mono }}>
          target = <span style={{ color, fontWeight: 700 }}>{target}</span>
        </span>
      </div>

      {/* Cells */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 16 }}>
        {_numbers.map((n, i) => {
          const isLeft  = i === left;
          const isRight = i === right;
          const inWindow = i >= left && i <= right && right !== null;

          let borderColor = T.border;
          let bgColor     = T.card;
          let textColor   = T.textMid;
          let shadow      = "none";
          let extraClass  = "";
          let pointerLabel = null;

          if (isFound && (isLeft || isRight)) {
            borderColor = PHASE_COLORS.found;
            bgColor     = `${PHASE_COLORS.found}25`;
            textColor   = PHASE_COLORS.found;
            shadow      = `0 0 16px ${PHASE_COLORS.found}66`;
            extraClass  = "cell-active";
            pointerLabel = isLeft ? "L" : "R";
          } else if (isLeft) {
            borderColor = PHASE_COLORS.found;
            bgColor     = `${PHASE_COLORS.found}18`;
            textColor   = PHASE_COLORS.found;
            shadow      = `0 0 12px ${PHASE_COLORS.found}55`;
            extraClass  = "cell-active";
            pointerLabel = "L";
          } else if (isRight) {
            borderColor = PHASE_COLORS.compute;
            bgColor     = `${PHASE_COLORS.compute}18`;
            textColor   = PHASE_COLORS.compute;
            shadow      = `0 0 12px ${PHASE_COLORS.compute}55`;
            pointerLabel = "R";
          } else if (inWindow) {
            borderColor = `${color}44`;
            bgColor     = `${color}08`;
            textColor   = T.text;
          }

          return (
            <div key={i} className={extraClass}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              {/* Pointer label above */}
              <span style={{
                fontSize: 9, fontWeight: 800, fontFamily: mono, height: 14,
                color: isLeft ? PHASE_COLORS.found : isRight ? PHASE_COLORS.compute : "transparent",
              }}>
                {pointerLabel || " "}
              </span>
              <div style={{
                width: CELL_W, height: CELL_W, borderRadius: 9,
                border: `2px solid ${borderColor}`, background: bgColor,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: textColor, fontSize: 15, fontWeight: 700, fontFamily: mono,
                boxShadow: shadow, transition: "all 0.22s",
              }}>
                {n}
              </div>
              <span style={{ fontSize: 9, fontFamily: mono, color: T.textDim }}>[{i}]</span>
            </div>
          );
        })}
      </div>

      {/* Variable chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: sum != null ? 10 : 0 }}>
        {[
          { icon: "arrow-right-bold", label: "left",   val: left,              col: PHASE_COLORS.found   },
          { icon: "arrow-left-bold",  label: "right",  val: right,             col: PHASE_COLORS.compute },
          { icon: "hashtag-bold",     label: "nums[L]",val: _numbers[left],     col: PHASE_COLORS.found   },
          { icon: "hashtag-bold",     label: "nums[R]",val: _numbers[right],    col: PHASE_COLORS.compute },
          { icon: "sum-bold",         label: "sum",    val: sum ?? "—",        col: sum === target ? PHASE_COLORS.found : color },
          { icon: "target-bold",      label: "target", val: target,            col: PHASE_COLORS.scan    },
        ].map(({ icon, label, val, col }) => (
          <div key={label} style={{
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 7, padding: "5px 10px",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <Icon name={icon} size={11} style={{ color: T.textDim }} />
            <span style={{ color: T.textMid, fontSize: 10, fontFamily: mono }}>{label} =</span>
            <span style={{ color: col, fontSize: 13, fontWeight: 700, fontFamily: mono }}>{val}</span>
          </div>
        ))}
      </div>

      {/* Sum annotation */}
      {sum != null && (
        <div style={{
          background: T.card,
          border: `1px solid ${sum === target ? PHASE_COLORS.found : color}55`,
          borderRadius: 8, padding: "8px 14px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Icon name="calculator-minimalistic-bold" size={12} style={{ color: T.textDim }} />
          <span style={{ color: T.textMid, fontSize: 11, fontFamily: mono }}>
            {_numbers[left]} + {_numbers[right]} =
          </span>
          <span style={{
            color: sum === target ? PHASE_COLORS.found : color,
            fontSize: 16, fontWeight: 800, fontFamily: mono,
          }}>
            {sum}
          </span>
          <span style={{
            color: T.textDim, fontSize: 11, fontFamily: mono, marginLeft: 4,
          }}>
            {sum === target ? "== target ✓" : sum < target ? `< ${target} (too small)` : `> ${target} (too big)`}
          </span>
        </div>
      )}
    </div>
  );
}
