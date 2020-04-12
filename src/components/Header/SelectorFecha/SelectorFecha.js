import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import './range.css'
import './SelectorFecha.css'
import { fijarDia } from '../../../redux/actions'
import moment from 'moment/min/moment-with-locales'
import fechaInicial from '../../../config/fechaInicial'
moment.locale('es')

const SelectorFecha = () => {

  const { dia } = useSelector(state => state.fecha)
  const dispatch = useDispatch()

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
      <div className="SelectorFecha__fecha">
        <button className="SelectorFecha__fecha_boton" onClick={e => dispatch(fijarDia(dia - 1))}>
          
        </button>
        {moment(fechaInicial).add(dia, 'days').format('dddd, D [de] MMMM [de] YYYY')}
        <button className="SelectorFecha__fecha_boton" onClick={e => dispatch(fijarDia(dia + 1))}>

        </button>
      </div>
    </div>
  )
}

export default SelectorFecha
