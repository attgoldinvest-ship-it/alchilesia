"use client";

// Mascota del curso — mismo personaje del logo (diamante naranja, lentes,
// cara amigable) pero animado y con expresiones, para usarlo en momentos
// puntuales con gancho emocional (sin corazones, bienvenida, lección
// perfecta) — nunca como decoración constante, para no competir
// visualmente con el contenido. Basado en el prototipo kawaii en
// macota.txt, adaptado a nuestros tokens de color (#FF6B2D, no su
// #FF6B35) y reescrito como componente real en vez del HTML/JS suelto.
export default function Mascota({ mood = "feliz", size = 96 }) {
  const triste = mood === "triste";
  const hablando = mood === "hablando";

  return (
    <div
      className="animate-mascota-float"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 140 160" width={size} height={size} fill="none">
        {/* Cuerpo — diamante, igual proporción que el logo real */}
        <path
          d="M70 8 L124 64 L70 150 L16 64 Z"
          fill="#FF6B2D"
        />
        <path
          d="M70 8 L124 64 L70 92 Z"
          fill="#FF7A3D"
          opacity="0.5"
        />

        {/* Cachetes */}
        <ellipse cx="38" cy="86" rx="9" ry="5" fill="#FFB3C6" opacity="0.35" />
        <ellipse cx="102" cy="86" rx="9" ry="5" fill="#FFB3C6" opacity="0.35" />

        {/* Lentes */}
        <circle cx="52" cy="70" r="15" stroke="#1A1208" strokeWidth="2.2" />
        <circle cx="88" cy="70" r="15" stroke="#1A1208" strokeWidth="2.2" />
        <path d="M67 70 L73 70" stroke="#1A1208" strokeWidth="2.2" />

        {/* Ojos */}
        {triste ? (
          <>
            <path d="M44 72 Q52 66 60 72" stroke="#1A1208" strokeWidth="2.6" strokeLinecap="round" fill="none" />
            <path d="M80 72 Q88 66 96 72" stroke="#1A1208" strokeWidth="2.6" strokeLinecap="round" fill="none" />
            {/* lagrimita */}
            <path
              className="animate-mascota-tear"
              d="M46 78 Q44 84 46 88 Q48 84 46 78 Z"
              fill="#4CC9F0"
            />
          </>
        ) : (
          <>
            <path d="M44 68 Q52 78 60 68" stroke="#1A1208" strokeWidth="2.6" strokeLinecap="round" fill="none" />
            <path d="M80 68 Q88 78 96 68" stroke="#1A1208" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          </>
        )}

        {/* Boca */}
        {triste ? (
          <ellipse cx="70" cy="96" rx="3.2" ry="3.8" fill="#1A1208" />
        ) : hablando ? (
          <ellipse
            className="animate-mascota-habla"
            cx="70" cy="96" rx="5" ry="5" fill="#1A1208"
            style={{ transformOrigin: "70px 96px" }}
          />
        ) : (
          <path d="M60 94 Q70 103 80 94" stroke="#1A1208" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        )}
      </svg>

      <style jsx>{`
        @keyframes mascotaFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes mascotaTear {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 0.4; }
        }
        @keyframes mascotaHabla {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.4); }
        }
        .animate-mascota-float { animation: mascotaFloat 2.6s ease-in-out infinite; }
        .animate-mascota-tear { animation: mascotaTear 1.6s ease-in-out infinite; }
        .animate-mascota-habla { animation: mascotaHabla 0.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
