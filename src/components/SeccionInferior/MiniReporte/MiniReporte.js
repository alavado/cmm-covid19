import React from 'react'
import './MiniReporte.css'
import escala from '../../../helpers/escala'
import { useSelector } from 'react-redux'
import { FaArrowCircleUp, FaArrowCircleDown } from 'react-icons/fa'

const MiniReporte = () => {

  const { subserieSeleccionada: serie, posicion } = useSelector(state => state.series)
  const { valor: valorPosicion, fecha } = serie.datos[posicion]
  
  const diferenciaDiaAnterior = posicion > 0 && (valorPosicion - serie.datos[posicion - 1].valor)

  return (
    <div className="MiniReporte">
      <div className="MiniReporte__cuadro">
        <div
          className="MiniReporte__casos"
          style={{ backgroundColor: escala.find((e, i) => escala[i + 1][0] > valorPosicion)[1] }}
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
          {diferenciaDiaAnterior.toLocaleString('de-DE', { maximumFractionDigits: 2 })} casos respecto al <br/>reporte anterior ({fecha.diff(serie.datos[posicion - 1].fecha, 'days')} {fecha.diff(serie.datos[posicion - 1].fecha, 'days') > 1 ? 'días' : 'día'} antes)
        </div>
      }
    </div>
  )
}

export default MiniReporte
