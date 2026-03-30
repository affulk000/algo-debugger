/**
 * DragGrid — draggable-swap + resizable panel grid
 *
 * Usage:
 *   <DragGrid cols={2} T={T}>
 *     <CodePanel ... />
 *     <SomeViz ... />
 *   </DragGrid>
 *
 * Features:
 *   • Grip handle at top of each panel — drag to swap positions (snap)
 *   • Vertical resize divider between columns — drag to resize
 *   • Drop zone highlight + dim on dragging panel
 *   • Works for 2 or 3 panels
 */

import { useState, useRef, useCallback } from "react";

const DIVIDER_W = 10;   // px — width of the resize handle column
const MIN_WEIGHT = 0.18; // minimum column fraction

// Six-dot grip SVG
function GripDots({ color }) {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
      {[0, 6].map(cx =>
        [2, 7, 12].map(cy => (
          <circle key={`${cx}-${cy}`} cx={cx + 3} cy={cy} r="1.5" fill={color} />
        ))
      )}
    </svg>
  );
}

export default function DragGrid({ children, cols = 2, T, style }) {
  const items = (Array.isArray(children) ? children.flat() : [children]).filter(Boolean);
  const n     = Math.min(items.length, cols || items.length);

  const [order,    setOrder]    = useState(() => items.map((_, i) => i));
  const [weights,  setWeights]  = useState(() => Array(n).fill(1));
  const [dragFrom, setDragFrom] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const containerRef = useRef(null);
  const gripHeld     = useRef(false);

  /* ── Drag swap ─────────────────────────────────────────────── */
  const onDragStart = useCallback((e, pos) => {
    if (!gripHeld.current) { e.preventDefault(); return; }
    // invisible drag image
    const ghost = document.createElement("div");
    ghost.style.cssText = "position:fixed;top:-999px;width:1px;height:1px;";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
    e.dataTransfer.effectAllowed = "move";
    setDragFrom(pos);
  }, []);

  const onDragOver = useCallback((e, pos) => {
    if (dragFrom === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(pos);
  }, [dragFrom]);

  const onDrop = useCallback((e, pos) => {
    e.preventDefault();
    if (dragFrom !== null && dragFrom !== pos) {
      setOrder(prev => {
        const next = [...prev];
        [next[dragFrom], next[pos]] = [next[pos], next[dragFrom]];
        return next;
      });
    }
    setDragFrom(null);
    setDragOver(null);
    gripHeld.current = false;
  }, [dragFrom]);

  const onDragEnd = useCallback(() => {
    setDragFrom(null);
    setDragOver(null);
    gripHeld.current = false;
  }, []);

  /* ── Resize ─────────────────────────────────────────────────── */
  const startResize = useCallback((e, divIdx) => {
    e.preventDefault();
    e.stopPropagation();
    const startX      = e.clientX;
    const snapWeights = [...weights];
    const containerW  = containerRef.current?.offsetWidth || 800;
    // approximate pixel width per unit weight
    const usableW = containerW - (n - 1) * DIVIDER_W;
    const totalW  = snapWeights.reduce((a, b) => a + b, 0);
    const pxPerW  = usableW / totalW;

    document.body.style.cursor    = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev) => {
      const dx   = ev.clientX - startX;
      const dw   = dx / pxPerW;
      setWeights(prev => {
        const next = [...prev];
        next[divIdx]     = Math.max(MIN_WEIGHT, snapWeights[divIdx]     + dw);
        next[divIdx + 1] = Math.max(MIN_WEIGHT, snapWeights[divIdx + 1] - dw);
        return next;
      });
    };
    const onUp = () => {
      document.body.style.cursor    = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  }, [weights, n]);

  /* ── Build grid-template-columns string ─────────────────────── */
  // Pattern:  "Wfr 10px Wfr"  (panels in odd columns, dividers in even)
  const templateParts = [];
  weights.forEach((w, i) => {
    templateParts.push(`${w}fr`);
    if (i < n - 1) templateParts.push(`${DIVIDER_W}px`);
  });
  const gridTemplate = templateParts.join(" ");

  /* ── Render ─────────────────────────────────────────────────── */
  const gridCells = [];
  order.slice(0, n).forEach((origIdx, pos) => {
    const child     = items[origIdx] ?? null;
    const isDragged = dragFrom === pos;
    const isTarget  = dragOver === pos && dragFrom !== null && dragFrom !== pos;
    const accentColor = T?.accent || "#60a5fa";
    const borderColor = T?.border || "#333";
    const dimColor    = T?.textDim || "#888";

    gridCells.push(
      <div
        key={`panel-${origIdx}`}
        draggable
        onDragStart={e => onDragStart(e, pos)}
        onDragOver={e  => onDragOver(e, pos)}
        onDrop={e      => onDrop(e, pos)}
        onDragEnd={onDragEnd}
        style={{ position: "relative", minWidth: 0 }}
      >
        {/* ── Grip handle ── */}
        <div
          title="Drag to swap panels"
          onMouseDown={e => { e.stopPropagation(); gripHeld.current = true; }}
          onMouseUp={() => { gripHeld.current = false; }}
          style={{
            position: "absolute", top: 7, left: "50%",
            transform: "translateX(-50%)",
            zIndex: 30, cursor: "grab",
            padding: "3px 7px", borderRadius: 6,
            background: `${borderColor}bb`,
            backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", gap: 2,
            opacity: 0.45,
            transition: "opacity 0.15s, background 0.15s",
            userSelect: "none",
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = `${borderColor}ff`; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = 0.45; e.currentTarget.style.background = `${borderColor}bb`; }}
        >
          <GripDots color={dimColor} />
        </div>

        {/* ── Drop target glow ── */}
        {isTarget && (
          <div style={{
            position: "absolute", inset: -1, zIndex: 25,
            border: `2px dashed ${accentColor}`,
            borderRadius: 14,
            background: `${accentColor}0f`,
            pointerEvents: "none",
            animation: "pulse 1s infinite",
          }} />
        )}

        {/* ── Panel content (dim while dragging) ── */}
        <div style={{
          opacity: isDragged ? 0.35 : 1,
          transition: "opacity 0.12s",
          pointerEvents: isDragged ? "none" : "auto",
          paddingTop: 0,   /* grip handle floats above */
        }}>
          {child}
        </div>
      </div>
    );

    /* ── Resize divider ── */
    if (pos < n - 1) {
      gridCells.push(
        <div
          key={`div-${pos}`}
          onMouseDown={e => startResize(e, pos)}
          style={{
            cursor: "col-resize",
            display: "flex",
            alignItems: "stretch",
            justifyContent: "center",
            zIndex: 20,
            padding: "4px 0",
          }}
          title="Drag to resize"
        >
          <div style={{
            width: 3,
            borderRadius: 3,
            background: borderColor,
            opacity: 0.35,
            transition: "opacity 0.15s, background 0.15s",
            minHeight: 60,
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = accentColor; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = 0.35; e.currentTarget.style.background = borderColor; }}
          />
        </div>
      );
    }
  });

  return (
    <div
      ref={containerRef}
      style={{
        display: "grid",
        gridTemplateColumns: gridTemplate,
        gap: 0,
        alignItems: "start",
        marginBottom: 14,
        ...(style || {}),
      }}
    >
      {gridCells}
    </div>
  );
}
