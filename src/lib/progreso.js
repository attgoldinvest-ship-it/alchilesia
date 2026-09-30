"use client";
import { supabase } from "./supabaseClient";

// Trae todas las filas de progreso del usuario, como Map<leccionId, fila>.
export async function cargarProgreso(userId) {
  const { data, error } = await supabase.from("progreso").select("*").eq("user_id", userId);
  if (error) { console.warn("cargarProgreso:", error.message); return new Map(); }
  return new Map(data.map((f) => [f.leccion_id, f]));
}

// Guarda el resultado de un intento. Solo cuenta como "completada" (y por
// lo tanto desbloquea el siguiente nodo) si acertó TODAS las preguntas —
// si falló aunque sea una, el nodo se queda disponible para reintentar,
// no avanza el camino.
export async function guardarProgreso(userId, leccionId, { correctas, total }) {
  const { error } = await supabase.from("progreso").upsert(
    { user_id: userId, leccion_id: leccionId, completada: correctas === total, correctas, total, updated_at: new Date().toISOString() },
    { onConflict: "user_id,leccion_id" }
  );
  if (error) console.warn("guardarProgreso:", error.message);
}

export async function cargarPerfil(userId) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) { console.warn("cargarPerfil:", error.message); return null; }
  return data;
}

export async function sumarXp(userId, xp) {
  const { error } = await supabase.rpc("sumar_xp", { uid: userId, monto: xp });
  if (error) console.warn("sumarXp:", error.message);
}

export async function ajustarCorazones(userId, delta) {
  const { error } = await supabase.rpc("ajustar_corazones", { uid: userId, delta });
  if (error) console.warn("ajustarCorazones:", error.message);
}

export async function registrarActividad(userId) {
  const { error } = await supabase.rpc("registrar_actividad", { uid: userId });
  if (error) console.warn("registrarActividad:", error.message);
}

export async function regenerarCorazones(userId, recargaMin = 5) {
  const { error } = await supabase.rpc("regenerar_corazones", { uid: userId, recarga_min: recargaMin });
  if (error) console.warn("regenerarCorazones:", error.message);
}
