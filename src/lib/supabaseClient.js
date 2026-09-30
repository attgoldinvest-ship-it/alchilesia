"use client";
import { createClient } from "@supabase/supabase-js";

// Cliente de navegador — usa la publishable/anon key (segura para exponer).
// NUNCA importar la secret key aquí.
// Opciones de auth explícitas (mismo default de la librería, pero fijado a
// propósito): persiste la sesión en localStorage y la refresca sola. El
// refresco automático se complementa con startAutoRefresh()/stopAutoRefresh()
// en useSesion.js, atado a la visibilidad de la pestaña/app — necesario en
// PWA porque el sistema pausa los timers en segundo plano.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
