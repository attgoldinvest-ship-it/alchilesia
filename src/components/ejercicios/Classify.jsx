"use client";
import { useState } from "react";

// Estilo 9/10 — CLASIFICAR: repartir afirmaciones en 2 categorías.
export default function Classify({ pregunta, onResuelto }) {
  const [asignado, setAsignado] = useState({}); // { itemIndex: "A" | "B" }
  const [confirmado, setConfirmado] = useState(false);

  function asignar(i, grupo) {
    if (confirmado) return;
    setAsignado((prev) => ({ ...prev, [i]: grupo }));
  }

  function confirmar() {
    if (confirmado) return;
    if (Object.keys(asignado).length < pregunta.items.length) return;
    setConfirmado(true);
    const ok = pregunta.items.every((it, i) => asignado[i] === it.grupo);
    onResuelto(ok);
  }

  const listos = Object.keys(asignado).length === pregunta.items.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-chip bg-surface border border-border py-2 text-xs font-bold tracking-wide">
          {pregunta.grupoA}
        </div>
        <div className="rounded-chip bg-surface border border-border py-2 text-xs font-bold tracking-wide">
          {pregunta.grupoB}
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {pregunta.items.map((it, i) => {
          const elegido = asignado[i];
          let marco = "border-border bg-surface";
          if (confirmado) {
            marco = elegido === it.grupo ? "border-[#4ADE80] bg-[#4ADE80]/10" : "border-[#FF3B5C] bg-[#FF3B5C]/10";
          } else if (elegido) {
            marco = "border-accent bg-accent/10";
          }
          return (
            <div key={i} className={`rounded-2xl border-2 px-4 py-3 flex items-center justify-between gap-3 ${marco}`}>
              <span className="text-[13px] flex-1">{it.texto}</span>
              <div className="flex gap-1.5 shrink-0">
                <button
                  disabled={confirmado}
                  onClick={() => asignar(i, "A")}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border-2 transition-all active:scale-90 ${
                    elegido === "A" ? "bg-accent text-black border-accent" : "bg-bg border-border text-muted"
                  }`}
                >
                  A
                </button>
                <button
                  disabled={confirmado}
                  onClick={() => asignar(i, "B")}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border-2 transition-all active:scale-90 ${
                    elegido === "B" ? "bg-accent text-black border-accent" : "bg-bg border-border text-muted"
                  }`}
                >
                  B
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={confirmar}
        disabled={confirmado || !listos}
        className="w-full py-3.5 rounded-chip bg-accent text-black font-bold transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
      >
        Confirmar clasificación
      </button>
    </div>
  );
}
