"use client";
import { supabase } from "./supabaseClient";

export async function cargarRanking(limite = 10) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nombre, xp, racha, avatar")
    .order("xp", { ascending: false })
    .order("created_at", { ascending: true }) // desempate: quien llegó primero a ese XP
    .limit(limite);
  if (error) { console.warn("cargarRanking:", error.message); return []; }
  return data;
}
