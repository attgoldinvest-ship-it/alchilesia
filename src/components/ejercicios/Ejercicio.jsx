"use client";
import { useState } from "react";
import Mcq from "./Mcq";
import DosCartas from "./DosCartas";
import Fill from "./Fill";
import Case from "./Case";
import Slider from "./Slider";
import Multi from "./Multi";
import Order from "./Order";
import Match from "./Match";
import Classify from "./Classify";

const ETIQUETAS = {
  mcq: "Elige la respuesta correcta",
  tf: "Verdadero o falso",
  fill: "Completa el espacio",
  case: "Caso práctico",
  slider: "Estima con el slider",
  multi: "Selecciona todas las que apliquen",
  order: "Ordena los pasos",
  match: "Relaciona cada pareja",
  classify: "Clasifica cada afirmación",
  duelo: "Elige la opción correcta",
  versus: "Elige la opción correcta",
};

const COMPONENTES = {
  mcq: Mcq,
  tf: DosCartas,
  duelo: DosCartas,
  versus: DosCartas,
  fill: Fill,
  case: Case,
  slider: Slider,
  multi: Multi,
  order: Order,
  match: Match,
  classify: Classify,
};

// Dispatcher de los 10 estilos de ejercicio + pie de retroalimentación
// (mismo patrón que resolver()/lecPie en curso-inversiones.html, en React).
export default function Ejercicio({ pregunta, onContinuar }) {
  const [ok, setOk] = useState(null); // null = sin responder, true/false = resultado

  const Comp = COMPONENTES[pregunta.tipo] || Mcq;
  const mostrarQ = pregunta.tipo !== "fill"; // fill ya muestra la frase con el hueco

  function resolver(resultado) {
    if (ok !== null) return;
    setOk(resultado);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="text-[11px] font-bold tracking-[0.14em] text-accent uppercase mb-2">
          {ETIQUETAS[pregunta.tipo] || ""}
        </div>
        {mostrarQ && <h2 className="text-[19px] font-bold leading-snug">{pregunta.q}</h2>}
      </div>

      <Comp pregunta={pregunta} onResuelto={resolver} />

      {ok !== null && (
        <div
          className={`rounded-card border-2 px-5 py-4 flex items-start gap-3 ${
            ok ? "bg-[#4ADE80]/10 border-[#4ADE80]" : "bg-[#FF3B5C]/10 border-[#FF3B5C]"
          }`}
        >
          <span className="text-xl leading-none">{ok ? "✓" : "✕"}</span>
          <div>
            <b className="block text-[14px] mb-1">{ok ? "¡Correcto!" : "No es esa"}</b>
            <p className="text-[13px] text-muted leading-relaxed">{pregunta.expl}</p>
          </div>
        </div>
      )}

      {ok !== null && (
        <button
          onClick={() => onContinuar(ok)}
          className={`w-full py-3.5 rounded-chip font-bold ${ok ? "bg-[#4ADE80] text-black" : "bg-[#FF3B5C] text-white"}`}
        >
          Continuar
        </button>
      )}
    </div>
  );
}
