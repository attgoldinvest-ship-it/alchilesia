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
          <Capsula icon={<Heart size={14} className="text-[#FF3B5C]" fill="currentColor" />} valor={vidas} />
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
