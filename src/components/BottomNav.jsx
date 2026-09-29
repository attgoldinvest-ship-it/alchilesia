"use client";
import { Map, Trophy, User } from "lucide-react";

// Bottom nav — specs de core.txt: 64px, fijo, 3 tabs. Activa: bg accent.
// "Práctica" se quitó como pestaña propia: repasar una lección ya
// completada ahora se hace tocándola directo en el camino (modo repaso,
// sin costo de corazones ni XP) — ver seleccionar() en page.js.
const TABS = [
  { id: "aprender", Icono: Map, label: "Aprender" },
  { id: "ranking", Icono: Trophy, label: "Ranking" },
  { id: "perfil", Icono: User, label: "Perfil" },
];

export default function BottomNav({ activa, onCambiar }) {
  return (
    <nav
      className="px-2 border-t border-border bg-bg/90 backdrop-blur-xl fixed bottom-0 left-0 right-0 z-30"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="h-16 max-w-[480px] mx-auto flex items-center justify-around">
        {TABS.map(({ id, Icono, label }) => {
          const on = id === activa;
          return (
            <button
              key={id}
              onClick={() => onCambiar(id)}
              className="flex flex-col items-center gap-1 min-w-[64px]"
            >
              <div
                className={`w-9 h-9 rounded-[12px] flex items-center justify-center transition-colors ${
                  on ? "bg-accent text-black" : "bg-surface border border-border text-muted"
                }`}
              >
                <Icono size={17} strokeWidth={2.4} />
              </div>
              <div className={`text-[9px] font-bold tracking-widest ${on ? "text-accent" : "text-muted"}`}>
                {label.toUpperCase()}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
