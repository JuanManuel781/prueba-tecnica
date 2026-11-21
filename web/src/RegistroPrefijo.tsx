import { useState, type SubmitEvent } from 'react'
import type { Prefijo } from './prefijosApi'

type Errores = Partial<Record<keyof Prefijo, string>>

type Props = {
  existentes: Prefijo[]
  // Debe lanzar un Error con un mensaje legible si el registro falla.
  onRegistrar: (prefijo: Prefijo) => Promise<void>
}

function validar(datos: Prefijo, existentes: Prefijo[]): Errores {
  const errores: Errores = {}

  if (!datos.numero) {
    errores.numero = 'El prefijo es obligatorio.'
  } else if (!/^\d$/.test(datos.numero)) {
    errores.numero = 'El prefijo debe ser un solo dígito (0-9).'
  } else if (existentes.some((p) => p.numero === datos.numero)) {
    errores.numero = 'Ese prefijo ya está registrado.'
  }

  if (!datos.nombre) {
    errores.nombre = 'El nombre es obligatorio.'
  } else if (datos.nombre.length > 60) {
    errores.nombre = 'El nombre no puede superar 60 caracteres.'
  }

  return errores
}

export function RegistroPrefijo({ existentes, onRegistrar }: Props) {
  const [numero, setNumero] = useState('')
  const [nombre, setNombre] = useState('')
  const [errores, setErrores] = useState<Errores>({})
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function manejarEnvio(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErrorServidor(null)

    const datos: Prefijo = { numero: numero.trim(), nombre: nombre.trim() }
    const nuevosErrores = validar(datos, existentes)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setEnviando(true)
    try {
      await onRegistrar(datos)
      setNumero('')
      setNombre('')
    } catch (error) {
      setErrorServidor(error instanceof Error ? error.message : 'Error desconocido.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={manejarEnvio} noValidate className="formulario">
      <div className="campo">
        <label htmlFor="numero">Prefijo</label>
        <div className="con-prefijo">
          <span aria-hidden="true">+</span>
          <input
            id="numero"
            name="numero"
            inputMode="numeric"
            placeholder="1"
            value={numero}
            onChange={(e) => setNumero(e.target.value.replace(/\D/g, ''))}
            maxLength={1}
            aria-invalid={Boolean(errores.numero)}
            aria-describedby={errores.numero ? 'numero-error' : undefined}
          />
        </div>
        {errores.numero && (
          <p id="numero-error" className="error">
            {errores.numero}
          </p>
        )}
      </div>

      <div className="campo">
        <label htmlFor="nombre">Nombre del prefijo</label>
        <input
          id="nombre"
          name="nombre"
          placeholder="Colombia"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={60}
          aria-invalid={Boolean(errores.nombre)}
          aria-describedby={errores.nombre ? 'nombre-error' : undefined}
        />
        {errores.nombre && (
          <p id="nombre-error" className="error">
            {errores.nombre}
          </p>
        )}
      </div>

      {errorServidor && (
        <p className="error" role="alert">
          No se pudo registrar: {errorServidor}
        </p>
      )}

      <button type="submit" disabled={enviando}>
        {enviando ? 'Registrando...' : 'Registrar'}
      </button>
    </form>
  )
}
