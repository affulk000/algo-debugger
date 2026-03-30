import { useEffect } from "react";
import { ICONIFY_URL } from "../constants/fonts.js";

/**
 * Injects the Iconify CDN script once into <head>.
 * Must be called before any <Icon> component renders.
 */
export default function useIconify() {
  useEffect(() => {
    if (window.Iconify) return;
    const s = document.createElement("script");
    s.src = ICONIFY_URL;
    document.head.appendChild(s);
  }, []);
}
