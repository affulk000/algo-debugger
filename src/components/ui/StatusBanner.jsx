import Icon from "./Icon.jsx";
import { FONTS } from "../../constants/fonts.js";
import { PHASE_COLORS } from "../../constants/themes.js";

const { mono } = FONTS;

/**
 * Displays a loading spinner or an error message above the visualization.
 * Returns null when neither loading nor error.
 */
export default function StatusBanner({ loading, error, T }) {
  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: `${T.textDim}12`,
        border: `1px solid ${T.border}`,
        borderRadius: 9, padding: "9px 14px", marginBottom: 12,
        color: T.textMid, fontSize: 11, fontFamily: mono,
      }}>
        <Icon name="refresh-bold" size={13} style={{ color: T.textDim, animation: "spin 1s linear infinite" }} />
        Computing steps on server…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: `${PHASE_COLORS.miss}18`,
        border: `1px solid ${PHASE_COLORS.miss}55`,
        borderRadius: 9, padding: "9px 14px", marginBottom: 12,
        color: PHASE_COLORS.miss, fontSize: 11, fontFamily: mono,
      }}>
        <Icon name="danger-bold" size={13} style={{ color: PHASE_COLORS.miss }} />
        Backend error: {error}
      </div>
    );
  }

  return null;
}
