"use client";

import { useEffect, useMemo, useState } from "react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import Camino from "@/components/Camino";
import Practica from "@/components/Practica";
import Ranking from "@/components/Ranking";
import Perfil from "@/components/Perfil";
import Onboarding from "@/components/Onboarding";
import Certificado from "@/components/Certificado";
import Login from "@/components/Login";
import NombreUsuario from "@/components/NombreUsuario";
import InstalarApp from "@/components/InstalarApp";
import { UNIDADES, TODAS, LECCIONES_CON_CONTENIDO, BLOQUES } from "@/data/temario";
import { useSesion } from "@/lib/useSesion";
import { cargarProgreso, cargarPerfil, regenerarCorazones } from "@/lib/progreso";
import { registrarServiceWorker } from "@/lib/pwa";
import { enviarPush } from "@/lib/push";

const ID_CERT_BLOQUE1 = "tm_u6l4"; // "Repaso final + certificado" de la Unidad 6
const ID_CERT_CURSO = "tm_u15l4"; // "Repaso final + certificado" de la Unidad 15

// Vista previa (?preview=1) — deja explorar la app sin login real mientras
// Google OAuth sigue bloqueado. Datos de ejemplo, nunca toca Supabase.
// Quitar cuando el login real esté resuelto para todos.
const PERFIL_PREVIEW = {
  nombre: "Vista previa", xp: 340, racha: 5, corazones: 2,
  corazon_perdido_en: new Date(Date.now() - 10 * 60000).toISOString(),
  es_admin: false, // así se ve para un usuario normal — sin acceso a /admin
};
const USUARIO_PREVIEW = { id: "preview-demo", email: "tu@correo.com", user_metadata: {} };

