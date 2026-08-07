import type { ColorPalette } from "../types";

/* ------------------------------------------------------------------ */
/*  TOKENS — paleta pensada para um portal de operadora de saúde:     */
/*  azul-marinho profundo como base, bronze como assinatura (ordem/   */
/*  confiança), teal para positivo, âmbar para pendência, coral p/    */
/*  alerta. Nada de acid-green/roxo genérico de dashboard "AI".       */
/* ------------------------------------------------------------------ */
export const C: ColorPalette = {
  bgBase: "#0A1930",
  bgPanel: "#0E2242",
  bgPanelAlt: "#122A4E",
  bgCard: "#132C52",
  border: "#213C60",
  borderSoft: "#1A3050",
  bronze: "#CDCD00",
  bronzeSoft: "rgba(205,205,0,0.14)",
  teal: "#35AC9E",
  tealSoft: "rgba(53,172,158,0.14)",
  coral: "#E2624F",
  coralSoft: "rgba(226,98,79,0.14)",
  amber: "#D9A441",
  amberSoft: "rgba(217,164,65,0.14)",
  textPrimary: "#EAF0F8",
  textMuted: "#8FA3C0",
  textFaint: "#5D7699",
};
