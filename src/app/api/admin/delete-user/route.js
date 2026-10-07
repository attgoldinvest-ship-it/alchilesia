import { createClient } from "@supabase/supabase-js";

// SOLO servidor — usa la secret key, nunca expuesta al navegador. Borrar un
// usuario de auth.users requiere privilegio de service_role; además esto
// cascadea (on delete cascade en schema.sql) y se lleva de paso profiles,
// progreso, push_subscriptions y perfil_privado — no hace falta borrarlos
// aparte.
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export async function POST(req) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  // Verifica que quien llama sea un admin real — nunca confiar en un flag
  // que mande el cliente, siempre se revisa contra la base de datos con la
  // secret key.
  const { data: { user }, error: authError } = await admin.auth.getUser(token);
  if (authError || !user) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const { data: perfilSolicitante, error: perfilError } = await admin
    .from("profiles")
    .select("es_admin")
    .eq("id", user.id)
    .single();
  if (perfilError || !perfilSolicitante?.es_admin) {
    return Response.json({ error: "Solo un admin puede hacer esto" }, { status: 403 });
  }

  const { userId } = await req.json();
  if (!userId) {
    return Response.json({ error: "userId es requerido" }, { status: 400 });
  }
  if (userId === user.id) {
    // Un admin no puede autoeliminarse por accidente desde su propio panel.
    return Response.json({ error: "No puedes eliminar tu propia cuenta desde aquí" }, { status: 400 });
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
