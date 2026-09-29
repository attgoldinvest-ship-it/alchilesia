"use client";
import { useEffect, useMemo, useState } from "react";
import { Medal, Trophy, X } from "lucide-react";

const COLORES_CONFETI = ["#FF6B2D", "#FFC24B", "#16D97C", "#7C5CFF", "#1CC6C6"];

const DATOS = {
  bloque1: {
    titulo: "Bloque 1 — Inversión tradicional",
    sub: '"Con Cabeza" · Al Chile Sí Aprendo',
    desc: "por completar todas las lecciones de este bloque, demostrando dominio de riesgo, diversificación, comisiones, impuestos y cómo detectar una estafa antes de que sea tarde.",
    Icono: Medal,
  },
  curso: {
    titulo: "Al Chile Sí Aprendo — Curso completo",
    sub: "Inversión tradicional + Cripto funcional · Dasus",
    desc: "por completar los Bloques 1 y 2 completos: de no saber por dónde empezar, a entender riesgo, custodia, comisiones y cómo operar con cabeza — en inversión tradicional y en cripto.",
    Icono: Trophy,
  },
  preview: {
    titulo: "Al Chile Sí Aprendo — Curso completo",
    sub: "Vista previa · así se ve el certificado real",
    desc: "Este es un adelanto — se entrega de verdad al terminar el Bloque 1 (certificado parcial) y al terminar el curso completo (Bloques 1 y 2).",
    Icono: Trophy,
  },
};

// Folio determinista por usuario+tipo (no cambia cada vez que se abre).
function folio(userId, tipo) {
  const base = (userId || "tu") + "-" + tipo;
  let h = 0;
  for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) >>> 0;
  return "CC-" + ((h % 900000) + 100000);
}

export default function Certificado({ tipo, userId, nombre, onCerrar }) {
  const d = DATOS[tipo] || DATOS.preview;
  const esVistaPrevia = tipo === "preview";
  const [confeti, setConfeti] = useState([]);

  useEffect(() => {
    if (esVistaPrevia) return;
    const piezas = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      dx: (Math.random() * 2 - 1) * 120,
      rot: Math.random() * 720 - 360,
      dur: 1.6 + Math.random(),
      delay: Math.random() * 0.3,
      color: COLORES_CONFETI[i % COLORES_CONFETI.length],
    }));
    setConfeti(piezas);
    const t = setTimeout(() => setConfeti([]), 3000);
    return () => clearTimeout(t);
  }, [esVistaPrevia]);

  const fecha = useMemo(
    () => new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }),
    []
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-5">
      {confeti.map((c) => (
        <div
          key={c.id}
          className="fixed top-[-5%] w-2 h-2 rounded-sm pointer-events-none"
          style={{
            left: `${c.left}%`,
            background: c.color,
            "--dx": `${c.dx}px`,
            "--rot": `${c.rot}deg`,
            animation: `confCae ${c.dur}s cubic-bezier(.3,.6,.4,1) both`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      <div className="relative w-full max-w-[400px] rounded-card bg-surface border-2 border-accent/40 px-7 py-9 flex flex-col items-center text-center gap-4">
        <button onClick={onCerrar} className="absolute top-4 right-4 text-muted transition-transform active:scale-90">
          <X size={18} />
        </button>

        <div className="w-16 h-16 rounded-full bg-accent/15 border-2 border-accent flex items-center justify-center">
          <d.Icono size={28} className="text-accent" />
        </div>

        {esVistaPrevia && (
          <span className="text-[10px] font-bold tracking-widest text-muted uppercase">Vista previa</span>
        )}
        <h1 className="text-[20px] font-[800] leading-tight">{d.titulo}</h1>
        <p className="text-[12px] text-accent font-semibold">{d.sub}</p>
        <p className="text-[13px] text-muted leading-relaxed">{d.desc}</p>

        <div className="w-full h-px bg-border my-1" />

        <div className="w-full flex items-center justify-between text-left">
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wide">Otorgado a</p>
            <p className="font-bold text-[14px]">{nombre || "Tú"}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted uppercase tracking-wide">Fecha</p>
            <p className="font-bold text-[14px]">{fecha}</p>
          </div>
        </div>
        <p className="text-[10px] text-muted tabular-nums">Folio {folio(userId, tipo)}</p>

        <button
          onClick={onCerrar}
          className="w-full py-3 rounded-chip bg-accent text-black font-bold mt-2 transition-transform active:scale-[0.98]"
        >
          {esVistaPrevia ? "Cerrar" : "¡Genial!"}
        </button>
      </div>
    </div>
  );
}
