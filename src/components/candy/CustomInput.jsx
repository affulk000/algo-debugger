import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
const { mono } = FONTS;

export default function CustomInput({ onApply, T }) {
  const [val, setVal]     = useState("");
  const [error, setError] = useState("");

  const apply = () => {
    try {
      const parsed = JSON.parse(`[${val}]`);
      if (!parsed.every(n => typeof n === "number" && Number.isInteger(n) && n >= 0)) throw 0;
      if (parsed.length < 1)  throw 0;
      if (parsed.length > 16) { setError("Max 16 values for readability."); return; }
      setError("");
      onApply(parsed);
    } catch {
      setError("Enter 1–16 comma-separated non-negative integers.");
    }
  };

  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 10, padding: "12px 14px", marginBottom: 18,
      display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
    }}>
      <Icon name="pen-new-square-bold" size={13} style={{ color: T.textDim }} />
      <span style={{ color: T.textMid, fontSize: 11 }}>Custom:</span>
      <input name="candy-ratings" value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === "Enter" && apply()}
        placeholder="e.g. 1,0,2"
        style={{ flex: 1, minWidth: 200, background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 6, padding: "6px 10px", color: T.text,
          fontSize: 12, fontFamily: mono, outline: "none" }} />
      <button className="tbtn" onClick={apply} style={{
        display: "flex", alignItems: "center", gap: 5, padding: "6px 14px",
        background: `${PHASE_COLORS.found}20`, border: `1px solid ${PHASE_COLORS.found}55`,
        borderRadius: 6, color: PHASE_COLORS.found, fontSize: 11, fontFamily: mono, fontWeight: 600,
      }}>
        Run <Icon name="arrow-right-bold" size={12} />
      </button>
      {error && <span style={{ color: "#f87171", fontSize: 11, width: "100%" }}>{error}</span>}
    </div>
  );
}
