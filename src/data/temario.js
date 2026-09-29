// Índice del curso para la app de React — resumen (títulos, conteos, ids de
// lección) derivado de ../../temario-maestro.txt, la fuente única real.
// NO duplica teoría ni preguntas (eso vive solo en contenido/produccion-*.js,
// que usa el prototipo HTML) — esto es solo lo necesario para pintar el
// camino/App Shell. Si el temario cambia, este archivo se actualiza a mano
// junto con él (regla #1 de reglas.txt: ojo con que no se desalineen).

export const BLOQUES = {
  1: { nombre: "Inversión tradicional", apodo: '"Con Cabeza"', color: "#FF6B2D" },
  2: { nombre: "Cripto funcional", apodo: null, color: "#4CC9F0" },
  3: { nombre: "Maestría Dasus", apodo: "🎓", color: "#FFC24B", gated: true },
};

function unidad(id, bloque, titulo, lecciones) {
  return {
    id,
    bloque,
    titulo: `Unidad ${id}`,
    subtitulo: titulo,
    lecciones: lecciones.map((t, i) => ({ id: `tm_u${id}l${i + 1}`, titulo: t })),
  };
}

export const UNIDADES = [
  unidad(1, 1, "Antes de invertir un peso", ["Tu dinero se encoge", "El colchón antes que todo", "Deuda cara vs. deuda barata", "¿Para qué estás invirtiendo?"]),
  unidad(2, 1, "La regla que gobierna todo", ["Riesgo y ganancia van pegados", "El interés compuesto", "Diversificar: no todos los huevos en una canasta", "Volatilidad no es lo mismo que perder"]),
  unidad(3, 1, "Dónde puede vivir tu dinero", ["Cuenta de ahorro / CETES", "Fondos indexados / ETFs", "Acciones individuales", "Bienes raíces", "Cripto en tu portafolio"]),
  unidad(4, 1, "Cómo se ve en la práctica", ["Abrir tu primera cuenta de inversión", "Comisiones: el ladrón silencioso", "Aportar cada mes (DCA)", "Rebalanceo"]),
  unidad(5, 1, "Las trampas", ["Señales de estafa/pirámide", "FOMO y pánico", "Influencers de dinero fácil", "Sesgos mentales"]),
  unidad(6, 1, "Tu plan", ["Arma tu regla simple", "Impuestos: lo básico", "Retiro: Afore vs. invertir por tu cuenta", "Repaso final + certificado"]),

  unidad(7, 2, "Qué es cripto y por qué importa", ["Tu dinero ya es 90% digital", "Los 4 tipos de dinero digital", "CBDC: cuando el gobierno hace su propia cripto", "El riesgo de que todo sea digital y rastreable", "Cómo protegerte: efectivo, diversificación y autocustodia", "Wallets: tu wallet vs. tu cuenta en un exchange", "Not your keys, not your coins", "Conectar con solo un correo", "INTERACCIÓN — Abre tu wallet descentralizada", "INTERACCIÓN — Abre una cuenta en un exchange (CEX)", "Centralizada vs. descentralizada vs. CBDC"]),
  unidad(8, 2, "Tu primer contacto con la plataforma", ["Getting Started", "Web Terminal vs. Lite Mode", "Fondear tu cuenta", "Redes y direcciones", "Leer tu Portfolio sin pánico", "Sub-Accounts y Guardian Mode", "INTERACCIÓN — Tu primera orden real"]),
  unidad(9, 2, "Spot vs. perpetuos", ["Spot: comprar y ya", "Qué es un perpetuo (perp)", "Long y short", "Fees: el ladrón silencioso, versión cripto"]),
  unidad(10, 2, "Órdenes y ejecución", ["Tipos de orden: mercado, límite, stop", "Take Profit / Stop Loss", "Scale Orders y TWAP", "Entry Price & PnL"]),
  unidad(11, 2, "Margen y el riesgo que la gente ignora", ["Margen y apalancamiento", "Funding Rate", "Liquidación", "Simulador de liquidación"]),
  unidad(12, 2, "Que tu cripto trabaje por ti", ["Grid Bots", "Vaults", "Staking", "Copy Trading", "Comunidades y Referral Program"]),
  unidad(13, 2, "Cómo funciona Dasus por dentro", ["De dónde sale la liquidez", "Quién es dueño de tu dinero", "La llave de sesión (agent wallet)", "El recorrido de una orden", "Cómo cobra Dasus (builder codes)", "La prueba de la desaparición"]),
  unidad(14, 2, "Riesgos reales y letra chica", ["Los 4 riesgos que sí existen", "Estafas específicas de cripto", "Sociedad vs. licencia financiera", "Leer ToS y Risk Disclosure"]),
  unidad(15, 2, "Tu plan para operar con cabeza", ["Comparativa final: tradicional vs. cripto", "Checklist antes de tu primera operación real", "Errores de principiante", "Repaso final + certificado"]),

  unidad(16, 3, "Tu primer ciclo de trading real", ["Diagnóstico inicial", "Plan de trading por escrito", "Bitácora de operaciones", "Primer ciclo evaluado (4-6 semanas)"]),
  unidad(17, 3, "Estrategia y herramientas de nivel práctico", ["Arma tu propio Grid Bot o Vault", "Gestión de riesgo por portafolio", "Analizar tu funding y comisiones", "(Opcional) API de Hyperliquid"]),
  unidad(18, 3, "Cierre de Maestría", ["Revisión con mentor/comunidad", "Certificado de Maestría Dasus"]),
];

export const TODAS = UNIDADES.flatMap((u) => u.lecciones.map((l) => ({ ...l, unidad: u })));

// ids con contenido de producción real (teoría + preguntas) ya escrito —
// ver contenido/MAPA_PRODUCCION.md. El resto se muestra como "Próximamente",
// nunca se inventa contenido que todavía no existe (regla #2/#7).
export const LECCIONES_CON_CONTENIDO = new Set(
  TODAS.filter((l) => l.unidad.bloque === 1 || l.unidad.bloque === 2).map((l) => l.id)
);
