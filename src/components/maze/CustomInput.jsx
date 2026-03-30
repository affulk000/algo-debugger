import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
const { mono } = FONTS;

export default function CustomInput({ onApply, T }) {
  const [rows, setRows]   = useState("4");
  const [cols, setCols]   = useState("4");
  const [vals, setVals]   = useState("1,0,0,0,1,1,0,1,0,1,0,0,0,1,1,1");
  const [error, setError] = useState("");

  const apply = () => {
    const r = parseInt(rows), c = parseInt(cols);
    if (isNaN(r) || isNaN(c) || r < 2 || c < 2 || r > 8 || c > 8) {
      setError("Rows and cols must be 2–8."); return;
    }
    try {
      const flat = JSON.parse(`[${vals}]`);
      if (flat.length !== r*c || !flat.every(v => v===0||v===1)) throw 0;
      const maze = Array.from({length:r}, (_,i) => flat.slice(i*c, i*c+c));
      setError("");
      onApply(maze);
    } catch {
      setError(`Need exactly ${r*c} values (0 or 1), comma-separated.`);
    }
  };

  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 10, padding: "12px 14px", marginBottom: 18,
      display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
    }}>
      <Icon name="pen-new-square-bold" size={13} style={{ color: T.textDim }} />
      <span style={{ color: T.textMid, fontSize: 11 }}>rows</span>
      <input name="maze-rows" value={rows} onChange={e=>setRows(e.target.value)} style={{
        width: 40, background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 6, padding: "6px 8px", color: T.text, fontSize: 12, fontFamily: mono, outline:"none",
      }} />
      <span style={{ color: T.textMid, fontSize: 11 }}>cols</span>
      <input name="maze-cols" value={cols} onChange={e=>setCols(e.target.value)} style={{
        width: 40, background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 6, padding: "6px 8px", color: T.text, fontSize: 12, fontFamily: mono, outline:"none",
      }} />
      <span style={{ color: T.textMid, fontSize: 11 }}>values (row-major, 0/1):</span>
      <input name="maze-vals" value={vals} onChange={e=>setVals(e.target.value)}
        onKeyDown={e => e.key==="Enter" && apply()}
        placeholder="1,0,1,..."
        style={{ flex:1, minWidth:160, background: T.card, border: `1px solid ${T.border}`,
          borderRadius:6, padding:"6px 10px", color:T.text, fontSize:12, fontFamily:mono, outline:"none" }} />
      <button className="tbtn" onClick={apply} style={{
        display:"flex", alignItems:"center", gap:5, padding:"6px 14px",
        background:`${PHASE_COLORS.found}20`, border:`1px solid ${PHASE_COLORS.found}55`,
        borderRadius:6, color:PHASE_COLORS.found, fontSize:11, fontFamily:mono, fontWeight:600,
      }}>
        Run <Icon name="arrow-right-bold" size={12} />
      </button>
      {error && <span style={{ color:"#f87171", fontSize:11, width:"100%" }}>{error}</span>}
    </div>
  );
}
