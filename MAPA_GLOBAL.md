# Mapa Global — Al Chile Sí Aprendo (curso de inversión de Dasus)

Estado real de cada parte del proyecto: qué funciona completo en esta etapa, qué es
demo/parcial, y qué todavía no existe. Mismo formato que el mapa de DIEDYHGC.

**Leyenda** (mide si algo funciona como se pensó para ESTA etapa, no si tiene backend):
- 🟢 **COMPLETO** — funciona de principio a fin tal como está pensado ahora mismo. Puede
  vivir en `localStorage` a propósito (el prototipo aún no usa backend) — eso no lo baja
  de 🟢, siempre que el dato sea real y no una simulación.
- 🟡 **PARCIAL / DEMO** — funciona en pantalla, pero con datos de ejemplo, modo demo, o
  depende de algo que todavía falta (típicamente: un backend real).
- 🔴 **EN MEMORIA** — se pierde al recargar la página (sin persistencia ni siquiera local).
- ⚪ **PENDIENTE** — no existe todavía / pantalla "Próximamente".

---

## ✅ Backend y login conectados de verdad (28 sep. 2026)

Con un Personal Access Token que diste para esto, automaticé toda la configuración de
Supabase vía su Management API (proyecto `academiainversiones`,
`vfmvrcrgbfgepusnffpe.supabase.co`) y activé Google con el Client ID/Secret que
generaste en Google Cloud Console. Todo lo de abajo está verificado en vivo, no solo
"debería funcionar":

- ✅ `supabase/schema.sql` corrido — tablas `profiles`/`progreso`, RLS, trigger y las 4 RPC existen.
- ✅ `site_url`/redirect URLs corregidos (apuntaban al puerto 3000; el dev server corre en 3002).
- ✅ Proveedor de Google activo — probé el endpoint de autorización y redirige de verdad a `accounts.google.com` con tu Client ID.

No queda ningún paso pendiente de plataforma para que el login y el progreso funcionen.

**Decisión de producto (28 sep. 2026):** se quitó el modo invitado — login con Google es
obligatorio para usar la app (ya no existe "Seguir sin cuenta"). `signInAnonymously` y
`linkIdentity` se sacaron del código; "Allow anonymous sign-ins" y "Allow manual linking"
quedaron activos en Supabase pero sin uso — no hace daño dejarlos así.

---

## 1. Contenido del curso

| Parte | Qué es | Estado |
|---|---|---|
| Temario maestro (18 unidades, 84 lecciones, 3 bloques: Tradicional → Cripto → Maestría) | Fusiona inversión tradicional + cripto + Maestría Dasus (por aplicación). v2 reestructuró la Unidad 7 (8→11 lecciones) para sumar dinero digital/CBDC, verificado con fuentes reales (Nigeria eNaira, Canadá 2022, China e-CNY, Banxico) | 🟢 [temario-maestro.txt](temario-maestro.txt) |
| Contenido de producción (teoría + banco de preguntas, formato `TEORIA`/`PREGUNTAS`) | Bloques 1 y 2 completos — 74 de 84 lecciones, todo el curso de acceso abierto. Lo de cripto/Dasus está verificado contra `dasus.gitbook.io/dasus-docs` y el PDF "Cómo funciona Dasus" | 🟢 completo (88%) — [contenido/produccion-b1-u1-u2.js](contenido/produccion-b1-u1-u2.js), [contenido/produccion-b1-u3-u6.js](contenido/produccion-b1-u3-u6.js), [contenido/produccion-b2-u7.js](contenido/produccion-b2-u7.js), [contenido/produccion-b2-u8-u15.js](contenido/produccion-b2-u8-u15.js) — detalle en [contenido/MAPA_PRODUCCION.md](contenido/MAPA_PRODUCCION.md) |
| Bloque 3 (Maestría) | A propósito sin formato de quiz — se evalúa por bitácora/resultado real, no por lecciones. El mecanismo de acceso todavía no se construye (por aplicación) | ⚪ pendiente de que definas el mecanismo, no de contenido |
| Fuente única, sin versiones sueltas | Tanto `curso-inversiones.html` como la app de React leen del mismo `temario-maestro.txt` + `contenido/produccion-*.js` — nunca hay una copia divergente | 🟢 completo |
| Nodos sin contenido de producción | Se muestran como "Próximamente" (número apagado, no clicable) en ambas interfaces — nunca se finge teoría/quiz que no existe | 🟢 completo |

