import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
import Icon from "../ui/Icon.jsx";
const { mono, display } = FONTS;

const BAR_MAX_H = 120;

export default function LISViz({ nums, tails, xi, x, left, right, mid, action, phase, color, T }) {
  const _nums  = nums  ?? [];
  const _tails = tails ?? [];
  const maxVal = Math.max(..._nums, 1);
  const isDone = phase === "done";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── nums array bar chart ── */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
          <Icon name="graph-new-up-bold" size={13} style={{ color: T.textDim }} />
          <span style={{ color: T.textDim, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
            nums  ({_nums.length})
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: BAR_MAX_H + 32 }}>
          {_nums.map((v, i) => {
            const isCur   = i === xi;
            const isPast  = i < xi;
            const barH    = Math.max(10, Math.round((v / maxVal) * BAR_MAX_H));
            let barColor  = T.border;
            let txtColor  = T.textDim;
            let glow      = "none";
            let scale     = 1;

            if (isPast)  { barColor = `${T.textDim}44`; txtColor = `${T.textDim}55`; }
            if (isCur)   { barColor = color; txtColor = color; glow = `0 0 10px ${color}77`; scale = 1.1; }

            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1 }}>
                <span style={{ color: txtColor, fontSize: 10, fontFamily: mono, fontWeight: isCur ? 800 : 400 }}>
                  {v}
                </span>
                <div style={{
                  width: "100%", height: barH,
                  borderRadius: "4px 4px 0 0",
                  background: isCur ? `${barColor}33` : isPast ? barColor : `${T.textDim}22`,
                  border: `2px solid ${barColor}`,
                  boxShadow: glow,
                  transform: `scaleY(${scale})`,
                  transformOrigin: "bottom",
                  transition: "all 0.14s",
                }} />
                <span style={{ color: `${T.textDim}66`, fontSize: 8, fontFamily: mono }}>{i}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── tails array with binary search overlay ── */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
          <Icon name="sort-by-time-bold" size={13} style={{ color: T.textDim }} />
          <span style={{ color: T.textDim, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
            tails  (LIS length proxy)
          </span>
          <span style={{ marginLeft: "auto", color: PHASE_COLORS.found, fontFamily: mono, fontSize: 12, fontWeight: 700 }}>
            {_tails.length > 0 ? `len = ${_tails.length}` : "empty"}
          </span>
        </div>

        {_tails.length === 0 ? (
          <div style={{ color: `${T.textDim}55`, fontFamily: mono, fontSize: 11, fontStyle: "italic", padding: "8px 0" }}>
            tails is empty — first number will extend it
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            {/* Search range highlight */}
            {left != null && right != null && right > left && (
              <div style={{
                position: "absolute",
                left: `calc(${left / tails.length * 100}% + 2px)`,
                width: `calc(${(right - left) / tails.length * 100}% - 4px)`,
                top: 0, bottom: 0,
                background: `${color}10`,
                border: `1px dashed ${color}44`,
                borderRadius: 8,
                pointerEvents: "none",
              }} />
            )}

            <div style={{ display: "flex", gap: 5 }}>
              {_tails.map((v, i) => {
                const isLeft    = i === left;
                const isRight   = i === right;
                const isMid     = i === mid;
                const inRange   = left != null && i >= left && i < right;
                const isInsert  = i === left && action !== null;

                let bg     = T.card;
                let border = T.border;
                let txt    = T.textMid;
                let scale  = 1;
                let glow   = "none";
                let label  = null;

                if (isMid) {
                  bg = `${color}22`; border = color; txt = color; scale = 1.1;
                  glow = `0 0 10px ${color}55`; label = "mid";
                } else if (isInsert && action === "replace") {
                  bg = `${PHASE_COLORS.update}22`; border = PHASE_COLORS.update; txt = PHASE_COLORS.update;
                  scale = 1.12; glow = `0 0 12px ${PHASE_COLORS.update}66`; label = "→" + x;
                } else if (isInsert && action === "extend") {
                  bg = `${PHASE_COLORS.found}22`; border = PHASE_COLORS.found; txt = PHASE_COLORS.found;
                  scale = 1.12; glow = `0 0 12px ${PHASE_COLORS.found}66`; label = "new";
                } else if (inRange) {
                  bg = `${color}10`; border = `${color}55`; txt = T.text;
                }

                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    {label && (
                      <span style={{ color: txt, fontSize: 8, fontFamily: mono, fontWeight: 700 }}>{label}</span>
                    )}
                    {!label && <span style={{ fontSize: 8, height: 12 }} />}
                    <div style={{
                      width: 42, height: 42, borderRadius: 8,
                      border: `2px solid ${border}`, background: bg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: txt, fontFamily: mono, fontSize: 14, fontWeight: 700,
                      transform: `scale(${scale})`,
                      boxShadow: glow,
                      transition: "all 0.14s",
                    }}>
                      {v}
                    </div>
                    {/* Index + pointer labels */}
                    <span style={{ color: `${T.textDim}77`, fontSize: 8, fontFamily: mono }}>[{i}]</span>
                    <div style={{ display: "flex", gap: 2 }}>
                      {i === left  && left != null  && <span style={{ color: color, fontSize: 8, fontFamily: mono, fontWeight: 700 }}>L</span>}
                      {i === right && right != null && <span style={{ color: PHASE_COLORS.miss, fontSize: 8, fontFamily: mono, fontWeight: 700 }}>R</span>}
                    </div>
                  </div>
                );
              })}

              {/* Phantom "append" slot when extending */}
              {action === "extend" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <span style={{ color: PHASE_COLORS.found, fontSize: 8, fontFamily: mono, fontWeight: 700 }}>+{x}</span>
                  <div style={{
                    width: 42, height: 42, borderRadius: 8,
                    border: `2px dashed ${PHASE_COLORS.found}`,
                    background: `${PHASE_COLORS.found}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: PHASE_COLORS.found, fontFamily: mono, fontSize: 14, fontWeight: 700,
                  }}>
                    {x}
                  </div>
                  <span style={{ color: `${T.textDim}77`, fontSize: 8, fontFamily: mono }}>[{_tails.length - 1}]</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current x pill */}
        {x != null && (
          <div style={{
            marginTop: 12, display: "flex", alignItems: "center", gap: 8,
            background: `${color}10`, border: `1px solid ${color}33`,
            borderRadius: 7, padding: "6px 12px",
          }}>
            <span style={{ color: T.textDim, fontFamily: mono, fontSize: 11 }}>inserting</span>
            <span style={{ color, fontFamily: mono, fontSize: 14, fontWeight: 800 }}>x = {x}</span>
            {left != null && (
              <span style={{ color: T.textDim, fontFamily: mono, fontSize: 10, marginLeft: "auto" }}>
                left={left}  right={right}
                {mid != null ? `  mid=${mid}` : ""}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
