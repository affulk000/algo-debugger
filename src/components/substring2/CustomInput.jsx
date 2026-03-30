import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
const { mono } = FONTS;

export default function CustomInput({ onApply, T }) {
  const [sVal,    setSVal]   = useState("");
  const [wVal,    setWVal]   = useState("");
  const [error,   setError]  = useState("");

  const apply = () => {
    const s     = sVal.trim();
    const words = wVal.split(",").map(w => w.trim()).filter(Boolean);
    if (!s)                   { setError("Enter a string s."); return; }
    if (s.length > 60)        { setError("Max 60 chars for s."); return; }
    if (words.length === 0)   { setError("Enter at least one word."); return; }
    const wLen = words[0].length;
    if (!words.every(w => w.length === wLen)) { setError("All words must be the same length."); return; }
    setError("");
    onApply(s, words);
  };

  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 10, padding: "12px 14px", marginBottom: 18,
      display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
    }}>
      <Icon name="pen-new-square-bold" size={13} style={{ color: T.textDim }} />
      <span style={{ color: T.textMid, fontSize: 11, fontFamily: mono }}>s =</span>
      <input name="substr2-s" value={sVal} onChange={e => setSVal(e.target.value)}
        onKeyDown={e => e.key === "Enter" && apply()}
        placeholder="barfoothefoobarman"
        style={{ flex: 2, minWidth: 160, background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 6, padding: "6px 10px", color: T.text, fontSize: 12, fontFamily: mono, outline: "none" }} />
      <span style={{ color: T.textMid, fontSize: 11, fontFamily: mono }}>words =</span>
      <input name="substr2-words" value={wVal} onChange={e => setWVal(e.target.value)}
        onKeyDown={e => e.key === "Enter" && apply()}
        placeholder="foo,bar"
        style={{ flex: 1, minWidth: 120, background: T.card, border: `1px solid ${T.border}`,
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
