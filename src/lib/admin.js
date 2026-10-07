"use client";
import { supabase } from "./supabaseClient";

// profiles y perfil_privado viven separadas a propósito (el correo es
// privado, profiles es legible por cualquiera para el Ranking) — como no
// hay una FK directa entre ellas, no se pueden traer en una sola consulta
// con el embedding normal de PostgREST; se piden aparte y se juntan aquí
// por id. perfil_privado_select_admin (nueva policy) es lo que permite que
// un admin real lea todos los correos, no solo el suyo.
export async function cargarTodosLosUsuarios() {
  const [{ data: perfiles, error: errPerfiles }, { data: correos, error: errCorreos }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("perfil_privado").select("id, email"),
  ]);
  if (errPerfiles) { console.warn("cargarTodosLosUsuarios:", errPerfiles.message); return []; }
  if (errCorreos) console.warn("cargarTodosLosUsuarios (correos):", errCorreos.message);

  const correoPorId = new Map((correos || []).map((c) => [c.id, c.email]));
  return (perfiles || []).map((p) => ({ ...p, email: correoPorId.get(p.id) || null }));
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
