import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";

const { mono } = FONTS;

/**
 * Custom nums + target input form for TwoSum.
 *
 * @param {Function} onApply  Called with (nums: number[], target: number) on valid submit
 * @param {object}   T        Theme token object
 */
export default function CustomInput({ onApply, T }) {
  const [nums,   setNums]   = useState("");
  const [target, setTarget] = useState("");
  const [error,  setError]  = useState("");

  const apply = () => {
    try {
      const parsed = JSON.parse(`[${nums}]`);
      if (!parsed.every(n => typeof n === "number")) throw 0;
      const t = parseInt(target);
      if (isNaN(t)) throw 0;
      setError("");
      onApply(parsed, t);
    } catch {
      setError("Invalid — comma-separated numbers only.");
    }
  };

  const inputStyle = {
    background: T.card, border: `1px solid ${T.border}`,
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
      <span style={{ color: T.textMid, fontSize: 11 }}>Custom:</span>

      <input
        name="twosum-nums" value={nums}
        onChange={e => setNums(e.target.value)}
        placeholder="2,7,11,15"
        style={{ ...inputStyle, flex: 1, minWidth: 110 }}
      />
      <input
        name="twosum-target" value={target}
        onChange={e => setTarget(e.target.value)}
        placeholder="target: 9"
        style={{ ...inputStyle, width: 90 }}
      />

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
