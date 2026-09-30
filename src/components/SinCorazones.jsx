"use client";
import { Heart } from "lucide-react";

// Modal de bloqueo — se muestra tanto al intentar abrir una lección nueva
// sin corazones, como en medio de una práctica cuando se pierde el último.
// En ambos casos cierra hacia el Camino; repasar lecciones ya completadas
// sigue disponible porque eso nunca cuesta corazones.
export default function SinCorazones({ recargaMin = 5, onCerrar }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-5">
      <div className="w-full max-w-[340px] rounded-card bg-surface border-2 border-[#FF3B5C]/40 px-7 py-9 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#FF3B5C]/15 border-2 border-[#FF3B5C] flex items-center justify-center">
          <Heart size={28} className="text-[#FF3B5C]" fill="currentColor" />
        </div>
        <h1 className="text-[20px] font-[800] leading-tight">Te quedaste sin corazones</h1>
        <p className="text-[13px] text-muted leading-relaxed">
          Perdiste tus 3 corazones. Se recargan solos, 1 cada {recargaMin} minutos — o repasa lecciones que ya completaste mientras esperas, eso nunca cuesta corazones.
        </p>
        <button
          onClick={onCerrar}
          className="w-full py-3 rounded-chip bg-accent text-black font-bold mt-2 transition-transform active:scale-[0.98]"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
