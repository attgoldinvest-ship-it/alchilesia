"use client";

// Un solo camino continuo para TODO el curso — sin tarjetas separando
// unidades (el usuario lo pidió explícito: "se ven separadas las cards,
// eso no me gusta"). Los títulos de unidad son separadores de texto,
// la línea pasa de una unidad a la siguiente sin cortes.

const ALTO_NODO = 108;
// Espacio del bloque de título: separado en 3 tramos para que respire tanto
// del último nodo de la unidad anterior como del primer nodo de esta.
const GAP_ANTES_HEADER = 52; // último nodo de la unidad previa → texto del título
const GAP_DESPUES_HEADER = 56; // texto del título → primer nodo de esta unidad
const LADOS = [50, 66, 34];

function construirItems(unidades) {
  const items = [];
  let y = 8;
  let indiceGlobal = 0;
  unidades.forEach((u, i) => {
    // La primera unidad no necesita el gap "de separación del nodo anterior"
    // (no hay nodo anterior) — evita un hueco enorme antes de "UNIDAD 1".
    const gapAntes = i === 0 ? 8 : GAP_ANTES_HEADER;
    items.push({ tipo: "header", unidad: u, top: y + gapAntes });
    y += gapAntes + GAP_DESPUES_HEADER;
    u.lecciones.forEach((l) => {
      indiceGlobal++;
      items.push({
        tipo: "nodo",
        leccion: l,
        numero: indiceGlobal, // numeración continua 1..84 de todo el curso, no por unidad
        top: y,
        left: LADOS[(indiceGlobal - 1) % 3],
      });
      y += ALTO_NODO;
    });
  });
  return { items, alto: y };
}

function curva(puntos) {
  if (puntos.length < 2) return "";
  let d = `M ${puntos[0].x} ${puntos[0].y}`;
  for (let i = 1; i < puntos.length; i++) {
    const p0 = puntos[i - 1];
    const p1 = puntos[i];
    const midY = (p0.y + p1.y) / 2;
    d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
  }
  return d;
}

export default function Camino({ unidades, estadoDe, onSeleccionar, anchoBox = 400 }) {
  const { items, alto } = construirItems(unidades);
  const nodos = items.filter((i) => i.tipo === "nodo");
  const puntosPx = nodos.map((n) => ({ x: (n.left / 100) * anchoBox, y: n.top }));

  let ultimaHechaIdx = -1;
  nodos.forEach((n, i) => {
    if (estadoDe(n.leccion) === "done") ultimaHechaIdx = i;
  });

  return (
    <div className="relative mx-auto" style={{ height: alto, maxWidth: anchoBox }}>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${anchoBox} ${alto}`}
        fill="none"
        preserveAspectRatio="none"
      >
        <path d={curva(puntosPx)} stroke="#2A2A2E" strokeWidth="8" strokeLinecap="round" strokeDasharray="12 14" opacity="0.9" />
        {ultimaHechaIdx > 0 && (
          <path d={curva(puntosPx.slice(0, ultimaHechaIdx + 1))} stroke="#FF6B2D" strokeWidth="8" strokeLinecap="round" opacity="0.25" />
        )}
      </svg>

      {items.map((it) =>
        it.tipo === "header" ? (
          <div
            key={`h-${it.unidad.id}`}
            className="absolute left-0 right-0 px-2"
            style={{ top: it.top }}
          >
            <div className="text-[11px] font-bold tracking-[0.14em] text-accent uppercase">
              {it.unidad.titulo}
            </div>
            <div className="font-bold tracking-tight text-[15px] mt-0.5">{it.unidad.subtitulo}</div>
          </div>
        ) : (
          <div
            key={it.leccion.id}
            className="absolute -translate-x-1/2"
            style={{ top: it.top, left: `${it.left}%` }}
          >
            <Nodo
              numero={it.numero}
              estado={estadoDe(it.leccion)}
              onClick={() => onSeleccionar(it.leccion)}
            />
          </div>
        )
      )}
    </div>
  );
}

function Nodo({ estado, numero, onClick }) {
  // Siempre muestra el número — decisión ya validada con el usuario en el
  // prototipo HTML ("solo números", extendido a todos los estados incluido
  // el bloqueado). El estado se comunica por color/borde, no por ícono.
  const deshabilitado = estado === "locked";
  const base = "w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold border-2 shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 tabular-nums";
  const porEstado = {
    done: "bg-accent border-accent text-black",
    active: "bg-surface border-accent text-white shadow-[0_0_0_6px_rgba(255,107,45,0.15),0_0_30px_rgba(255,107,45,0.3)]",
    // Borde más claro y sólido que "locked" — a simple vista antes se
    // confundían (ambos usaban el mismo border-border oscuro), y parecía
    // que TODO estaba bloqueado aunque la mayoría sí era clicable.
    default: "bg-surface border-[#4A4A50] text-white",
    locked: "bg-surface border-border border-dashed text-muted opacity-50",
  };

  return (
    <button onClick={onClick} disabled={deshabilitado} className="flex flex-col items-center gap-2">
      <div className={`${base} ${porEstado[estado]}`}>{numero}</div>
      <div className="text-[10px] font-bold tracking-widest text-center text-muted">
        {String(numero).padStart(2, "0")}
      </div>
    </button>
  );
}
