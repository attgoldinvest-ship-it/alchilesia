// Clases compartidas por los 10 estilos de ejercicio — mismos tokens que
// TopBar/BottomNav/Camino (core.txt): surface/border/accent, radius-card.

export const OK = "#4ADE80";
export const MAL = "#FF3B5C";

export function claseOpcion(estado) {
  // estado: "default" | "correcta" | "incorrecta" | "descartada"
  const base =
    "w-full text-left px-4 py-3.5 rounded-2xl border-2 transition-all flex items-center gap-3";
  if (estado === "correcta") return `${base} bg-[#4ADE80]/10 border-[#4ADE80] text-white`;
  if (estado === "incorrecta") return `${base} bg-[#FF3B5C]/10 border-[#FF3B5C] text-white`;
  if (estado === "descartada") return `${base} bg-surface border-border text-muted opacity-50`;
  return `${base} bg-surface border-border text-white hover:border-hover active:scale-[0.98]`;
}

export const LETRAS = ["A", "B", "C", "D", "E", "F"];
