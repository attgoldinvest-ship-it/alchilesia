"use client";
import { useState } from "react";
import { Mail, Heart, Flame, Gem, Check, ArrowLeft, Shuffle, Skull } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { AVATARES, urlAvatar } from "@/lib/avatares";
import Mascota from "./Mascota";

const INSTRUCCIONES = [
  { Icono: Heart, color: "#FF3B5C", texto: "3 corazones. Pierdes 1 por error, se recargan solos cada 5 min." },
  { Icono: Gem, color: "#4CC9F0", texto: "Ganas XP por cada lección completada — más si aciertas a la primera." },
  { Icono: Flame, color: "#FF6B2D", texto: "Entra seguido para mantener tu racha — se rompe si dejas un día en blanco." },
  { Icono: Skull, color: "#9A6CFF", texto: "¡Nuevo! Cada 5 días de racha desbloqueas Muerte Súbita: preguntas contrarreloj con tus corazones reales en juego." },
];

const PASOS = ["reglas", "alias", "foto"];

// Tarjeta de bienvenida — se muestra una sola vez, tras el primer login real,
// mientras profiles.nombre siga en el default "Estudiante". Wizard de 3
// pasos (reglas → alias → foto) en vez de una sola pantalla larga con
// scroll — cada paso se ve completo sin desplazarse, y valida antes de
// dejar avanzar. Guarda nombre+avatar en profiles y el correo (privado)
// en perfil_privado, todo junto hasta el final.
export default function NombreUsuario({ userId, email, sugerido, onGuardado }) {
  const [paso, setPaso] = useState(0);
  const [valor, setValor] = useState(sugerido || "");
  const [avatar, setAvatar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const limpio = valor.trim();
  const aliasValido = limpio.length >= 3 && limpio.length <= 20;

  function siguiente() {
    if (paso === 1 && !aliasValido) {
      setError("Entre 3 y 20 caracteres.");
      return;
    }
    setError("");
    setPaso((p) => Math.min(p + 1, PASOS.length - 1));
  }

  function atras() {
    setError("");
    setPaso((p) => Math.max(p - 1, 0));
  }

  function avatarAleatorio() {
    const otros = AVATARES.filter((a) => a !== avatar);
    setAvatar(otros[Math.floor(Math.random() * otros.length)]);
  }

  async function guardar() {
    if (!aliasValido) { setPaso(1); setError("Entre 3 y 20 caracteres."); return; }
    setGuardando(true);
    setError("");

    const avatarFinal = avatar || AVATARES[0];
    const [r1, r2] = await Promise.all([
      supabase.from("profiles").update({ nombre: limpio, avatar: avatarFinal }).eq("id", userId),
      email ? supabase.from("perfil_privado").upsert({ id: userId, email }) : Promise.resolve({ error: null }),
    ]);

    setGuardando(false);
    if (r1.error || r2.error) {
      setError("No se pudo guardar, intenta de nuevo.");
      return;
    }
    onGuardado({ nombre: limpio, avatar: avatarFinal });
  }

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col px-8 py-10 overflow-y-auto">
      {/* Barra de progreso — 3 tramos, se llenan según el paso actual. */}
      <div className="w-full max-w-[320px] mx-auto flex items-center gap-2 shrink-0">
        {paso > 0 ? (
          <button onClick={atras} className="text-muted p-1 -ml-1 shrink-0 transition-transform active:scale-90">
            <ArrowLeft size={18} />
          </button>
        ) : (
          <div className="w-6 shrink-0" />
        )}
        <div className="flex-1 flex gap-1.5">
          {PASOS.map((p, i) => (
            <div key={p} className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: i <= paso ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>
        <div className="w-6 shrink-0" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 text-center fade-in" key={paso}>
        {paso === 0 && (
          <>
            <Mascota mood="hablando" size={88} />
            <div>
              <h1 className="text-[26px] font-[800] tracking-[-0.03em]">¡Bienvenido!</h1>
              <p className="text-[13px] text-muted mt-2 max-w-[280px] mx-auto leading-relaxed">
                Antes de arrancar, esto es lo que necesitas saber:
              </p>
            </div>
            <div className="w-full max-w-[320px] flex flex-col gap-3">
              {INSTRUCCIONES.map(({ Icono, color, texto }, i) => (
                <div key={i} className="flex items-start gap-3 rounded-card bg-surface border border-border px-4 py-3.5 text-left">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `${color}22` }}
                  >
                    <Icono size={15} style={{ color }} fill={color} />
                  </div>
                  <span className="text-[13px] text-white/90 leading-relaxed pt-1">{texto}</span>
                </div>
              ))}
            </div>
            <button
              onClick={siguiente}
              className="w-full max-w-[320px] py-3.5 rounded-chip bg-accent text-black font-bold transition-transform active:scale-[0.98]"
            >
              Entendido
            </button>
          </>
        )}

        {paso === 1 && (
          <>
            <div>
              <h1 className="text-[24px] font-[800] tracking-[-0.03em]">¿Cómo te llamamos?</h1>
              <p className="text-[13px] text-muted mt-2 max-w-[280px] mx-auto leading-relaxed">
                Este es el nombre que van a ver los demás en el Ranking.
              </p>
            </div>
            <div className="w-full max-w-[320px] flex flex-col gap-2">
              <div className="relative">
                <input
                  autoFocus
                  value={valor}
                  onChange={(e) => { setValor(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && siguiente()}
                  maxLength={20}
                  placeholder="Tu nombre de usuario"
                  className={`w-full py-3.5 pl-4 pr-11 rounded-chip bg-surface border-2 outline-none text-center font-semibold transition-colors ${
                    error ? "border-[#FF3B5C]" : aliasValido ? "border-accent" : "border-border focus:border-white/30"
                  }`}
                />
                {aliasValido && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                    <Check size={12} className="text-black" />
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between px-1">
                <p className={`text-[11px] ${error ? "text-[#FF3B5C]" : "text-muted"}`}>
                  {error || "Entre 3 y 20 caracteres"}
                </p>
                <p className="text-[11px] text-muted tabular-nums">{limpio.length}/20</p>
              </div>

              {email && (
                <div className="flex items-center gap-2.5 px-4 py-3 mt-2 rounded-chip bg-surface border border-border text-left">
                  <Mail size={15} className="text-muted shrink-0" />
                  <span className="text-[13px] text-muted truncate">{email}</span>
                </div>
              )}
            </div>
            <button
              onClick={siguiente}
              disabled={!aliasValido}
              className="w-full max-w-[320px] py-3.5 rounded-chip bg-accent text-black font-bold transition-transform active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
            >
              Siguiente
            </button>
          </>
        )}

        {paso === 2 && (
          <>
            <div>
              <h1 className="text-[24px] font-[800] tracking-[-0.03em]">Elige tu foto</h1>
              <p className="text-[13px] text-muted mt-2 max-w-[280px] mx-auto leading-relaxed">
                Así te van a ver en el Ranking y tu Perfil. Puedes cambiarla después.
              </p>
            </div>
            <div className="w-full max-w-[320px] flex flex-col gap-3">
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
              <button
                type="button"
                onClick={avatarAleatorio}
                className="self-center flex items-center gap-1.5 text-[12px] text-muted font-semibold py-1.5 px-3 transition-transform active:scale-95"
              >
                <Shuffle size={12} />
                Sorpréndeme
              </button>
            </div>

            {error && <p className="text-[12px] text-[#FF3B5C]">{error}</p>}

            <button
              onClick={guardar}
              disabled={guardando}
              className="w-full max-w-[320px] py-3.5 rounded-chip bg-accent text-black font-bold transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {guardando ? "Guardando…" : "Empezar"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
