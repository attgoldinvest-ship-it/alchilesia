import { createClient } from "@supabase/supabase-js";
import { enviarPushAUsuario } from "@/lib/server/pushAdmin";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export async function POST(req) {
  // Sin esto, cualquiera podía mandar un POST con {userId, title, body} y
  // spamear una notificación real a CUALQUIER usuario (los userId son
  // públicos vía el Ranking) — bug de seguridad real, corregido: se exige
  // el token de sesión de Supabase, y solo se puede notificar a uno mismo.
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const { data: { user }, error: authError } = await admin.auth.getUser(token);
  if (authError || !user) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { userId, title, body, url } = await req.json();
  if (!userId || !title) {
    return Response.json({ error: "userId y title son requeridos" }, { status: 400 });
  }
  if (userId !== user.id) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  const enviadas = await enviarPushAUsuario(userId, { title, body, url });
  return Response.json({ enviadas });
}
