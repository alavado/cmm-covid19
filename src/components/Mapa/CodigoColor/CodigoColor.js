import React from 'react'
import './CodigoColor.css'
import { useSelector } from 'react-redux'
import moment from 'moment/min/moment-with-locales'

const CodigoColor = () => {

  const { serieSeleccionada, subserieSeleccionada, posicion } = useSelector(state => state.series)
  const { fecha } = subserieSeleccionada.datos[posicion]
  const diferencia = fecha.diff(moment(), 'days')
  let etiqueta = `${diferencia === 0 ? 'Hoy, ' : (diferencia === -1 ? 'Ayer, ' : '')} ${fecha.format('dddd D [de] MMMM')}`
  if (posicion > 0) {
    const diferenciaMedicionAnterior = fecha.diff(subserieSeleccionada.datos[posicion - 1].fecha, 'days')
    if (diferenciaMedicionAnterior > 1) {
      etiqueta = `Promedio 
        ${subserieSeleccionada.datos[posicion - 1].fecha.clone().add(1, 'days').format('D')}–${fecha.format('D')}
        de ${fecha.format('MMMM')}`
    }
  }

  return (
    <div className="CodigoColor">
      <div className="CodigoColor__titulo">{serieSeleccionada.nombre}</div>
      <div className="CodigoColor__fecha">{etiqueta}</div>
      <div className="CodigoColor__espectro" />
      <div className="CodigoColor__limites">
        <div>0</div>
        <div>Más de 20</div>
      </div>
    </div>
  )
}

export default CodigoColor
