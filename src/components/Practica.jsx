"use client";
import { useState } from "react";
import Ejercicio from "./ejercicios/Ejercicio";
import { TEORIA, PREGUNTAS } from "@/data/contenido";
import { guardarProgreso, sumarXp, ajustarCorazones, registrarActividad } from "@/lib/progreso";

// Convierte **negrita** a <strong> real, sin HTML crudo — seguro porque el
// contenido es nuestro (contenido/produccion-*.js), no texto de usuarios.
function conNegritas(texto) {
  if (!texto) return texto;
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);
  return partes.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p
  );
}

function barajar(arr) {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Pantalla completa de lección: teoría → preguntas (los 10 estilos) → resultado.
// Reemplaza el "márcalo completo al tocar el nodo" de la demo anterior —
// esto ya guarda en Supabase de verdad (progreso, xp, corazones).
// Unidades 7-15 = Bloque 2 (cripto/Dasus) — su contenido está verificado
// contra dasus.gitbook.io/dasus-docs y el PDF oficial (regla #2 de
// reglas.txt: nunca se inventa un dato de la plataforma). Unidades 1-6 son
// educación financiera general, no necesitan esa etiqueta.
function esBloqueCripto(leccionId) {
  const m = leccionId.match(/^tm_u(\d+)l/);
  const unidad = m ? parseInt(m[1], 10) : 0;
  return unidad >= 7 && unidad <= 15;
}

export default function Practica({ leccion, userId, repaso = false, onCerrar, onTerminada }) {
  const teoria = TEORIA[leccion.id];
  // Se revuelve cada vez que se abre la lección (Practica se monta de nuevo
  // en cada intento) — así reintentar después de fallar no repite el mismo
  // orden, se siente distinto/más difícil de memorizar cada vez.
  const [preguntas] = useState(() => barajar(PREGUNTAS[leccion.id] || []));
  // La teoría se muestra SIEMPRE que exista, incluso en repaso — repasar es
  // justo para reforzar el concepto, no solo repetir preguntas de memoria.
  // Lo único que cambia en repaso es que no cuesta corazones ni da XP.
  const [fase, setFase] = useState(teoria ? "teoria" : "practica");
  const [idx, setIdx] = useState(0);
  const [correctas, setCorrectas] = useState(0);
  const [guardando, setGuardando] = useState(false);

  async function continuar(ok) {
    if (ok) setCorrectas((c) => c + 1);
    else if (userId && !repaso) ajustarCorazones(userId, -1); // repaso: nunca pierde vidas

    if (idx + 1 >= preguntas.length) {
      setGuardando(true);
      const total = preguntas.length;
      const finalCorrectas = ok ? correctas + 1 : correctas;
      if (userId && !repaso) {
        await guardarProgreso(userId, leccion.id, { correctas: finalCorrectas, total });
        await sumarXp(userId, 10 + (finalCorrectas === total ? 5 : 0));
        await registrarActividad(userId);
      }
      setGuardando(false);
      setFase("resultado");
    } else {
      setIdx((i) => i + 1);
    }
  }

  const total = preguntas.length;
  const pct = total ? Math.round((Math.min(idx, total) / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col">
      <div className="px-4 border-b border-border shrink-0" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="h-14 max-w-[480px] mx-auto flex items-center gap-3">
          <button onClick={onCerrar} className="text-muted text-xl leading-none px-1">✕</button>
          {fase === "practica" && (
            <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
              <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
            </div>
          )}
          {repaso && <span className="text-[10px] font-bold tracking-widest text-muted uppercase shrink-0">Repaso — sin riesgo</span>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 max-w-[480px] w-full mx-auto">
        {fase === "teoria" && teoria && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-[0.14em] text-accent uppercase">Aprende</span>
              {esBloqueCripto(leccion.id) && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-muted">
                  <svg width="11" height="11" viewBox="0 0 20 20" fill="none"><path d="M10 1.5l7 3.2v4.8c0 4.6-3 8.9-7 9.9-4-1-7-5.3-7-9.9V4.7l7-3.2z" fill="#4ADE80" opacity="0.15"/><path d="M6.5 10l2.3 2.3L13.5 8" stroke="#4ADE80" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 1.5l7 3.2v4.8c0 4.6-3 8.9-7 9.9-4-1-7-5.3-7-9.9V4.7l7-3.2z" stroke="#4ADE80" strokeWidth="1.2"/></svg>
                  Verificado en dasus.gitbook.io
                </span>
              )}
            </div>
            <h1 className="text-[26px] font-[800] leading-tight mb-1">{teoria.titulo}</h1>

            <div className="flex flex-col gap-4">
              <p className="text-[16px] text-white leading-[1.7]">{conNegritas(teoria.texto[0])}</p>
              {teoria.texto[1] && <p className="text-[16px] text-white leading-[1.7]">{conNegritas(teoria.texto[1])}</p>}
              {teoria.ejemplo && <ParrafoEtiquetado etiqueta="Ejemplo" color="#4CC9F0" texto={teoria.ejemplo} />}
              {teoria.error && <ParrafoEtiquetado etiqueta="Ojo — error común" color="#FF3B5C" texto={teoria.error} />}
              {teoria.contexto && <ParrafoEtiquetado etiqueta="Contexto" color="#9A9AA0" texto={teoria.contexto} />}
            </div>

            <TarjetaTeoria etiqueta="Dato clave" texto={teoria.dato} acento />

            <button
              onClick={() => setFase("practica")}
              className="w-full py-3.5 rounded-chip bg-accent text-black font-bold mt-2"
            >
              {total ? "Empezar práctica" : "Cerrar"}
            </button>
          </div>
        )}

        {fase === "practica" && preguntas[idx] && (
          <Ejercicio key={idx} pregunta={preguntas[idx]} onContinuar={continuar} />
        )}

        {fase === "resultado" && (
          <div className="flex flex-col items-center text-center gap-4 pt-16">
            <div className="w-20 h-20 rounded-full bg-accent/15 border-2 border-accent flex items-center justify-center text-3xl">
              {correctas === total ? "🏆" : "✓"}
            </div>
            <h1 className="text-[24px] font-[800]">¡Lección completada!</h1>
            <p className="text-muted text-[15px]">
              {correctas} de {total} correctas
              {!repaso && ` · +${10 + (correctas === total ? 5 : 0)} XP`}
            </p>
            <button
              onClick={() => onTerminada({ correctas, total })}
              className="w-full py-3.5 rounded-chip bg-accent text-black font-bold mt-4"
            >
              Continuar
            </button>
          </div>
        )}

        {guardando && <p className="text-center text-muted text-sm mt-4">Guardando…</p>}
      </div>
    </div>
  );
}

// Texto corrido con una etiqueta chica en línea — no es una caja, solo un
// color de acento al inicio del párrafo para que se distinga sin pesar
// visualmente. Ejemplo se ve azul, error rojo tenue, contexto gris neutro.
function ParrafoEtiquetado({ etiqueta, color, texto }) {
  return (
    <p className="text-[16px] text-white leading-[1.7]">
      <span className="font-bold" style={{ color }}>{etiqueta}: </span>
      {conNegritas(texto)}
    </p>
  );
}

function TarjetaTeoria({ etiqueta, texto, acento = false }) {
  return (
    <div
      className={`rounded-card px-5 py-4 border ${
        acento ? "bg-accent/[0.06] border-accent/30" : "bg-surface border-border"
      }`}
    >
      <b
        className={`block text-[11px] font-bold tracking-[0.14em] uppercase mb-1.5 ${
          acento ? "text-accent" : "text-muted"
        }`}
      >
        {etiqueta}
      </b>
      <span className="text-[15px] text-white leading-relaxed">{conNegritas(texto)}</span>
    </div>
  );
}