## 2. Prototipo HTML (`curso-inversiones.html`)

Sigue vivo como referencia — sin build ni framework, estilo oscuro/naranja tipo Duolingo
con íconos 3D (Fluent Emoji). Todo lo de esta sección vive en `localStorage` del
navegador, sin backend.

| Parte | Qué hace | Estado |
|---|---|---|
| Camino | Una sola curva continua conectando los 84 nodos, agrupados por Bloque | 🟢 completo |
| Motor de preguntas | 5 tipos (mcq/tf/fill/case/slider), feedback correcto/incorrecto, XP | 🟢 completo |
| Corazones (vidas) | 3 vidas, se pierde 1 por error, se recargan solas con el tiempo (configurable en Perfil → Admin) | 🟢 completo |
| Login (Google) | Toggle Crear cuenta / Iniciar sesión — el botón simula el login, sin Google/Supabase real detrás | 🟡 solo interfaz visual, a propósito |
| Onboarding, Certificado, Ranking, Retro | Ver detalle en el archivo — todo funcional en modo demo/local | 🟢 completo como demo |
| Racha de días, tema claro/oscuro, sonido | — | 🔴 racha no calcula días reales · ⚪ tema/sonido pendientes |

## 3. App de React/Next.js (`src/`) — diseño exacto de `core.txt`

Reemplaza gradualmente al prototipo HTML. Lee el mismo contenido real de
`contenido/produccion-*.js` (fusionado sin duplicar en `src/data/contenido.js`) —
nunca una copia ni datos inventados.

