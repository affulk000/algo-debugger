import { useEffect } from "react";
import { GOOGLE_FONTS_URL } from "../constants/fonts.js";

/**
 * Injects the Google Fonts <link> tag once into <head>.
 * Loads JetBrains Mono and Syne.
 */
export default function useFonts() {
  useEffect(() => {
    if (document.getElementById("algo-fonts")) return;
    const l = document.createElement("link");
    l.id   = "algo-fonts";
    l.rel  = "stylesheet";
    l.href = GOOGLE_FONTS_URL;
    document.head.appendChild(l);
  }, []);
}
