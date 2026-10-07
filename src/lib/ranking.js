"use client";
import { supabase } from "./supabaseClient";

// Excluye perfiles que nunca terminaron la tarjeta de bienvenida (alias
// obligatorio) — se quedan con el nombre default "Estudiante" si alguien
// cierra la app antes de completar ese paso único. Sin este filtro,
// aparecían en el Ranking con 0 XP, ensuciando la lista con cuentas que
// nunca llegaron a jugar nada.
export async function cargarRanking(limite = 10) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nombre, xp, racha, avatar")
    .neq("nombre", "Estudiante")
    .order("xp", { ascending: false })
    .order("created_at", { ascending: true }) // desempate: quien llegó primero a ese XP
    .limit(limite);
  if (error) { console.warn("cargarRanking:", error.message); return []; }
  return data;
}
