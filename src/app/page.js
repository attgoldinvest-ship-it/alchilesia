"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import InstalarApp, { useCapturaInstallPrompt, yaVistoOInstalado } from "@/components/InstalarApp";
import SinCorazones from "@/components/SinCorazones";
import Cargando from "@/components/Cargando";
import MuerteSubita, { InvitacionMuerteSubita } from "@/components/MuerteSubita";
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
  const router = useRouter();
  const [tab, setTab] = useState("aprender");
  const { usuario: usuarioReal, cargando, continuarConGoogle, registrarConCorreo, iniciarConCorreo, cerrarSesion } = useSesion();
  // esPreview SIEMPRE arranca en false (igual en servidor y cliente) — se
  // decide de verdad dentro de un useEffect, nunca leyendo `window` durante
  // el render, porque el servidor no tiene `window` y eso rompe la hidratación
  // (el HTML que manda el servidor tiene que ser idéntico al del primer
  // render del cliente, o React se queja y regenera todo el árbol).
  const [esPreview, setEsPreview] = useState(false);
  const [progreso, setProgreso] = useState(new Map());
  const [perfil, setPerfil] = useState(null);
  // perfil===null significa dos cosas distintas y hacía falta separarlas:
  // "todavía no terminó de cargar" vs "ya cargó y no hay nada" (ej. la
  // cuenta fue borrada desde el admin pero el navegador sigue con una
  // sesión vieja guardada) — sin este flag, el segundo caso se leía igual
  // que el primero y la pantalla de carga se quedaba esperando para
  // siempre. Bug real reportado.
  const [perfilCargado, setPerfilCargado] = useState(false);
  const [leccionAbierta, setLeccionAbierta] = useState(null);
  const [modoRepaso, setModoRepaso] = useState(false);
  const [onboardingOn, setOnboardingOn] = useState(false);
  const [instalarAppOn, setInstalarAppOn] = useState(false);
  const [certificado, setCertificado] = useState(null); // "bloque1" | "curso" | "preview" | null
  const [mostrarSinCorazones, setMostrarSinCorazones] = useState(false);
  const [muerteSubitaInvite, setMuerteSubitaInvite] = useState(false);
  const [muerteSubitaOn, setMuerteSubitaOn] = useState(false);
  // Captura beforeinstallprompt lo antes posible — Chrome solo lo dispara
  // una vez por carga de página, así que hay que engancharlo desde el
  // arranque aunque la pantalla de instalar se muestre más adelante en
  // la secuencia (después del alias/onboarding, antes del Camino).
  const installPrompt = useCapturaInstallPrompt();

  useEffect(() => {
    registrarServiceWorker();
  }, []);

  const usuario = esPreview ? USUARIO_PREVIEW : usuarioReal;
  // Se calcula aquí arriba (antes de los early-return de carga) para poder
  // usarlo en la secuencia de pantallas de abajo — un hook no puede
  // depender de algo definido después de un return condicional.
  const necesitaNombre = usuario && perfil && perfil.nombre === "Estudiante";

  // Secuencia de pantallas de un solo uso: alias (si falta) → onboarding
  // (si no se vio) → instalar app (si no se vio/ya está instalada) → recién
  // ahí el Camino. Antes "instalar app" era un bannercito independiente
  // que podía aparecer encima de cualquier cosa; ahora es un paso real.
  useEffect(() => {
    if (esPreview || !usuario || necesitaNombre || onboardingOn || instalarAppOn) return;
    if (!yaVistoOInstalado()) setInstalarAppOn(true);
  }, [esPreview, usuario, necesitaNombre, onboardingOn, instalarAppOn]);

  useEffect(() => {
    if (!usuarioReal) return;
    setPerfilCargado(false); // por si quedó en true de una sesión anterior
    cargarProgreso(usuarioReal.id).then(setProgreso);
    cargarPerfil(usuarioReal.id).then((p) => {
      setPerfil(p);
      setPerfilCargado(true);
    });
  }, [usuarioReal]);

  // La cuenta ya no existe de verdad (ej. un admin la borró) pero el
  // navegador todavía trae una sesión vieja guardada — cargarPerfil()
  // terminó, pero no encontró nada. En vez de quedarse trabado, se cierra
  // esa sesión fantasma y se manda de vuelta al login.
  useEffect(() => {
    if (!esPreview && usuarioReal && perfilCargado && perfil === null) {
      cerrarSesion();
    }
  }, [esPreview, usuarioReal, perfilCargado, perfil, cerrarSesion]);

  // Cuenta admin — no ve la app de estudiante (Camino/Ranking/Perfil), va
  // directo al panel. No aplica en vista previa (?preview=1), donde
  // PERFIL_PREVIEW.es_admin siempre es false a propósito.
  useEffect(() => {
    if (!esPreview && perfil?.es_admin) router.replace("/admin");
  }, [esPreview, perfil, router]);

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
      await regenerarCorazones(usuarioReal.id, 5);
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

  // Muerte Súbita — se invita una sola vez por cada múltiplo de 5 días de
  // racha (5, 10, 15…), nunca de más. Se guarda el último múltiplo ya
  // mostrado en localStorage para no repetir la invitación cada vez que
  // se abre la app con la misma racha.
  useEffect(() => {
    if (esPreview || !perfil?.racha || perfil.racha < 5) return;
    const multiplo = Math.floor(perfil.racha / 5) * 5;
    let ultimoMostrado = 0;
    try { ultimoMostrado = parseInt(localStorage.getItem("cc_muerte_subita_racha") || "0", 10); } catch {}
    if (multiplo > ultimoMostrado && completadas.size >= 3) {
      setMuerteSubitaInvite(true);
      try { localStorage.setItem("cc_muerte_subita_racha", String(multiplo)); } catch {}
    }
  }, [esPreview, perfil?.racha, completadas]);

  // useCallback con identidad estable — sin esto, Camino.jsx recibía una
  // función "nueva" en cada render del padre (ej. cada 30s por el sondeo
  // de corazones) y no había forma de saltarse el re-render de los 84
  // nodos aunque nada visible hubiera cambiado en ellos. Parte del arreglo
  // de los "lags" periódicos reportados.
  const estadoDe = useCallback(
    (leccion) => {
      if (completadas.has(leccion.id)) return "done";
      if (!LECCIONES_CON_CONTENIDO.has(leccion.id)) return "locked";
      if (siguienteGlobal && siguienteGlobal.id === leccion.id) return "active";
      // Desbloqueo secuencial real: solo la lección siguiente a tu progreso
      // está disponible — el resto queda bloqueada hasta llegar a ella
      // (antes cualquier lección con contenido ya era clicable de una vez,
      // sin importar el progreso; bug real, corregido).
      return "locked";
    },
    [completadas, siguienteGlobal]
  );

  const seleccionar = useCallback((leccion) => {
    // El botón ya viene deshabilitado si está "locked" (Camino.jsx), pero
    // esto lo blinda también a nivel de datos, no solo de UI.
    if (estadoDe(leccion) === "locked") return;
    const esRepaso = completadas.has(leccion.id);
    // Repasar una lección ya completada no cuesta corazones ni vuelve a sumar
    // XP, así que sigue disponible sin corazones — solo se bloquea abrir una
    // lección NUEVA (esa sí puede costar un corazón si fallas).
    if (!esRepaso && !esPreview && (perfil?.corazones ?? 3) <= 0) {
      setMostrarSinCorazones(true);
      return;
    }
    setModoRepaso(esRepaso);
    setLeccionAbierta(leccion);
  }, [estadoDe, completadas, esPreview, perfil]);

  // Aplica de inmediato el conteo de corazones que Practica.jsx YA conoce
  // (se actualizó en vivo con cada respuesta) — así el header cambia en el
  // mismo instante en que cierras, sin esperar el round-trip a Supabase que
  // antes dejaba ver el número viejo un momento (o hasta el siguiente poll
  // de 30s si no se volvía a tocar nada).
  function aplicarCorazonesOptimista(datos) {
    if (!datos) return;
    setPerfil((p) => (p ? { ...p, corazones: datos.corazones, corazon_perdido_en: datos.corazonPerdidoEn } : p));
  }

  // Cerrar a medias (la ✕, o "Entendido" del modal de sin corazones) SÍ
  // pudo haber costado un corazón real, aunque la lección no se completó.
  async function cerrarLeccion(datos) {
    aplicarCorazonesOptimista(datos);
    setLeccionAbierta(null);
    if (esPreview || !usuario) return;
    cargarPerfil(usuario.id).then(setPerfil); // en segundo plano, para todo lo demás (racha, xp…)
  }

  // Muerte Súbita gasta corazones reales — mismo patrón que cerrarLeccion:
  // aplica de inmediato el conteo que el reto ya confirmó con el servidor,
  // y refresca el perfil completo en segundo plano (el XP ganado).
  async function cerrarMuerteSubita(datos) {
    aplicarCorazonesOptimista(datos);
    setMuerteSubitaOn(false);
    if (esPreview || !usuario) return;
    cargarPerfil(usuario.id).then(setPerfil);
  }

  async function terminarLeccion(datos) {
    const idTerminada = leccionAbierta?.id;
    aplicarCorazonesOptimista(datos);
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

  function cerrarInstalarApp() {
    setInstalarAppOn(false);
  }

  // Mientras useSesion() todavía no resuelve si hay sesión, antes NO había
  // pantalla de espera — se caía directo a renderizar la app completa con
  // datos vacíos (el Camino, TopBar en 0, etc.) durante ese instante, un
  // parpadeo real de la interfaz equivocada antes de mostrar el login. Bug
  // corregido: pantalla de espera propia mientras se decide.
  if (cargando && !esPreview) {
    return <Cargando texto="Conectando…" />;
  }

  if (!usuario) {
    return <Login onGoogle={continuarConGoogle} onRegistrarCorreo={registrarConCorreo} onIniciarCorreo={iniciarConCorreo} />;
  }

  // Mismo guard que el de arriba, pero para el instante entre "ya sabemos
  // que es admin" y que router.replace("/admin") realmente navegue — sin
  // esto se alcanzaba a ver un parpadeo del Camino de estudiante primero.
  if (!esPreview && perfil?.es_admin) {
    return <Cargando texto="Abriendo panel admin…" />;
  }

  // Bug real: entre que useSesion() ya confirmó la sesión (cargando=false)
  // y que cargarPerfil() termina de traer el perfil, `perfil` sigue en
  // null — en ese instante `necesitaNombre` evaluaba a false (null && ...)
  // y la app completa ya se mostraba interactiva, saltándose el alias
  // obligatorio durante esa ventana. Se cierra ese hueco esperando el
  // perfil antes de decidir si hace falta el alias — usando
  // `perfilCargado` (no `perfil === null`) para no quedarse esperando
  // para siempre si la cuenta ya no existe de verdad (ver el useEffect de
  // arriba, que cierra la sesión fantasma en ese caso).
  if (!esPreview && !perfilCargado) {
    return <Cargando texto="Cargando tu perfil…" />;
  }
  if (!esPreview && perfil === null) {
    // Ya se disparó cerrarSesion() en el useEffect — esto solo evita un
    // parpadeo del resto de la pantalla mientras esa sesión se cierra.
    return <Cargando texto="Cerrando sesión…" />;
  }

  return (
    // h-dvh + flex column, en vez de min-h-screen con el BottomNav en
    // "fixed" — en iOS Safari, la barra de herramientas dinámica hace que
    // los elementos fixed se desincronicen del viewport real durante el
    // scroll en páginas largas (bug real reportado: el menú aparecía a la
    // mitad del Camino al bajar). Con este contenedor de altura fija y
    // solo <main> con scroll interno, el menú nunca depende de "fixed" —
    // vive en el flujo normal, siempre visible, sin ese bug de iOS.
    <div className="relative h-dvh flex flex-col bg-bg text-white overflow-hidden">
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
        <div className="shrink-0 bg-accent text-black text-[11px] font-bold text-center py-1 tracking-wide">
          VISTA PREVIA — datos de ejemplo, no se guarda nada
        </div>
      )}
      <TopBar racha={perfil?.racha ?? 0} gemas={perfil?.xp ?? 0} vidas={perfil?.corazones ?? 3} />

      <main className="flex-1 min-h-0 overflow-y-auto max-w-[480px] mx-auto px-5 pt-7 w-full">
        {tab === "aprender" && (
          <>
            <div className="flex items-end justify-between px-1 mb-1.5">
              <h1 className="text-[28px] font-[800] tracking-[-0.03em] leading-none">
                NiroAcademy
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
          corazones={perfil?.corazones ?? 3}
          corazonPerdidoEn={perfil?.corazon_perdido_en}
          onCerrar={cerrarLeccion}
          onTerminada={terminarLeccion}
        />
      )}

      {mostrarSinCorazones && !leccionAbierta && (
        <SinCorazones corazonPerdidoEn={perfil?.corazon_perdido_en} onCerrar={() => setMostrarSinCorazones(false)} />
      )}

      {muerteSubitaInvite && !leccionAbierta && (
        <InvitacionMuerteSubita
          racha={perfil?.racha ?? 0}
          onAceptar={() => { setMuerteSubitaInvite(false); setMuerteSubitaOn(true); }}
          onRechazar={() => setMuerteSubitaInvite(false)}
        />
      )}

      {muerteSubitaOn && (
        <MuerteSubita
          userId={usuario?.id}
          completadas={[...completadas]}
          corazonesIniciales={perfil?.corazones ?? 3}
          corazonPerdidoEnInicial={perfil?.corazon_perdido_en}
          onCerrar={cerrarMuerteSubita}
        />
      )}

      {necesitaNombre && (
        <NombreUsuario
          userId={usuario.id}
          email={usuario.email}
          sugerido={usuario.user_metadata?.full_name || usuario.user_metadata?.name || ""}
          onGuardado={({ nombre, avatar }) => setPerfil((p) => ({ ...p, nombre, avatar }))}
        />
      )}

      {!necesitaNombre && onboardingOn && <Onboarding onTerminar={cerrarOnboarding} />}

      {!necesitaNombre && !onboardingOn && instalarAppOn && (
        <InstalarApp prompt={installPrompt} onTerminar={cerrarInstalarApp} />
      )}

      {certificado && (
        <Certificado
          tipo={certificado}
          userId={usuario?.id}
          nombre={perfil?.nombre}
          onCerrar={() => setCertificado(null)}
        />
      )}
    </div>
  );
}
