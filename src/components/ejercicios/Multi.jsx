"use client";
import { useState } from "react";

// Estilo 6/10 — MULTI: selección múltiple con chips + confirmar.
// Espera pregunta.opciones (array) y pregunta.correctas (array de índices).
export default function Multi({ pregunta, onResuelto }) {
  const [marcadas, setMarcadas] = useState(new Set());
  const [confirmado, setConfirmado] = useState(false);

  function toggle(i) {
    if (confirmado) return;
    setMarcadas((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function confirmar() {
    if (confirmado || marcadas.size === 0) return;
    setConfirmado(true);
    const correctas = new Set(pregunta.correctas);
    const ok =
      correctas.size === marcadas.size && [...correctas].every((i) => marcadas.has(i));
    onResuelto(ok);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {pregunta.opciones.map((op, i) => {
          const marcada = marcadas.has(i);
          let clase = marcada ? "bg-accent/15 border-accent text-white" : "bg-surface border-border text-white hover:border-hover";
          if (confirmado) {
            const esCorrecta = pregunta.correctas.includes(i);
            if (esCorrecta) clase = "bg-[#4ADE80]/10 border-[#4ADE80]";
            else if (marcada) clase = "bg-[#FF3B5C]/10 border-[#FF3B5C]";
            else clase = "bg-surface border-border opacity-40";
          }
          return (
            <button
              key={i}
              disabled={confirmado}
              onClick={() => toggle(i)}
              className={`px-4 py-2.5 rounded-chip border-2 text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 ${clase}`}
            >
              <span className={`w-4 h-4 rounded-[4px] border-2 flex items-center justify-center text-[10px] ${marcada ? "bg-accent border-accent text-black" : "border-muted"}`}>
                {marcada ? "✓" : ""}
              </span>
              {op}
            </button>
          );
        })}
      </div>
      <button
        onClick={confirmar}
        disabled={confirmado || marcadas.size === 0}
        className="w-full py-3.5 rounded-chip bg-accent text-black font-bold disabled:opacity-50"
      >
        Confirmar selección
      </button>
    </div>
  );
}
