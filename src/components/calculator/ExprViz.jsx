import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";
import Icon from "../ui/Icon.jsx";
const { mono, display } = FONTS;

// Depth-based colors for nested parens
const DEPTH_COLORS = ["#f97316","#38bdf8","#c084fc","#22c55e","#f472b6"];

// Parse the string into tokens for colored rendering
function tokenize(s) {
  const tokens = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch >= '0' && ch <= '9') {
      let j = i;
      while (j < s.length && s[j] >= '0' && s[j] <= '9') j++;
      tokens.push({ type: 'num', value: s.slice(i, j), start: i, end: j - 1 });
      i = j;
    } else {
      tokens.push({ type: ch === ' ' ? 'space' : 'op', value: ch, start: i, end: i });
      i++;
    }
  }
  return tokens;
}

// Assign paren depth to each token
function withDepths(tokens) {
  let depth = 0;
  return tokens.map(tok => {
    if (tok.value === '(') { const d = depth; depth++; return { ...tok, depth: d }; }
    if (tok.value === ')') { depth--; return { ...tok, depth }; }
    return { ...tok, depth };
  });
}

export default function ExprViz({ s, i, result, sign, stack, numStart, numEnd, color, T }) {
  const _stack  = stack ?? [];
  const tokens  = withDepths(tokenize(s ?? ""));

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        <Icon name="calculator-bold" size={13} style={{ color: T.textDim }} />
        <span style={{ color: T.textDim, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
          Expression
        </span>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: T.textDim, fontSize: 10, fontFamily: mono }}>
            sign = <span style={{ color: sign > 0 ? PHASE_COLORS.found : PHASE_COLORS.miss, fontWeight: 700 }}>
              {sign > 0 ? "+1" : "−1"}
            </span>
          </span>
          <span style={{ color: T.textDim, fontSize: 10, fontFamily: mono }}>
            result = <span style={{ color, fontWeight: 700 }}>{result}</span>
          </span>
        </span>
      </div>

      {/* Expression tokens */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 16, alignItems: "flex-end" }}>
        {tokens.map((tok, ti) => {
          const isCurrent = tok.start === i || (numStart !== undefined && tok.start >= numStart && tok.start <= (numEnd ?? numStart));
          const depthColor = DEPTH_COLORS[tok.depth % DEPTH_COLORS.length];
          const isSpace    = tok.type === 'space';
          if (isSpace) return <span key={ti} style={{ width: 6 }} />;

          const isParen   = tok.value === '(' || tok.value === ')';
          const isOp      = tok.value === '+' || tok.value === '-';
          const isPast    = tok.end < i && !isCurrent;

          let bg      = "transparent";
          let border  = "transparent";
          let txt     = T.textDim;
          let scale   = 1;
          let glow    = "none";
          let weight  = 400;

          if (isPast) {
            txt = `${T.textDim}55`;
          } else if (isCurrent) {
            bg    = `${color}25`;
            border = color;
            txt   = color;
            scale = 1.18;
            glow  = `0 0 12px ${color}66`;
            weight = 800;
          } else if (isParen) {
            txt    = depthColor;
            weight = 700;
          } else if (isOp) {
            txt    = T.textMid;
            weight = 600;
          } else {
            txt    = T.text;
            weight = 600;
          }

          return (
            <div key={ti} style={{
              minWidth: 24, height: isParen ? 32 : 28,
              borderRadius: 6,
              border: `1.5px solid ${border}`,
              background: bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 6px",
              color: txt, fontFamily: mono, fontSize: isParen ? 18 : 15,
              fontWeight: weight,
              transform: `scale(${scale})`,
              boxShadow: glow,
              transition: "all 0.14s",
            }}>
              {tok.value}
            </div>
          );
        })}
      </div>

      {/* Stack visualization */}
      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <Icon name="layers-minimalistic-bold" size={11} style={{ color: T.textDim }} />
          <span style={{ color: T.textDim, fontSize: 9, letterSpacing: 2, textTransform: "uppercase", fontFamily: display }}>
            Stack  ({_stack.length / 2} frame{_stack.length / 2 !== 1 ? "s" : ""})
          </span>
        </div>

        {_stack.length === 0 ? (
          <div style={{ color: `${T.textDim}55`, fontFamily: mono, fontSize: 11, fontStyle: "italic" }}>
            empty
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column-reverse", gap: 5 }}>
            {Array.from({ length: _stack.length / 2 }, (_, fi) => {
              const base     = fi * 2;
              const savedRes = _stack[base];
              const savedSign = _stack[base + 1];
              const frameColor = DEPTH_COLORS[fi % DEPTH_COLORS.length];
              const isTop    = base === _stack.length - 2;
              return (
                <div key={fi} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: `${frameColor}12`,
                  border: `1.5px solid ${isTop ? frameColor : `${frameColor}44`}`,
                  borderRadius: 8, padding: "7px 12px",
                  transition: "all 0.2s",
                }}>
                  <span style={{ color: frameColor, fontFamily: mono, fontSize: 9, fontWeight: 700, minWidth: 40 }}>
                    frame {fi}
                  </span>
                  <span style={{ color: T.textMid, fontFamily: mono, fontSize: 11 }}>
                    result = <span style={{ color: frameColor, fontWeight: 700 }}>{savedRes}</span>
                  </span>
                  <span style={{ color: T.textDim, fontFamily: mono, fontSize: 10 }}>|</span>
                  <span style={{ color: T.textMid, fontFamily: mono, fontSize: 11 }}>
                    sign = <span style={{ color: savedSign > 0 ? PHASE_COLORS.found : PHASE_COLORS.miss, fontWeight: 700 }}>
                      {savedSign > 0 ? "+1" : "−1"}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Current scope indicator */}
      <div style={{
        marginTop: 10, display: "flex", alignItems: "center", gap: 6,
        background: `${color}08`, border: `1px solid ${color}22`,
        borderRadius: 7, padding: "6px 10px",
      }}>
        <span style={{ color: T.textDim, fontFamily: mono, fontSize: 10 }}>
          depth = <span style={{ color, fontWeight: 700 }}>{_stack.length / 2}</span>
        </span>
        <span style={{ color: T.textDim, fontFamily: mono, fontSize: 10, marginLeft: 12 }}>
          current scope result = <span style={{ color, fontWeight: 700 }}>{result}</span>
        </span>
        <span style={{ color: T.textDim, fontFamily: mono, fontSize: 10, marginLeft: 12 }}>
          sign = <span style={{ color: sign > 0 ? PHASE_COLORS.found : PHASE_COLORS.miss, fontWeight: 700 }}>
            {sign > 0 ? "+1" : "−1"}
          </span>
        </span>
      </div>
    </div>
  );
}
