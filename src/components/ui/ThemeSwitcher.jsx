import { THEMES } from "../../constants/themes.js";
import Icon from "./Icon.jsx";

/**
 * Row of icon buttons to switch between available themes.
 *
 * @param {string}   themeKey      Active theme key
 * @param {Function} setThemeKey   Setter for themeKey
 * @param {string}   color         Accent color for the active ring
 * @param {object}   T             Active theme token object
 */
export default function ThemeSwitcher({ themeKey, setThemeKey, color, T }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <span style={{
        color: T.textDim, fontSize: 10,
        letterSpacing: 2, textTransform: "uppercase", marginRight: 4,
      }}>
        Theme
      </span>

      {Object.keys(THEMES).map(k => (
        <button
          key={k}
          className="tbtn"
          onClick={() => setThemeKey(k)}
          title={THEMES[k].name}
          style={{
            width: 32, height: 32, borderRadius: 8,
            border: `1.5px solid ${themeKey === k ? color : T.border}`,
            background: themeKey === k ? `${color}22` : T.surface,
            color: themeKey === k ? color : T.textMid,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Icon name={THEMES[k].icon} size={14} />
        </button>
      ))}
    </div>
  );
}
