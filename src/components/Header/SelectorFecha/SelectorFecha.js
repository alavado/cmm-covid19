import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import './range.css'
import './SelectorFecha.css'
import { fijarDia } from '../../../redux/actions'
import moment from 'moment/min/moment-with-locales'
import fechaInicial from '../../../config/fechaInicial'
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa'
moment.locale('es')

const SelectorFecha = () => {

  const { dia } = useSelector(state => state.fecha)
  const dispatch = useDispatch()

  useEffect(() => {
    const dias = moment().diff(fechaInicial, 'days')
    const fecha = document.getElementsByClassName('SelectorFecha__contenedor_fecha')[0]
    const limite = document.getElementsByClassName('SelectorFecha__limite')[0]
    const slider = document.getElementsByClassName('SelectorFecha__selector')[0]
    fecha.style.marginLeft = `calc(
      ${limite.clientWidth}px - ${fecha.clientWidth / 2}px + 9px + ${slider.clientWidth * dia / dias}px)`
  }, [dia])

  return (
    <div className="SelectorFecha">
      <div className="SelectorFecha__contenedor_rango">
        <div className="SelectorFecha__limite">{moment(fechaInicial).format(`DD/MM`)}</div>
        <input
          type="range"
          className="SelectorFecha__selector"
          min={0}
          max={moment().diff(fechaInicial, 'days')}
          step={1}
          onChange={e => dispatch(fijarDia(e.target.value))}
          value={dia}
        />
        <div className="SelectorFecha__limite">{moment().format(`DD/MM`)}</div>
      </div>
      <div className="SelectorFecha__contenedor_fecha">
        <div className="SelectorFecha__fecha">
          <button className="SelectorFecha__fecha_boton" onClick={e => dispatch(fijarDia(dia - 1))}>
            <FaCaretLeft />
          </button>
          <div className="SelectorFecha__texto_fecha">
            {moment(fechaInicial).add(dia, 'days').format('dddd D [de] MMMM')}
          </div>
          <button className="SelectorFecha__fecha_boton" onClick={e => dispatch(fijarDia(dia + 1))}>
            <FaCaretRight />
          </button>
        </div>
      </div>
    </div>
  )
}

export default SelectorFecha
