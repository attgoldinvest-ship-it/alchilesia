"use client";
import { useState } from "react";
import { Mail, Heart, Flame, Gem, Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { AVATARES, urlAvatar } from "@/lib/avatares";

const INSTRUCCIONES = [
  { Icono: Heart, texto: "3 corazones. Pierdes 1 por error, se recargan solos cada 30 min." },
  { Icono: Gem, texto: "Ganas XP por cada lección completada — más si aciertas a la primera." },
  { Icono: Flame, texto: "Entra seguido para mantener tu racha — se rompe si dejas un día en blanco." },
];

// Tarjeta de bienvenida — se muestra una sola vez, tras el primer login real,
// mientras profiles.nombre siga en el default "Estudiante". Orden a
// propósito: 1) instrucciones, 2) alias (público, Ranking), 3) foto.
// Guarda nombre+avatar en profiles y el correo (privado) en perfil_privado.
export default function NombreUsuario({ userId, email, sugerido, onGuardado }) {
  const [valor, setValor] = useState(sugerido || "");
  const [avatar, setAvatar] = useState(AVATARES[0]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function guardar(e) {
    e.preventDefault();
    const limpio = valor.trim();
    if (limpio.length < 3 || limpio.length > 20) {
      setError("Entre 3 y 20 caracteres.");
      return;
    }
    setGuardando(true);
    setError("");

    const [r1, r2] = await Promise.all([
      supabase.from("profiles").update({ nombre: limpio, avatar }).eq("id", userId),
      email ? supabase.from("perfil_privado").upsert({ id: userId, email }) : Promise.resolve({ error: null }),
    ]);

    setGuardando(false);
    if (r1.error || r2.error) {
      setError("No se pudo guardar, intenta de nuevo.");
      return;
    }
    onGuardado({ nombre: limpio, avatar });
  }

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col items-center px-8 gap-8 text-center overflow-y-auto py-12">
      <div>
        <h1 className="text-[26px] font-[800] tracking-[-0.03em]">¡Bienvenido!</h1>
        <p className="text-[13px] text-muted mt-2 max-w-[280px] mx-auto leading-relaxed">
          Antes de arrancar, esto es lo que necesitas saber:
        </p>
      </div>

      <div className="w-full max-w-[320px] flex flex-col gap-3">
        {INSTRUCCIONES.map(({ Icono, texto }, i) => (
          <div key={i} className="flex items-start gap-3 rounded-card bg-surface border border-border px-4 py-3.5 text-left">
            <Icono size={15} className="text-accent shrink-0 mt-0.5" />
            <span className="text-[12px] text-muted leading-relaxed">{texto}</span>
          </div>
        ))}
      </div>

      <div className="w-full max-w-[320px] h-px bg-border" />

      <form onSubmit={guardar} className="w-full max-w-[320px] flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <input
            autoFocus
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            maxLength={20}
            placeholder="Tu nombre de usuario"
            className="w-full py-3.5 px-4 rounded-chip bg-surface border-2 border-border focus:border-accent outline-none text-center font-semibold"
          />
          <p className="text-[11px] text-muted">Este es el que van a ver los demás en el Ranking.</p>
        </div>

        {email && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-chip bg-surface border border-border text-left">
            <Mail size={15} className="text-muted shrink-0" />
            <span className="text-[13px] text-muted truncate">{email}</span>
          </div>
        )}

        <div className="text-left">
          <p className="text-[11px] font-bold tracking-[0.14em] text-accent uppercase mb-3">Elige tu foto</p>
          <div className="grid grid-cols-5 gap-2.5">
            {AVATARES.map((a) => {
              const activo = a === avatar;
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all active:scale-90 ${
                    activo ? "border-accent scale-95" : "border-border"
                  }`}
                >
                  <img src={urlAvatar(a)} alt="" className="w-full h-full object-cover" />
                  {activo && (
                    <span className="absolute inset-0 bg-accent/25 flex items-center justify-center">
                      <Check size={16} className="text-white drop-shadow" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-[12px] text-[#FF3B5C] -mt-2">{error}</p>}

        <button
          type="submit"
          disabled={guardando || valor.trim().length < 3}
          className="w-full py-3.5 rounded-chip bg-accent text-black font-bold transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
        >
          {guardando ? "Guardando…" : "Empezar"}
        </button>
      </form>
    </div>
  );
}
