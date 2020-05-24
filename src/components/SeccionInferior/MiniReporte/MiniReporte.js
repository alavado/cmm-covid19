import React from 'react'
import './MiniReporte.css'
import { useSelector } from 'react-redux'
import { FaArrowCircleUp, FaArrowCircleDown, FaUserFriends, FaChartBar } from 'react-icons/fa'
import { useParams } from 'react-router-dom'
import { CODIGO_CHILE } from '../../../redux/reducers/series'
import { obtenerDemograficosComuna, obtenerDemograficosRegion } from '../../../helpers/demograficos'
import { obtenerColor } from '../../../helpers/escala'
import moment from 'moment'

const MiniReporte = () => {

  const { division, codigo } = useParams()
  const { escala } = useSelector(state => state.colores)
  const { datasets, indice, posicion } = useSelector(state => state.datasets)
  const dataset = datasets[indice]

  const fecha = moment(dataset.chile[posicion].fecha, 'DD/MM')

  let datosExtra = {
    casos: 0,
    casosAnteriores: 0,
    poblacion: 0,
    nombre: '',
    diferencia: 0
  }
  if (division === 'comuna' && dataset.comunas) {
    const datosComuna = dataset.comunas.series.find(s => s.codigo === Number(codigo))
    if (datosComuna.serie[posicion]) {
      const demograficos = obtenerDemograficosComuna(codigo)
      datosExtra.casos = Math.round(datosComuna.serie[posicion].valor)
      datosExtra.poblacion = demograficos.poblacion
      datosExtra.nombre = demograficos.nombre
      datosExtra.interpolado = datosComuna.serie[posicion].interpolado
      datosExtra.diferencia = datosComuna.serie[posicion].valor - datosComuna.serie[Math.max(0, posicion - 1)].valor
    }
  }
  else if (division === 'region') {
    const datosRegion = dataset.regiones.series.find(s => s.codigo === Number(codigo))
    if (datosRegion.serie[posicion]) {
      const demograficos = obtenerDemograficosRegion(codigo)
      datosExtra.casos = datosRegion.serie[posicion].valor
      datosExtra.poblacion = demograficos.poblacion
      datosExtra.nombre = demograficos.nombre
      datosExtra.diferencia = datosRegion.serie[posicion].valor - datosRegion.serie[Math.max(0, posicion - 1)].valor
    }
  }
  else {
    datosExtra.casos = datasets[indice].chile[posicion].valor
    datosExtra.poblacion = obtenerDemograficosRegion(CODIGO_CHILE).poblacion
    datosExtra.nombre = obtenerDemograficosRegion(CODIGO_CHILE).nombre
    datosExtra.diferencia = datasets[indice].chile[posicion].valor - datasets[indice].chile[Math.max(0, posicion - 1)].valor
  }
  let valorFecha
  if (dataset.comunas && division === 'comuna') {
    const datos = dataset.comunas.series.find(s => s.codigo === Number(codigo))
    valorFecha = datos.serie[Math.min(posicion, datos.serie.length - 1)].valor
  }
  else if (division === 'region') {
    const datos = dataset.regiones.series.find(s => s.codigo === Number(codigo))
    valorFecha = datos.serie[posicion].valor
  }
  else {
    valorFecha = dataset.chile[posicion].valor
  }
  let backgroundColor = obtenerColor(valorFecha, dataset.escala, escala)

  return (
    <div className="MiniReporte">
      <div className="MiniReporte__cuadro" style={{ backgroundColor }}>
        <div className="MiniReporte__casos">
          {valorFecha.toLocaleString('de-DE', { maximumFractionDigits: 1 })}
        </div>
        <div className="MiniReporte__descripcion">{dataset.nombre}</div>
      </div>
      <div className="MiniReporte__diferencia">
        <div
          className="MiniReporte__diferencia_icono"
          style={{ color: datosExtra.diferencia > 0 ? '#F44336' : '#43A047' }}
        >
          {datosExtra.diferencia > 0 ?
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
        {datosExtra.diferencia >= 0 && '+'}
        {datosExtra.diferencia.toLocaleString('de-DE', { maximumFractionDigits: 1 })} respecto al día anterior
      </div>
      <div className="MiniReporte__diferencia">
        <div className="MiniReporte__diferencia_icono">
          <FaChartBar />
        </div>
        <div
          title="Para estimar los casos en los días sin datos por comuna, los nuevos casos de cada región se reparten entre sus comunas siguiendo la misma proporción de aumento observada entre los dos informes más cercanos en el tiempo."
          style={{ cursor: 'help' }}
        >
          {Number(datosExtra.casos).toLocaleString('de-DE')} caso{Number(datosExtra.casos) !== 1 ? 's' : ''} <span style={{ fontWeight: 'bold', textDecoration: 'underline', cursor: 'help' }}>{datosExtra.interpolado ? `estimado${Number(datosExtra.casos) !== 1 ? 's' : ''}` : 'informados'}</span> hasta el {fecha.format('dddd D [de] MMMM')}</div>
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
