import { useState, type SubmitEvent } from 'react'
import type { PrefijoHijo, PrefijoNieto } from './prefijosApi'

type Errores = Partial<Record<keyof PrefijoNieto, string>>

type Props = {
  hijos: PrefijoHijo[]
  existentes: PrefijoNieto[]
  // Debe lanzar un Error con un mensaje legible si el registro falla.
  onRegistrar: (nieto: PrefijoNieto) => Promise<void>
}

function validar(datos: PrefijoNieto, existentes: PrefijoNieto[]): Errores {
  const errores: Errores = {}

  if (!datos.numeroPadre) {
    errores.numeroPadre = 'Selecciona el prefijo hijo.'
  }

  if (!datos.numero) {
    errores.numero = 'El prefijo es obligatorio.'
  } else if (!/^\d{4}$/.test(datos.numero)) {
    errores.numero = 'El prefijo debe tener exactamente cuatro dígitos.'
  } else if (existentes.some((n) => n.numero === datos.numero)) {
    errores.numero = 'Ese prefijo de cuatro dígitos ya está registrado.'
  }

  if (!datos.nombre) {
    errores.nombre = 'El nombre es obligatorio.'
  } else if (datos.nombre.length > 60) {
    errores.nombre = 'El nombre no puede superar 60 caracteres.'
  }

  return errores
}

export function RegistroPrefijoNieto({ hijos, existentes, onRegistrar }: Props) {
  const [numeroPadre, setNumeroPadre] = useState('')
  const [numero, setNumero] = useState('')
  const [nombre, setNombre] = useState('')
  const [errores, setErrores] = useState<Errores>({})
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const sinHijos = hijos.length === 0

  async function manejarEnvio(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErrorServidor(null)

    const datos: PrefijoNieto = {
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
      // Se mantiene el hijo elegido para registrar varios seguidos.
    } catch (error) {
      setErrorServidor(error instanceof Error ? error.message : 'Error desconocido.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={manejarEnvio} noValidate className="formulario">
      {sinHijos && <p>Primero registra al menos un prefijo hijo.</p>}

      <div className="campo">
        <label htmlFor="nieto-padre">Prefijo hijo</label>
        <select
          id="nieto-padre"
          name="numeroPadre"
          value={numeroPadre}
          onChange={(e) => setNumeroPadre(e.target.value)}
          disabled={sinHijos}
          aria-invalid={Boolean(errores.numeroPadre)}
          aria-describedby={errores.numeroPadre ? 'nieto-padre-error' : undefined}
        >
          <option value="">Selecciona un prefijo hijo...</option>
          {hijos.map((h) => (
            <option key={h.numero} value={h.numero}>
              {h.numero} — {h.nombre} (de +{h.numeroPadre})
            </option>
          ))}
        </select>
        {errores.numeroPadre && (
          <p id="nieto-padre-error" className="error">
            {errores.numeroPadre}
          </p>
        )}
      </div>

      <div className="campo">
        <label htmlFor="nieto-numero">Prefijo de cuatro dígitos</label>
        <input
          id="nieto-numero"
          name="numero"
          inputMode="numeric"
          placeholder="1001"
          value={numero}
          onChange={(e) => setNumero(e.target.value.replace(/\D/g, ''))}
          maxLength={4}
          disabled={sinHijos}
          aria-invalid={Boolean(errores.numero)}
          aria-describedby={errores.numero ? 'nieto-numero-error' : undefined}
        />
        {errores.numero && (
          <p id="nieto-numero-error" className="error">
            {errores.numero}
          </p>
        )}
      </div>

      <div className="campo">
        <label htmlFor="nieto-nombre">Nombre del prefijo</label>
        <input
          id="nieto-nombre"
          name="nombre"
          placeholder="Chapinero"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={60}
          disabled={sinHijos}
          aria-invalid={Boolean(errores.nombre)}
          aria-describedby={errores.nombre ? 'nieto-nombre-error' : undefined}
        />
        {errores.nombre && (
          <p id="nieto-nombre-error" className="error">
            {errores.nombre}
          </p>
        )}
      </div>

      {errorServidor && (
        <p className="error" role="alert">
          No se pudo registrar: {errorServidor}
        </p>
      )}

      <button type="submit" disabled={enviando || sinHijos}>
        {enviando ? 'Registrando...' : 'Registrar prefijo de cuatro dígitos'}
      </button>
    </form>
  )
}
