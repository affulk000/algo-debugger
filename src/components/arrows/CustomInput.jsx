import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
const { mono } = FONTS;

export default function CustomInput({ onApply, T }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");

  const apply = () => {
    try {
      const pts = JSON.parse(val.trim());
      if (!Array.isArray(pts) || !pts.every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isInteger)))
        throw 0;
      if (pts.length > 16) { setErr("Max 16 balloons."); return; }
      if (pts.some(p => p[0] > p[1])) { setErr("Each balloon needs start ≤ end."); return; }
      setErr(""); onApply(pts);
    } catch {
      setErr("Enter JSON array e.g. [[1,6],[2,8],[7,12]]");
    }
  };

  return (
    <div style={{
      background:T.surface, border:`1px solid ${T.border}`,
      borderRadius:10, padding:"12px 14px", marginBottom:18,
      display:"flex", gap:8, flexWrap:"wrap", alignItems:"center",
    }}>
      <Icon name="pen-new-square-bold" size={13} style={{ color:T.textDim }} />
      <span style={{ color:T.textMid, fontSize:11, fontFamily:mono }}>points =</span>
      <input name="arrows-points" value={val} onChange={e=>setVal(e.target.value)}
        onKeyDown={e=>e.key==="Enter"&&apply()}
        placeholder="[[10,16],[2,8],[1,6],[7,12]]"
        style={{ flex:1, minWidth:230, background:T.card, border:`1px solid ${T.border}`,
          borderRadius:6, padding:"6px 10px", color:T.text, fontSize:12, fontFamily:mono, outline:"none" }} />
      <button className="tbtn" onClick={apply} style={{
        display:"flex", alignItems:"center", gap:5, padding:"6px 14px",
        background:`${PHASE_COLORS.found}20`, border:`1px solid ${PHASE_COLORS.found}55`,
        borderRadius:6, color:PHASE_COLORS.found, fontSize:11, fontFamily:mono, fontWeight:600,
      }}>
        Run <Icon name="arrow-right-bold" size={12} />
      </button>
      {err && <span style={{ color:"#f87171", fontSize:11, width:"100%" }}>{err}</span>}
    </div>
  );
}
