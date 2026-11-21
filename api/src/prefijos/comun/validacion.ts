// Reglas compartidas por todos los niveles de prefijo.

export const NOMBRE_MAX = 60;

// Devuelve el valor recortado si es texto, o '' si no lo es.
export function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : '';
}
