"use client";

// Loader compartido — reemplaza las pantallas negras totalmente en blanco
// que se mostraban mientras se resolvía la sesión, el perfil, o una
// redirección (ej. cuenta admin yendo a /admin). Antes esos instantes se
// veían como si la app se hubiera colgado; ahora siempre hay algo visible.
export default function Cargando({ texto }) {
  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col items-center justify-center gap-4">
      <div className="w-9 h-9 rounded-full border-2 border-border border-t-accent animate-spin" />
      {texto && <p className="text-[13px] text-muted">{texto}</p>}
    </div>
  );
}
