import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ArbolPrefijos } from './ArbolPrefijos'
import { RegistroPrefijo } from './RegistroPrefijo'
import { RegistroPrefijoBisnieto } from './RegistroPrefijoBisnieto'
import { RegistroPrefijoHijo } from './RegistroPrefijoHijo'
import { RegistroPrefijoNieto } from './RegistroPrefijoNieto'
import {
  listarPrefijos,
  listarPrefijosBisnietos,
  listarPrefijosHijos,
  listarPrefijosNietos,
  registrarPrefijo,
  registrarPrefijoBisnieto,
  registrarPrefijoHijo,
  registrarPrefijoNieto,
  type Prefijo,
  type PrefijoBisnieto,
  type PrefijoHijo,
  type PrefijoNieto,
} from './prefijosApi'

type Carga =
  | { tipo: 'cargando' }
  | { tipo: 'ok' }
  | { tipo: 'error'; mensaje: string }

const PESTANAS = [
  { id: 'padre', titulo: '1 dígito' },
  { id: 'hijo', titulo: '2 dígitos' },
  { id: 'nieto', titulo: '4 dígitos' },
  { id: 'bisnieto', titulo: '6 dígitos' },
] as const

type IdPestana = (typeof PESTANAS)[number]['id']

function App() {
  const [prefijos, setPrefijos] = useState<Prefijo[]>([])
  const [hijos, setHijos] = useState<PrefijoHijo[]>([])
  const [nietos, setNietos] = useState<PrefijoNieto[]>([])
  const [bisnietos, setBisnietos] = useState<PrefijoBisnieto[]>([])
  const [carga, setCarga] = useState<Carga>({ tipo: 'cargando' })
  const [activa, setActiva] = useState<IdPestana>('padre')
  const botonesPestana = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    Promise.all([
      listarPrefijos(),
      listarPrefijosHijos(),
      listarPrefijosNietos(),
      listarPrefijosBisnietos(),
    ])
      .then(([listaPadres, listaHijos, listaNietos, listaBisnietos]) => {
        setPrefijos(listaPadres)
        setHijos(listaHijos)
        setNietos(listaNietos)
        setBisnietos(listaBisnietos)
        setCarga({ tipo: 'ok' })
      })
      .catch((error: Error) => setCarga({ tipo: 'error', mensaje: error.message }))
  }, [])

  async function registrar(nuevo: Prefijo) {
    const creado = await registrarPrefijo(nuevo)
    setPrefijos((actuales) => [...actuales, creado])
  }

  async function registrarHijo(nuevo: PrefijoHijo) {
    const creado = await registrarPrefijoHijo(nuevo)
    setHijos((actuales) => [...actuales, creado])
  }

  async function registrarNieto(nuevo: PrefijoNieto) {
    const creado = await registrarPrefijoNieto(nuevo)
    setNietos((actuales) => [...actuales, creado])
  }

  async function registrarBisnieto(nuevo: PrefijoBisnieto) {
    const creado = await registrarPrefijoBisnieto(nuevo)
    setBisnietos((actuales) => [...actuales, creado])
  }

  // Navegación con flechas entre pestañas (patrón WAI-ARIA de tabs).
  function moverConTeclado(evento: KeyboardEvent<HTMLDivElement>) {
    const actual = PESTANAS.findIndex((p) => p.id === activa)
    let siguiente = actual
    if (evento.key === 'ArrowRight') siguiente = (actual + 1) % PESTANAS.length
    else if (evento.key === 'ArrowLeft')
      siguiente = (actual - 1 + PESTANAS.length) % PESTANAS.length
    else if (evento.key === 'Home') siguiente = 0
    else if (evento.key === 'End') siguiente = PESTANAS.length - 1
    else return

    evento.preventDefault()
    setActiva(PESTANAS[siguiente].id)
    botonesPestana.current[siguiente]?.focus()
  }

  return (
    <main>
      <h1>Registro de prefijos</h1>

      <div className="disposicion">
        <section className="panel" aria-label="Formularios de registro">
          <div
            className="pestanas"
            role="tablist"
            aria-label="Nivel del prefijo"
            onKeyDown={moverConTeclado}
          >
            {PESTANAS.map((p, i) => (
              <button
                key={p.id}
                ref={(el) => {
                  botonesPestana.current[i] = el
                }}
                type="button"
                role="tab"
                id={`pestana-${p.id}`}
                aria-selected={activa === p.id}
                aria-controls={`panel-${p.id}`}
                tabIndex={activa === p.id ? 0 : -1}
                onClick={() => setActiva(p.id)}
              >
                {p.titulo}
              </button>
            ))}
          </div>

          {/* Los paneles se ocultan en vez de desmontarse para no perder lo escrito. */}
          <div
            role="tabpanel"
            id="panel-padre"
            aria-labelledby="pestana-padre"
            hidden={activa !== 'padre'}
          >
            <RegistroPrefijo existentes={prefijos} onRegistrar={registrar} />
          </div>
          <div
            role="tabpanel"
            id="panel-hijo"
            aria-labelledby="pestana-hijo"
            hidden={activa !== 'hijo'}
          >
            <RegistroPrefijoHijo
              padres={prefijos}
              existentes={hijos}
              onRegistrar={registrarHijo}
            />
          </div>
          <div
            role="tabpanel"
            id="panel-nieto"
            aria-labelledby="pestana-nieto"
            hidden={activa !== 'nieto'}
          >
            <RegistroPrefijoNieto
              hijos={hijos}
              existentes={nietos}
              onRegistrar={registrarNieto}
            />
          </div>
          <div
            role="tabpanel"
            id="panel-bisnieto"
            aria-labelledby="pestana-bisnieto"
            hidden={activa !== 'bisnieto'}
          >
            <RegistroPrefijoBisnieto
              nietos={nietos}
              existentes={bisnietos}
              onRegistrar={registrarBisnieto}
            />
          </div>
        </section>

        <section className="panel" aria-labelledby="titulo-arbol">
          <h2 id="titulo-arbol">Prefijos registrados</h2>
          {carga.tipo === 'cargando' && <p>Cargando prefijos...</p>}
          {carga.tipo === 'error' && (
            <p className="error">No se pudieron cargar los prefijos ({carga.mensaje}).</p>
          )}
          {carga.tipo === 'ok' && prefijos.length === 0 && (
            <p>Todavía no hay prefijos registrados.</p>
          )}
          {prefijos.length > 0 && (
            <ArbolPrefijos
              prefijos={prefijos}
              hijos={hijos}
              nietos={nietos}
              bisnietos={bisnietos}
            />
          )}
        </section>
      </div>
    </main>
  )
}

export default App
