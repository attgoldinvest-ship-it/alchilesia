-- Esquema real de Supabase para Con Cabeza (Dasus).
-- Correr una sola vez en: Project → SQL Editor → New query → pegar todo → Run.
-- Antes de correr esto: Authentication → Providers → habilitar "Anonymous Sign-Ins".

-- 1) Perfil público mínimo (para ranking) — 1 fila por usuario de auth.users.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null default 'Estudiante',
  xp integer not null default 0,
  racha integer not null default 0,
  corazones integer not null default 3,
  corazon_perdido_en timestamptz,
  ultima_actividad date,
  es_admin boolean not null default false,
  avatar text, -- nombre de archivo en el bucket público "avatars" (ej. "avatar_04_icon.webp")
  created_at timestamptz not null default now()
);

-- 2) Progreso por lección — 1 fila por (usuario, lección).
create table if not exists public.progreso (
  user_id uuid not null references auth.users(id) on delete cascade,
  leccion_id text not null,
  completada boolean not null default false,
  correctas integer not null default 0,
  total integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, leccion_id)
);

-- Columnas agregadas después de la creación inicial de `profiles` — `create
-- table if not exists` NO las agrega a una tabla que ya existía, así que
-- este ALTER es obligatorio para que el drift no vuelva a romper el
-- guardado real (bug real: por esto el guardado de perfil/XP/corazones
-- dejó de funcionar en producción — `es_admin` no existía y el trigger
-- `evitar_auto_admin`, más abajo, la referencia).
alter table public.profiles add column if not exists es_admin boolean not null default false;
alter table public.profiles add column if not exists avatar text;

alter table public.profiles enable row level security;
alter table public.progreso enable row level security;

-- Perfiles: cualquiera puede LEER (necesario para el ranking), pero cada
-- quien solo puede crear/editar el suyo.
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles for select using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Progreso: privado, cada quien solo ve/edita el suyo.
drop policy if exists "progreso_select_own" on public.progreso;
create policy "progreso_select_own" on public.progreso for select using (auth.uid() = user_id);

drop policy if exists "progreso_insert_own" on public.progreso;
create policy "progreso_insert_own" on public.progreso for insert with check (auth.uid() = user_id);

drop policy if exists "progreso_update_own" on public.progreso;
create policy "progreso_update_own" on public.progreso for update using (auth.uid() = user_id);

