import { useState, type SubmitEvent } from 'react'
import type { PrefijoBisnieto, PrefijoNieto } from './prefijosApi'

type Errores = Partial<Record<keyof PrefijoBisnieto, string>>

type Props = {
  nietos: PrefijoNieto[]
  existentes: PrefijoBisnieto[]
  // Debe lanzar un Error con un mensaje legible si el registro falla.
  onRegistrar: (bisnieto: PrefijoBisnieto) => Promise<void>
}

function validar(datos: PrefijoBisnieto, existentes: PrefijoBisnieto[]): Errores {
  const errores: Errores = {}

  if (!datos.numeroPadre) {
    errores.numeroPadre = 'Selecciona el prefijo de cuatro dígitos.'
  }

  if (!datos.numero) {
    errores.numero = 'El prefijo es obligatorio.'
  } else if (!/^\d{6}$/.test(datos.numero)) {
    errores.numero = 'El prefijo debe tener exactamente seis dígitos.'
  } else if (existentes.some((b) => b.numero === datos.numero)) {
    errores.numero = 'Ese prefijo de seis dígitos ya está registrado.'
  }

  if (!datos.nombre) {
    errores.nombre = 'El nombre es obligatorio.'
  } else if (datos.nombre.length > 60) {
    errores.nombre = 'El nombre no puede superar 60 caracteres.'
  }

  return errores
}

export function RegistroPrefijoBisnieto({ nietos, existentes, onRegistrar }: Props) {
  const [numeroPadre, setNumeroPadre] = useState('')
  const [numero, setNumero] = useState('')
  const [nombre, setNombre] = useState('')
  const [errores, setErrores] = useState<Errores>({})
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const sinNietos = nietos.length === 0

  async function manejarEnvio(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErrorServidor(null)

    const datos: PrefijoBisnieto = {
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
      // Se mantiene el prefijo de cuatro dígitos elegido para registrar varios seguidos.
    } catch (error) {
      setErrorServidor(error instanceof Error ? error.message : 'Error desconocido.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={manejarEnvio} noValidate className="formulario">
      {sinNietos && <p>Primero registra al menos un prefijo de cuatro dígitos.</p>}

      <div className="campo">
        <label htmlFor="bisnieto-padre">Prefijo de cuatro dígitos</label>
        <select
          id="bisnieto-padre"
          name="numeroPadre"
          value={numeroPadre}
          onChange={(e) => setNumeroPadre(e.target.value)}
          disabled={sinNietos}
          aria-invalid={Boolean(errores.numeroPadre)}
          aria-describedby={errores.numeroPadre ? 'bisnieto-padre-error' : undefined}
        >
          <option value="">Selecciona un prefijo de cuatro dígitos...</option>
          {nietos.map((n) => (
            <option key={n.numero} value={n.numero}>
              {n.numero} — {n.nombre} (de {n.numeroPadre})
            </option>
          ))}
        </select>
        {errores.numeroPadre && (
          <p id="bisnieto-padre-error" className="error">
            {errores.numeroPadre}
          </p>
        )}
      </div>

      <div className="campo">
        <label htmlFor="bisnieto-numero">Prefijo de seis dígitos</label>
        <input
          id="bisnieto-numero"
          name="numero"
          inputMode="numeric"
          placeholder="100101"
          value={numero}
          onChange={(e) => setNumero(e.target.value.replace(/\D/g, ''))}
          maxLength={6}
          disabled={sinNietos}
          aria-invalid={Boolean(errores.numero)}
          aria-describedby={errores.numero ? 'bisnieto-numero-error' : undefined}
        />
        {errores.numero && (
          <p id="bisnieto-numero-error" className="error">
            {errores.numero}
          </p>
        )}
      </div>

      <div className="campo">
        <label htmlFor="bisnieto-nombre">Nombre del prefijo</label>
        <input
          id="bisnieto-nombre"
          name="nombre"
          placeholder="Zona G"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={60}
          disabled={sinNietos}
          aria-invalid={Boolean(errores.nombre)}
          aria-describedby={errores.nombre ? 'bisnieto-nombre-error' : undefined}
        />
        {errores.nombre && (
          <p id="bisnieto-nombre-error" className="error">
            {errores.nombre}
          </p>
        )}
      </div>

      {errorServidor && (
        <p className="error" role="alert">
          No se pudo registrar: {errorServidor}
        </p>
      )}

      <button type="submit" disabled={enviando || sinNietos}>
        {enviando ? 'Registrando...' : 'Registrar prefijo de seis dígitos'}
      </button>
    </form>
  )
}
