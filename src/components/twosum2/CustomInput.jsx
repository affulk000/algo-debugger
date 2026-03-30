import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";

const { mono } = FONTS;

export default function CustomInput({ onApply, T }) {
  const [nums, setNums]   = useState("");
  const [tgt,  setTgt]    = useState("");
  const [error, setError] = useState("");

  const apply = () => {
    try {
      const parsed = JSON.parse(`[${nums}]`);
      const t = Number(tgt);
      if (!parsed.every(n => typeof n === "number") || parsed.length < 2) throw 0;
      if (parsed.length > 20) { setError("Max 20 values."); return; }
      // Verify sorted
      for (let i = 1; i < parsed.length; i++) {
        if (parsed[i] < parsed[i-1]) { setError("Array must be sorted (non-decreasing)."); return; }
      }
      if (isNaN(t)) throw 0;
      setError("");
      onApply(parsed, t);
    } catch {
      setError("Enter 2–20 sorted integers and a target.");
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
      <input name="twosum2-nums" value={nums} onChange={e => setNums(e.target.value)}
        onKeyDown={e => e.key === "Enter" && apply()}
        placeholder="sorted nums, e.g. 2,7,11,15"
        style={{ flex: 2, minWidth: 160, background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 6, padding: "6px 10px", color: T.text, fontSize: 12, fontFamily: mono, outline: "none" }} />
      <span style={{ color: T.textDim, fontSize: 11, fontFamily: mono }}>target =</span>
      <input name="twosum2-target" value={tgt} onChange={e => setTgt(e.target.value)}
        onKeyDown={e => e.key === "Enter" && apply()}
        placeholder="9"
        style={{ width: 64, background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 6, padding: "6px 10px", color: T.text, fontSize: 12, fontFamily: mono, outline: "none" }} />
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
