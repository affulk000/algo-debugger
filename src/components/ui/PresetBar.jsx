import { FONTS } from "../../constants/fonts.js";

const { mono } = FONTS;

/**
 * A row of pill-shaped preset buttons.
 *
 * @param {object[]}  presets        Array of preset objects
 * @param {Function}  getLabel       (preset) => primary label string
 * @param {Function}  getSublabel    (preset) => dimmed sublabel string
 * @param {number}    activeIndex    Index of the currently selected preset
 * @param {boolean}   isCustomActive Whether a custom input is currently active
 * @param {Function}  onSelect       (index) => void — called on preset click
 * @param {string}    color          Accent color for the active preset
 * @param {object}    T              Theme token object
 */
export default function PresetBar({
  presets, getLabel, getSublabel,
  activeIndex, isCustomActive,
  onSelect, color, T,
}) {
  return (
    <div style={{
      display: "flex", gap: 6, marginBottom: 12,
      flexWrap: "wrap", alignItems: "center",
    }}>
      <span style={{ color: T.textDim, fontSize: 11, marginRight: 2 }}>Preset:</span>

      {presets.map((p, i) => {
        const isActive = !isCustomActive && activeIndex === i;
        return (
          <button
            key={i}
            className="tbtn"
            onClick={() => onSelect(i)}
            style={{
              padding: "5px 12px", borderRadius: 20,
              border: `1px solid ${isActive ? color : T.border}`,
              background: isActive ? `${color}1a` : T.surface,
              color: isActive ? color : T.textMid,
              fontSize: 11, fontFamily: mono,
            }}
          >
            <span style={{ fontWeight: 600 }}>{getLabel(p)}</span>
            <span style={{ opacity: 0.5, marginLeft: 5 }}>{getSublabel(p)}</span>
          </button>
        );
      })}
    </div>
  );
}
