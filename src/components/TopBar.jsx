"use client";
import { Flame, Gem, Heart } from "lucide-react";

// Top bar — specs de core.txt: 56px, fondo bg, border-bottom border, blur.
// Racha en cápsula acento; gemas y vidas en cápsulas surface, cada una con
// su propio ícono (antes eran dos puntos de color casi idénticos entre sí).
export default function TopBar({ racha = 0, gemas = 0, vidas = 0 }) {
  return (
    <header
      className="px-4 border-b border-border bg-bg/90 backdrop-blur-xl sticky top-0 z-30"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="h-14 max-w-[480px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-accent/10 border border-accent/30">
          <Flame size={15} className="text-accent" fill="currentColor" />
          <span className="font-bold text-[13px] text-accent tabular-nums">{racha}</span>
        </div>
        <div className="flex items-center gap-2">
          <Capsula icon={<Gem size={14} className="text-[#4CC9F0]" />} valor={gemas} />
          <Corazones vidas={vidas} />
        </div>
      </div>
    </header>
  );
}

function Capsula({ icon, valor }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border">
      {icon}
      <span className="text-xs font-bold tabular-nums">{valor}</span>
    </div>
  );
}

// Corazones individuales (máx. 3) en vez de un número — se ve de un vistazo
// cuántos quedan, y cuando quedan pocos (1 o 0) el borde y los corazones
// llenos pulsan: la misma urgencia de "se están acabando" que usa Duolingo.
function Corazones({ vidas }) {
  const bajo = vidas <= 1;
  return (
    <div
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-surface border transition-colors ${
        bajo ? "border-[#FF3B5C]/50" : "border-border"
      }`}
    >
      {[0, 1, 2].map((i) => {
        const lleno = i < vidas;
        return (
          <Heart
            key={i}
            size={13}
            className={`${lleno ? "text-[#FF3B5C]" : "text-[#3A3A3E]"} ${lleno && bajo ? "pulso-urgente" : ""}`}
            fill={lleno ? "currentColor" : "none"}
          />
        );
      })}
    </div>
  );
}