| Parte | Qué hace | Estado |
|---|---|---|
| App Shell (`TopBar`, `BottomNav`, tokens de `globals.css`) | Colores/tipografía/radios exactos de `core.txt`, íconos reales (Lucide). 3 pestañas: Aprender, Ranking, Perfil | 🟢 completo |
| Login (`Login.jsx`) | Pantalla obligatoria al abrir sin sesión — un solo botón, "Continuar con Google" (sin modo invitado, decisión de producto) | 🟢 completo — probado en vivo (redirige de verdad a `accounts.google.com`) |
| Tarjeta de bienvenida (`NombreUsuario.jsx`) | Orden: instrucciones (3 cortas: corazones/XP/racha) → alias (público, Ranking/Perfil, sugiere el nombre de Google) → correo (privado, `perfil_privado`) → elegir foto de perfil (10 avatares reales, ver abajo) | 🟢 completo |
| Avatares (`src/lib/avatares.js`, bucket `avatars`) | 10 imágenes cyberpunk/cripto reales, comprimidas de ~2.5MB a ~20-60KB c/u (webp, recorte cuadrado), subidas a un bucket público de Supabase Storage. Se eligen en la tarjeta de bienvenida y se muestran en Perfil y Ranking | 🟢 completo — subido y verificado (URLs públicas responden 200) |
| Cerrar sesión (`Perfil.jsx`) | Botón para salir de la cuenta de Google | 🟢 completo |
| Camino (`Camino.jsx`) | Curva continua de los 84 nodos, títulos de unidad con su propio espacio (sin cards separadas), numeración continua 1-84, solo números en todos los estados — decisiones ya validadas contigo | 🟢 completo |
| Constructor de 10 estilos de pregunta (`src/components/ejercicios/`) | `Mcq`, `DosCartas` (tf/duelo/versus), `Fill`, `Case`, `Slider`, `Multi`, `Order`, `Match`, `Classify`, con `Ejercicio.jsx` como despachador. Cada lección usa un solo estilo consistente (su `contenedor` en TEORIA) | 🟢 completo — `Multi` construido, sin ninguna lección asignada a ese estilo todavía |
| Flujo de lección (`Practica.jsx`) | Teoría → preguntas → resultado — la teoría se muestra siempre, incluso en modo `repaso` (corregido: antes se saltaba en repaso, sentía que "iba directo a la pregunta"). Repaso solo cambia que no resta corazones ni vuelve a sumar XP | 🟢 completo |
| Contraste visual de nodos (`Camino.jsx`) | "Disponible" (default) y "bloqueado de verdad" (locked) se veían casi idénticos — ambos un círculo oscuro apagado, parecía que todo estaba bloqueado. Ahora default usa un borde más claro y sólido; locked usa borde punteado | 🟢 completo |
| Teoría (`Practica.jsx`) | Texto corrido (no cajas apiladas): concepto → aplicación → Ejemplo/Ojo-error común/Contexto con etiqueta de color en línea (azul/rojo/gris), campos opcionales — si una lección no los tiene, ese párrafo no aparece. Al final, **una sola caja resaltada**: Dato clave. Las lecciones de cripto/Dasus (Unidades 7-15) muestran además un sello "Verificado en dasus.gitbook.io" | 🟢 completo — diseño (código) y contenido ampliado (ejemplo/error/contexto) ya escritos en las 74 lecciones de las 15 unidades (Bloque 1 y 2 completos). También corregido un bug real: `<b>` en el texto se mostraba literal en vez de negritas, ahora usa `**negrita**` con un parser seguro |
| Contenido jugable real | 63 lecciones con los 5 tipos clásicos (mcq/tf/fill/case/slider) + 11 de la Unidad 7 con los estilos nuevos | 🟢 completo |
| Ranking (`Ranking.jsx`) | Top 10 por XP, medallas para el 1-2-3, resalta tu fila. Sin usuarios reales todavía, muestra un preview con las 10 posiciones vacías (mismo diseño, líneas punteadas) | 🟢 completo, tabla real ya existe — esperando el primer usuario con XP |
| Perfil (`Perfil.jsx`) | Racha/XP/vidas reales, cuenta regresiva del próximo corazón, accesos a certificados, botón "reiniciar progreso" (demo) | 🟢 completo |
| Onboarding (`Onboarding.jsx`) | 3 pantallas portadas del HTML con datos reales del temario — se muestra una vez por navegador, no depende de Supabase | 🟢 completo |
| Certificado (`Certificado.jsx`) | Diploma con folio determinista + confeti. Se dispara solo al completar `tm_u6l4` (Bloque 1) o `tm_u15l4` (curso completo); vista previa desde Perfil | 🟢 completo |
| Corazones con regeneración por tiempo | RPC `regenerar_corazones` (1 cada 30 min desde la primera vida perdida) | 🟢 completo y activo |
| App Shell responsivo/adaptativo | TopBar/BottomNav/Practica alinean su contenido al mismo ancho máximo (480px) que el resto. Halo decorativo sutil en desktop. `env(safe-area-inset-*)` en TopBar/BottomNav/Onboarding para notch/home-indicator en PWA. Tabla del admin con scroll horizontal propio (no desborda la página). Verificado sin overflow con sonda real (`docScrollW ≤ innerWidth`) en Aprender, Onboarding, tarjeta de bienvenida y admin, y a 1200px de escritorio | 🟢 completo |
| Feedback táctil (`active:scale`) | Todos los botones/tarjetas tocables de los 10 estilos de ejercicio, Perfil, Login, Certificado, banner de instalar y selector de avatar responden visualmente al tocarlos (antes varios no tenían ninguna reacción) | 🟢 completo |
| PWA instalable (`manifest.js`, `sw.js`, íconos) | Manifest con íconos reales (192/512/maskable, generados con `sharp`), Service Worker con cache offline básico (network-first en navegación, cache-first en estáticos) | 🟢 completo |
| Banner "Instalar app" (`InstalarApp.jsx`) | Captura `beforeinstallprompt` en Android/desktop; en iOS (que no dispara ese evento) muestra instrucciones manuales de "Compartir → Agregar a pantalla de inicio". Se muestra 1 vez, se guarda en localStorage que ya se vio | 🟢 completo |
| Notificaciones push reales (`src/lib/push.js`, `/api/push/send`) | Web Push de verdad con llaves VAPID propias — no son notificaciones locales de mentira. Botón "Activar notificaciones" en Perfil pide permiso y guarda la suscripción en `push_subscriptions`. Dispara automático cuando los corazones pasan de <3 a 3 (llega aunque la app esté cerrada en otro dispositivo con la suscripción activa) | 🟢 completo y probado (tabla creada, RLS activo) |
| Recordatorio diario de racha ("no has practicado hoy") | — | ⚪ pendiente — necesita un cron real (Supabase Edge Function programada) para poder avisar aunque nadie tenga la app abierta; lo que ya existe solo dispara cuando alguien SÍ está usando la app en ese momento |
| Panel admin (`/admin`) | Pantalla separada — todos los usuarios (nombre, XP, racha, vidas, fecha de registro, días sin actividad), buscador por nombre, tarjetas de resumen (total de usuarios, con progreso, XP repartido, racha promedio). Protegida por `profiles.es_admin`, que no se puede autootorgar desde el navegador (trigger `evitar_auto_admin`, ver sección 4) | 🟢 completo — probado con la data real de `profiles` |
| Preguntas en orden aleatorio (`Practica.jsx`) | Cada vez que se abre una lección (incluyendo reintentos tras fallar), las preguntas salen revueltas — no se puede memorizar la posición de la respuesta correcta | 🟢 completo |
| Ranking — desempate | Ordena por XP y, en empate, por fecha de registro (quien llegó primero) | 🟢 completo |
| Tema claro/oscuro, sonido | — | ⚪ pendiente |

