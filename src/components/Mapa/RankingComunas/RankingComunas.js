import React from 'react'
import './RankingComunas.css'
import { useSelector, useDispatch } from 'react-redux'
import { NUEVOS_CASOS_COMUNALES_POR_100000_HABITANTES, NUEVOS_CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS, CODIGO_CHILE, CASOS_COMUNALES_INTERPOLADOS, CASOS_COMUNALES } from '../../../redux/reducers/series'
import { useParams, Link } from 'react-router-dom'
import { expandirRanking, cambiarOrdenRanking } from '../../../redux/actions'
import { obtenerDemograficosComuna } from '../../../helpers/demograficos'
import {
  FaWindowMinimize as IconoMenosDetalle,
  FaWindowMaximize as IconoMasDetalle,
  FaCaretDown,
  FaSort
} from 'react-icons/fa'
import moment from 'moment'
import {
  RANKING_NUEVOS_CASOS_POR_100000_HABITANTES,
  RANKING_NUEVOS_CASOS,
  RANKING_CASOS_TOTALES,
  RANKING_VARIACION_SEMANAL
} from '../../../redux/reducers/ranking'

const RankingComunas = () => {

  const { series, posicion, comunasInterpoladas, datosNormalizadosPor100000Habitantes } = useSelector(state => state.series)
  const { escala } = useSelector(state => state.colores)
  const { rankingExpandido, ordenRanking } = useSelector(state => state.ranking)
  const serieNormalizada = series.find(({ id }) => {
    return id === (comunasInterpoladas ?
      NUEVOS_CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS :
      NUEVOS_CASOS_COMUNALES_POR_100000_HABITANTES
    )
  })
  const serieCasos = series.find(({ id }) => id === (comunasInterpoladas ? CASOS_COMUNALES_INTERPOLADOS: CASOS_COMUNALES))
  
  const { codigo } = useParams()
  const dispatch = useDispatch()

  if (!comunasInterpoladas || serieCasos.datos.find(c => c.codigo === Number(codigo)).datos[posicion].fecha.diff(moment('2020-04-01'), 'days') < 0) {
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
          variacionSemanal: promedioSemanalAnterior === 0 ? -1 : (100 * (promedioSemanal / promedioSemanalAnterior - 1))
        }
      })
  }
  else {
    comunasRegion = serieNormalizada
      .datos
      .map(({ codigo, nombre, datos }) => ({
        nombre,
        codigo,
        valorNormalizado: datos[posicion].valor
      }))
  }

  const comunasOrdenadas = [...comunasRegion]
    .sort((c1, c2) => {
      switch (ordenRanking) {
        case RANKING_NUEVOS_CASOS:
          return c1.valorOriginal < c2.valorOriginal ? 1 : -1
        case RANKING_NUEVOS_CASOS_POR_100000_HABITANTES:
          return c1.valorNormalizado < c2.valorNormalizado ? 1 : -1
        case RANKING_VARIACION_SEMANAL:
          return c1.variacionSemanal < c2.variacionSemanal ? 1 : -1
        default:
          return c1.total < c2.total ? 1 : -1
      }
    })
    
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
            {c.variacionSemanal <= 0 ?
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
        <h1
          className="RankingComunas__contenido_encabezado"
          title="Nuevos casos confirmados por 100.000 habitantes en la comuna. El número de casos confirmados es menor que el número real de casos, porque no se les toma el examen a todos los habitantes."
          onClick={() => dispatch(cambiarOrdenRanking(RANKING_NUEVOS_CASOS_POR_100000_HABITANTES))}
        >
          Nuevos casos<br />x 100.000 hab.
          {ordenRanking === RANKING_NUEVOS_CASOS_POR_100000_HABITANTES ?
            <FaCaretDown className="RankingComunas__icono_ordenar" /> :
            <FaSort className="RankingComunas__icono_ordenar" />
          }
        </h1>
        <h1
          className="RankingComunas__contenido_encabezado"
          title="Nuevos casos confirmados en la comuna. El número de casos confirmados es menor que el número real de casos, porque no se les toma el examen a todos los habitantes."
          onClick={() => dispatch(cambiarOrdenRanking(RANKING_NUEVOS_CASOS))}
        >
          Nuevos<br />casos
          {ordenRanking === RANKING_NUEVOS_CASOS ?
            <FaCaretDown className="RankingComunas__icono_ordenar" /> :
            <FaSort className="RankingComunas__icono_ordenar" />
          }
        </h1>
        <h1
          className="RankingComunas__contenido_encabezado"
          title="Total de casos confirmados en la comuna. El número de casos confirmados es menor que el número real de casos, porque no se les toma el examen a todos los habitantes."
          onClick={() => dispatch(cambiarOrdenRanking(RANKING_CASOS_TOTALES))}
        >
          Casos<br />totales
          {ordenRanking === RANKING_CASOS_TOTALES ?
            <FaCaretDown className="RankingComunas__icono_ordenar" /> :
            <FaSort className="RankingComunas__icono_ordenar" />
          }
        </h1>
        <h1
          className="RankingComunas__contenido_encabezado"
          title="Porcentaje de aumento o disminución de nuevos casos confirmados en la comuna. Este se calcula como el promedio de nuevos casos confirmados durante los últimos 7 días en relación al de los 7 días anteriores."
          onClick={() => dispatch(cambiarOrdenRanking(RANKING_VARIACION_SEMANAL))}
        >
          Variación<br/>semanal
          {ordenRanking === RANKING_VARIACION_SEMANAL ?
            <FaCaretDown className="RankingComunas__icono_ordenar" /> :
            <FaSort className="RankingComunas__icono_ordenar" />
          }
        </h1>
      </div>
    </div>
  )
}

export default RankingComunas
