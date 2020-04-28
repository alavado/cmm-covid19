import React from 'react'
import './MiniReporte.css'
import escala from '../../../helpers/escala'
import { useSelector } from 'react-redux'
import { FaArrowCircleUp, FaArrowCircleDown } from 'react-icons/fa'
import demograficosComunas from '../../../data/demografia/comunas.json'
import { useParams } from 'react-router-dom'
import { CASOS_COMUNALES } from '../../../redux/reducers/series'

const MiniReporte = () => {

  const { subserieSeleccionada: ss, series, posicion } = useSelector(state => state.series)
  const { division, codigo} = useParams()
  
  const { valor: valorPosicion, fecha } = ss.datos[posicion]
  const diferenciaDiaAnterior = posicion > 0 && (valorPosicion - ss.datos[posicion - 1].valor)
  const backgroundColor = escala.find((e, i) => i === escala.length - 1 || escala[i + 1][0] > valorPosicion)[1]
  
  let datosExtra = {
    casos: 0,
    poblacion: 0
  }
  if (division === 'comuna') {
    const datosComuna = series.find(s => s.id === CASOS_COMUNALES)
      .datos
      .find(d => d.codigo === Number(codigo))
    if (datosComuna.datos[posicion])
    datosExtra.casos = datosComuna.datos[posicion].valor
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
      <div className="MiniReporte__poblacion">
        <div> </div>
        {datosExtra.poblacion}
      </div>
      <div className="MiniReporte__casos_totales">
        {datosExtra.casos}
      </div>
    </div>
  )
}

export default MiniReporte
