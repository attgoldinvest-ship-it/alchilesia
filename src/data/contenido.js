// Puente hacia el contenido REAL del curso — mismos archivos que usa
// curso-inversiones.html (contenido/produccion-*.js), no una copia.
// Esos archivos declaran `const TEORIA_X = {...}` como script suelto (para
// el prototipo HTML) y además exportan por CommonJS al final (guardado con
// `typeof module !== "undefined"`, así que el <script src="..."> del HTML
// no se entera y sigue funcionando igual).

import { TEORIA_TM_B1_U1_U2, PREGUNTAS_TM_B1_U1_U2 } from "../../contenido/produccion-b1-u1-u2.js";
import { TEORIA_TM_B1_U3_U6, PREGUNTAS_TM_B1_U3_U6 } from "../../contenido/produccion-b1-u3-u6.js";
import { TEORIA_TM_B2_U7, PREGUNTAS_TM_B2_U7 } from "../../contenido/produccion-b2-u7.js";
import { TEORIA_TM_B2_U8_U15, PREGUNTAS_TM_B2_U8_U15 } from "../../contenido/produccion-b2-u8-u15.js";

export const TEORIA = Object.assign(
  {},
  TEORIA_TM_B1_U1_U2,
  TEORIA_TM_B1_U3_U6,
  TEORIA_TM_B2_U7,
  TEORIA_TM_B2_U8_U15
);

export const PREGUNTAS = Object.assign(
  {},
  PREGUNTAS_TM_B1_U1_U2,
  PREGUNTAS_TM_B1_U3_U6,
  PREGUNTAS_TM_B2_U7,
  PREGUNTAS_TM_B2_U8_U15
);
