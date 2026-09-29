import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

// SOLO servidor — usa la secret key, nunca expuesta al navegador.
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

webpush.setVapidDetails(
  "mailto:attgoldinvest@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function POST(req) {
  const { userId, title, body, url } = await req.json();
  if (!userId || !title) {
    return Response.json({ error: "userId y title son requeridos" }, { status: 400 });
  }

  const { data: subs, error } = await admin
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userId);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!subs?.length) return Response.json({ enviadas: 0 });

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
        // 410/404 = la suscripción ya no existe (usuario desinstaló, etc.) — se limpia.
        if (e.statusCode === 410 || e.statusCode === 404) {
          await admin.from("push_subscriptions").delete().eq("id", s.id);
        }
      }
    })
  );

  return Response.json({ enviadas });
}
