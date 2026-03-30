import Icon from "./Icon.jsx";
import { FONTS } from "../../constants/fonts.js";

const { mono } = FONTS;

/**
 * Playback control bar: skip-start, prev, play/pause/restart, next, skip-end, speed slider.
 */
export default function Controls({
  stepIdx, stepsLen, playing, setPlaying,
  goTo, speed, setSpeed, color, T,
}) {
  const btnBase = {
    display: "flex", alignItems: "center", gap: 5,
    padding: "9px 14px",
    background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: mono,
  };

  const isEnd = stepIdx >= stepsLen - 1;

  return (
    <div style={{
      display: "flex", gap: 8,
      alignItems: "center", justifyContent: "center",
      flexWrap: "wrap",
    }}>
      {/* ⏮ Skip to start */}
      <button className="tbtn"
        onClick={() => { setPlaying(false); goTo(0); }}
        style={{ ...btnBase, color: T.textMid }}>
        <Icon name="skip-previous-bold" size={15} />
      </button>

      {/* ← Prev */}
      <button className="tbtn"
        onClick={() => { setPlaying(false); goTo(stepIdx - 1); }}
        style={{ ...btnBase, color: T.text }}>
        <Icon name="arrow-left-bold" size={15} /> Prev
      </button>

      {/* ▶ / ⏸ / ↺ */}
      <button className="tbtn"
        onClick={() => setPlaying(p => !p)}
        style={{
          ...btnBase, minWidth: 95, padding: "9px 22px",
          background: playing ? "#ef444420" : `${color}20`,
          border: `1.5px solid ${playing ? "#ef4444" : color}`,
          color: playing ? "#ef4444" : color,
          fontWeight: 700,
        }}>
        <Icon
          name={playing ? "pause-bold" : isEnd ? "refresh-bold" : "play-bold"}
          size={15}
        />
        {playing ? "Pause" : isEnd ? "Restart" : "Play"}
      </button>

      {/* Next → */}
      <button className="tbtn"
        onClick={() => { setPlaying(false); goTo(stepIdx + 1); }}
        style={{ ...btnBase, color: T.text }}>
        Next <Icon name="arrow-right-bold" size={15} />
      </button>

      {/* ⏭ Skip to end */}
      <button className="tbtn"
        onClick={() => { setPlaying(false); goTo(stepsLen - 1); }}
        style={{ ...btnBase, color: T.textMid }}>
        <Icon name="skip-next-bold" size={15} />
      </button>

      {/* Speed slider */}
      <div style={{
        display: "flex", alignItems: "center", gap: 7, marginLeft: 6,
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 8, padding: "8px 12px",
      }}>
        <Icon name="bolt-bold" size={12} style={{ color: T.textDim }} />
        <input
          name="step-speed" type="range" min={200} max={1800} step={100}
          value={2000 - speed}
          onChange={e => setSpeed(2000 - Number(e.target.value))}
          style={{ width: 66, accentColor: color }}
        />
        <span style={{ color: T.textMid, fontSize: 10, fontFamily: mono, minWidth: 26 }}>
          {speed < 500 ? "Fast" : speed < 1000 ? "Med" : "Slow"}
        </span>
      </div>
    </div>
  );
}
