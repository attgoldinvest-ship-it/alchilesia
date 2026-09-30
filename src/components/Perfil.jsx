"use client";
import { useState } from "react";
import { Flame, Gem, Heart, Medal, Trophy, Lock, LogOut, Bell, Shield } from "lucide-react";
import Link from "next/link";
import { activarNotificaciones, soportaPush } from "@/lib/push";
import { urlAvatar } from "@/lib/avatares";

const RECARGA_MIN = 5;

function proximoCorazonTexto(perfil) {
  if (!perfil || perfil.corazones >= 3 || !perfil.corazon_perdido_en) return null;
  const msPorVida = RECARGA_MIN * 60 * 1000;
  const pasado = Date.now() - new Date(perfil.corazon_perdido_en).getTime();
  const falta = msPorVida - (pasado % msPorVida);
  const m = Math.floor(falta / 60000);
  const s = Math.floor((falta % 60000) / 1000);
  return `+1 en ${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Perfil({ perfil, userId, onVerCertificado, onCerrarSesion, certificadosGanados }) {
  const [notifEstado, setNotifEstado] = useState("idle"); // idle | pidiendo | on | off
  const proximo = proximoCorazonTexto(perfil);

  async function activarNotifs() {
    if (!userId || notifEstado === "pidiendo") return;
    setNotifEstado("pidiendo");
    const r = await activarNotificaciones(userId);
    setNotifEstado(r.ok ? "on" : "off");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 pt-4">
        <div className="w-16 h-16 rounded-full bg-accent/15 border-2 border-accent flex items-center justify-center text-2xl font-[800] text-accent overflow-hidden">
          {perfil?.avatar ? (
            <img src={urlAvatar(perfil.avatar)} alt="" className="w-full h-full object-cover" />
          ) : (
            (perfil?.nombre || "E")[0].toUpperCase()
          )}
        </div>
        <p className="font-bold text-[16px]">{perfil?.nombre || "Estudiante"}</p>
        <p className="text-[11px] text-muted">Cuenta con Google</p>
      </div>

      <button
        onClick={onCerrarSesion}
        className="flex items-center justify-center gap-2 py-3 rounded-chip bg-surface border border-border text-muted text-sm font-bold transition-transform active:scale-[0.98]"
      >
        <LogOut size={15} />
        Cerrar sesión
      </button>

      {soportaPush() && notifEstado !== "on" && (
        <button
          onClick={activarNotifs}
          disabled={notifEstado === "pidiendo"}
          className="flex items-center justify-center gap-2 py-3 rounded-chip bg-accent text-black text-sm font-bold transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
        >
          <Bell size={15} />
          {notifEstado === "pidiendo" ? "Pidiendo permiso…" : notifEstado === "off" ? "No se activaron — reintentar" : "Activar notificaciones"}
        </button>
      )}
      {notifEstado === "on" && (
        <div className="flex items-center justify-center gap-2 py-3 rounded-chip bg-surface border border-border text-[#4ADE80] text-sm font-bold">
          <Bell size={15} />
          Notificaciones activadas
        </div>
      )}

      <div className="grid grid-cols-3 gap-2.5">
        <Stat icon={<Flame size={16} className="text-accent" fill="currentColor" />} valor={perfil?.racha ?? 0} label="Racha" />
        <Stat icon={<Gem size={16} className="text-[#4CC9F0]" />} valor={perfil?.xp ?? 0} label="XP" />
        <Stat icon={<Heart size={16} className="text-[#FF3B5C]" fill="currentColor" />} valor={perfil?.corazones ?? 3} label="Vidas" sub={proximo} />
      </div>

      <div className="flex flex-col gap-2.5">
        <span className="text-[11px] font-bold tracking-[0.14em] text-accent uppercase px-1">Certificados</span>
        <BotonCertificado
          Icono={Medal}
          titulo="Bloque 1 completo"
          ganado={!!certificadosGanados?.bloque1}
          onClick={() => onVerCertificado(certificadosGanados?.bloque1 ? "bloque1" : "preview")}
        />
        <BotonCertificado
          Icono={Trophy}
          titulo="Curso completo"
          ganado={!!certificadosGanados?.curso}
          onClick={() => onVerCertificado(certificadosGanados?.curso ? "curso" : "preview")}
        />
      </div>

      <div className="rounded-card bg-surface border border-border px-5 py-4">
        <p className="text-[13px] text-muted leading-relaxed">
          Tu progreso está ligado a tu cuenta de Google — lo vas a tener en cualquier dispositivo donde inicies sesión.
        </p>
      </div>

      {perfil?.es_admin && (
        <Link
          href="/admin"
          className="flex items-center justify-center gap-2 py-3 rounded-chip bg-surface border border-accent/40 text-accent text-sm font-bold transition-transform active:scale-[0.98]"
        >
          <Shield size={15} />
          Panel admin
        </Link>
      )}
    </div>
  );
}

function Stat({ icon, valor, label, sub }) {
  return (
    <div className="rounded-card bg-surface border border-border py-4 flex flex-col items-center gap-1.5">
      {icon}
      <span className="font-[800] text-[18px] tabular-nums">{valor}</span>
      <span className="text-[9px] font-bold tracking-widest text-muted uppercase">{label}</span>
      {sub && <span className="text-[9px] text-accent tabular-nums -mt-1">{sub}</span>}
    </div>
  );
}

function BotonCertificado({ Icono, titulo, ganado, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-card border-2 text-left transition-all active:scale-[0.98] ${
        ganado ? "bg-accent/10 border-accent" : "bg-surface border-border"
      }`}
    >
      <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${ganado ? "bg-accent text-black" : "bg-bg text-muted"}`}>
        <Icono size={16} />
      </div>
      <span className="flex-1 text-[14px] font-semibold">{titulo}</span>
      {ganado ? (
        <span className="text-[11px] font-bold text-accent">Ver</span>
      ) : (
        <Lock size={14} className="text-muted shrink-0" />
      )}
    </button>
  );
}
