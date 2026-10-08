"use client";
import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import Ejercicio from "./ejercicios/Ejercicio";
import SinCorazones from "./SinCorazones";
import Mascota from "./Mascota";
import { TEORIA, PREGUNTAS } from "@/data/contenido";
import { guardarProgreso, sumarXp, ajustarCorazones, registrarActividad } from "@/lib/progreso";
import { soportaPush, notificacionesActivas, activarNotificaciones } from "@/lib/push";

// Convierte **negrita** a <strong> real, sin HTML crudo — seguro porque el
// contenido es nuestro (contenido/produccion-*.js), no texto de usuarios.
function conNegritas(texto) {
  if (!texto) return texto;
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);
  return partes.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p
  );
}

function barajar(arr) {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Pantalla completa de lección: teoría → preguntas (los 10 estilos) → resultado.
// Reemplaza el "márcalo completo al tocar el nodo" de la demo anterior —
// esto ya guarda en Supabase de verdad (progreso, xp, corazones).
// Unidades 7-15 = Bloque 2 (cripto/Dasus) — su contenido está verificado
// contra dasus.gitbook.io/dasus-docs y el PDF oficial (regla #2 de
// reglas.txt: nunca se inventa un dato de la plataforma). Unidades 1-6 son
// educación financiera general, no necesitan esa etiqueta.
function esBloqueCripto(leccionId) {
  const m = leccionId.match(/^tm_u(\d+)l/);
  const unidad = m ? parseInt(m[1], 10) : 0;
  return unidad >= 7 && unidad <= 15;
}

export default function Practica({ leccion, userId, repaso = false, corazones = 3, corazonPerdidoEn = null, onCerrar, onTerminada }) {
  const teoria = TEORIA[leccion.id];
  // Se revuelve cada vez que se abre la lección (Practica se monta de nuevo
  // en cada intento) — así reintentar después de fallar no repite el mismo
  // orden, se siente distinto/más difícil de memorizar cada vez.
  const [preguntas] = useState(() => barajar(PREGUNTAS[leccion.id] || []));
  // La teoría se muestra SIEMPRE que exista, incluso en repaso — repasar es
  // justo para reforzar el concepto, no solo repetir preguntas de memoria.
  // Lo único que cambia en repaso es que no cuesta corazones ni da XP.
  const [fase, setFase] = useState(teoria ? "teoria" : "practica");
  const [idx, setIdx] = useState(0);
  const [correctas, setCorrectas] = useState(0);
  const [guardando, setGuardando] = useState(false);
  // Corazones en vivo durante la sesión — el perfil global tarda un poco en
  // refrescarse desde Supabase, así que se sigue el conteo local para poder
  // frenar de inmediato al llegar a 0, sin esperar ese round-trip.
  const [corazonesLocal, setCorazonesLocal] = useState(corazones);
  // Igual que hace la RPC ajustar_corazones en el servidor: el reloj de
  // recarga arranca en la PRIMERA vida perdida desde el máximo, no en cada
  // pérdida — si esta lección es la que causa esa primera pérdida (entró
  // con 3 llenos), se marca aquí mismo para que el contador ya tenga de
  // dónde partir sin esperar a refrescar el perfil completo.
  const [corazonPerdidoEnLocal, setCorazonPerdidoEnLocal] = useState(corazonPerdidoEn);
  const [sinCorazones, setSinCorazones] = useState(false);
  // Aviso de notificaciones — a propósito solo en la pantalla de teoría de
  // un quiz real (no repaso), que es cuando el usuario está más
  // comprometido con la sesión. Nunca se dispara el permiso nativo solo;
  // requiere el toque del usuario en "Activar", como exigen los
  // navegadores para no auto-rechazar el prompt.
  const [avisoNotif, setAvisoNotif] = useState(false);
  const [pidiendoNotif, setPidiendoNotif] = useState(false);

  useEffect(() => {
    if (repaso || !userId || !soportaPush()) return;
    let activo = true;
    notificacionesActivas().then((si) => {
      if (activo && !si) setAvisoNotif(true);
    });
    return () => { activo = false; };
  }, [repaso, userId]);

  async function activarNotifsDesdeQuiz() {
    if (pidiendoNotif) return;
    setPidiendoNotif(true);
    const r = await activarNotificaciones(userId);
    setPidiendoNotif(false);
    if (r.ok) setAvisoNotif(false);
  }

  async function continuar(ok) {
    if (ok) setCorrectas((c) => c + 1);
    else if (userId && !repaso) {
      // Se espera la confirmación real del servidor antes de decidir si
      // bloquea — restar por nuestra cuenta desde un `corazones` que pudo
      // llegar desactualizado es justo lo que dejaba "seguir jugando" con
      // 0 corazones de verdad en el servidor.
      const real = await ajustarCorazones(userId, -1); // repaso: nunca pierde vidas
      const restantes = real ? real.corazones : Math.max(0, corazonesLocal - 1);
      setCorazonesLocal(restantes);
      if (real?.corazon_perdido_en) setCorazonPerdidoEnLocal(real.corazon_perdido_en);
      if (restantes <= 0) {
        setSinCorazones(true);
        return; // no pasa a la siguiente pregunta — hay que recargar corazones primero
      }
    }

    if (idx + 1 >= preguntas.length) {
      setGuardando(true);
      const total = preguntas.length;
      const finalCorrectas = ok ? correctas + 1 : correctas;
      if (userId && !repaso) {
        await guardarProgreso(userId, leccion.id, { correctas: finalCorrectas, total });
        // XP y racha solo si quedó de verdad completada (todas correctas) —
        // igual que el nodo, no se premia un intento que no avanza.
        if (finalCorrectas === total) {
          await sumarXp(userId, 15);
          await registrarActividad(userId);
        }
      }
      setGuardando(false);
      setFase("resultado");
    } else {
      setIdx((i) => i + 1);
    }
  }

  const total = preguntas.length;
  const pct = total ? Math.round((Math.min(idx, total) / total) * 100) : 0;

  // Manda el conteo real que YA conocemos aquí (se actualizó al instante en
  // cada respuesta) para que el header se actualice de inmediato al cerrar,
  // sin esperar un round-trip a Supabase — antes se veía el número viejo un
  // instante hasta que esa segunda consulta regresaba.
  function cerrar() {
    onCerrar({ corazones: corazonesLocal, corazonPerdidoEn: corazonPerdidoEnLocal });
  }

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col">
      <div className="px-4 border-b border-border shrink-0" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="h-14 max-w-[480px] mx-auto flex items-center gap-3">
          <button onClick={cerrar} className="text-muted text-xl leading-none px-1">✕</button>
          {fase === "practica" && (
            <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
              <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
            </div>
          )}
          {repaso && <span className="text-[10px] font-bold tracking-widest text-muted uppercase shrink-0">Repaso — sin riesgo</span>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 max-w-[480px] w-full mx-auto">
        {avisoNotif && (
          <div className="flex items-center gap-3 rounded-card bg-surface border border-accent/30 px-4 py-3.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
              <Bell size={14} className="text-accent" />
            </div>
            <p className="flex-1 text-[12px] text-white/90 leading-relaxed">
              Activa notificaciones para avisarte cuando se recarguen tus corazones y no perder tu racha.
            </p>
            <button
              onClick={activarNotifsDesdeQuiz}
              disabled={pidiendoNotif}
              className="shrink-0 px-3 py-2 rounded-chip bg-accent text-black text-[11px] font-bold transition-transform active:scale-95 disabled:opacity-50"
            >
              {pidiendoNotif ? "…" : "Activar"}
            </button>
            <button onClick={() => setAvisoNotif(false)} className="shrink-0 text-muted transition-transform active:scale-90">
              <X size={14} />
            </button>
          </div>
        )}

        {fase === "teoria" && teoria && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-[0.14em] text-accent uppercase">Aprende</span>
              {esBloqueCripto(leccion.id) && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-muted">
                  <svg width="11" height="11" viewBox="0 0 20 20" fill="none"><path d="M10 1.5l7 3.2v4.8c0 4.6-3 8.9-7 9.9-4-1-7-5.3-7-9.9V4.7l7-3.2z" fill="#4ADE80" opacity="0.15"/><path d="M6.5 10l2.3 2.3L13.5 8" stroke="#4ADE80" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 1.5l7 3.2v4.8c0 4.6-3 8.9-7 9.9-4-1-7-5.3-7-9.9V4.7l7-3.2z" stroke="#4ADE80" strokeWidth="1.2"/></svg>
                  Verificado en dasus.gitbook.io
                </span>
              )}
            </div>
            <h1 className="text-[26px] font-[800] leading-tight mb-1">{teoria.titulo}</h1>

            <div className="flex flex-col gap-4">
              <p className="text-[16px] text-white leading-[1.7]">{conNegritas(teoria.texto[0])}</p>
              {teoria.texto[1] && <p className="text-[16px] text-white leading-[1.7]">{conNegritas(teoria.texto[1])}</p>}
              {teoria.ejemplo && <ParrafoEtiquetado etiqueta="Ejemplo" color="#4CC9F0" texto={teoria.ejemplo} />}
              {teoria.error && <ParrafoEtiquetado etiqueta="Ojo — error común" color="#FF3B5C" texto={teoria.error} />}
              {teoria.contexto && <ParrafoEtiquetado etiqueta="Contexto" color="#9A9AA0" texto={teoria.contexto} />}
            </div>

            <TarjetaTeoria etiqueta="Dato clave" texto={teoria.dato} acento />

            <button
              onClick={() => setFase("practica")}
              className="w-full py-3.5 rounded-chip bg-accent text-black font-bold mt-2"
            >
              {total ? "Empezar práctica" : "Cerrar"}
            </button>
          </div>
        )}

        {fase === "practica" && preguntas[idx] && (
          <Ejercicio key={idx} pregunta={preguntas[idx]} onContinuar={continuar} />
        )}

        {fase === "resultado" && (() => {
          const perfecto = correctas === total;
          // Solo cuenta como "completada" (avanza el camino) si acertaste
          // TODAS — repaso siempre se ve neutral porque ya estaba completada
          // de antes y no depende de este intento.
          const completo = repaso || perfecto;
          return (
            <div className="flex flex-col items-center text-center gap-4 pt-16">
              {perfecto && !repaso ? (
                <Mascota mood="feliz" size={100} />
              ) : (
                <div
                  className={`w-20 h-20 rounded-full border-2 flex items-center justify-center text-3xl ${
                    completo ? "bg-accent/15 border-accent" : "bg-[#FF3B5C]/10 border-[#FF3B5C]/50"
                  }`}
                >
                  {perfecto ? "🏆" : repaso ? "✓" : "↻"}
                </div>
              )}
              <h1 className="text-[24px] font-[800]">
                {repaso ? "Repaso completado" : perfecto ? "¡Lección completada!" : "Casi — inténtalo de nuevo"}
              </h1>
              <p className="text-muted text-[15px]">
                {correctas} de {total} correctas
                {!repaso && perfecto && ` · +${15} XP`}
              </p>
              {!repaso && !perfecto && (
                <p className="text-[13px] text-muted max-w-[280px] leading-relaxed -mt-1">
                  Necesitas acertar todas para completar el nodo y avanzar — vuelve a intentarlo, las preguntas salen en otro orden.
                </p>
              )}
              <button
                onClick={() => onTerminada({ correctas, total, corazones: corazonesLocal, corazonPerdidoEn: corazonPerdidoEnLocal })}
                className={`w-full py-3.5 rounded-chip font-bold mt-4 ${
                  completo ? "bg-accent text-black" : "bg-surface border-2 border-[#FF3B5C]/40 text-[#FF3B5C]"
                }`}
              >
                {completo ? "Continuar" : "Reintentar"}
              </button>
            </div>
          );
        })()}

        {guardando && <p className="text-center text-muted text-sm mt-4">Guardando…</p>}
      </div>

      {sinCorazones && <SinCorazones corazonPerdidoEn={corazonPerdidoEnLocal} onCerrar={cerrar} />}
    </div>
  );
}

// Texto corrido con una etiqueta chica en línea — no es una caja, solo un
// color de acento al inicio del párrafo para que se distinga sin pesar
// visualmente. Ejemplo se ve azul, error rojo tenue, contexto gris neutro.
function ParrafoEtiquetado({ etiqueta, color, texto }) {
  return (
    <p className="text-[16px] text-white leading-[1.7]">
      <span className="font-bold" style={{ color }}>{etiqueta}: </span>
      {conNegritas(texto)}
    </p>
  );
}

function TarjetaTeoria({ etiqueta, texto, acento = false }) {
  return (
    <div
      className={`rounded-card px-5 py-4 border ${
        acento ? "bg-accent/[0.06] border-accent/30" : "bg-surface border-border"
      }`}
    >
      <b
        className={`block text-[11px] font-bold tracking-[0.14em] uppercase mb-1.5 ${
          acento ? "text-accent" : "text-muted"
        }`}
      >
        {etiqueta}
      </b>
      <span className="text-[15px] text-white leading-relaxed">{conNegritas(texto)}</span>
    </div>
  );
}
