"use client";
import { useEffect, useRef, useState } from "react";
import { Flame, Heart } from "lucide-react";
import Ejercicio from "./ejercicios/Ejercicio";
import Mascota from "./Mascota";
import { PREGUNTAS } from "@/data/contenido";
import { sumarXp, ajustarCorazones } from "@/lib/progreso";

const SEGUNDOS_POR_PREGUNTA = 12;

function barajar(arr) {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Pantalla de invitación — se muestra una vez por cada múltiplo de 5 días
// de racha (ver el useEffect en page.js que la dispara).
export function InvitacionMuerteSubita({ racha, onAceptar, onRechazar }) {
  return (
    <div className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm flex items-center justify-center p-5">
      <div className="w-full max-w-[340px] rounded-card bg-surface border-2 border-accent/40 px-7 py-9 flex flex-col items-center text-center gap-5">
        <div className="flex items-center gap-2 text-accent">
          <Flame size={22} fill="currentColor" />
          <span className="text-[26px] font-[800] tabular-nums">{racha}</span>
          <Flame size={22} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-[21px] font-[800] leading-tight">¡Racha de {racha} días! 🔥</h1>
          <p className="text-[13px] text-muted leading-relaxed mt-2">
            Desbloqueaste <b className="text-white">Muerte Súbita</b>: preguntas al azar de todo lo que ya aprendiste, {SEGUNDOS_POR_PREGUNTA}s cada una. Usa tus corazones reales — si los pierdes todos, el reto se acaba ahí. Una vez dentro, no hay vuelta atrás hasta terminarlo.
          </p>
        </div>
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onAceptar}
            className="w-full py-3.5 rounded-chip bg-accent text-black font-bold transition-transform active:scale-[0.98]"
          >
            Aceptar el reto
          </button>
          <button
            onClick={onRechazar}
            className="w-full py-3 text-muted text-[13px] font-bold transition-transform active:scale-[0.98]"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}

// El reto — usa los MISMOS 3 corazones de todo el juego (no un conteo
// aparte): cada error o cada timer agotado cuesta un corazón real vía la
// misma RPC que usa Practica.jsx. Si llegan a 0, el reto termina ahí
// mismo — el riesgo es real, no cosmético. Sin botón de cerrar mientras
// está en curso: una vez aceptado, se compromete hasta perder o sobrevivir
// todo el pool. onCerrar solo se llama al terminar (perdió o sobrevivió),
// nunca antes.
export default function MuerteSubita({ userId, completadas, corazonesIniciales = 3, corazonPerdidoEnInicial = null, onCerrar }) {
  const [preguntas] = useState(() => {
    const pool = [];
    for (const leccionId of completadas) {
      for (const p of PREGUNTAS[leccionId] || []) pool.push(p);
    }
    return barajar(pool).slice(0, 15);
  });
  const [idx, setIdx] = useState(0);
  const [correctas, setCorrectas] = useState(0);
  const [terminado, setTerminado] = useState(false); // false | "perdio" | "sobrevivio"
  const [guardando, setGuardando] = useState(false);
  const [xpGanado, setXpGanado] = useState(0);
  const [corazonesLocal, setCorazonesLocal] = useState(corazonesIniciales);
  const [corazonPerdidoEnLocal, setCorazonPerdidoEnLocal] = useState(corazonPerdidoEnInicial);
  const [segundosLeft, setSegundosLeft] = useState(SEGUNDOS_POR_PREGUNTA);
  const procesandoRef = useRef(false);

  // Timer por pregunta — separado en dos efectos a propósito: el
  // cronómetro en sí (puro, solo cuenta) y el disparo de continuar(false)
  // cuando llega a 0 (efecto aparte). Llamarlo directo dentro del
  // actualizador de setSegundosLeft podía duplicarse con el modo estricto
  // de desarrollo de React (que invoca updaters dos veces a propósito) y
  // costar 2 corazones por un solo timeout — procesandoRef igual lo
  // protege, pero así ni siquiera depende de esa guarda.
  useEffect(() => {
    if (terminado) return;
    setSegundosLeft(SEGUNDOS_POR_PREGUNTA);
    const id = setInterval(() => {
      setSegundosLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [idx, terminado]);

  useEffect(() => {
    if (segundosLeft === 0 && !terminado) continuar(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segundosLeft]);

  async function continuar(ok) {
    if (procesandoRef.current || terminado) return;
    procesandoRef.current = true;

    const correctasFinal = ok ? correctas + 1 : correctas;
    if (ok) setCorrectas(correctasFinal);

    if (!ok) {
      const real = userId ? await ajustarCorazones(userId, -1) : null;
      const restantes = real ? real.corazones : Math.max(0, corazonesLocal - 1);
      setCorazonesLocal(restantes);
      if (real?.corazon_perdido_en) setCorazonPerdidoEnLocal(real.corazon_perdido_en);

      if (restantes <= 0) {
        const xp = correctasFinal * 3;
        setXpGanado(xp);
        setTerminado("perdio");
        if (xp > 0 && userId) { setGuardando(true); await sumarXp(userId, xp); setGuardando(false); }
        procesandoRef.current = false;
        return;
      }
    }

    // Sigue habiendo corazones (o acertó) — avanza, o termina si ya no
    // quedan más preguntas en el pool.
    if (idx + 1 >= preguntas.length) {
      const xp = correctasFinal * 3 + (correctasFinal === preguntas.length ? 20 : 0);
      setXpGanado(xp);
      setTerminado("sobrevivio");
      if (userId) { setGuardando(true); await sumarXp(userId, xp); setGuardando(false); }
    } else {
      setIdx((i) => i + 1);
    }
    procesandoRef.current = false;
  }

  function salir() {
    onCerrar({ corazones: corazonesLocal, corazonPerdidoEn: corazonPerdidoEnLocal });
  }

  if (!preguntas.length) {
    onCerrar(null);
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] bg-bg flex flex-col">
      <div className="px-4 border-b border-border shrink-0" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="h-14 max-w-[480px] mx-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-accent shrink-0">
            <Flame size={14} fill="currentColor" />
            <span className="text-[12px] font-bold">Muerte Súbita</span>
          </div>
          {!terminado && (
            <>
              <div className="flex items-center gap-1 ml-auto shrink-0">
                {[0, 1, 2].map((i) => (
                  <Heart
                    key={i}
                    size={15}
                    className={i < corazonesLocal ? "text-[#FF3B5C]" : "text-[#3A3A3E]"}
                    fill={i < corazonesLocal ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <span className={`text-[13px] font-[800] tabular-nums shrink-0 ${segundosLeft <= 4 ? "text-[#FF3B5C]" : "text-white"}`}>
                {segundosLeft}s
              </span>
            </>
          )}
        </div>
        {!terminado && (
          <div className="max-w-[480px] mx-auto h-1 rounded-full bg-surface overflow-hidden mb-2">
            <div
              className={`h-full transition-all ${segundosLeft <= 4 ? "bg-[#FF3B5C]" : "bg-accent"}`}
              style={{ width: `${(segundosLeft / SEGUNDOS_POR_PREGUNTA) * 100}%`, transitionDuration: "1s", transitionTimingFunction: "linear" }}
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 max-w-[480px] w-full mx-auto">
        {!terminado && <Ejercicio key={idx} pregunta={preguntas[idx]} onContinuar={continuar} />}

        {terminado === "perdio" && (
          <div className="flex flex-col items-center text-center gap-4 pt-16">
            <Mascota mood="triste" size={100} />
            <h1 className="text-[24px] font-[800]">Te quedaste sin corazones</h1>
            <p className="text-muted text-[15px]">
              {correctas} de {preguntas.length} correctas
              {xpGanado > 0 && ` · +${xpGanado} XP`}
            </p>
            <p className="text-[12px] text-muted max-w-[280px] leading-relaxed">
              Tus 3 corazones se recargan solos con el tiempo, igual que en el resto del curso.
            </p>
            <button onClick={salir} className="w-full py-3.5 rounded-chip bg-accent text-black font-bold mt-4">
              Volver al curso
            </button>
          </div>
        )}

        {terminado === "sobrevivio" && (
          <div className="flex flex-col items-center text-center gap-4 pt-16">
            <Mascota mood="feliz" size={100} />
            <h1 className="text-[24px] font-[800]">
              {correctas === preguntas.length ? "¡Sobreviviste todo! 🏆" : "¡Llegaste al final!"}
            </h1>
            <p className="text-muted text-[15px]">
              {correctas} de {preguntas.length} correctas · +{xpGanado} XP
            </p>
            <button onClick={salir} className="w-full py-3.5 rounded-chip bg-accent text-black font-bold mt-4">
              Volver al curso
            </button>
          </div>
        )}

        {guardando && <p className="text-center text-muted text-sm mt-4">Guardando…</p>}
      </div>
    </div>
  );
}
