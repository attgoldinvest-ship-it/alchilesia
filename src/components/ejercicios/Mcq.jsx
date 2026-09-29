"use client";
import { useState } from "react";
import { claseOpcion, LETRAS } from "./estilos";

// Estilo 1/10 — CLÁSICO: opción múltiple A-D.
export default function Mcq({ pregunta, onResuelto }) {
  const [elegida, setElegida] = useState(null);

  function elegir(i) {
    if (elegida !== null) return;
    setElegida(i);
    onResuelto(i === pregunta.correcta);
  }

  return (
    <div className="flex flex-col gap-2.5">
      {pregunta.opciones.map((op, i) => {
        let estado = "default";
        if (elegida !== null) {
          if (i === pregunta.correcta) estado = "correcta";
          else if (i === elegida) estado = "incorrecta";
          else estado = "descartada";
        }
        return (
          <button key={i} className={claseOpcion(estado)} disabled={elegida !== null} onClick={() => elegir(i)}>
            <span className="w-7 h-7 shrink-0 rounded-full bg-bg border border-border flex items-center justify-center text-xs font-bold">
              {LETRAS[i]}
            </span>
            <span className="text-[15px]">{op}</span>
          </button>
        );
      })}
    </div>
  );
}
