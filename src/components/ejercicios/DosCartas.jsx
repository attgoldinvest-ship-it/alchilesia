"use client";
import { useState } from "react";

// Estilo 2/10 — DUELO: dos cartas grandes lado a lado (sirve para tf,
// duelo y versus — misma interacción "elige entre 2", distinto contenido).
export default function DosCartas({ pregunta, onResuelto }) {
  const [elegida, setElegida] = useState(null);
  const esTF = pregunta.tipo === "tf";

  function elegir(i) {
    if (elegida !== null) return;
    setElegida(i);
    onResuelto(i === pregunta.correcta);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {pregunta.opciones.map((op, i) => {
        const esCorrecta = i === pregunta.correcta;
        const esElegida = i === elegida;
        let clase = "border-border bg-surface hover:border-hover";
        if (elegida !== null) {
          if (esCorrecta) clase = "border-[#4ADE80] bg-[#4ADE80]/10";
          else if (esElegida) clase = "border-[#FF3B5C] bg-[#FF3B5C]/10";
          else clase = "border-border bg-surface opacity-40";
        }
        return (
          <button
            key={i}
            disabled={elegida !== null}
            onClick={() => elegir(i)}
            className={`rounded-card border-2 px-5 py-8 flex flex-col items-center justify-center gap-2 text-center transition-all active:scale-[0.97] ${clase}`}
          >
            {esTF && (
              <span className="text-2xl">{i === 0 ? "✓" : "✕"}</span>
            )}
            <span className="text-[15px] font-semibold leading-snug">{op}</span>
          </button>
        );
      })}
    </div>
  );
}
