import { useState, type SubmitEvent } from 'react'
import type { Prefijo, PrefijoHijo } from './prefijosApi'

type Errores = Partial<Record<keyof PrefijoHijo, string>>

type Props = {
  padres: Prefijo[]
  existentes: PrefijoHijo[]
  // Debe lanzar un Error con un mensaje legible si el registro falla.
  onRegistrar: (hijo: PrefijoHijo) => Promise<void>
}

function validar(datos: PrefijoHijo, existentes: PrefijoHijo[]): Errores {
  const errores: Errores = {}

  if (!datos.numeroPadre) {
    errores.numeroPadre = 'Selecciona el prefijo padre.'
  }

  if (!datos.numero) {
    errores.numero = 'El prefijo hijo es obligatorio.'
  } else if (!/^\d{2}$/.test(datos.numero)) {
    errores.numero = 'El prefijo hijo debe tener exactamente dos dígitos.'
  } else if (existentes.some((h) => h.numero === datos.numero)) {
    errores.numero = 'Ese prefijo hijo ya está registrado.'
  }

  if (!datos.nombre) {
    errores.nombre = 'El nombre es obligatorio.'
  } else if (datos.nombre.length > 60) {
    errores.nombre = 'El nombre no puede superar 60 caracteres.'
  }

  return errores
}

export function RegistroPrefijoHijo({ padres, existentes, onRegistrar }: Props) {
  const [numeroPadre, setNumeroPadre] = useState('')
  const [numero, setNumero] = useState('')
  const [nombre, setNombre] = useState('')
  const [errores, setErrores] = useState<Errores>({})
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const sinPadres = padres.length === 0

  async function manejarEnvio(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErrorServidor(null)

    const datos: PrefijoHijo = {
      numero: numero.trim(),
      nombre: nombre.trim(),
      numeroPadre,
    }
    const nuevosErrores = validar(datos, existentes)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setEnviando(true)
    try {
      await onRegistrar(datos)
      setNumero('')
      setNombre('')
      // Se mantiene el padre elegido para registrar varios hijos seguidos.
    } catch (error) {
      setErrorServidor(error instanceof Error ? error.message : 'Error desconocido.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={manejarEnvio} noValidate className="formulario">
      {sinPadres && <p>Primero registra al menos un prefijo padre.</p>}

      <div className="campo">
        <label htmlFor="hijo-padre">Prefijo padre</label>
        <select
          id="hijo-padre"
          name="numeroPadre"
          value={numeroPadre}
          onChange={(e) => setNumeroPadre(e.target.value)}
          disabled={sinPadres}
          aria-invalid={Boolean(errores.numeroPadre)}
          aria-describedby={errores.numeroPadre ? 'hijo-padre-error' : undefined}
        >
          <option value="">Selecciona un prefijo...</option>
          {padres.map((p) => (
            <option key={p.numero} value={p.numero}>
              +{p.numero} — {p.nombre}
            </option>
          ))}
        </select>
        {errores.numeroPadre && (
          <p id="hijo-padre-error" className="error">
            {errores.numeroPadre}
          </p>
        )}
      </div>

      <div className="campo">
        <label htmlFor="hijo-numero">Prefijo hijo</label>
        <input
          id="hijo-numero"
          name="numero"
          inputMode="numeric"
          placeholder="10"
          value={numero}
          onChange={(e) => setNumero(e.target.value.replace(/\D/g, ''))}
          maxLength={2}
          disabled={sinPadres}
          aria-invalid={Boolean(errores.numero)}
          aria-describedby={errores.numero ? 'hijo-numero-error' : undefined}
        />
        {errores.numero && (
          <p id="hijo-numero-error" className="error">
            {errores.numero}
          </p>
        )}
      </div>

      <div className="campo">
        <label htmlFor="hijo-nombre">Nombre del prefijo hijo</label>
        <input
          id="hijo-nombre"
          name="nombre"
          placeholder="Bogotá"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={60}
          disabled={sinPadres}
          aria-invalid={Boolean(errores.nombre)}
          aria-describedby={errores.nombre ? 'hijo-nombre-error' : undefined}
        />
        {errores.nombre && (
          <p id="hijo-nombre-error" className="error">
            {errores.nombre}
          </p>
        )}
      </div>

      {errorServidor && (
        <p className="error" role="alert">
          No se pudo registrar: {errorServidor}
        </p>
      )}

      <button type="submit" disabled={enviando || sinPadres}>
        {enviando ? 'Registrando...' : 'Registrar hijo'}
      </button>
    </form>
  )
}
