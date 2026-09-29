"use client";
import { createClient } from "@supabase/supabase-js";

// Cliente de navegador — usa la publishable/anon key (segura para exponer).
// NUNCA importar la secret key aquí.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
