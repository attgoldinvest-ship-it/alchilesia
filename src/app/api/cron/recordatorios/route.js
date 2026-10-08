import { admin, enviarPushAUsuario } from "@/lib/server/pushAdmin";

// Cron diario (ver vercel.json) — manda recordatorios ESTRATÉGICOS según
// qué tan inactivo está cada usuario, no un mensaje genérico para todos:
//   - Racha en riesgo (practicó ayer, no hoy, racha>0): urgencia alta,
//     se pierde esta misma noche si no entra.
//   - Inactivo 3-6 días: invitación suave a retomar.
//   - Inactivo 7+ días: reenganche, más directo.
// Nunca manda más de un recordatorio por usuario por corrida — un solo
// mensaje, el que más aplica a su situación real.
function diasInactivo(ultimaActividad) {
  if (!ultimaActividad) return null;
  const hoy = new Date();
  const ultima = new Date(ultimaActividad + "T00:00:00");
  return Math.floor((hoy.setHours(0, 0, 0, 0) - ultima.getTime()) / 86400000);
}

export async function GET(req) {
  // Vercel Cron manda este header automático en producción; también se
  // acepta el CRON_SECRET como query param para poder probarlo a mano.
  const auth = req.headers.get("authorization");
  const esVercelCron = auth === `Bearer ${process.env.CRON_SECRET}`;
  const url = new URL(req.url);
  const secretoManual = url.searchParams.get("secret") === process.env.CRON_SECRET;
  if (!esVercelCron && !secretoManual) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data: usuarios, error } = await admin
    .from("profiles")
    .select("id, nombre, racha, ultima_actividad")
    .neq("nombre", "Estudiante"); // cuentas que nunca completaron el registro, se saltan
  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Solo a quien de verdad tiene una suscripción push activa — evita
  // consultas de más para el resto.
  const { data: subs } = await admin.from("push_subscriptions").select("user_id");
  const conPush = new Set((subs || []).map((s) => s.user_id));

  let enviados = { rachaEnRiesgo: 0, inactivo3: 0, inactivo7: 0 };

  await Promise.all(
    usuarios
      .filter((u) => conPush.has(u.id))
      .map(async (u) => {
        const d = diasInactivo(u.ultima_actividad);

        if (d === 1 && u.racha > 0) {
          await enviarPushAUsuario(u.id, {
            title: `🔥 Tu racha de ${u.racha} días está en riesgo`,
            body: "No has practicado hoy — entra antes de medianoche para no perderla.",
            url: "/",
          });
          enviados.rachaEnRiesgo++;
        } else if (d !== null && d >= 7) {
          await enviarPushAUsuario(u.id, {
            title: "Te extrañamos en NiroAcademy 👋",
            body: `${u.nombre}, llevas ${d} días sin entrar — retoma donde te quedaste, no se te olvide lo que ya aprendiste.`,
            url: "/",
          });
          enviados.inactivo7++;
        } else if (d !== null && d >= 3) {
          await enviarPushAUsuario(u.id, {
            title: "¿Seguimos con el curso? 📚",
            body: "Unos minutos hoy bastan para no perder el hilo.",
            url: "/",
          });
          enviados.inactivo3++;
        }
      })
  );

  return Response.json({ ok: true, enviados });
}
