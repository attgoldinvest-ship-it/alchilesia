"use client";
import { useEffect, useMemo, useState } from "react";
import { Shield, Search, Users, Flame, Gem, CalendarOff, LogOut, Trash2, X, Check } from "lucide-react";
import Link from "next/link";
import { useSesion } from "@/lib/useSesion";
import { cargarPerfil } from "@/lib/progreso";
import { cargarTodosLosUsuarios, eliminarUsuario } from "@/lib/admin";
import Cargando from "@/components/Cargando";
import { urlAvatar } from "@/lib/avatares";

function diasInactivo(ultimaActividad) {
  if (!ultimaActividad) return null; // nunca completó una lección
  const hoy = new Date();
  const ultima = new Date(ultimaActividad + "T00:00:00");
  return Math.floor((hoy.setHours(0, 0, 0, 0) - ultima.getTime()) / 86400000);
}

export default function AdminPage() {
  const { usuario, cargando, cerrarSesion } = useSesion();
  const [perfil, setPerfil] = useState(null);
  const [usuarios, setUsuarios] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [esPreview, setEsPreview] = useState(false);
  const [confirmandoId, setConfirmandoId] = useState(null);
  const [borrandoId, setBorrandoId] = useState(null);
  const [errorBorrado, setErrorBorrado] = useState("");

  useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).get("preview") === "1") {
        setEsPreview(true);
        setPerfil({ es_admin: true });
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!usuario) return;
    cargarPerfil(usuario.id).then(setPerfil);
  }, [usuario]);

  useEffect(() => {
    if (perfil?.es_admin) cargarTodosLosUsuarios().then(setUsuarios);
  }, [perfil]);

  // Irreversible — borra la cuenta completa (auth + perfil + progreso +
  // push + correo), por eso exige 2 toques: el primero solo arma la
  // confirmación en esa fila, el segundo (el check) ejecuta de verdad.
  async function confirmarBorrado(userId) {
    if (esPreview) { setConfirmandoId(null); return; }
    setBorrandoId(userId);
    setErrorBorrado("");
    const r = await eliminarUsuario(userId);
    setBorrandoId(null);
    setConfirmandoId(null);
    if (!r.ok) { setErrorBorrado(r.motivo || "No se pudo eliminar"); return; }
    setUsuarios((prev) => prev.filter((u) => u.id !== userId));
  }

  const filtrados = useMemo(() => {
    if (!usuarios) return [];
    const q = busqueda.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) => (u.nombre || "").toLowerCase().includes(q));
  }, [usuarios, busqueda]);

  const stats = useMemo(() => {
    if (!usuarios) return null;
    return {
      total: usuarios.length,
      conProgreso: usuarios.filter((u) => u.xp > 0).length,
      xpTotal: usuarios.reduce((a, u) => a + (u.xp || 0), 0),
      rachaProm: usuarios.length ? Math.round(usuarios.reduce((a, u) => a + (u.racha || 0), 0) / usuarios.length) : 0,
      inactivos: usuarios.filter((u) => { const d = diasInactivo(u.ultima_actividad); return d !== null && d >= 7; }).length,
      // Cuentas que nunca terminaron la tarjeta de bienvenida (alias
      // obligatorio) — se quedan con el nombre default "Estudiante".
      sinCompletar: usuarios.filter((u) => u.nombre === "Estudiante").length,
    };
  }, [usuarios]);

  if (!esPreview && (cargando || (usuario && perfil === null))) {
    return <Cargando texto="Cargando…" />;
  }

  if (!esPreview && (!usuario || !perfil?.es_admin)) {
    return (
      <div className="min-h-screen bg-bg text-white flex flex-col items-center justify-center gap-4 px-8 text-center">
        <Shield size={28} className="text-muted" />
        <p className="font-bold">No autorizado</p>
        <p className="text-[13px] text-muted max-w-[260px]">Esta pantalla es solo para administradores.</p>
        <Link href="/" className="text-accent text-sm font-bold">← Volver al curso</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-white">
      <header className="h-14 px-4 border-b border-border flex items-center justify-between sticky top-0 bg-bg/90 backdrop-blur-xl z-10">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-accent" />
          <span className="font-bold text-[15px]">Panel admin</span>
        </div>
        {!esPreview && (
          <button
            onClick={cerrarSesion}
            className="flex items-center gap-1.5 text-muted text-[12px] font-bold transition-transform active:scale-95"
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        )}
      </header>

      <main className="max-w-[860px] mx-auto px-5 py-7">
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <StatCard icon={<Users size={16} className="text-accent" />} valor={stats.total} label="Usuarios" />
            <StatCard icon={<Gem size={16} className="text-[#4CC9F0]" />} valor={stats.conProgreso} label="Con progreso" />
            <StatCard icon={<Gem size={16} className="text-[#4CC9F0]" />} valor={stats.xpTotal} label="XP total" />
            <StatCard icon={<Flame size={16} className="text-accent" fill="currentColor" />} valor={stats.rachaProm} label="Racha promedio" />
            <StatCard icon={<CalendarOff size={16} className="text-[#FF3B5C]" />} valor={stats.inactivos} label="Inactivos 7+d" />
            <StatCard icon={<Users size={16} className="text-muted" />} valor={stats.sinCompletar} label="Sin completar" />
          </div>
        )}

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre…"
            className="w-full pl-10 pr-4 py-2.5 rounded-chip bg-surface border border-border outline-none focus:border-accent text-sm"
          />
        </div>

        {errorBorrado && (
          <div className="mb-4 px-4 py-2.5 rounded-chip bg-[#FF3B5C]/10 border border-[#FF3B5C]/40 text-[#FF3B5C] text-[12px]">
            No se pudo eliminar: {errorBorrado}
          </div>
        )}

        {usuarios === null ? (
          <p className="text-muted text-sm">Cargando usuarios…</p>
        ) : filtrados.length === 0 ? (
          <p className="text-muted text-sm">Sin resultados.</p>
        ) : (
          <div className="rounded-card border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[880px]">
              <thead>
                <tr className="bg-surface text-left text-[11px] text-muted uppercase tracking-wide">
                  <th className="px-4 py-3 font-bold">Nombre</th>
                  <th className="px-4 py-3 font-bold">Correo</th>
                  <th className="px-4 py-3 font-bold text-right">XP</th>
                  <th className="px-4 py-3 font-bold text-right">Racha</th>
                  <th className="px-4 py-3 font-bold text-right">Vidas</th>
                  <th className="px-4 py-3 font-bold text-right">Inactivo</th>
                  <th className="px-4 py-3 font-bold text-right">Registro</th>
                  <th className="px-4 py-3 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((u) => {
                  const inactivo = diasInactivo(u.ultima_actividad);
                  const confirmando = confirmandoId === u.id;
                  const borrando = borrandoId === u.id;
                  const sinCompletar = u.nombre === "Estudiante";
                  return (
                    <tr key={u.id} className={`border-t border-border ${sinCompletar ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3 font-semibold whitespace-nowrap">
                        <span className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-full bg-accent/15 border border-border flex items-center justify-center text-[11px] font-bold text-accent overflow-hidden shrink-0">
                            {u.avatar ? (
                              <img src={urlAvatar(u.avatar)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              (u.nombre || "?")[0].toUpperCase()
                            )}
                          </span>
                          {u.nombre}
                          {u.es_admin && <span className="text-[10px] font-bold text-accent bg-accent/10 border border-accent/30 px-1.5 py-0.5 rounded-full shrink-0">ADMIN</span>}
                          {sinCompletar && <span className="text-[10px] font-bold text-muted bg-surface border border-border px-1.5 py-0.5 rounded-full shrink-0">SIN COMPLETAR</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted text-[12px] whitespace-nowrap">{u.email || "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-accent font-bold">{u.xp}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{u.racha}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{u.corazones}</td>
                      <td className={`px-4 py-3 text-right tabular-nums text-[12px] ${inactivo !== null && inactivo >= 7 ? "text-[#FF3B5C]" : "text-muted"}`}>
                        {inactivo === null ? (
                          <span className="inline-flex items-center gap-1 justify-end"><CalendarOff size={12} />nunca</span>
                        ) : inactivo === 0 ? (
                          "hoy"
                        ) : (
                          `${inactivo}d`
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-muted text-[12px] whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {u.es_admin ? (
                          <span className="text-muted text-[11px]">—</span>
                        ) : confirmando ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="text-[11px] text-[#FF3B5C] font-semibold mr-1">¿Seguro?</span>
                            <button
                              onClick={() => confirmarBorrado(u.id)}
                              disabled={borrando}
                              className="w-7 h-7 rounded-full bg-[#FF3B5C]/15 border border-[#FF3B5C] text-[#FF3B5C] flex items-center justify-center transition-transform active:scale-90 disabled:opacity-50"
                              title="Sí, eliminar"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              onClick={() => setConfirmandoId(null)}
                              disabled={borrando}
                              className="w-7 h-7 rounded-full bg-surface border border-border text-muted flex items-center justify-center transition-transform active:scale-90"
                              title="Cancelar"
                            >
                              <X size={13} />
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmandoId(u.id)}
                            className="w-7 h-7 rounded-full bg-surface border border-border text-muted hover:text-[#FF3B5C] hover:border-[#FF3B5C]/40 flex items-center justify-center transition-colors active:scale-90"
                            title="Eliminar usuario"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, valor, label }) {
  return (
    <div className="rounded-card bg-surface border border-border p-4 flex flex-col gap-1.5">
      {icon}
      <span className="font-[800] text-[20px] tabular-nums">{valor}</span>
      <span className="text-[10px] font-bold tracking-widest text-muted uppercase">{label}</span>
    </div>
  );
}
