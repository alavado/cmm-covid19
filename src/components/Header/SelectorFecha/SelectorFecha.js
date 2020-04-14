import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import './range.css'
import './SelectorFecha.css'
import { fijarDia } from '../../../redux/actions'
import moment from 'moment/min/moment-with-locales'
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa'
moment.locale('es')

const SelectorFecha = () => {

  const { dia } = useSelector(state => state.fecha)
  const { region } = useSelector(state => state.region)
  const fecha = moment(region.fechaInicial).add(dia, 'days')
  const diferencia = fecha.diff(moment(), 'days')
  const rangoDias = region.datos.length - 1
  const dispatch = useDispatch()
  const [ancho, setAncho] = useState(window.innerWidth)

  useEffect(() => {
    const fecha = document.getElementsByClassName('SelectorFecha__contenedor_fecha')[0]
    const limite = document.getElementsByClassName('SelectorFecha__limite')[0]
    const slider = document.getElementsByClassName('SelectorFecha__selector')[0]
    fecha.style.marginLeft = `calc(
      ${limite.clientWidth}px - ${fecha.clientWidth / 2}px + 9px + ${slider.clientWidth * dia / rangoDias}px)`
  }, [dia, ancho])

  window.addEventListener('resize', () => setAncho(window.innerWidth))

  return (
    <div className="SelectorFecha">
      <div className="SelectorFecha__contenedor_rango">
        <div className="SelectorFecha__limite">{moment(region.fechaInicial).format(`DD/MM`)}</div>
        <input
          type="range"
          className="SelectorFecha__selector"
          min={0}
          max={rangoDias}
          step={1}
          onChange={e => dispatch(fijarDia(e.target.value, region))}
          value={dia}
        />
        <div className="SelectorFecha__limite">{moment(region.fechaInicial).add('days', rangoDias).format(`DD/MM`)}</div>
      </div>
      <div className="SelectorFecha__contenedor_fecha">
        <div className="SelectorFecha__fecha">
          <button
            className="SelectorFecha__fecha_boton"
            onClick={e => dispatch(fijarDia(dia - 1, region))}
            title="Ir a día anterior"
            aria-label={'Ir a día anterior'}
          >
            <FaCaretLeft />
          </button>
          <div className="SelectorFecha__texto_fecha">
            {diferencia === 0 ? 'Hoy, ' : (diferencia === -1 ? 'Ayer, ' : '')} {fecha.format('dddd D [de] MMMM')}
          </div>
          <button 
            className="SelectorFecha__fecha_boton"
            onClick={e => dispatch(fijarDia(dia + 1, region))}
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
