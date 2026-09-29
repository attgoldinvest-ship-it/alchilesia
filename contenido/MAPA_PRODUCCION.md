# Mapa de producción de contenido — temario-maestro.txt

Orden de trabajo para llevar las 84 lecciones de `temario-maestro.txt` a
contenido jugable real (teoría completa + banco de preguntas, formato
`TEORIA`/`PREGUNTAS` de `curso-inversiones.html`). Se actualiza cada vez que
se termina una unidad — no es documentación fija.

> **Corrección (regla #7):** el conteo anterior decía 78 lecciones con rangos
> corridos desde la Unidad 6. Se verificó con un chequeo automático sobre el
> documento maestro (numeración inline 1→81, sin huecos ni repetidos) y el
> total real era **81**.
>
> **v2 (28 sep. 2026):** se integró `Temario-Maestro-V2.txt` (ya borrado, su
> contenido vive en `temario-maestro.txt`) — la Unidad 7 se reestructuró de
> 8 a 11 lecciones (agrega dinero digital/CBDC), corriendo +3 toda la
> numeración posterior. Total real ahora: **84**. Verificado con chequeo
> automático (numeración inline 1→84, sin huecos ni repetidos). Los ids de
> `contenido/produccion-*.js` son relativos a cada unidad (`tm_u8l1` = Unidad
> 8, lección 1 de esa unidad) — por diseño (regla #5), así que solo
> `produccion-b2-u7.js` necesitó reescritura; el resto de archivos sigue
> alineado sin tocarse.

**Leyenda:** 🟢 hecho · 🟡 en curso · ⚪ pendiente

## BLOQUE 1 — Inversión tradicional (Unidades 1-6, lecciones 1-25) — ✅ COMPLETO

| # | Unidad | Lecciones | Estado | Archivo |
|---|---|---|---|---|
| 1 | Antes de invertir un peso | 1-4 | 🟢 hecho | `produccion-b1-u1-u2.js` |
| 2 | La regla que gobierna todo | 5-8 | 🟢 hecho | `produccion-b1-u1-u2.js` |
| 3 | Dónde puede vivir tu dinero | 9-13 | 🟢 hecho | `produccion-b1-u3-u6.js` |
| 4 | Cómo se ve en la práctica | 14-17 | 🟢 hecho | `produccion-b1-u3-u6.js` |
| 5 | Las trampas | 18-21 | 🟢 hecho | `produccion-b1-u3-u6.js` |
| 6 | Tu plan | 22-25 | 🟢 hecho | `produccion-b1-u3-u6.js` |

## BLOQUE 2 — Cripto funcional (Unidades 7-15, lecciones 26-74) — ✅ COMPLETO

| # | Unidad | Lecciones | Estado | Archivo |
|---|---|---|---|---|
| 7 | Qué es cripto y por qué importa (11 lecciones, v2) | 26-36 | 🟢 hecho | `produccion-b2-u7.js` |
| 8 | Tu primer contacto con la plataforma | 37-43 | 🟢 hecho | `produccion-b2-u8-u15.js` (ids relativos, sin cambios) |
| 9 | Spot vs. perpetuos | 44-47 | 🟢 hecho | `produccion-b2-u8-u15.js` |
| 10 | Órdenes y ejecución | 48-51 | 🟢 hecho | `produccion-b2-u8-u15.js` |
| 11 | Margen y el riesgo que la gente ignora | 52-55 | 🟢 hecho | `produccion-b2-u8-u15.js` |
| 12 | Que tu cripto trabaje por ti | 56-60 | 🟢 hecho | `produccion-b2-u8-u15.js` |
| 13 | Cómo funciona Dasus por dentro | 61-66 | 🟢 hecho | `produccion-b2-u8-u15.js` |
| 14 | Riesgos reales y letra chica | 67-70 | 🟢 hecho | `produccion-b2-u8-u15.js` |
| 15 | Tu plan para operar con cabeza | 71-74 | 🟢 hecho | `produccion-b2-u8-u15.js` |

**Fuentes verificadas para las Unidades 8-15** (consultadas 7 sep. 2026): `dasus.gitbook.io/dasus-docs`
(páginas de platform/, trading/, earn/, guides-and-faq/) y el PDF "Cómo funciona Dasus" (sep. 2026).
Dato corregido vs. el temario original: los depósitos son SOLO USDC en Arbitrum (no varias redes) —
se ajustó la lección de fondeo a este hecho verificado. Dato añadido: "Dasus LTD" está EN CONSTITUCIÓN en
Companies House, no registrada todavía — el PDF lo marca explícitamente como pendiente.

**Fuentes verificadas para la Unidad 7 v2** (consultadas 28 sep. 2026, WebSearch): Nigeria eNaira —
NFCW, Cointelegraph, PYMNTS (límites de retiro dic. 2022-ene. 2023); Canadá 2022 — CBC News
(congelamiento de ~210 cuentas, ~$7.8M USD, bajo la Ley de Emergencias); China e-CNY — dlnews.com,
fanaticalfuturist.com (programabilidad, caducidad de saldo); Banxico — beincrypto.com, elceo.com
(estado real: pruebas piloto vía BIS, sin fecha pública confirmada — se corrigió cualquier
suposición de lanzamiento ya hecho).

## BLOQUE 3 — 🎓 Maestría Dasus (Unidades 16-18, lecciones 75-84)

| # | Unidad | Lecciones | Estado | Archivo |
|---|---|---|---|---|
| 16 | Tu primer ciclo de trading real, con seguimiento | 75-78 | ⚪ pendiente (formato distinto: sin quiz, es bitácora/ciclo evaluado) | — |
| 17 | Estrategia y herramientas de nivel práctico | 79-82 | ⚪ pendiente | — |
| 18 | Cierre de Maestría | 83-84 | ⚪ pendiente | — |

## Progreso

**74 / 84 lecciones con contenido de producción (88%). Bloques 1 y 2 completos.**
Unidades hechas: 1-15 (todo el curso de acceso abierto).
Unidades pendientes: 16, 17, 18 (Bloque 3 — formato distinto, no aplica quiz;
son tareas evaluadas por bitácora/resultado real, ver temario-maestro.txt).

## Orden en que se sigue trabajando

Bloques 1 y 2 (Unidades 1-15, el curso completo de acceso abierto) están
100% con contenido de producción real y verificado. Lo único que falta del
temario es el Bloque 3 (Maestría, 10 lecciones), que por diseño NO lleva
teoría/quiz — son tareas evaluadas por bitácora y resultados reales, y su
mecanismo de acceso todavía no se construye (regla #6 de reglas.txt).

**No hay siguiente lección de producción pendiente en formato quiz — el curso completo (Bloques 1-2) ya está escrito.**
