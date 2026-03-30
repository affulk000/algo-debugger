import { Icon as Iconify } from "@iconify/react";

/**
 * Renders a Solar icon via @iconify/react (no CDN script, no DOM conflicts).
 *
 * @param {string} name   Solar icon name, e.g. "rocket-bold"
 * @param {number} size   Size in px (default 15)
 * @param {object} style  Additional inline styles
 */
export default function Icon({ name, size = 15, style = {} }) {
  return (
    <Iconify
      icon={`solar:${name}`}
      width={size}
      height={size}
      style={{
        display: "inline-flex",
        alignItems: "center",
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
