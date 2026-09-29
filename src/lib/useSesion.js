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

    return () => {
      activo = false;
      sub.subscription.unsubscribe();
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
