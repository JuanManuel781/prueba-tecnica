import type { Prefijo, PrefijoBisnieto, PrefijoHijo, PrefijoNieto } from './prefijosApi'

type Props = {
  prefijos: Prefijo[]
  hijos: PrefijoHijo[]
  nietos: PrefijoNieto[]
  bisnietos: PrefijoBisnieto[]
}

function Nodo({ numero, nombre }: { numero: string; nombre: string }) {
  return (
    <span className="nodo">
      <span className="nodo-numero">{numero}</span>
      <span className="nodo-nombre">{nombre}</span>
    </span>
  )
}

export function ArbolPrefijos({ prefijos, hijos, nietos, bisnietos }: Props) {
  return (
    <ul className="arbol">
      {prefijos.map((p) => {
        const susHijos = hijos.filter((h) => h.numeroPadre === p.numero)
        return (
          <li key={p.numero}>
            <Nodo numero={`+${p.numero}`} nombre={p.nombre} />
            {susHijos.length > 0 && (
              <ul>
                {susHijos.map((h) => {
                  const susNietos = nietos.filter((n) => n.numeroPadre === h.numero)
                  return (
                    <li key={h.numero}>
                      <Nodo numero={h.numero} nombre={h.nombre} />
                      {susNietos.length > 0 && (
                        <ul>
                          {susNietos.map((n) => {
                            const susBisnietos = bisnietos.filter(
                              (b) => b.numeroPadre === n.numero,
                            )
                            return (
                              <li key={n.numero}>
                                <Nodo numero={n.numero} nombre={n.nombre} />
                                {susBisnietos.length > 0 && (
                                  <ul>
                                    {susBisnietos.map((b) => (
                                      <li key={b.numero}>
                                        <Nodo numero={b.numero} nombre={b.nombre} />
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </li>
        )
      })}
    </ul>
  )
}