-- Crea el perfil automáticamente cuando se crea un usuario nuevo (incluye
-- los anónimos de signInAnonymously()).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RPCs atómicas — evitan condiciones de carrera al sumar XP o restar corazones
-- desde el cliente (léelo-modifícalo-guárdalo directo desde JS es inseguro).
create or replace function public.sumar_xp(uid uuid, monto integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Candado real: sin esto, cualquiera con la anon key podía llamar esta
  -- función con el uid de OTRO usuario (los ids son públicos vía el
  -- Ranking) y darle/quitarle XP a quien quisiera. Bug de seguridad real,
  -- corregido — cada quien solo puede operar sobre su propio uid.
  if uid <> auth.uid() then
    raise exception 'No autorizado';
  end if;
  update public.profiles set xp = xp + monto where id = uid;
end;
$$;

-- Postgres no permite cambiar el tipo de retorno con CREATE OR REPLACE
-- (antes era "returns void") — hay que borrarla primero.
drop function if exists public.ajustar_corazones(uuid, integer);

-- Devuelve el corazones/corazon_perdido_en REALES ya actualizados —
-- antes no devolvía nada (returns void) y el cliente solo restaba 1 de su
-- propio conteo local, que arranca del `perfil` que ya tenía en pantalla.
-- Si ese valor estaba desactualizado (ej. perdiste un corazón en la
-- lección anterior y el conteo local de esta lección arrancó de un número
-- más alto), el bloqueo por "sin corazones" se activaba tarde — el
-- servidor ya te había puesto en 0, pero el navegador seguía creyendo que
-- tenías más. Ahora el cliente usa SIEMPRE el valor que confirma este
-- RPC, nunca su propia resta, así no hay forma de desincronizarse.
create or replace function public.ajustar_corazones(uid uuid, delta integer)
returns table (corazones integer, corazon_perdido_en timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  actual integer;
  nuevo integer;
begin
  if uid <> auth.uid() then
    raise exception 'No autorizado';
  end if;
  select p.corazones into actual from public.profiles p where p.id = uid;
  nuevo := greatest(0, least(3, actual + delta));
  update public.profiles p
  set corazones = nuevo,
      -- el reloj de recarga arranca solo en la PRIMERA vida perdida desde
      -- el máximo (no se reinicia con cada error, igual que en el prototipo HTML)
      corazon_perdido_en = case
        when nuevo >= 3 then null
        when delta < 0 and actual >= 3 then now()
        else p.corazon_perdido_en
      end
  where p.id = uid;

  return query select p.corazones, p.corazon_perdido_en from public.profiles p where p.id = uid;
end;
$$;

-- Regenera corazones según el tiempo transcurrido desde que se perdió el
-- primero (1 cada `recarga_min` minutos, igual que curso-inversiones.html).
create or replace function public.regenerar_corazones(uid uuid, recarga_min integer default 5)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actual integer;
  perdido_en timestamptz;
  ganadas integer;
  nuevo integer;
begin
  if uid <> auth.uid() then
    raise exception 'No autorizado';
  end if;
  select corazones, corazon_perdido_en into actual, perdido_en from public.profiles where id = uid;
  if actual >= 3 or perdido_en is null then
    return;
  end if;
  ganadas := floor(extract(epoch from (now() - perdido_en)) / (recarga_min * 60));
  if ganadas <= 0 then
    return;
  end if;
  nuevo := least(3, actual + ganadas);
  update public.profiles
  set corazones = nuevo,
      corazon_perdido_en = case when nuevo >= 3 then null else perdido_en + make_interval(secs => ganadas * recarga_min * 60) end
  where id = uid;
end;
$$;

-- Racha: se llama una vez por lección completada. Si la última actividad
-- fue AYER, suma 1. Si fue HOY, no hace nada (ya cuenta el día). Si fue
-- antes de ayer (o nunca), reinicia a 1 — se rompió la racha.
create or replace function public.registrar_actividad(uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ultima date;
begin
  if uid <> auth.uid() then
    raise exception 'No autorizado';
  end if;
  select ultima_actividad into ultima from public.profiles where id = uid;
  if ultima = current_date then
    return;
  elsif ultima = current_date - 1 then
    update public.profiles set racha = racha + 1, ultima_actividad = current_date where id = uid;
  else
    update public.profiles set racha = 1, ultima_actividad = current_date where id = uid;
  end if;
end;
$$;

-- Solo "authenticated" — ya no existe modo invitado (login con Google
-- obligatorio), así que "anon" no necesita ni debe poder llamar estas
-- funciones. Si venían otorgadas de una versión anterior con modo invitado,
-- el revoke explícito las quita aunque ya no estén en este grant.
grant execute on function public.sumar_xp(uuid, integer) to authenticated;
grant execute on function public.ajustar_corazones(uuid, integer) to authenticated;
grant execute on function public.registrar_actividad(uuid) to authenticated;
grant execute on function public.regenerar_corazones(uuid, integer) to authenticated;
revoke execute on function public.sumar_xp(uuid, integer) from anon;
revoke execute on function public.ajustar_corazones(uuid, integer) from anon;
revoke execute on function public.registrar_actividad(uuid) from anon;
revoke execute on function public.regenerar_corazones(uuid, integer) from anon;

-- 3) Suscripciones push (notificaciones reales) — 1 fila por dispositivo/navegador.
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "push_subscriptions_select_own" on public.push_subscriptions;
create policy "push_subscriptions_select_own" on public.push_subscriptions for select using (auth.uid() = user_id);

drop policy if exists "push_subscriptions_insert_own" on public.push_subscriptions;
create policy "push_subscriptions_insert_own" on public.push_subscriptions for insert with check (auth.uid() = user_id);

drop policy if exists "push_subscriptions_delete_own" on public.push_subscriptions;
create policy "push_subscriptions_delete_own" on public.push_subscriptions for delete using (auth.uid() = user_id);

-- Faltaba esta — sin ella, el upsert de activarNotificaciones() fallaba
-- con "violates row-level security policy" cada vez que el navegador ya
-- tenía una suscripción con el mismo endpoint (mismo dispositivo/perfil
-- de Chrome) de un intento anterior: el upsert se convierte en UPDATE
-- por el conflicto de "endpoint" único, y sin policy de update, Postgres
-- lo bloquea por completo. Bug real, confirmado con el error tal cual en
-- pantalla.
drop policy if exists "push_subscriptions_update_own" on public.push_subscriptions;
create policy "push_subscriptions_update_own" on public.push_subscriptions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4) Panel admin — candado: nadie puede autootorgarse es_admin desde el
-- navegador (la policy "profiles_update_own" permite editar tu propia fila,
-- pero este trigger revierte cualquier cambio a es_admin que no venga del
-- rol service_role, es decir, solo se puede activar corriendo SQL directo).
create or replace function public.evitar_auto_admin()
returns trigger
language plpgsql
as $$
begin
  if NEW.es_admin is distinct from OLD.es_admin and auth.role() <> 'service_role' then
    NEW.es_admin := OLD.es_admin;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_evitar_auto_admin on public.profiles;
create trigger trg_evitar_auto_admin
before update on public.profiles
for each row execute procedure public.evitar_auto_admin();

-- 5) Correo — vive APARTE de `profiles` a propósito: `profiles` es legible
-- por cualquiera (para el Ranking), así que meter el correo ahí lo
-- expondría a todo mundo. Esta tabla es privada: cada quien solo ve el suyo.
create table if not exists public.perfil_privado (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  updated_at timestamptz not null default now()
);

alter table public.perfil_privado enable row level security;

drop policy if exists "perfil_privado_select_own" on public.perfil_privado;
create policy "perfil_privado_select_own" on public.perfil_privado for select using (auth.uid() = id);

drop policy if exists "perfil_privado_insert_own" on public.perfil_privado;
create policy "perfil_privado_insert_own" on public.perfil_privado for insert with check (auth.uid() = id);

drop policy if exists "perfil_privado_update_own" on public.perfil_privado;
create policy "perfil_privado_update_own" on public.perfil_privado for update using (auth.uid() = id);

-- Admin puede ver el correo de cualquiera (lo necesita para soporte/gestión
-- de usuarios en el panel) — sigue sin ser público, solo un admin real
-- pasa este check (es_admin se valida contra profiles, no un flag del
-- cliente).
drop policy if exists "perfil_privado_select_admin" on public.perfil_privado;
create policy "perfil_privado_select_admin" on public.perfil_privado for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.es_admin = true)
);