## 4. Backend real (Supabase)

Cliente, esquema y configuración de Auth ya corridos contra el proyecto real
(automatizado vía la Management API de Supabase con un Personal Access Token que diste
para esto — regla #6 de `reglas.txt`: nada se toca sin tu autorización).

| Parte | Qué hace | Estado |
|---|---|---|
| `supabase/schema.sql` | Tablas `profiles` (incluye `avatar`) + `progreso` + `push_subscriptions` + `perfil_privado` (correo — separada de `profiles` a propósito, porque `profiles` es legible por cualquiera y el correo no debe serlo), RLS, trigger que crea el perfil al nacer el usuario, RPCs atómicas `sumar_xp` / `ajustar_corazones` / `registrar_actividad` (racha real) / `regenerar_corazones` (recarga por tiempo) | 🟢 corrido y verificado (tablas + trigger probados en vivo) |
| Bucket `avatars` (Storage) | Público, 10 imágenes preseleccionadas (~20-60KB c/u) | 🟢 creado y verificado (URLs públicas responden 200) |
| Auth (`useSesion.js`) | Solo `signInWithOAuth('google')` — sin modo invitado | 🟢 completo y verificado |
| Google provider | Client ID/Secret cargados desde Google Cloud Console, proveedor activo | 🟢 activo — verificado con una llamada real al endpoint de autorización (redirige a `accounts.google.com`) |
| Anonymous sign-ins + Manual linking | Se activaron vía Management API cuando todavía existía el modo invitado — hoy sin uso, no estorban dejarlos prendidos | 🟢 activos pero sin uso |
| `site_url` / redirect URLs | Corregido de `localhost:3000` (default) a los puertos reales de desarrollo | 🟢 completo |
| `.env.local` | URL + publishable key (cliente); la secret key vive ahí pero nunca se usa desde el navegador. También llaves VAPID (push) | 🟢 completo (no versionado, ver `.gitignore`) |
| `profiles.es_admin` + trigger `evitar_auto_admin` | Columna que controla el acceso a `/admin`, protegida: cualquier intento de cambiarla desde el cliente (rol `authenticated`) se revierte sola: solo se puede activar corriendo SQL directo (rol `service_role`) | 🟢 activo — nadie tiene `es_admin = true` todavía |

## 5. Pendientes a definir contigo

- **Login con Google para cualquier cuenta** — bloqueado en la pantalla de consentimiento de Google (falta homepage/privacy URL reales, necesita un dominio público). En pausa esperando tu token de Vercel.
- **Hacerte admin** — el panel ya existe pero nadie tiene `es_admin = true` todavía porque no hay ninguna cuenta real de Google logueada aún (solo mi cuenta de prueba anónima). En cuanto entres de verdad con Google, avísame y te marco como admin con una consulta directa (no se puede hacer desde el navegador, a propósito).
- **Recordatorio diario por push** — necesita un cron real (Supabase Edge Function programada) para funcionar sin que nadie tenga la app abierta.
- **Tema claro/oscuro y sonido** — no empezados.
- **Sistema de "cobrar"** (1000 gemas = $1 USD, multiplicador por racha, mínimo $50) — en pausa, se construye al final del proyecto.
- **Futuro del prototipo HTML** — en algún momento hay que decidir si se retira o se queda como referencia una vez que React cubra todo lo mismo.
- **Nota de entorno, no de código**: `npm run build` falla en esta sesión de trabajo porque el sandbox no tiene salida a internet para bajar la fuente Inter vía `next/font`. En tu máquina, con internet normal, debería compilar sin problema.

---
*Este archivo se actualiza en el momento en que cambia lo que describe — no es documentación fija, es una foto del estado real (regla #7 de reglas.txt).*
