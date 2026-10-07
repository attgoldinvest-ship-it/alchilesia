"use client";
import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";

function esStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function esIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

// Banner de instalación — captura el prompt nativo de Chrome/Edge/Android, y
// muestra instrucciones manuales en iOS (Safari no dispara beforeinstallprompt).
export default function InstalarApp() {
  const [prompt, setPrompt] = useState(null);
  const [mostrarIOS, setMostrarIOS] = useState(false);
  const [cerrado, setCerrado] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem("cc_instalar_visto") || esStandalone()) return;
    } catch {}

    function onBeforeInstall(e) {
      e.preventDefault();
      setPrompt(e);
      setCerrado(false);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    if (esIOS() && !esStandalone()) {
      setMostrarIOS(true);
      setCerrado(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  function cerrar() {
    setCerrado(true);
    try { localStorage.setItem("cc_instalar_visto", "1"); } catch {}
  }

  async function instalar() {
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice;
    cerrar();
  }

  if (cerrado || (!prompt && !mostrarIOS)) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 max-w-[440px] mx-auto">
      <div className="rounded-card bg-surface border-2 border-accent/40 px-4 py-3.5 flex items-center gap-3 shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
        <div className="w-10 h-10 shrink-0 rounded-xl bg-accent/15 border border-accent flex items-center justify-center">
          <Download size={18} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold">Instala NiroAcademy</p>
          {mostrarIOS ? (
            <p className="text-[11px] text-muted leading-snug">
              Toca <Share size={11} className="inline -mt-0.5" /> y luego "Agregar a pantalla de inicio"
            </p>
          ) : (
            <p className="text-[11px] text-muted">Acceso directo, funciona sin conexión</p>
          )}
        </div>
        {!mostrarIOS && (
          <button onClick={instalar} className="shrink-0 px-3 py-2 rounded-chip bg-accent text-black text-[12px] font-bold transition-transform active:scale-95">
            Instalar
          </button>
        )}
        <button onClick={cerrar} className="shrink-0 text-muted transition-transform active:scale-90">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
