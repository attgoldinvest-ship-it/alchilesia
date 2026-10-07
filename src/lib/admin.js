"use client";
import { supabase } from "./supabaseClient";

export async function cargarTodosLosUsuarios() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.warn("cargarTodosLosUsuarios:", error.message); return []; }
  return data;
}

// Borra la cuenta completa de un usuario (auth + profiles + progreso +
// push_subscriptions + perfil_privado, todo en cascada vía el endpoint
// server-side — requiere la secret key, nunca expuesta al navegador).
// Irreversible.
export async function eliminarUsuario(userId) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, motivo: "sin-sesion" };
  try {
    const res = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ userId }),
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, motivo: json.error || `HTTP ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, motivo: e?.message || String(e) };
  }
}
