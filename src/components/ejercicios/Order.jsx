"use client";
import { useState } from "react";

// Estilo 7/10 — ORDEN: reordenar pasos con flechas arriba/abajo + confirmar.
export default function Order({ pregunta, onResuelto }) {
  const original = pregunta.pasos;
  const [pasos, setPasos] = useState(() => {
    // baraja determinista simple (reversa) para no coincidir con el orden correcto
    const arr = [...original].reverse();
    return arr.map((texto, i) => ({ texto, id: original.indexOf(texto) }));
  });
  const [confirmado, setConfirmado] = useState(false);

  function mover(i, dir) {
    if (confirmado) return;
    const j = i + dir;
    if (j < 0 || j >= pasos.length) return;
    const next = [...pasos];
    [next[i], next[j]] = [next[j], next[i]];
    setPasos(next);
  }

  function confirmar() {
    if (confirmado) return;
    setConfirmado(true);
    const ok = pasos.every((p, i) => p.texto === original[i]);
    onResuelto(ok);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        {pasos.map((p, i) => (
          <div
            key={p.id}
            className="flex items-center gap-3 rounded-2xl border-2 border-border bg-surface px-4 py-3"
          >
            <span className="w-6 h-6 shrink-0 rounded-full bg-bg border border-border flex items-center justify-center text-xs font-bold text-muted">
              {i + 1}
            </span>
            <span className="flex-1 text-[14px]">{p.texto}</span>
            <div className="flex flex-col gap-0.5">
              <button
                disabled={confirmado || i === 0}
                onClick={() => mover(i, -1)}
                className="w-6 h-6 rounded-md bg-bg border border-border text-xs transition-transform active:scale-90 disabled:opacity-30 disabled:active:scale-100"
              >
                ▲
              </button>
              <button
                disabled={confirmado || i === pasos.length - 1}
                onClick={() => mover(i, 1)}
                className="w-6 h-6 rounded-md bg-bg border border-border text-xs transition-transform active:scale-90 disabled:opacity-30 disabled:active:scale-100"
              >
                ▼
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={confirmar}
        disabled={confirmado}
        className="w-full py-3.5 rounded-chip bg-accent text-black font-bold transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
      >
        Confirmar orden
      </button>
    </div>
  );
}
