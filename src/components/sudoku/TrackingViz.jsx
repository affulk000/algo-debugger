import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
const { mono, display } = FONTS;

const DIGITS = ['1','2','3','4','5','6','7','8','9'];

function BoolRow({ label, arr, activeIdx, isConflict, T }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:3 }}>
      <span style={{ color:T.textDim, fontSize:9, fontFamily:mono, minWidth:28, flexShrink:0 }}>{label}</span>
      {arr.map((seen, i) => {
        const isActive = i === activeIdx;
        const isConf   = isActive && isConflict && seen;
        return (
          <div key={i} style={{
            width:20, height:20, borderRadius:4,
            border:`1.5px solid ${isConf ? PHASE_COLORS.miss : isActive ? PHASE_COLORS.found : seen ? `${PHASE_COLORS.store}66` : T.border}`,
            background: isConf ? `${PHASE_COLORS.miss}22` : isActive ? `${PHASE_COLORS.found}18` : seen ? `${PHASE_COLORS.store}10` : T.card,
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"all 0.15s", flexShrink:0,
          }}>
            {seen && (
              <span style={{ color: isConf ? PHASE_COLORS.miss : PHASE_COLORS.store, fontSize:9, fontWeight:700, fontFamily:mono }}>
                {DIGITS[i]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Section({ title, data, activeRow, activeCol, conflict, conflictIn, conflictType, T }) {
  return (
    <div style={{ flex:1, minWidth:0 }}>
      <span style={{ color:T.textDim, fontSize:9, fontFamily:mono, display:"block",
        marginBottom:6, letterSpacing:1, textTransform:"uppercase" }}>
        {title}
      </span>
      {/* digit header */}
      <div style={{ display:"flex", alignItems:"center", gap:3, marginBottom:4, paddingLeft:31 }}>
        {DIGITS.map(d => (
          <div key={d} style={{ width:20, textAlign:"center" }}>
            <span style={{ color:`${T.textDim}77`, fontSize:8, fontFamily:mono }}>{d}</span>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
        {data.map((row, ri) => (
          <BoolRow
            key={ri}
            label={`${title[0].toLowerCase()}${ri}`}
            arr={row}
            activeIdx={ri === activeRow ? activeCol : -1}
            isConflict={conflict && conflictIn === conflictType && ri === activeRow}
            T={T}
          />
        ))}
      </div>
    </div>
  );
}

export default function TrackingViz({ rows, cols, boxes, r, c, num, boxIndex, conflict, conflictIn, T }) {
  const _rows  = rows  ?? [];
  const _cols  = cols  ?? [];
  const _boxes = boxes ?? [];
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12,
      padding:14, marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12 }}>
        <Icon name="database-bold" size={13} style={{ color:T.textDim }} />
        <span style={{ color:T.textDim, fontSize:10, letterSpacing:2, textTransform:"uppercase", fontFamily:display }}>
          Tracking Arrays
        </span>
        <span style={{ marginLeft:"auto", color:T.textDim, fontSize:9, fontFamily:mono }}>
          digits 1–9
        </span>
      </div>

      {/* Three sections side-by-side */}
      <div style={{ display:"flex", gap:20, overflowX:"auto" }}>
        <Section title="Rows"  data={_rows}  activeRow={r}         activeCol={num} conflict={conflict} conflictIn={conflictIn} conflictType="row" T={T} />
        <div style={{ width:1, background:T.border, flexShrink:0 }} />
        <Section title="Cols"  data={_cols}  activeRow={c}         activeCol={num} conflict={conflict} conflictIn={conflictIn} conflictType="col" T={T} />
        <div style={{ width:1, background:T.border, flexShrink:0 }} />
        <Section title="Boxes" data={_boxes} activeRow={boxIndex}  activeCol={num} conflict={conflict} conflictIn={conflictIn} conflictType="box" T={T} />
      </div>
    </div>
  );
}
