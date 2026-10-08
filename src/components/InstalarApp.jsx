"use client";
import { useEffect, useState } from "react";
import { Download, Share, Sparkles, RotateCcw } from "lucide-react";

function esStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function esIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function yaVistoOInstalado() {
  try {
    return !!localStorage.getItem("cc_instalar_visto") || esStandalone();
  } catch {
    return false;
  }
}

// Captura el evento beforeinstallprompt lo antes posible (antes de que el
// usuario llegue a esta pantalla) — Chrome/Android solo lo dispara una vez
// por carga de página, si no lo agarramos aquí arriba se pierde.
export function useCapturaInstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  useEffect(() => {
    function onBeforeInstall(e) {
      e.preventDefault();
      setPrompt(e);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);
  return prompt;
}

// Pantalla obligatoria — sin "ahora no": no hay forma de seguir al Camino
// sin instalar (o confirmar que ya se instaló). Dos límites técnicos
// reales que hay que respetar aunque sea obligatorio:
// 1) iOS no tiene API para "instalar" ni para detectar si ya se hizo —
//    es 100% manual (Compartir → Agregar a pantalla de inicio), así que
//    el botón "Ya la agregué" confía en el usuario, no lo verifica.
// 2) Si el navegador nunca disparó beforeinstallprompt (Android/desktop
//    sin el evento — ya se instaló antes, o no cumple criterios, o un
//    navegador que no lo soporta), bloquear sin alternativa dejaría a
//    ese usuario sin poder entrar NUNCA — por eso hay un botón de
//    respaldo igual de "confío en ti" para ese caso específico.
export default function InstalarApp({ prompt, onTerminar }) {
  const [rechazado, setRechazado] = useState(false);
  const mostrarIOS = esIOS() && !esStandalone();

  async function instalar() {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      cerrar();
    } else {
      // Dismissed el diálogo nativo — no hay forma de re-lanzarlo a la
      // fuerza, así que se queda en esta pantalla y se le explica.
      setRechazado(true);
    }
  }

  function cerrar() {
    try { localStorage.setItem("cc_instalar_visto", "1"); } catch {}
    onTerminar();
  }

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col items-center justify-center px-8 gap-7 text-center">
      <div className="w-20 h-20 rounded-[22px] bg-accent/15 border-2 border-accent flex items-center justify-center">
        <Download size={32} className="text-accent" />
      </div>

      <div>
        <div className="flex items-center justify-center gap-1.5 text-accent mb-2">
          <Sparkles size={13} />
          <span className="text-[11px] font-bold tracking-[0.14em] uppercase">Paso obligatorio</span>
        </div>
        <h1 className="text-[24px] font-[800] tracking-[-0.03em] leading-tight">Instala NiroAcademy</h1>
        <p className="text-[13px] text-muted mt-2 max-w-[280px] mx-auto leading-relaxed">
          Para seguir, instala la app a tu pantalla de inicio — acceso directo, funciona sin conexión, y recibe recordatorios para no perder tu racha.
        </p>
      </div>

      <div className="w-full max-w-[320px] flex flex-col gap-3">
        {mostrarIOS ? (
          <>
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-muted uppercase tracking-wide">
              <span className="text-[14px]">🍎</span>
              En iPhone el proceso es distinto — es manual, no hay botón de un toque
            </div>
            <div className="rounded-card bg-surface border border-border px-4 py-3.5 text-left flex items-start gap-3">
              <Share size={16} className="text-accent shrink-0 mt-0.5" />
              <p className="text-[13px] text-white/90 leading-relaxed">
                Toca el botón <b>Compartir</b> de Safari y luego <b>"Agregar a pantalla de inicio"</b>.
              </p>
            </div>
            <button
              onClick={cerrar}
              className="w-full py-3.5 rounded-chip bg-accent text-black font-bold transition-transform active:scale-[0.98]"
            >
              Ya la agregué
            </button>
          </>
        ) : prompt ? (
          <>
            <button
              onClick={instalar}
              className="w-full py-3.5 rounded-chip bg-accent text-black font-bold transition-transform active:scale-[0.98]"
            >
              Instalar ahora
            </button>
            {rechazado && (
              <p className="text-[12px] text-[#FF3B5C] leading-relaxed flex items-center justify-center gap-1.5">
                <RotateCcw size={12} />
                Necesitas aceptar la instalación para continuar.
              </p>
            )}
          </>
        ) : (
          <>
            <div className="rounded-card bg-surface border border-border px-4 py-3.5 text-left">
              <p className="text-[13px] text-white/90 leading-relaxed">
                Busca <b>"Instalar app"</b> o <b>"Agregar a pantalla de inicio"</b> en el menú de tu navegador (⋮ o ⋯).
              </p>
            </div>
            <button
              onClick={cerrar}
              className="w-full py-3.5 rounded-chip bg-accent text-black font-bold transition-transform active:scale-[0.98]"
            >
              Ya la instalé
            </button>
          </>
        )}
      </div>
    </div>
  );
}
