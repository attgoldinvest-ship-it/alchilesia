"use client";
import { useState } from "react";
import { BookOpen, Gamepad2, Star, Heart, Gem, Flame, Trophy } from "lucide-react";
import { BLOQUES, UNIDADES } from "@/data/temario";

// 3 pantallas de bienvenida — mismo contenido que construirSlidesOnboarding()
// en curso-inversiones.html, portado a React con íconos Lucide.
export default function Onboarding({ onTerminar }) {
  const [i, setI] = useState(0);
  const slides = [<Slide1 key="1" />, <Slide2 key="2" />, <Slide3 key="3" />];
  const ultimo = i === slides.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 bg-bg flex flex-col"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex-1 overflow-y-auto px-6 py-10 max-w-[440px] w-full mx-auto flex flex-col">
        {slides[i]}
      </div>
      <div className="px-6 pb-8 max-w-[440px] w-full mx-auto flex flex-col gap-5 shrink-0">
        <div className="flex justify-center gap-1.5">
          {slides.map((_, idx) => (
            <span key={idx} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-accent" : "w-1.5 bg-border"}`} />
          ))}
        </div>
        <button
          onClick={() => (ultimo ? onTerminar() : setI((v) => v + 1))}
          className="w-full py-3.5 rounded-chip bg-accent text-black font-bold"
        >
          {ultimo ? "Empezar" : "Siguiente"}
        </button>
      </div>
    </div>
  );
}

function Slide1() {
  return (
    <div className="flex flex-col gap-5">
      <BookOpen size={36} className="text-accent" />
      <h2 className="text-[24px] font-[800] leading-tight">Así está organizado el curso</h2>
      <p className="text-[14px] text-muted leading-relaxed -mt-2">
        Un solo camino, en 3 bloques: primero lo básico, luego cripto, y al final la Maestría.
      </p>
      <div className="flex flex-col gap-2.5 mt-2">
        {Object.entries(BLOQUES).map(([num, info]) => {
          const unidadesDelBloque = UNIDADES.filter((u) => u.bloque == num);
          const lecciones = unidadesDelBloque.reduce((a, u) => a + u.lecciones.length, 0);
          return (
            <div key={num} className="flex items-center gap-3 rounded-card bg-surface border border-border px-4 py-3.5">
              <div
                className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm text-black"
                style={{ background: info.color }}
              >
                {num}
              </div>
              <div className="flex-1">
                <p className="font-bold text-[14px]">{info.nombre}</p>
                <p className="text-[12px] text-muted">{unidadesDelBloque.length} unidades</p>
              </div>
              <span className="text-[12px] text-muted shrink-0">
                {info.gated ? "por aplicación" : `${lecciones} lecciones`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Slide2() {
  const filas = [
    { Icon: Heart, color: "#FF3B5C", titulo: "Corazones", texto: "Empiezas con 3. Pierdes 1 por cada respuesta incorrecta, y se recargan solas con el tiempo." },
    { Icon: Gem, color: "#4CC9F0", titulo: "Gemas (XP)", texto: "Ganas puntos por cada lección que completas — más si aciertas todo a la primera." },
    { Icon: Flame, color: "#FF6B2D", titulo: "Racha", texto: "Cuenta los días seguidos que entras a practicar." },
    { Icon: Trophy, color: "#FFC24B", titulo: "Certificados", texto: "Se entregan al terminar el Bloque 1 y al terminar el curso completo." },
  ];
  return (
    <div className="flex flex-col gap-5">
      <Gamepad2 size={36} className="text-accent" />
      <h2 className="text-[24px] font-[800] leading-tight">Así funciona el juego</h2>
      <p className="text-[14px] text-muted leading-relaxed -mt-2">Cuatro cosas que vas a ver todo el tiempo:</p>
      <div className="flex flex-col gap-3 mt-2">
        {filas.map(({ Icon, color, titulo, texto }) => (
          <div key={titulo} className="flex items-start gap-3 rounded-card bg-surface border border-border px-4 py-3.5">
            <Icon size={18} style={{ color }} className="shrink-0 mt-0.5" fill={Icon === Heart ? color : "none"} />
            <div>
              <p className="font-bold text-[14px]">{titulo}</p>
              <p className="text-[12px] text-muted leading-relaxed">{texto}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Slide3() {
  return (
    <div className="flex flex-col gap-5">
      <Star size={36} className="text-accent" />
      <h2 className="text-[24px] font-[800] leading-tight">Los nodos del camino</h2>
      <p className="text-[14px] text-muted leading-relaxed -mt-2">
        Cada círculo es una lección. Su color y número te dicen en qué va:
      </p>
      <div className="flex flex-col gap-3 mt-2">
        <EjemploNodo estilo="border-accent text-accent" numero="7" texto="Disponible, dale clic" />
        <EjemploNodo estilo="bg-accent border-accent text-black" numero="✓" texto="Ya la completaste" />
        <EjemploNodo estilo="border-border text-muted opacity-60" numero="12" texto="Próximamente" />
      </div>
    </div>
  );
}

function EjemploNodo({ estilo, numero, texto }) {
  return (
    <div className="flex items-center gap-3 rounded-card bg-surface border border-border px-4 py-3.5">
      <div className={`w-10 h-10 shrink-0 rounded-full border-2 flex items-center justify-center font-bold text-sm bg-bg ${estilo}`}>
        {numero}
      </div>
      <span className="text-[13px] text-muted">{texto}</span>
    </div>
  );
}
