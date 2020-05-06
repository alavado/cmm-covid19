import React from 'react'
import './RankingComunas.css'
import { useSelector, useDispatch } from 'react-redux'
import { CASOS_COMUNALES_POR_100000_HABITANTES, CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS, CODIGO_CHILE, CASOS_COMUNALES_INTERPOLADOS, CASOS_COMUNALES } from '../../../redux/reducers/series'
import { useParams, Link } from 'react-router-dom'
import { expandirRanking } from '../../../redux/actions'
import { obtenerDemograficosComuna } from '../../../helpers/demograficos'
import {
  FaWindowMinimize as IconoMenosDetalle,
  FaWindowMaximize as IconoMasDetalle
} from 'react-icons/fa'

const RankingComunas = () => {

  const { series, posicion, comunasInterpoladas } = useSelector(state => state.series)
  const { escala } = useSelector(state => state.colores)
  const { rankingExpandido } = useSelector(state => state.ranking)
  const serieNormalizada = series.find(({ id }) => id === (comunasInterpoladas ? CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS: CASOS_COMUNALES_POR_100000_HABITANTES))
  const serieCasos = series.find(({ id }) => id === (comunasInterpoladas ? CASOS_COMUNALES_INTERPOLADOS: CASOS_COMUNALES))
  
  const { codigo } = useParams()
  const dispatch = useDispatch()

  if (!comunasInterpoladas) {
    return null
  }

  let comunasRegion
  if (codigo) {
    const codigoRegion = serieNormalizada
      .datos
      .find(c => c.codigo === Number(codigo))
      .codigoRegion
    comunasRegion = serieNormalizada
      .datos
      .filter(c => c.codigoRegion === codigoRegion)
      .map(({ codigo, nombre, datos }) => {
        const serieOriginal = serieCasos.datos.find(c => c.codigo === codigo)
        const promedioSemanal = serieOriginal.datos.slice(posicion - 6, posicion + 1).reduce((sum, x) => sum + x.valor, 0) / 7
        const promedioSemanalAnterior = serieOriginal.datos.slice(posicion - 13, posicion - 6).reduce((sum, x) => sum + x.valor, 0) / 7
        return {
          nombre,
          codigo,
          valorNormalizado: datos[posicion].valor,
          valorOriginal: serieOriginal.datos[posicion].valor - serieOriginal.datos[Math.max(0, posicion - 1)].valor,
          total: serieOriginal.datos[posicion].valor,
          variacionSemanal: 100 * (promedioSemanal / (promedioSemanalAnterior === 0 ? 1 : promedioSemanalAnterior) - 1)
        }
      })
  }
  else {
    comunasRegion = serieNormalizada
      .datos
      .map(({ codigo, nombre, datos }) => ({ nombre, codigo, valorNormalizado: datos[posicion].valor }))
  }

  const comunasOrdenadas = [...comunasRegion].sort((c1, c2) => c1.valorNormalizado < c2.valorNormalizado ? 1 : -1)
  const comunasConPosicion = comunasRegion
    .map(comuna => {
      const posicion = comunasOrdenadas.findIndex(c => c.codigo === comuna.codigo)
      return { ...comuna, posicion }
    })

  return (
    <div className={`RankingComunas${rankingExpandido ? ' RankingComunas--expandido' : ''}`}>
      {comunasConPosicion.map(c => (
        <Link
          to={`/comuna/${c.codigo}`}
          className={`RankingComunas__comuna${c.codigo === Number(codigo) ? ' RankingComunas__comuna--seleccionada': ''}`}
          key={`ranking-${c.codigo}`}
          id={`ranking-${c.codigo}`}
          style={{
            transform: `translateY(${1.5 + c.posicion * 1.25}em)`,
            zIndex: c.posicion,
            backgroundColor: escala.find((e, i) => i === escala.length - 1 || escala[i + 1][0] > c.valorNormalizado)[1]
          }}
        >
          <div className="RankingComunas__nombre_comuna">
            {c.posicion + 1}. {c.nombre}
          </div>
          <div className="RankingComunas__casos_comuna">
            {c.valorNormalizado.toLocaleString('de-DE', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}
          </div>
          <div className="RankingComunas__casos_comuna">
            {c.valorOriginal.toLocaleString('de-DE', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
          </div>
          <div className="RankingComunas__casos_comuna">
            {c.total.toLocaleString('de-DE', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
          </div>
          <div className="RankingComunas__casos_comuna">
            {c.variacionSemanal === 0 ?
              '-' :
              <>
                {c.variacionSemanal > 0 && '+' }
                {c.variacionSemanal.toLocaleString('de-DE', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                %
              </>
            }
          </div>
        </Link>
      ))}
      <div className="RankingComunas__titulo">
        <h1 className="RankingComunas__botones">
          <button
            className="RankingComunas__boton_detalle"
            onClick={() => dispatch(expandirRanking(!rankingExpandido))}
          >
            {rankingExpandido ? <IconoMenosDetalle /> : <IconoMasDetalle />}
          </button>
        </h1>
        <h1 className="RankingComunas__contenido_titulo" title="Casos comunales por 100.000 habitantes estimados según el último reporte regional">
          Nuevos casos<br />x 100.000 hab.
        </h1>
        <h1 className="RankingComunas__contenido_titulo" title="Casos comunales estimados según el último reporte regional">
          Nuevos<br />casos
        </h1>
        <h1 className="RankingComunas__contenido_titulo" totle="Total de casos en la comuna">
          Casos<br />totales
        </h1>
        <h1 className="RankingComunas__contenido_titulo" title="Promedio de casos de los últimos 7 días en relación a los 7 días anteriores">
          Variación<br/>semanal
        </h1>
      </div>
    </div>
  )
}

export default RankingComunas
