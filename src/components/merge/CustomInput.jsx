import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";

const { mono } = FONTS;

/**
 * Custom sorted-array A + B input form for MergeSortedArrays.
 * Validates that both inputs are sorted before calling onApply.
 *
 * @param {Function} onApply  Called with (a: number[], b: number[]) on valid submit
 * @param {object}   T        Theme token object
 */
export default function CustomInput({ onApply, T }) {
  const [a,     setA]     = useState("");
  const [b,     setB]     = useState("");
  const [error, setError] = useState("");

  const isSorted = arr => arr.every((_, i) => i === 0 || arr[i - 1] <= arr[i]);

  const apply = () => {
    try {
      const pa = JSON.parse(`[${a}]`);
      const pb = JSON.parse(`[${b}]`);
      if (![...pa, ...pb].every(n => typeof n === "number")) throw 0;
      if (!isSorted(pa) || !isSorted(pb)) throw 0;
      setError("");
      onApply(pa, pb);
    } catch {
      setError("Both arrays must be sorted comma-separated numbers.");
    }
  };

  const inputStyle = {
    width: 100, background: T.card, border: `1px solid ${T.border}`,
    borderRadius: 6, padding: "6px 10px",
    color: T.text, fontSize: 12, fontFamily: mono, outline: "none",
  };

  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 10, padding: "12px 14px", marginBottom: 18,
      display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
    }}>
      <Icon name="pen-new-square-bold" size={13} style={{ color: T.textDim }} />

      <span style={{ color: T.textMid, fontSize: 11 }}>A:</span>
      <input value={a} onChange={e => setA(e.target.value)} name="merge-a" placeholder="1,3,5" style={inputStyle} />

      <span style={{ color: T.textMid, fontSize: 11 }}>B:</span>
      <input value={b} onChange={e => setB(e.target.value)} name="merge-b" placeholder="2,4,6" style={inputStyle} />

      <button className="tbtn" onClick={apply} style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "6px 14px",
        background: `${PHASE_COLORS.found}20`,
        border: `1px solid ${PHASE_COLORS.found}55`,
        borderRadius: 6, color: PHASE_COLORS.found,
        fontSize: 11, fontFamily: mono, fontWeight: 600,
      }}>
        Run <Icon name="arrow-right-bold" size={12} />
      </button>

      {error && (
        <span style={{ color: "#f87171", fontSize: 11, width: "100%" }}>{error}</span>
      )}
    </div>
  );
}
