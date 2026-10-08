import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

// SOLO servidor — compartido entre el endpoint de push manual
// (/api/push/send) y el cron de recordatorios (/api/cron/recordatorios).
// Usa la secret key, nunca expuesta al navegador.
export const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

webpush.setVapidDetails(
  "mailto:attgoldinvest@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Manda una notificación a TODAS las suscripciones activas de un usuario
// (puede tener varios dispositivos). Limpia solo las suscripciones muertas
// (410/404 = el usuario desinstaló o revocó el permiso).
export async function enviarPushAUsuario(userId, { title, body, url }) {
  const { data: subs, error } = await admin
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userId);
  if (error || !subs?.length) return 0;

  const payload = JSON.stringify({ title, body: body || "", url: url || "/" });
  let enviadas = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        );
        enviadas++;
      } catch (e) {
        if (e.statusCode === 410 || e.statusCode === 404) {
          await admin.from("push_subscriptions").delete().eq("id", s.id);
        }
      }
    })
  );
  return enviadas;
}
