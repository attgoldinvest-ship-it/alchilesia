"use client";

// Se muestra solo cuando NO hay ninguna sesión — login obligatorio con
// Google, sin modo invitado (decisión explícita: solo usuarios logueados).
export default function Login({ onGoogle }) {
  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col items-center justify-center px-8 gap-8 text-center">
      <img src="/icon-512.png" alt="NiroAcademy" className="w-28 h-28 object-contain" />

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
