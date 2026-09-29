"use client";
import { useState } from "react";

// Estilo 5/10 — ESTIMACIÓN: slider numérico con tolerancia.
export default function Slider({ pregunta, onResuelto }) {
  const inicial = Math.round((pregunta.min + pregunta.max) / 2);
  const [valor, setValor] = useState(inicial);
  const [comprobado, setComprobado] = useState(false);

  function comprobar() {
    if (comprobado) return;
    setComprobado(true);
    const ok = Math.abs(valor - pregunta.correcta) <= pregunta.tolerancia;
    onResuelto(ok);
  }

  const u = pregunta.unidad === "$" ? "$" : "";
  const suf = pregunta.unidad && pregunta.unidad !== "$" ? " " + pregunta.unidad : "";

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-card bg-surface border border-border px-6 py-8 flex flex-col items-center gap-5">
        <div className="text-4xl font-[800] text-accent tabular-nums">
          {u}{valor}{suf}
        </div>
        <input
          type="range"
          min={pregunta.min}
          max={pregunta.max}
          step={pregunta.step}
          value={valor}
          disabled={comprobado}
          onChange={(e) => setValor(parseInt(e.target.value))}
          className="w-full accent-[#FF6B2D]"
        />
        <div className="w-full flex justify-between text-xs text-muted tabular-nums">
          <span>{u}{pregunta.min}{suf}</span>
          <span>{u}{pregunta.max}{suf}</span>
        </div>
      </div>
      <button
        onClick={comprobar}
        disabled={comprobado}
        className="w-full py-3.5 rounded-chip bg-accent text-black font-bold transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
      >
        Comprobar
      </button>
    </div>
  );
}
