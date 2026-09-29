"use client";
import { useMemo, useState } from "react";

function barajar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (i * 7 + 3) % (i + 1); // baraja determinista, sin Math.random
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Estilo 8/10 — PAREJA: relacionar término (izquierda) con definición (derecha).
export default function Match({ pregunta, onResuelto }) {
  const der = useMemo(() => barajar(pregunta.pares.map((p) => p.der)), [pregunta]);
  const [resueltas, setResueltas] = useState(new Set()); // índices izq ya emparejados bien
  const [selIzq, setSelIzq] = useState(null);
  const [error, setError] = useState(null); // índice der marcado mal momentáneamente
  const avisado = useMemo(() => ({ current: false }), [pregunta]);

  function tocarIzq(i) {
    if (resueltas.has(i)) return;
    setSelIzq(i);
    setError(null);
  }

  function tocarDer(texto) {
    if (selIzq === null) return;
    const esperado = pregunta.pares[selIzq].der;
    if (texto === esperado) {
      const next = new Set(resueltas);
      next.add(selIzq);
      setResueltas(next);
      setSelIzq(null);
      if (next.size === pregunta.pares.length && !avisado.current) {
        avisado.current = true;
        onResuelto(true);
      }
    } else {
      setError(texto);
      setTimeout(() => setError(null), 500);
      setSelIzq(null);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-2">
        {pregunta.pares.map((p, i) => (
          <button
            key={i}
            disabled={resueltas.has(i)}
            onClick={() => tocarIzq(i)}
            className={`px-3 py-3 rounded-2xl border-2 text-[13px] font-semibold text-left transition-all active:scale-95 ${
              resueltas.has(i)
                ? "bg-[#4ADE80]/10 border-[#4ADE80] opacity-70"
                : selIzq === i
                ? "bg-accent/15 border-accent"
                : "bg-surface border-border hover:border-hover"
            }`}
          >
            {p.izq}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {der.map((texto, i) => {
          const yaUsada = pregunta.pares.some((p) => resueltas.has(pregunta.pares.indexOf(p)) && p.der === texto);
          return (
            <button
              key={i}
              disabled={yaUsada}
              onClick={() => tocarDer(texto)}
              className={`px-3 py-3 rounded-2xl border-2 text-[12px] text-left transition-all active:scale-95 ${
                yaUsada
                  ? "bg-[#4ADE80]/10 border-[#4ADE80] opacity-70"
                  : error === texto
                  ? "bg-[#FF3B5C]/10 border-[#FF3B5C]"
                  : "bg-surface border-border hover:border-hover"
              }`}
            >
              {texto}
            </button>
          );
        })}
      </div>
    </div>
  );
}
