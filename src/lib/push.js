"use client";
import { supabase } from "./supabaseClient";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function soportaPush() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

// El botón "Activar notificaciones" arrancaba SIEMPRE en "idle" al volver
// a abrir la app, aunque ya estuvieran activadas de antes — notifEstado
// vivía solo en memoria del componente, nunca se revisaba el estado real.
// Esto consulta directo al navegador (Notification.permission +
// pushManager.getSubscription(), la fuente de verdad real, no la base de
// datos) si ya existe una suscripción activa para no volver a pedirla.
export async function notificacionesActivas() {
  if (!soportaPush()) return false;
  if (Notification.permission !== "granted") return false;
  try {
    const registro = await navigator.serviceWorker.getRegistration("/sw.js");
    if (!registro) return false;
    const sub = await registro.pushManager.getSubscription();
    return !!sub;
  } catch {
    return false;
  }
}

export async function activarNotificaciones(userId) {
  if (!soportaPush()) return { ok: false, motivo: "no-soportado" };

  try {
    const permiso = await Notification.requestPermission();
    if (permiso !== "granted") return { ok: false, motivo: "rechazado" };

    // Antes se usaba navigator.serviceWorker.ready, que se queda colgado
    // para siempre si el SW todavía no se registró en este primer load —
    // register() de nuevo es idempotente (no vuelve a instalar si ya
    // existe) y sí resuelve, en vez de quedarse esperando sin fin.
    const registro = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    let sub = await registro.pushManager.getSubscription();
    if (!sub) {
      sub = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      });
    }

    const json = sub.toJSON();
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: userId,
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      },
      { onConflict: "endpoint" }
    );
    if (error) return { ok: false, motivo: error.message };
    return { ok: true };
  } catch (e) {
    // Antes esto no se capturaba en ningún lado — si subscribe() lanzaba
    // (SW no listo, llave inválida, cuota del navegador, etc.), el botón
    // se quedaba trabado en "Pidiendo permiso…" para siempre, sin mostrar
    // ningún error real. Ahora se propaga el mensaje real a la UI.
    return { ok: false, motivo: e?.message || String(e) };
  }
}

export async function enviarPush(userId, { title, body, url }) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return; // sin sesión real, no se manda nada
    await fetch("/api/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ userId, title, body, url }),
    });
  } catch (e) {
    console.warn("enviarPush:", e.message);
  }
}
