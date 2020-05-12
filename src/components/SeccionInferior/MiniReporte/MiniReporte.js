import React from 'react'
import './MiniReporte.css'
import { useSelector } from 'react-redux'
import { FaArrowCircleUp, FaArrowCircleDown, FaUserFriends, FaChartBar } from 'react-icons/fa'
import { useParams } from 'react-router-dom'
import { CASOS_COMUNALES, CASOS_REGIONALES, CODIGO_CHILE, CASOS_COMUNALES_INTERPOLADOS, CONTAGIOS_REGIONALES_POR_100000_HABITANTES } from '../../../redux/reducers/series'
import { obtenerDemograficosComuna, obtenerDemograficosRegion } from '../../../helpers/demograficos'

const MiniReporte = () => {

  const { subserieSeleccionada: ss, series, posicion, comunasInterpoladas } = useSelector(state => state.series)
  const { division, codigo } = useParams()
  const { escala } = useSelector(state => state.colores)

  let { valor: valorPosicion, fecha } = ss.datos[posicion]
  const diferenciaDiaAnterior = posicion > 0 && (valorPosicion - ss.datos[posicion - 1].valor)
  let backgroundColor = escala.find((e, i) => i === escala.length - 1 || escala[i + 1][0] > valorPosicion)[1]

  let datosExtra = {
    casos: 0,
    casosAnteriores: 0,
    poblacion: 0,
    nombre: ''
  }
  if (division === 'comuna') {
    const datosComuna = series.find(s => s.id === (comunasInterpoladas ? CASOS_COMUNALES_INTERPOLADOS : CASOS_COMUNALES))
      .datos
      .find(d => Number(d.codigo) === Number(codigo))
    if (datosComuna.datos[posicion]) {
      datosExtra.casos = Math.round(datosComuna.datos[posicion].valor)
      datosExtra.poblacion = obtenerDemograficosComuna(codigo).poblacion
      datosExtra.nombre = obtenerDemograficosComuna(codigo).nombre
      datosExtra.interpolado = datosComuna.datos[posicion].interpolado
    }
  }
  else if (division === 'region') {
    const datosRegion = series.find(s => s.id === CASOS_REGIONALES)
      .datos
      .find(d => Number(d.codigo) === Number(codigo))
    if (datosRegion.datos[posicion + 1]) {
      datosExtra.casos = datosRegion.datos[posicion + 1].valor
      datosExtra.poblacion = obtenerDemograficosRegion(codigo).poblacion
      datosExtra.nombre = obtenerDemograficosRegion(codigo).nombre
    }
  }
  else {
    datosExtra.casos = series.find(s => s.id === CASOS_REGIONALES)
      .datos
      .map(r => r.datos[Math.min(r.datos.length - 1, posicion + 1)].valor)
      .reduce((sum, v) => sum + v)
    datosExtra.poblacion = obtenerDemograficosRegion(CODIGO_CHILE).poblacion
    datosExtra.nombre = obtenerDemograficosRegion(CODIGO_CHILE).nombre
    const serieChile = series
      .find(s => s.id === CONTAGIOS_REGIONALES_POR_100000_HABITANTES)
      .datos
      .find(d => d.codigo === CODIGO_CHILE).datos
    valorPosicion = serieChile[Math.min(posicion, serieChile.length - 1)].valor
    backgroundColor = escala.find((e, i) => i === escala.length - 1 || escala[i + 1][0] > valorPosicion)[1]
  }

  return (
    <div className="MiniReporte">
      <div className="MiniReporte__cuadro">
        <div
          className="MiniReporte__casos"
          style={{ backgroundColor }}
        >
          {valorPosicion.toLocaleString('de-DE', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}
        </div>
        <div className="MiniReporte__descripcion">Nuevos casos por 100.000 habitantes</div>
      </div>
      {diferenciaDiaAnterior !== false &&
        <div className="MiniReporte__diferencia">
          <div
            className="MiniReporte__diferencia_icono"
            style={{ color: diferenciaDiaAnterior > 0 ? '#F44336' : '#43A047' }}
          >
            {diferenciaDiaAnterior > 0 ?
              <FaArrowCircleUp
                className="MiniReporte__diferencia_icono_sube"
                style={{ color: escala.slice(-1)[0][1] }}
              /> :
              <FaArrowCircleDown
                className="MiniReporte__diferencia_icono_baja"
                style={{ color: escala[0][1] }}
              />
            }
          </div>
          {diferenciaDiaAnterior >= 0 && '+'}
          {diferenciaDiaAnterior.toLocaleString('de-DE', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} casos por 100.000 habitantes respecto {comunasInterpoladas ? 'a la estimación' : 'al reporte'} anterior ({fecha.diff(ss.datos[posicion - 1].fecha, 'days')} {fecha.diff(ss.datos[posicion - 1].fecha, 'days') > 1 ? 'días' : 'día'} antes)
        </div>
      }
      <div className="MiniReporte__diferencia">
        <div className="MiniReporte__diferencia_icono">
          <FaChartBar />
        </div>
        <div
          title="Para estimar los casos en los días sin datos por comuna, los nuevos casos de cada región se reparten entre sus comunas siguiendo la misma proporción de aumento observada entre los dos informes más cercanos en el tiempo."
          style={{ cursor: 'help' }}
        >
          {division === 'comuna' && '*'} {Number(datosExtra.casos).toLocaleString('de-DE')} caso{Number(datosExtra.casos) !== 1 ? 's' : ''} <span style={{ fontWeight: 'bold', textDecoration: 'underline', cursor: 'help' }}>{datosExtra.interpolado ? `estimado${Number(datosExtra.casos) !== 1 ? 's' : ''}` : 'informados'}</span> hasta el {fecha.format('dddd D [de] MMMM')}</div>
      </div>
      <div className="MiniReporte__diferencia">
        <div className="MiniReporte__diferencia_icono">
          <FaUserFriends />
        </div>
        <div>
          <a href="https://www.censo2017.cl/descargas/proyecciones/metodologia-estimaciones-y-proyecciones-de-poblacion-chile-1992-2050.pdf" target="_blank">
            {division === 'region' && 'La '} {datosExtra.nombre} tiene {Number(datosExtra.poblacion).toLocaleString('de-DE')} habitantes
          </a>
        </div>
      </div>
    </div>
  )
}

export default MiniReporte
