"use client";
import { useState } from "react";
import { Mail, Lock } from "lucide-react";

// Se muestra solo cuando NO hay ninguna sesión. Google sigue siendo la
// opción principal (como ya estaba) — se agregó correo/contraseña como
// alternativa debajo, sin quitar nada de lo que ya había. Validación a
// propósito mínima (solo que el correo tenga @) — el registro queda
// confirmado de inmediato (autoconfirm activado en Supabase), sin correo
// de verificación de por medio.
export default function Login({ onGoogle, onRegistrarCorreo, onIniciarCorreo }) {
  const [modo, setModo] = useState("entrar"); // "entrar" | "crear"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const correoValido = email.includes("@");

  async function enviar(e) {
    e.preventDefault();
    if (!correoValido) { setError("Escribe un correo válido."); return; }
    if (password.length < 6) { setError("La contraseña necesita al menos 6 caracteres."); return; }
    setEnviando(true);
    setError("");
    const r = modo === "crear" ? await onRegistrarCorreo(email, password) : await onIniciarCorreo(email, password);
    setEnviando(false);
    if (!r.ok) {
      setError(
        r.motivo === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : r.motivo === "User already registered"
          ? "Ya existe una cuenta con ese correo — intenta iniciar sesión."
          : r.motivo || "No se pudo completar, intenta de nuevo."
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col items-center justify-center px-8 gap-7 text-center overflow-y-auto py-10">
      <img src="/icon-512.png" alt="NiroAcademy" className="w-24 h-24 object-contain shrink-0" />

      <div>
        <h1 className="text-[26px] font-[800] tracking-[-0.03em]">NiroAcademy</h1>
        <p className="text-[13px] text-muted mt-1">Inversión y cripto, explicado sin choro — Dasus</p>
      </div>

      <div className="w-full max-w-[320px] flex flex-col gap-3">
        <button
          onClick={onGoogle}
          className="w-full py-3.5 rounded-chip bg-white text-black font-bold flex items-center justify-center gap-2.5 transition-transform active:scale-[0.98]"
        >
          <GoogleIcon />
          Continuar con Google
        </button>
      </div>

      <div className="w-full max-w-[320px] flex items-center gap-3">
        <div className="h-px bg-border flex-1" />
        <span className="text-[11px] text-muted font-bold uppercase tracking-wide">o</span>
        <div className="h-px bg-border flex-1" />
      </div>

      <form onSubmit={enviar} className="w-full max-w-[320px] flex flex-col gap-3">
        <div className="relative">
          <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="tu@correo.com"
            className="w-full py-3.5 pl-11 pr-4 rounded-chip bg-surface border-2 border-border focus:border-accent outline-none text-[14px]"
          />
        </div>
        <div className="relative">
          <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            placeholder="Contraseña"
            className="w-full py-3.5 pl-11 pr-4 rounded-chip bg-surface border-2 border-border focus:border-accent outline-none text-[14px]"
          />
        </div>

        {error && <p className="text-[12px] text-[#FF3B5C] text-left -mt-1">{error}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="w-full py-3.5 rounded-chip bg-accent text-black font-bold transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {enviando ? "…" : modo === "crear" ? "Crear cuenta" : "Iniciar sesión"}
        </button>

        <button
          type="button"
          onClick={() => { setModo((m) => (m === "crear" ? "entrar" : "crear")); setError(""); }}
          className="text-[12px] text-muted font-semibold"
        >
          {modo === "crear" ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Créala aquí"}
        </button>
      </form>

      <p className="text-[11px] text-muted max-w-[280px]">
        Necesitas una cuenta para guardar tu progreso, tu racha y aparecer en el Ranking.
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}
