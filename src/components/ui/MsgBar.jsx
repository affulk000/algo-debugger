import Icon from "./Icon.jsx";
import { PHASE_COLORS } from "../../constants/themes.js";
import { FONTS } from "../../constants/fonts.js";

const { mono, display } = FONTS;

/**
 * Animated message bar showing the current step's phase icon, message,
 * detail string, and (when present) a result badge.
 *
 * @param {object} step      Current step object
 * @param {number} stepIdx   Used as React key to re-trigger entry animation
 * @param {string} color     Phase accent color
 * @param {object} T         Theme token object
 */
export default function MsgBar({ step, stepIdx, color, T }) {
  return (
    <div
      key={stepIdx}
      className="msg-in"
      style={{
        background: T.surface,
        border: `1px solid ${color}55`,
        borderRadius: 12,
        padding: "14px 18px",
        marginBottom: 12,
        display: "flex", gap: 14, alignItems: "center",
        boxShadow: `0 0 24px ${color}14`,
      }}
    >
      {/* Left accent bar */}
      <div style={{
        width: 3, alignSelf: "stretch",
        borderRadius: 4, background: color, flexShrink: 0,
      }} />

      {/* Phase icon badge */}
      <div style={{
        width: 36, height: 36, borderRadius: 9,
        background: `${color}20`, border: `1px solid ${color}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon name={step.icon} size={18} style={{ color }} />
      </div>

      {/* Message text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: T.text, fontSize: 13, marginBottom: 4,
          fontFamily: mono, fontWeight: 600,
        }}>
          {step.msg}
        </div>
        <div style={{ color: T.textMid, fontSize: 11, fontFamily: mono }}>
          {step.detail}
        </div>
      </div>

      {/* Result badge */}
      {step.result != null && (
        <div style={{
          background: `${PHASE_COLORS.found}20`,
          border: `1px solid ${PHASE_COLORS.found}`,
          borderRadius: 9, padding: "9px 16px",
          textAlign: "center", animation: "pop 0.4s ease", flexShrink: 0,
        }}>
          <div style={{
            color: T.textMid, fontSize: 9,
            letterSpacing: 2, textTransform: "uppercase",
            marginBottom: 3, fontFamily: display,
          }}>
            Result
          </div>
          <div style={{
            color: PHASE_COLORS.found, fontSize: 14,
            fontWeight: 700, fontFamily: mono,
          }}>
            {Array.isArray(step.result)
              ? `[${step.result.join(", ")}]`
              : String(step.result)}
          </div>
        </div>
      )}
    </div>
  );
}
