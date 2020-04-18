import React from 'react'
import './CodigoColor.css'
import { useSelector } from 'react-redux'
import moment from 'moment/min/moment-with-locales'

const CodigoColor = () => {

  const { serieSeleccionada, subserieSeleccionada, posicion } = useSelector(state => state.series)
  const { fecha } = subserieSeleccionada.datos[posicion]
  const diferencia = fecha.diff(moment(), 'days')

  return (
    <div className="CodigoColor">
      <div className="CodigoColor__titulo">{serieSeleccionada.nombre}</div>
      <div className="CodigoColor__fecha">
        {diferencia === 0 ? 'Hoy, ' : (diferencia === -1 ? 'Ayer, ' : '')} {fecha.format('dddd D [de] MMMM')}
      </div>
      <div className="CodigoColor__espectro" />
      <div className="CodigoColor__limites">
        <div>0</div>
        <div>Más de 20</div>
      </div>
    </div>
  )
}

export default CodigoColor
