import React, { useMemo } from 'react'
import './RankingComunas.css'
import { useSelector } from 'react-redux'
import { CASOS_COMUNALES_POR_100000_HABITANTES, CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS, CODIGO_CHILE } from '../../../redux/reducers/series'
import { useParams, Link } from 'react-router-dom'

const RankingComunas = () => {

  const { series, posicion, comunasInterpoladas } = useSelector(state => state.series)
  const { escala } = useSelector(state => state.colores)
  const serieComunas = series.find(({ id }) => id === (comunasInterpoladas ? CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS: CASOS_COMUNALES_POR_100000_HABITANTES))
  const { codigo } = useParams()

  let comunasRegion
  if (codigo) {
    const codigoRegion = serieComunas
      .datos
      .find(c => c.codigo === Number(codigo))
      .codigoRegion
    comunasRegion = serieComunas
      .datos
      .filter(c => c.codigoRegion === codigoRegion)
      .map(({ codigo, nombre, datos }) => ({ nombre, codigo, valor: datos[posicion].valor }))
  }
  else {
    comunasRegion = serieComunas
      .datos
      .map(({ codigo, nombre, datos }) => ({ nombre, codigo, valor: datos[posicion].valor }))
  }

  const comunasOrdenadas = [...comunasRegion].sort((c1, c2) => c1.valor < c2.valor ? 1 : -1)
  const comunasConPosicion = comunasRegion.map(comuna => {
    const posicion = comunasOrdenadas.findIndex(c => c.codigo === comuna.codigo)
    return { ...comuna, posicion }
  })

  return (
    <div className="RankingComunas">
      {comunasConPosicion.map((c, i) => (
        <Link
          to={`/comuna/${c.codigo}`}
          className="RankingComunas__comuna"
          key={`ranking-${c.codigo}`}
          id={`ranking-${c.codigo}`}
          style={{
            transform: `translateY(${1 + c.posicion * 1.25}em)`,
            zIndex: c.posicion,
            backgroundColor: escala.find((e, i) => i === escala.length - 1 || escala[i + 1][0] > c.valor)[1]
          }}
        >
          <div className="RankingComunas__nombre_comuna">{c.nombre}</div>
          <div className="RankingComunas__casos_comuna">{c.valor.toLocaleString('de-DE', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}</div>
        </Link>
      ))}
      <div className="RankingComunas__titulo">
        <h1 className="RankingComunas__contenido_titulo">
          Comunas con más nuevos casos
        </h1>
      </div>
    </div>
  )
}

export default RankingComunas
