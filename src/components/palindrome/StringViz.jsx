import Icon from "../ui/Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";

const { mono, display } = FONTS;
const isAlnum = c => c && /^[a-zA-Z0-9]$/.test(c);

export default function StringViz({ chars, left, right, phase, lChar, rChar, lLow, rLow, color, T }) {
  const _chars     = chars ?? [];
  const isMatch    = phase === "match";
  const isMismatch = phase === "mismatch";
  const isSkipL    = phase === "skip_left";
  const isSkipR    = phase === "skip_right";

  // Only render up to ~40 chars to avoid overflow; show ellipsis if longer
  const MAX_VISIBLE = 40;
  const tooLong = _chars.length > MAX_VISIBLE;
  const visible = tooLong ? _chars.slice(0, MAX_VISIBLE) : _chars;

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        <Icon name="mirror-left-bold" size={13} style={{ color: T.textDim }} />
        <span style={{ color: T.textDim, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
          String View
        </span>
        <span style={{ marginLeft: "auto", color: T.textMid, fontSize: 10, fontFamily: mono }}>
          {_chars.length} chars
        </span>
      </div>

      {/* Character cells */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 16 }}>
        {visible.map((ch, i) => {
          const isLeft    = i === left;
          const isRight   = i === right;
          const inWindow  = right !== null && i >= left && i <= right;
          const alnum     = isAlnum(ch);

          let borderColor = T.border;
          let bgColor     = T.card;
          let textColor   = alnum ? T.textMid : T.textDim;
          let shadow      = "none";
          let pointerLabel = null;

          if (isLeft && (isMatch || isMismatch)) {
            borderColor = isMismatch ? PHASE_COLORS.miss : PHASE_COLORS.found;
            bgColor     = isMismatch ? `${PHASE_COLORS.miss}25` : `${PHASE_COLORS.found}25`;
            textColor   = isMismatch ? PHASE_COLORS.miss : PHASE_COLORS.found;
            shadow      = `0 0 14px ${isMismatch ? PHASE_COLORS.miss : PHASE_COLORS.found}66`;
            pointerLabel = "L";
          } else if (isRight && (isMatch || isMismatch)) {
            borderColor = isMismatch ? PHASE_COLORS.miss : PHASE_COLORS.found;
            bgColor     = isMismatch ? `${PHASE_COLORS.miss}25` : `${PHASE_COLORS.found}25`;
            textColor   = isMismatch ? PHASE_COLORS.miss : PHASE_COLORS.found;
            shadow      = `0 0 14px ${isMismatch ? PHASE_COLORS.miss : PHASE_COLORS.found}66`;
            pointerLabel = "R";
          } else if (isLeft && isSkipL) {
            borderColor = PHASE_COLORS.scan;
            bgColor     = `${PHASE_COLORS.scan}18`;
            textColor   = PHASE_COLORS.scan;
            shadow      = `0 0 10px ${PHASE_COLORS.scan}44`;
            pointerLabel = "L";
          } else if (isRight && isSkipR) {
            borderColor = PHASE_COLORS.scan;
            bgColor     = `${PHASE_COLORS.scan}18`;
            textColor   = PHASE_COLORS.scan;
            shadow      = `0 0 10px ${PHASE_COLORS.scan}44`;
            pointerLabel = "R";
          } else if (isLeft) {
            borderColor = PHASE_COLORS.found;
            bgColor     = `${PHASE_COLORS.found}18`;
            textColor   = PHASE_COLORS.found;
            shadow      = `0 0 10px ${PHASE_COLORS.found}44`;
            pointerLabel = "L";
          } else if (isRight) {
            borderColor = PHASE_COLORS.compute;
            bgColor     = `${PHASE_COLORS.compute}18`;
            textColor   = PHASE_COLORS.compute;
            shadow      = `0 0 10px ${PHASE_COLORS.compute}44`;
            pointerLabel = "R";
          } else if (inWindow && alnum) {
            borderColor = `${color}33`;
            bgColor     = `${color}08`;
          } else if (!alnum) {
            borderColor = `${T.border}88`;
            bgColor     = `${T.surface}`;
            textColor   = T.textDim;
          }

          const CELL = ch === ' ' ? 24 : 30;

          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 8, fontWeight: 700, fontFamily: mono, height: 12,
                color: pointerLabel === "L" ? PHASE_COLORS.found : pointerLabel === "R" ? PHASE_COLORS.compute : "transparent" }}>
                {pointerLabel || " "}
              </span>
              <div style={{
                width: CELL, height: CELL, borderRadius: 6,
                border: `1.5px solid ${borderColor}`, background: bgColor,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: textColor, fontSize: ch === ' ' ? 9 : 13,
                fontWeight: (isLeft || isRight) ? 800 : alnum ? 600 : 400,
                fontFamily: mono, boxShadow: shadow, transition: "all 0.2s",
                opacity: alnum ? 1 : 0.5,
              }}>
                {ch === ' ' ? '·' : ch}
              </div>
              <span style={{ fontSize: 7, fontFamily: mono, color: T.textDim }}>{i}</span>
            </div>
          );
        })}
        {tooLong && (
          <div style={{ alignSelf: "center", color: T.textDim, fontFamily: mono, fontSize: 11, paddingBottom: 16 }}>
            …+{_chars.length - MAX_VISIBLE}
          </div>
        )}
      </div>

      {/* Comparison panel (only when comparing) */}
      {(phase === "compare" || phase === "match" || phase === "mismatch") && lChar && rChar && (
        <div style={{
          background: T.card,
          border: `1px solid ${phase === "mismatch" ? PHASE_COLORS.miss : phase === "match" ? PHASE_COLORS.found : color}44`,
          borderRadius: 9, padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
        }}>
          {[
            { label: `s[${left}]`, raw: lChar, low: lLow, col: PHASE_COLORS.found },
            { label: `s[${right}]`, raw: rChar, low: rLow, col: PHASE_COLORS.compute },
          ].map(({ label, raw, low, col }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: T.textDim, fontSize: 10, fontFamily: mono }}>{label}</span>
              <span style={{ color: col, fontSize: 18, fontWeight: 800, fontFamily: mono }}>'{raw}'</span>
              <Icon name="arrow-right-bold" size={10} style={{ color: T.textDim }} />
              <span style={{ color: T.textMid, fontSize: 10, fontFamily: mono }}>toLower</span>
              <span style={{ color: col, fontSize: 18, fontWeight: 800, fontFamily: mono }}>'{low}'</span>
            </div>
          ))}
          <span style={{
            marginLeft: "auto", fontSize: 13, fontWeight: 700, fontFamily: mono,
            color: phase === "mismatch" ? PHASE_COLORS.miss : phase === "match" ? PHASE_COLORS.found : color,
          }}>
            {phase === "mismatch" ? `'${lLow}' ≠ '${rLow}'` : phase === "match" ? `'${lLow}' == '${rLow}' ✓` : "comparing…"}
          </span>
        </div>
      )}

      {/* Skip annotation */}
      {(isSkipL || isSkipR) && (
        <div style={{
          background: T.card, border: `1px solid ${PHASE_COLORS.scan}44`,
          borderRadius: 9, padding: "8px 14px",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <Icon name={isSkipL ? "skip-next-bold" : "skip-previous-bold"} size={13} style={{ color: PHASE_COLORS.scan }} />
          <span style={{ color: T.textMid, fontSize: 12, fontFamily: mono }}>
            '{isSkipL ? lChar : rChar}'
            <span style={{ color: T.textDim }}> — not alphanumeric → </span>
            <span style={{ color: PHASE_COLORS.scan, fontWeight: 700 }}>
              {isSkipL ? "left++" : "right--"}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
