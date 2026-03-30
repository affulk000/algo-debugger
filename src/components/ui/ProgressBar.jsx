/**
 * Thin progress track showing how far through the steps we are.
 */
export default function ProgressBar({ stepIdx, stepsLen, color, T }) {
  const pct = (stepIdx / Math.max(stepsLen - 1, 1)) * 100;

  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`,
      borderRadius: 4, height: 5, marginBottom: 14, overflow: "hidden",
    }}>
      <div style={{
        height: "100%",
        background: `linear-gradient(90deg, ${color}, ${color}aa)`,
        width: `${pct}%`,
        transition: "width 0.3s ease",
        borderRadius: 4,
      }} />
    </div>
  );
}
