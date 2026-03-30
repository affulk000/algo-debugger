import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
import Icon from "../ui/Icon.jsx";
const { mono, display } = FONTS;

const STATE_META = [
  { key:"firstBuy",   label:"firstBuy",   color:"#38bdf8", desc:"−price of best buy #1" },
  { key:"firstSell",  label:"firstSell",  color:"#22c55e", desc:"profit after sell #1"  },
  { key:"secondBuy",  label:"secondBuy",  color:"#f97316", desc:"firstSell − price"      },
  { key:"secondSell", label:"secondSell", color:"#e879f9", desc:"total profit both txns" },
];

const BAR_MAX_H = 100;

export default function ProfitViz({ prices, i, price, firstBuy, firstSell, secondBuy, secondSell, changed, color, T }) {
  const _prices  = prices  ?? [];
  const _changed = changed ?? [];
  const states = { firstBuy, firstSell, secondBuy, secondSell };
  const maxPrice = Math.max(..._prices, 1);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Price bar chart */}
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12 }}>
          <Icon name="graph-new-up-bold" size={13} style={{ color:T.textDim }} />
          <span style={{ color:T.textDim, fontSize:10, letterSpacing:2, textTransform:"uppercase", fontFamily:display }}>
            prices
          </span>
          {price != null && (
            <span style={{ marginLeft:"auto", color, fontFamily:mono, fontSize:11 }}>
              price = <strong>{price}</strong>
            </span>
          )}
        </div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:4, height: BAR_MAX_H + 28 }}>
          {_prices.map((v, idx) => {
            const isCur  = idx === i;
            const isPast = idx < i;
            const barH   = Math.max(8, Math.round((v / maxPrice) * BAR_MAX_H));
            const barCol = isCur ? color : isPast ? `${T.textDim}44` : `${T.textDim}22`;
            const txtCol = isCur ? color : isPast ? `${T.textDim}55` : T.textDim;
            return (
              <div key={idx} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                <span style={{ color:txtCol, fontSize:9, fontFamily:mono, fontWeight:isCur?800:400 }}>{v}</span>
                <div style={{
                  width:"100%", height:barH,
                  borderRadius:"4px 4px 0 0",
                  background: isCur ? `${color}30` : barCol,
                  border:`2px solid ${barCol}`,
                  transition:"all 0.13s",
                  boxShadow: isCur ? `0 0 10px ${color}66` : "none",
                  transform: isCur ? "scaleY(1.06)" : "scaleY(1)",
                  transformOrigin:"bottom",
                }} />
                <span style={{ color:`${T.textDim}55`, fontSize:7, fontFamily:mono }}>{idx}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4 state cards */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {STATE_META.map(({ key, label, color:stateColor, desc }) => {
          const val       = states[key];
          const isChanged = _changed.includes(key);
          return (
            <div key={key} style={{
              background: isChanged ? `${stateColor}18` : T.surface,
              border:`2px solid ${isChanged ? stateColor : T.border}`,
              borderRadius:10, padding:"10px 14px",
              transition:"all 0.15s",
              boxShadow: isChanged ? `0 0 14px ${stateColor}44` : "none",
            }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ color:stateColor, fontFamily:mono, fontSize:11, fontWeight:700 }}>{label}</span>
                {isChanged && (
                  <span style={{ background:`${stateColor}22`, border:`1px solid ${stateColor}66`,
                    borderRadius:4, padding:"1px 6px", color:stateColor, fontSize:9, fontFamily:mono }}>
                    updated
                  </span>
                )}
              </div>
              <div style={{ color:stateColor, fontFamily:mono, fontSize:22, fontWeight:800, lineHeight:1.1 }}>
                {val}
              </div>
              <div style={{ color:T.textDim, fontFamily:mono, fontSize:9, marginTop:4 }}>{desc}</div>
            </div>
          );
        })}
      </div>

      {/* Transaction summary */}
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 14px",
        display:"flex", gap:20, flexWrap:"wrap" }}>
        <span style={{ color:T.textDim, fontFamily:mono, fontSize:10 }}>
          Txn 1 net: <span style={{ color:"#22c55e", fontWeight:700 }}>{firstSell}</span>
        </span>
        <span style={{ color:T.textDim, fontFamily:mono, fontSize:10 }}>
          Txn 2 net: <span style={{ color:"#e879f9", fontWeight:700 }}>
            {secondSell - Math.max(firstSell, 0)}
          </span>
        </span>
        <span style={{ color:T.textDim, fontFamily:mono, fontSize:10, marginLeft:"auto" }}>
          Total: <span style={{ color: secondSell > 0 ? PHASE_COLORS.found : T.textDim, fontWeight:800, fontSize:13 }}>
            {secondSell}
          </span>
        </span>
      </div>
    </div>
  );
}
