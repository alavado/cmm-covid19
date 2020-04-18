import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import './range.css'
import './SelectorFecha.css'
import { avanzarEnSerie, retrocederEnSerie, fijarPosicionSerie } from '../../../redux/actions'
import moment from 'moment/min/moment-with-locales'
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa'
moment.locale('es')

const SelectorFecha = () => {

  const { subserieSeleccionada: serie, posicion } = useSelector(state => state.series)
  const diferencia = serie.datos[posicion].fecha.diff(moment(), 'days')
  const rangoDias = serie.datos.length
  const dispatch = useDispatch()
  const [ancho, setAncho] = useState(window.innerWidth)

  useEffect(() => {
    const fecha = document.getElementsByClassName('SelectorFecha__contenedor_fecha')[0]
    const limite = document.getElementsByClassName('SelectorFecha__limite')[0]
    const slider = document.getElementsByClassName('SelectorFecha__selector')[0]
    fecha.style.marginLeft = `calc(
      ${limite.clientWidth}px - ${fecha.clientWidth / 2}px + 9px + ${slider.clientWidth * posicion / (rangoDias - 1)}px)`
  }, [posicion, ancho])

  useEffect(() => {
    window.addEventListener('resize', () => setAncho(window.innerWidth))
    return () => window.removeEventListener('resize')
  }, [])

  return (
    <div className="SelectorFecha">
      <div className="SelectorFecha__contenedor_rango">
        <div className="SelectorFecha__limite">{serie.datos[0].fecha.format(`DD/MM`)}</div>
        <input
          type="range"
          className="SelectorFecha__selector"
          min={0}
          step={1}
          max={rangoDias - 1}
          onChange={e => dispatch(fijarPosicionSerie(e.target.value))}
          value={posicion}
        />
        <div className="SelectorFecha__limite">{serie.datos.slice(-1)[0].fecha.format(`DD/MM`)}</div>
      </div>
      <div className="SelectorFecha__contenedor_fecha">
        <div className="SelectorFecha__fecha">
          <button
            className="SelectorFecha__fecha_boton"
            onClick={e => dispatch(retrocederEnSerie())}
            title="Ir a día anterior"
            aria-label={'Ir a día anterior'}
          >
            <FaCaretLeft />
          </button>
          <div className="SelectorFecha__texto_fecha">
            {diferencia === 0 ? 'Hoy, ' : (diferencia === -1 ? 'Ayer, ' : '')} {serie.datos[posicion].fecha.format('dddd D [de] MMMM')}
          </div>
          <button 
            className="SelectorFecha__fecha_boton"
            onClick={e => dispatch(avanzarEnSerie())}
            title="Ir a día siguiente"
            aria-label={'Ir a día siguiente'}
          >
            <FaCaretRight />
          </button>
        </div>
      </div>
    </div>
  )
}

export default SelectorFecha
