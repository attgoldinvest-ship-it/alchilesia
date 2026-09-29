"use client";
import { useState } from "react";

// Estilo 3/10 — FRASE: completar el hueco con una palabra de un banco de chips.
export default function Fill({ pregunta, onResuelto }) {
  const [elegida, setElegida] = useState(null);

  function elegir(i) {
    if (elegida !== null) return;
    setElegida(i);
    onResuelto(i === pregunta.correcta);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-card bg-surface border border-border px-5 py-6 text-[17px] leading-relaxed flex flex-wrap gap-x-1.5 gap-y-2 justify-center">
        {pregunta.frase.map((t, i) =>
          t === "____" ? (
            <span
              key={i}
              className="inline-flex min-w-[64px] justify-center border-b-2 border-dashed border-accent px-2 font-bold text-accent"
            >
              {elegida !== null ? pregunta.opciones[elegida] : "?"}
            </span>
          ) : (
            <span key={i}>{t}</span>
          )
        )}
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {pregunta.opciones.map((op, i) => {
          let clase = "bg-surface border-border hover:border-hover";
          if (elegida !== null) {
            if (i === pregunta.correcta) clase = "bg-[#4ADE80]/10 border-[#4ADE80]";
            else if (i === elegida) clase = "bg-[#FF3B5C]/10 border-[#FF3B5C]";
            else clase = "bg-surface border-border opacity-40";
          }
          return (
            <button
              key={i}
              disabled={elegida !== null}
              onClick={() => elegir(i)}
              className={`rounded-chip border-2 px-3 py-2.5 text-sm font-semibold transition-all active:scale-95 ${clase}`}
            >
              {op}
            </button>
          );
        })}
      </div>
    </div>
  );
}
