"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// Sesión real de Supabase: login obligatorio con Google, sin modo invitado
// (decisión explícita del producto: solo usuarios logueados).
export function useSesion() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (activo) {
        setUsuario(session?.user ?? null);
        setCargando(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (activo) setUsuario(session?.user ?? null);
    });

    // En una PWA, el sistema operativo pausa los timers de la pestaña/app
    // en segundo plano — incluido el que Supabase usa para refrescar el
    // token automáticamente. Si vuelves después de que el token ya venció
    // (típico al reabrir la PWA tras un rato), eso podía leerse como
    // "sesión cerrada" sin que realmente lo estuviera. startAutoRefresh()
    // es el patrón recomendado por Supabase para apps móviles/PWA: se
    // detiene en segundo plano (ahorra batería) y se reactiva —forzando
    // un refresh si hace falta— apenas la app vuelve a primer plano.
    function alCambiarVisibilidad() {
      if (document.visibilityState === "visible") {
        supabase.auth.startAutoRefresh();
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (activo) setUsuario(session?.user ?? null);
        });
      } else {
        supabase.auth.stopAutoRefresh();
      }
    }
    document.addEventListener("visibilitychange", alCambiarVisibilidad);

    return () => {
      activo = false;
      sub.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
    };
  }, []);

  async function continuarConGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) console.warn("Error de login con Google:", error.message);
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
  }

  return { usuario, cargando, continuarConGoogle, cerrarSesion };
}
