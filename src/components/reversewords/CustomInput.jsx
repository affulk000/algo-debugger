import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
const { mono } = FONTS;

export default function CustomInput({ onApply, T }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");

  const apply = () => {
    if (!val.trim()) { setErr("Enter a string with words."); return; }
    if (val.length > 120) { setErr("Max 120 characters."); return; }
    setErr("");
    onApply(val);
  };

  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 10, padding: "12px 14px", marginBottom: 18,
      display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
    }}>
      <Icon name="pen-new-square-bold" size={13} style={{ color: T.textDim }} />
      <span style={{ color: T.textMid, fontSize: 11, fontFamily: mono }}>s =</span>
      <input name="reversewords-s" value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === "Enter" && apply()}
        placeholder='  the sky is blue  '
        style={{ flex: 1, minWidth: 220, background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 6, padding: "6px 10px", color: T.text, fontSize: 12, fontFamily: mono, outline: "none" }} />
      <button className="tbtn" onClick={apply} style={{
        display: "flex", alignItems: "center", gap: 5, padding: "6px 14px",
        background: `${PHASE_COLORS.found}20`, border: `1px solid ${PHASE_COLORS.found}55`,
        borderRadius: 6, color: PHASE_COLORS.found, fontSize: 11, fontFamily: mono, fontWeight: 600,
      }}>
        Run <Icon name="arrow-right-bold" size={12} />
      </button>
      {err && <span style={{ color: "#f87171", fontSize: 11, width: "100%" }}>{err}</span>}
    </div>
  );
}
