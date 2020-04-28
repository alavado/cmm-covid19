import React from 'react'
import './MiniReporte.css'
import escala from '../../../helpers/escala'
import { useSelector } from 'react-redux'
import { FaArrowCircleUp, FaArrowCircleDown, FaPeopleCarry, FaUserFriends, FaRegSun, FaChartBar } from 'react-icons/fa'
import demograficosComunas from '../../../data/demografia/comunas.json'
import { useParams } from 'react-router-dom'
import { CASOS_COMUNALES, CASOS_REGIONALES, CONTAGIOS_REGIONALES_POR_100000_HABITANTES, CODIGO_CHILE } from '../../../redux/reducers/series'
import { obtenerDemograficosComuna, obtenerDemograficosRegion } from '../../../helpers/demograficos'

const MiniReporte = () => {

  const { subserieSeleccionada: ss, series, posicion } = useSelector(state => state.series)
  const { division, codigo } = useParams()
  
  const { valor: valorPosicion, fecha } = ss.datos[posicion]
  const diferenciaDiaAnterior = posicion > 0 && (valorPosicion - ss.datos[posicion - 1].valor)
  const backgroundColor = escala.find((e, i) => i === escala.length - 1 || escala[i + 1][0] > valorPosicion)[1]
  
  let datosExtra = {
    casos: 0,
    casosAnteriores: 0,
    poblacion: 0,
    nombre: ''
  }
  if (division === 'comuna') {
    const datosComuna = series.find(s => s.id === CASOS_COMUNALES)
      .datos
      .find(d => Number(d.codigo) === Number(codigo))
    if (datosComuna.datos[posicion]) {
      datosExtra.casos = datosComuna.datos[posicion].valor
      datosExtra.poblacion = obtenerDemograficosComuna(codigo).poblacion
      datosExtra.nombre = obtenerDemograficosComuna(codigo).nombre
    }
  }
  else if (division === 'region') {
    const datosRegion = series.find(s => s.id === CASOS_REGIONALES)
      .datos
      .find(d => Number(d.codigo) === Number(codigo))
    console.log(datosRegion.datos[posicion])
    if (datosRegion.datos[posicion]) {
      datosExtra.casos = datosRegion.datos[posicion].valor
      datosExtra.poblacion = obtenerDemograficosRegion(codigo).poblacion
      datosExtra.nombre = obtenerDemograficosRegion(codigo).nombre
    }
  }
  else {
    datosExtra.casos = series.find(s => s.id === CASOS_REGIONALES)
      .datos
      .map(r => r.datos[posicion].valor)
      .reduce((sum, v) => sum + v)
    datosExtra.poblacion = obtenerDemograficosRegion(CODIGO_CHILE).poblacion
    datosExtra.nombre = obtenerDemograficosRegion(CODIGO_CHILE).nombre
  }

  return (
    <div className="MiniReporte">
      <div className="MiniReporte__cuadro">
        <div
          className="MiniReporte__casos"
          style={{ backgroundColor }}
        >
          {valorPosicion.toLocaleString('de-DE', { maximumFractionDigits: 2 })}
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
              <FaArrowCircleUp className="MiniReporte__diferencia_icono_sube" /> :
              <FaArrowCircleDown className="MiniReporte__diferencia_icono_baja" />
            }
          </div>
          {diferenciaDiaAnterior >= 0 && '+'}
          {diferenciaDiaAnterior.toLocaleString('de-DE', { maximumFractionDigits: 2 })} casos por 100.000 habitantes respecto al <br/>reporte anterior ({fecha.diff(ss.datos[posicion - 1].fecha, 'days')} {fecha.diff(ss.datos[posicion - 1].fecha, 'days') > 1 ? 'días' : 'día'} antes)
        </div>
      }
      <div className="MiniReporte__diferencia">
        <div className="MiniReporte__diferencia_icono">
          <FaUserFriends />
        </div>
        <div><a href="https://www.censo2017.cl/descargas/proyecciones/metodologia-estimaciones-y-proyecciones-de-poblacion-chile-1992-2050.pdf" target="_blank">{datosExtra.nombre} tiene {Number(datosExtra.poblacion).toLocaleString('de-DE')} habitantes</a></div>
      </div>
      <div className="MiniReporte__diferencia">
        <div className="MiniReporte__diferencia_icono">
          <FaChartBar />
        </div>
        <div>{Number(datosExtra.casos).toLocaleString('de-DE')} casos en total hasta el {fecha.format('dddd D [de] MMMM')}</div>
      </div>
    </div>
  )
}

export default MiniReporte
