import Icon from "./Icon.jsx";
import { FONTS } from "../../constants/fonts.js";

const { mono, display } = FONTS;

export default function CodePanel({ lines, activeLineIdxs, color, T }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: "14px 0 14px 14px",
      display: "flex", flexDirection: "column",
      minWidth: 0,          /* allow shrink in grid */
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, paddingRight: 14 }}>
        <Icon name="code-bold" size={13} style={{ color: T.textDim }} />
        <span style={{
          color: T.textDim, fontSize: 10,
          letterSpacing: 2, textTransform: "uppercase", fontFamily: display,
        }}>
          Source
        </span>
      </div>

      {/* Scrollable code area */}
      <div style={{
        overflowX: "auto",
        overflowY: "visible",
        paddingRight: 14,
        /* custom scrollbar */
        scrollbarWidth: "thin",
        scrollbarColor: `${color}44 transparent`,
      }}>
        <div style={{ minWidth: "max-content" }}>
          {lines.map((text, idx) => {
            const isActive = activeLineIdxs.includes(idx);
            return (
              <div key={idx} style={{
                display: "flex", alignItems: "center",
                padding: "3px 8px", borderRadius: 5, marginBottom: 1,
                background:  isActive ? `${color}1c` : "transparent",
                borderLeft: `2.5px solid ${isActive ? color : "transparent"}`,
                transition: "background 0.2s, border-color 0.2s",
              }}>
                {/* Line number */}
                <span style={{
                  color: T.textDim, fontSize: 10,
                  width: 20, flexShrink: 0, fontFamily: mono,
                  userSelect: "none",
                }}>
                  {idx + 1}
                </span>

                {/* Code text */}
                <span style={{
                  color: isActive ? T.code : T.codeDim,
                  fontSize: 11.5, whiteSpace: "pre", fontFamily: mono,
                  fontWeight: isActive ? 600 : 400,
                  transition: "color 0.2s",
                }}>
                  {text}
                </span>

                {/* Active pulse dot */}
                {isActive && (
                  <div style={{
                    marginLeft: 8,
                    width: 5, height: 5, borderRadius: "50%",
                    background: color,
                    animation: "pulse 1.1s infinite",
                    flexShrink: 0,
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
