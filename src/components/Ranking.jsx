"use client";
import { useEffect, useState } from "react";
import { cargarRanking } from "@/lib/ranking";
import { urlAvatar } from "@/lib/avatares";

const MEDALLAS = ["#FFD700", "#C0C0C0", "#CD7F32"];
const PLACEHOLDER = Array.from({ length: 10 }, (_, i) => ({ id: `ph-${i}`, posicion: i + 1 }));

export default function Ranking({ userId }) {
  const [filas, setFilas] = useState(null);

  useEffect(() => {
    cargarRanking(10).then(setFilas);
  }, []);

  const cargando = filas === null;
  const sinDatos = !cargando && filas.length === 0;
  const mostrarPreview = cargando || sinDatos;

  return (
    <div className="flex flex-col gap-3">
      {mostrarPreview && (
        <div className="rounded-card bg-surface border border-border px-4 py-3 text-center mb-1">
          <p className="text-[12px] text-muted">
            {cargando ? "Cargando ranking…" : "Vista previa — todavía no hay usuarios reales, así se va a ver"}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {mostrarPreview
          ? PLACEHOLDER.map((p) => <Fila key={p.id} posicion={p.posicion} preview />)
          : filas.map((f, i) => (
              <Fila
                key={f.id}
                posicion={i + 1}
                nombre={f.id === userId ? "Tú" : f.nombre || "Estudiante"}
                avatar={f.avatar}
                xp={f.xp}
                racha={f.racha}
                soyYo={f.id === userId}
              />
            ))}
      </div>
    </div>
  );
}

function Fila({ posicion, nombre, avatar, xp, racha, soyYo, preview }) {
  const medalla = MEDALLAS[posicion - 1];
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-card border-2 ${
        preview
          ? "border-dashed border-border/70 opacity-50"
          : soyYo
          ? "bg-accent/10 border-accent"
          : "bg-surface border-border"
      }`}
    >
      <div
        className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold"
        style={{
          background: !preview && medalla ? medalla : "transparent",
          color: !preview && medalla ? "#000" : "#9A9AA0",
          border: !preview && medalla ? "none" : "1px solid #2A2A2E",
        }}
      >
        {posicion}
      </div>
      {!preview && (
        <div className="w-8 h-8 shrink-0 rounded-full bg-bg border border-border overflow-hidden flex items-center justify-center text-[10px] font-bold text-muted">
          {avatar ? <img src={urlAvatar(avatar)} alt="" className="w-full h-full object-cover" /> : (nombre || "E")[0].toUpperCase()}
        </div>
      )}
      <span className="flex-1 text-[14px] font-semibold truncate text-muted">
        {preview ? "—" : nombre}
      </span>
      {!preview && racha > 0 && <span className="text-xs text-muted">🔥{racha}</span>}
      <span className={`text-[14px] font-bold tabular-nums ${preview ? "text-muted" : "text-accent"}`}>
        {preview ? "—" : `${xp} XP`}
      </span>
    </div>
  );
}
