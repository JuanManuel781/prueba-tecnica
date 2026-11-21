import { apiUrl } from './api'

export type Prefijo = {
  numero: string
  nombre: string
}

async function leerError(respuesta: Response): Promise<string> {
  try {
    const cuerpo = (await respuesta.json()) as { message?: string | string[] }
    if (Array.isArray(cuerpo.message)) return cuerpo.message.join(' ')
    if (cuerpo.message) return cuerpo.message
  } catch {
    // El cuerpo no era JSON; usamos el código HTTP.
  }
  return `HTTP ${respuesta.status}`
}

export async function listarPrefijos(): Promise<Prefijo[]> {
  const respuesta = await fetch(apiUrl('/prefijos'))
  if (!respuesta.ok) throw new Error(await leerError(respuesta))
  return (await respuesta.json()) as Prefijo[]
}

export async function registrarPrefijo(prefijo: Prefijo): Promise<Prefijo> {
  const respuesta = await fetch(apiUrl('/prefijos/registrar-prefijos'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefijo),
  })
  if (!respuesta.ok) throw new Error(await leerError(respuesta))
  return (await respuesta.json()) as Prefijo
}

export type PrefijoHijo = {
  numero: string
  nombre: string
  numeroPadre: string
}

export async function listarPrefijosHijos(): Promise<PrefijoHijo[]> {
  const respuesta = await fetch(apiUrl('/prefijos-hijos'))
  if (!respuesta.ok) throw new Error(await leerError(respuesta))
  return (await respuesta.json()) as PrefijoHijo[]
}

export async function registrarPrefijoHijo(hijo: PrefijoHijo): Promise<PrefijoHijo> {
  const respuesta = await fetch(apiUrl('/prefijos-hijos/registrar-prefijos-hijos'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(hijo),
  })
  if (!respuesta.ok) throw new Error(await leerError(respuesta))
  return (await respuesta.json()) as PrefijoHijo
}

export type PrefijoNieto = {
  numero: string
  nombre: string
  // Número del prefijo hijo (dos dígitos) al que pertenece.
  numeroPadre: string
}

export async function listarPrefijosNietos(): Promise<PrefijoNieto[]> {
  const respuesta = await fetch(apiUrl('/prefijos-nietos'))
  if (!respuesta.ok) throw new Error(await leerError(respuesta))
  return (await respuesta.json()) as PrefijoNieto[]
}

export async function registrarPrefijoNieto(nieto: PrefijoNieto): Promise<PrefijoNieto> {
  const respuesta = await fetch(apiUrl('/prefijos-nietos/registrar-prefijos-nietos'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nieto),
  })
  if (!respuesta.ok) throw new Error(await leerError(respuesta))
  return (await respuesta.json()) as PrefijoNieto
}

export type PrefijoBisnieto = {
  numero: string
  nombre: string
  // Número del prefijo de cuatro dígitos al que pertenece.
  numeroPadre: string
}

export async function listarPrefijosBisnietos(): Promise<PrefijoBisnieto[]> {
  const respuesta = await fetch(apiUrl('/prefijos-bisnietos'))
  if (!respuesta.ok) throw new Error(await leerError(respuesta))
  return (await respuesta.json()) as PrefijoBisnieto[]
}

export async function registrarPrefijoBisnieto(
  bisnieto: PrefijoBisnieto,
): Promise<PrefijoBisnieto> {
  const respuesta = await fetch(
    apiUrl('/prefijos-bisnietos/registrar-prefijos-bisnietos'),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bisnieto),
    },
  )
  if (!respuesta.ok) throw new Error(await leerError(respuesta))
  return (await respuesta.json()) as PrefijoBisnieto
}
