import { FONTS } from "../../constants/fonts.js";
import Icon from "./Icon.jsx";

const { mono, display } = FONTS;

/**
 * Generic array visualizer used by both TwoSum and MergeSortedArrays.
 *
 * @param {string}    label         Section heading text
 * @param {number[]}  arr           Values to render
 * @param {number[]}  highlight     Indices to highlight with `color`
 * @param {number}    pointer       Index to show a pointer label under
 * @param {string}    pointerLabel  Text shown under the pointer cell (e.g. "i=2")
 * @param {string}    color         Accent color for highlighted cells
 * @param {object}    T             Theme token object
 * @param {number}    [dimBefore]   Indices < dimBefore are rendered at reduced opacity
 */
export default function ArrayViz({
  label, arr, highlight = [], pointer, pointerLabel,
  color, T, dimBefore,
}) {
  return (
    <div>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Icon name="list-bold" size={12} style={{ color: T.textDim }} />
        <span style={{
          color: T.textDim, fontSize: 10,
          letterSpacing: 2, textTransform: "uppercase", fontFamily: display,
        }}>
          {label}
        </span>
        <span style={{ marginLeft: "auto", color: T.textMid, fontSize: 10, fontFamily: mono }}>
          {arr.length} items
        </span>
      </div>

      {/* Cells */}
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
        {arr.map((n, i) => {
          const isHighlight = highlight.includes(i);
          const isConsumed  = dimBefore !== undefined && i < dimBefore;
          const cellCol     = isHighlight ? color : isConsumed ? `${T.border}88` : T.border;

          return (
            <div
              key={i}
              className={isHighlight ? "cell-active" : ""}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 9,
                border: `2px solid ${cellCol}`,
                background: isHighlight ? `${color}1c` : isConsumed ? `${T.card}44` : T.card,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: isHighlight ? color : isConsumed ? T.textDim : T.textMid,
                fontSize: 15, fontWeight: 700, fontFamily: mono,
                boxShadow: isHighlight ? `0 0 12px ${color}55` : "none",
                opacity: isConsumed ? 0.4 : 1,
                transition: "all 0.22s",
              }}>
                {n}
              </div>
              <span style={{
                color: pointer === i ? color : T.textDim,
                fontSize: 9, fontFamily: mono,
                fontWeight: pointer === i ? 700 : 400,
              }}>
                {pointer === i ? pointerLabel : `[${i}]`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
