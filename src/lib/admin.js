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
