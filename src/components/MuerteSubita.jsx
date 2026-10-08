"use client";
import { useState } from "react";
import { Flame } from "lucide-react";
import Ejercicio from "./ejercicios/Ejercicio";
import Mascota from "./Mascota";
import { PREGUNTAS } from "@/data/contenido";
import { sumarXp } from "@/lib/progreso";

function barajar(arr) {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Pantalla de invitación — se muestra una vez por cada múltiplo de 5 días
// de racha (ver el useEffect en page.js que la dispara). Repasar nunca
// cuesta corazones normalmente; esto es la excepción a propósito: un reto
// de alto riesgo para quien ya demostró constancia, con recompensa de XP
// real si sobrevive.
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
            Desbloqueaste <b className="text-white">Muerte Súbita</b>: preguntas al azar de todo lo que ya aprendiste. Un error y se acaba — pero cada pregunta correcta suma XP extra real.
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

// El reto en sí — junta preguntas de TODAS las lecciones ya completadas,
// revueltas, y las presenta una por una reusando el mismo dispatcher de
// los 10 estilos. Un fallo termina el reto de inmediato (no cuesta
// corazones reales — el riesgo es perder el progreso del reto, no vidas).
export default function MuerteSubita({ userId, completadas, onCerrar }) {
  const [preguntas] = useState(() => {
    const pool = [];
    for (const leccionId of completadas) {
      for (const p of PREGUNTAS[leccionId] || []) pool.push(p);
    }
    return barajar(pool).slice(0, 15);
  });
  const [idx, setIdx] = useState(0);
  const [terminado, setTerminado] = useState(false); // false | "muerto" | "sobrevivio"
  const [guardando, setGuardando] = useState(false);
  const [xpGanado, setXpGanado] = useState(0);

  async function continuar(ok) {
    if (!ok) {
      const xp = idx * 3; // 3 XP por cada pregunta sobrevivida antes del error
      setXpGanado(xp);
      setTerminado("muerto");
      if (xp > 0 && userId) { setGuardando(true); await sumarXp(userId, xp); setGuardando(false); }
      return;
    }
    if (idx + 1 >= preguntas.length) {
      const xp = preguntas.length * 3 + 20; // bono extra por sobrevivir todas
      setXpGanado(xp);
      setTerminado("sobrevivio");
      if (userId) { setGuardando(true); await sumarXp(userId, xp); setGuardando(false); }
      return;
    }
    setIdx((i) => i + 1);
  }

  if (!preguntas.length) {
    // Sin suficientes preguntas disponibles todavía (muy pocas lecciones
    // completadas) — se cierra solo, sin mostrar un reto vacío.
    onCerrar();
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] bg-bg flex flex-col">
      <div className="px-4 border-b border-border shrink-0" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="h-14 max-w-[480px] mx-auto flex items-center gap-3">
          <button onClick={onCerrar} className="text-muted text-xl leading-none px-1">✕</button>
          <div className="flex items-center gap-1.5 text-accent shrink-0">
            <Flame size={14} fill="currentColor" />
            <span className="text-[12px] font-bold">Muerte Súbita</span>
          </div>
          {!terminado && (
            <span className="ml-auto text-[12px] font-bold text-muted tabular-nums shrink-0">
              {idx + 1} / {preguntas.length}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 max-w-[480px] w-full mx-auto">
        {!terminado && <Ejercicio key={idx} pregunta={preguntas[idx]} onContinuar={continuar} />}

        {terminado === "muerto" && (
          <div className="flex flex-col items-center text-center gap-4 pt-16">
            <Mascota mood="triste" size={100} />
            <h1 className="text-[24px] font-[800]">Hasta aquí llegaste</h1>
            <p className="text-muted text-[15px]">
              Sobreviviste {idx} de {preguntas.length} preguntas
              {xpGanado > 0 && ` · +${xpGanado} XP`}
            </p>
            <button
              onClick={onCerrar}
              className="w-full py-3.5 rounded-chip bg-accent text-black font-bold mt-4"
            >
              Volver al curso
            </button>
          </div>
        )}

        {terminado === "sobrevivio" && (
          <div className="flex flex-col items-center text-center gap-4 pt-16">
            <Mascota mood="feliz" size={100} />
            <h1 className="text-[24px] font-[800]">¡Sobreviviste todo! 🏆</h1>
            <p className="text-muted text-[15px]">
              {preguntas.length} de {preguntas.length} correctas · +{xpGanado} XP
            </p>
            <button
              onClick={onCerrar}
              className="w-full py-3.5 rounded-chip bg-accent text-black font-bold mt-4"
            >
              Volver al curso
            </button>
          </div>
        )}

        {guardando && <p className="text-center text-muted text-sm mt-4">Guardando…</p>}
      </div>
    </div>
  );
}
