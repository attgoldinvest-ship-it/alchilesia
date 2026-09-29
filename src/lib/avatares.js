// Los 10 avatares preseleccionados — subidos al bucket público "avatars" de
// Supabase Storage (comprimidos a webp ~20-60KB desde los originales de img/).
export const AVATARES = [
  "avatar_01.webp",
  "avatar_02_crypto.webp",
  "avatar_03_crypto.webp",
  "avatar_04_icon.webp",
  "avatar_05_crypto.webp",
  "avatar_06_crypto.webp",
  "avatar_07_chart.webp",
  "avatar_08_eth.webp",
  "avatar_09_vault.webp",
  "avatar_10_chart.webp",
];

const BASE = "https://vfmvrcrgbfgepusnffpe.supabase.co/storage/v1/object/public/avatars/";

export function urlAvatar(archivo) {
  if (!archivo) return null;
  return BASE + archivo;
}
