"use client";
import { useEffect, useState } from "react";
import { Download, Share, Sparkles } from "lucide-react";

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

// Pantalla completa — a propósito como paso obligatorio del flujo (antes
// era un banner chico, fácil de ignorar) justo después de completar el
// alias/onboarding y antes de entrar al Camino, una sola vez por
// dispositivo. "Ahora no" sigue disponible — nunca bloquea el acceso al
// curso, solo pide la decisión una vez con más presencia.
export default function InstalarApp({ prompt, onTerminar }) {
  const mostrarIOS = esIOS() && !esStandalone();

  async function instalar() {
    if (prompt) {
      prompt.prompt();
      await prompt.userChoice;
    }
    cerrar();
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
          <span className="text-[11px] font-bold tracking-[0.14em] uppercase">Recomendado</span>
        </div>
        <h1 className="text-[24px] font-[800] tracking-[-0.03em] leading-tight">Instala NiroAcademy</h1>
        <p className="text-[13px] text-muted mt-2 max-w-[280px] mx-auto leading-relaxed">
          Acceso directo desde tu pantalla de inicio, funciona sin conexión, y recibe recordatorios para no perder tu racha.
        </p>
      </div>

      <div className="w-full max-w-[320px] flex flex-col gap-3">
        {mostrarIOS ? (
          <div className="rounded-card bg-surface border border-border px-4 py-3.5 text-left flex items-start gap-3">
            <Share size={16} className="text-accent shrink-0 mt-0.5" />
            <p className="text-[13px] text-white/90 leading-relaxed">
              Toca el botón <b>Compartir</b> de Safari y luego <b>"Agregar a pantalla de inicio"</b>.
            </p>
          </div>
        ) : (
          <button
            onClick={instalar}
            className="w-full py-3.5 rounded-chip bg-accent text-black font-bold transition-transform active:scale-[0.98]"
          >
            Instalar ahora
          </button>
        )}
        <button
          onClick={cerrar}
          className="w-full py-3 text-muted text-[13px] font-bold transition-transform active:scale-[0.98]"
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}
