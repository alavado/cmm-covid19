import React from 'react'
import './CodigoColor.css'
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import escala from '../../../helpers/escala'
import { filtrarGeoJSONPorValor, toggleFiltro } from '../../../redux/actions'

const CodigoColor = () => {

  const { serieSeleccionada, subserieSeleccionada, posicion, filtroToggle } = useSelector(state => state.series)
  const { fecha } = subserieSeleccionada.datos[posicion]
  const dispatch = useDispatch()
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
      <div className="CodigoColor__espectro">
        {escala.map((v, i) => (
          <div
            className="CodigoColor__fraccion"
            key={`CodigoColor__fraccion_${i}`}
          >
            <div
              className="CodigoColor__fraccion_color"
              style={{ backgroundColor: v[1] }}
              onMouseEnter={() => {
                dispatch(toggleFiltro(false))
                dispatch(filtrarGeoJSONPorValor(x => x > v[0] && i < escala.length - 1 && x < escala[i + 1][0]))
              }}
              onMouseLeave={() => !filtroToggle && dispatch(filtrarGeoJSONPorValor(() => true))}
              onClick={() => dispatch(toggleFiltro(true))}
            />
            <div className="CodigoColor__fraccion_limite">
              {i === escala.length - 1 ? '50+' : v[0]}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CodigoColor