export default function Home() {
  const [tab, setTab] = useState("aprender");
  const { usuario: usuarioReal, cargando, continuarConGoogle, cerrarSesion } = useSesion();
  // esPreview SIEMPRE arranca en false (igual en servidor y cliente) — se
  // decide de verdad dentro de un useEffect, nunca leyendo `window` durante
  // el render, porque el servidor no tiene `window` y eso rompe la hidratación
  // (el HTML que manda el servidor tiene que ser idéntico al del primer
  // render del cliente, o React se queja y regenera todo el árbol).
  const [esPreview, setEsPreview] = useState(false);
  const [progreso, setProgreso] = useState(new Map());
  const [perfil, setPerfil] = useState(null);
  const [leccionAbierta, setLeccionAbierta] = useState(null);
  const [modoRepaso, setModoRepaso] = useState(false);
  const [onboardingOn, setOnboardingOn] = useState(false);
  const [certificado, setCertificado] = useState(null); // "bloque1" | "curso" | "preview" | null

  useEffect(() => {
    registrarServiceWorker();
  }, []);

  const usuario = esPreview ? USUARIO_PREVIEW : usuarioReal;

  useEffect(() => {
    if (!usuarioReal) return;
    cargarProgreso(usuarioReal.id).then(setProgreso);
    cargarPerfil(usuarioReal.id).then(setPerfil);
  }, [usuarioReal]);

  // Un solo efecto para las dos decisiones que dependen de la URL/localStorage
  // (nunca disponibles durante el render en el servidor) — todo secuencial,
  // así no hay forma de que una se dispare con el valor viejo de la otra.
  useEffect(() => {
    let enPreview = false;
    try {
      enPreview = new URLSearchParams(window.location.search).get("preview") === "1";
    } catch {}

    if (enPreview) {
      setEsPreview(true);
      setPerfil(PERFIL_PREVIEW);
      setProgreso(new Map(TODAS.slice(0, 8).map((l) => [l.id, { leccion_id: l.id, completada: true }])));
      return; // el onboarding es solo informativo, no aplica en vista previa
    }

    try {
      if (!localStorage.getItem("cc_onboarding_visto")) setOnboardingOn(true);
    } catch {}
  }, []);

  // Regenera corazones al entrar y cada 30s mientras la pestaña esté abierta.
  // Si pasaron de <3 a 3, manda una notificación push real (llega aunque la
  // app esté cerrada en otro dispositivo con la suscripción activa).
  useEffect(() => {
    if (!usuarioReal) return;
    let corazonesAntes = null;
    async function tick() {
      await regenerarCorazones(usuarioReal.id, 30);
      const p = await cargarPerfil(usuarioReal.id);
      setPerfil(p);
      if (p && corazonesAntes !== null && corazonesAntes < 3 && p.corazones >= 3) {
        enviarPush(usuarioReal.id, { title: "¡Corazones llenos! ❤️", body: "Ya tienes tus 3 vidas de vuelta — a practicar.", url: "/" });
      }
      if (p) corazonesAntes = p.corazones;
    }
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [usuarioReal]);

  const completadas = useMemo(
    () => new Set([...progreso.values()].filter((f) => f.completada).map((f) => f.leccion_id)),
    [progreso]
  );

  const siguienteGlobal = useMemo(
    () => TODAS.find((l) => LECCIONES_CON_CONTENIDO.has(l.id) && !completadas.has(l.id)),
    [completadas]
  );

  const bloqueActual = BLOQUES[siguienteGlobal?.unidad?.bloque ?? 1];

  function estadoDe(leccion) {
    if (completadas.has(leccion.id)) return "done";
    if (!LECCIONES_CON_CONTENIDO.has(leccion.id)) return "locked";
    if (siguienteGlobal && siguienteGlobal.id === leccion.id) return "active";
    return "default";
  }

  function seleccionar(leccion) {
    if (!LECCIONES_CON_CONTENIDO.has(leccion.id)) return;
    // Repasar una lección ya completada no cuesta corazones ni vuelve a sumar XP.
    setModoRepaso(completadas.has(leccion.id));
    setLeccionAbierta(leccion);
  }

  async function terminarLeccion() {
    const idTerminada = leccionAbierta?.id;
    setLeccionAbierta(null);
    if (esPreview) {
      // No toca Supabase — marca localmente para que la vista previa se sienta viva.
      setProgreso((prev) => new Map(prev).set(idTerminada, { leccion_id: idTerminada, completada: true }));
      return;
    }
    if (!usuario) return;
    const nuevoProgreso = await cargarProgreso(usuario.id);
    setProgreso(nuevoProgreso);
    cargarPerfil(usuario.id).then(setPerfil);

    if (modoRepaso) return;
    if (idTerminada === ID_CERT_BLOQUE1 && !localStorage.getItem("cc_cert_bloque1")) {
      localStorage.setItem("cc_cert_bloque1", "1");
      setCertificado("bloque1");
    } else if (idTerminada === ID_CERT_CURSO && !localStorage.getItem("cc_cert_curso")) {
      localStorage.setItem("cc_cert_curso", "1");
      setCertificado("curso");
    }
  }

  function cerrarOnboarding() {
    try { localStorage.setItem("cc_onboarding_visto", "1"); } catch {}
    setOnboardingOn(false);
  }

  if (!cargando && !usuario) {
    return <Login onGoogle={continuarConGoogle} />;
  }

  // Una sola vez — mientras el nombre siga en el default, todavía no lo personalizaron.
  const necesitaNombre = usuario && perfil && perfil.nombre === "Estudiante";

  return (
    <div
      className="relative min-h-screen bg-bg text-white"
      style={{ paddingBottom: "calc(96px + env(safe-area-inset-bottom, 0px))" }}
    >
      {/* Halo decorativo — solo se nota en pantallas anchas, evita que se
          sienta vacío alrededor de la columna centrada en desktop/tablet. */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(560px circle at 50% -10%, rgba(255,107,45,0.09), transparent 60%)",
        }}
      />
      {esPreview && (
        <div className="bg-accent text-black text-[11px] font-bold text-center py-1 tracking-wide">
          VISTA PREVIA — datos de ejemplo, no se guarda nada
        </div>
      )}
      <TopBar racha={perfil?.racha ?? 0} gemas={perfil?.xp ?? 0} vidas={perfil?.corazones ?? 3} />

      <main className="max-w-[480px] mx-auto px-5 pt-7">
        {tab === "aprender" && (
          <>
            <div className="flex items-end justify-between px-1 mb-1.5">
              <h1 className="text-[28px] font-[800] tracking-[-0.03em] leading-none">
                Al Chile Sí Aprendo
              </h1>
              {!cargando && (
                <span className="text-[11px] font-bold text-accent tabular-nums leading-none pb-0.5">
                  {completadas.size}/{TODAS.length}
                </span>
              )}
            </div>
            <p className="text-[13px] text-muted px-1 mb-3">
              {cargando
                ? "Conectando…"
                : `${bloqueActual?.nombre ?? "Curso completo"}${!siguienteGlobal ? " — completado" : ""}`}
            </p>
            <div className="h-1.5 rounded-full bg-surface overflow-hidden mx-1 mb-5">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${TODAS.length ? Math.round((completadas.size / TODAS.length) * 100) : 0}%` }}
              />
            </div>

            <Camino unidades={UNIDADES} estadoDe={estadoDe} onSeleccionar={seleccionar} />
          </>
        )}

        {tab === "ranking" && <Ranking userId={usuario?.id} />}

        {tab === "perfil" && (
          <Perfil
            perfil={perfil}
            userId={usuario?.id}
            onCambio={() => usuario && cargarPerfil(usuario.id).then(setPerfil)}
            onVerCertificado={(tipo) => setCertificado(tipo)}
            onCerrarSesion={cerrarSesion}
            certificadosGanados={{
              bloque1: completadas.has(ID_CERT_BLOQUE1),
              curso: completadas.has(ID_CERT_CURSO),
            }}
          />
        )}
      </main>

      <BottomNav activa={tab} onCambiar={setTab} />

      {leccionAbierta && (
        <Practica
          leccion={leccionAbierta}
          userId={usuario?.id}
          repaso={modoRepaso}
          onCerrar={() => setLeccionAbierta(null)}
          onTerminada={terminarLeccion}
        />
      )}

      {onboardingOn && <Onboarding onTerminar={cerrarOnboarding} />}

      {necesitaNombre && (
        <NombreUsuario
          userId={usuario.id}
          email={usuario.email}
          sugerido={usuario.user_metadata?.full_name || usuario.user_metadata?.name || ""}
          onGuardado={({ nombre, avatar }) => setPerfil((p) => ({ ...p, nombre, avatar }))}
        />
      )}

      {certificado && (
        <Certificado
          tipo={certificado}
          userId={usuario?.id}
          nombre={perfil?.nombre}
          onCerrar={() => setCertificado(null)}
        />
      )}

      <InstalarApp />
    </div>
  );
}
