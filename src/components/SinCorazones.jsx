"use client";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

function tiempoRestante(corazonPerdidoEn, recargaMin) {
  if (!corazonPerdidoEn) return null;
  const msPorVida = recargaMin * 60 * 1000;
  const pasado = Date.now() - new Date(corazonPerdidoEn).getTime();
  const falta = msPorVida - (pasado % msPorVida);
  const m = Math.floor(falta / 60000);
  const s = Math.floor((falta % 60000) / 1000);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Modal de bloqueo — se muestra tanto al intentar abrir una lección nueva
// sin corazones, como en medio de una práctica cuando se pierde el último.
// En ambos casos cierra hacia el Camino; repasar lecciones ya completadas
// sigue disponible porque eso nunca cuesta corazones.
// Contador en vivo + los 3 corazones apagados con pulso — a propósito para
// que se sienta la urgencia de volver, mismo mecanismo que Duolingo.
export default function SinCorazones({ corazonPerdidoEn, recargaMin = 5, onCerrar }) {
  const [restante, setRestante] = useState(() => tiempoRestante(corazonPerdidoEn, recargaMin));

  useEffect(() => {
    const id = setInterval(() => setRestante(tiempoRestante(corazonPerdidoEn, recargaMin)), 1000);
    return () => clearInterval(id);
  }, [corazonPerdidoEn, recargaMin]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-5">
      <div className="w-full max-w-[340px] rounded-card bg-surface border-2 border-[#FF3B5C]/40 px-7 py-9 flex flex-col items-center text-center gap-5">
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <Heart key={i} size={30} className="text-[#3A3A3E] pulso-urgente" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>

        <div>
          <h1 className="text-[21px] font-[800] leading-tight">Te quedaste sin corazones</h1>
          <p className="text-[13px] text-muted leading-relaxed mt-2">
            Perdiste tus 3 corazones. Se recargan solos, 1 cada {recargaMin} minutos.
          </p>
        </div>

        {restante && (
          <div className="flex flex-col items-center gap-1 rounded-chip bg-bg border border-[#FF3B5C]/30 px-6 py-3 w-full">
            <span className="text-[10px] font-bold tracking-[0.14em] text-muted uppercase">Próximo corazón en</span>
            <span className="text-[26px] font-[800] text-[#FF3B5C] tabular-nums leading-none">{restante}</span>
          </div>
        )}

        <p className="text-[12px] text-muted leading-relaxed">
          Mientras esperas, puedes repasar lecciones que ya completaste — eso nunca cuesta corazones.
        </p>

        <button
          onClick={onCerrar}
          className="w-full py-3 rounded-chip bg-accent text-black font-bold transition-transform active:scale-[0.98]"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
