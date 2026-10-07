export const metadata = {
  title: "Política de privacidad — NiroAcademy",
};

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-bg text-white px-5 py-10 max-w-[640px] mx-auto">
      <h1 className="text-[26px] font-[800] mb-6">Política de privacidad</h1>
      <p className="text-muted text-[13px] mb-8">Última actualización: septiembre de 2026</p>

      <div className="flex flex-col gap-6 text-[15px] leading-relaxed text-white/90">
        <section>
          <h2 className="text-[18px] font-bold mb-2">1. Qué datos recopilamos</h2>
          <p>
            NiroAcademy (la "app") recopila únicamente los datos necesarios para
            que funcione el curso: tu nombre/alias, tu correo electrónico (obtenidos de tu
            cuenta de Google al iniciar sesión), tu avatar elegido, tu progreso en las
            lecciones, tu racha, tu experiencia (XP) y tus corazones. No recopilamos datos
            financieros ni de pago.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-2">2. Cómo usamos tus datos</h2>
          <p>
            Tu nombre/alias y avatar se muestran públicamente en el Ranking y tu Perfil
            dentro de la app. Tu correo electrónico se guarda de forma privada y nunca se
            muestra a otros usuarios. Tu progreso se usa únicamente para mostrarte tu
            propio avance y estadísticas.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-2">3. Inicio de sesión con Google</h2>
          <p>
            Usamos "Iniciar sesión con Google" (Google OAuth) únicamente para autenticar tu
            identidad. Solicitamos acceso solo a tu nombre, correo y foto de perfil básicos
            — nunca a tu contraseña, contactos, correos ni archivos de Google.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-2">4. Notificaciones push</h2>
          <p>
            Si activas las notificaciones, guardamos una suscripción técnica de tu
            navegador (no datos personales adicionales) para poder enviarte avisos sobre
            tus corazones y tu racha. Puedes desactivarlas en cualquier momento desde tu
            navegador o desde tu Perfil en la app.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-2">5. Dónde viven tus datos</h2>
          <p>
            Tus datos se almacenan en Supabase (base de datos y autenticación), con acceso
            protegido por reglas de seguridad a nivel de fila (RLS) — tu correo electrónico,
            por ejemplo, vive en una tabla separada y privada que solo tú puedes leer.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-2">6. Tus derechos</h2>
          <p>
            Puedes solicitar la eliminación de tu cuenta y todos tus datos en cualquier
            momento escribiendo al correo de soporte. No vendemos ni compartimos tus datos
            con terceros con fines publicitarios.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-2">7. Contacto</h2>
          <p>
            Para dudas sobre esta política o tus datos, contáctanos en{" "}
            <a href="mailto:billionary137946@gmail.com" className="text-accent underline">
              billionary137946@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
