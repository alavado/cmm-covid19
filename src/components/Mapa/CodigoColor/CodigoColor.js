import React from 'react'
import './CodigoColor.css'
import { useSelector } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import fechaInicial from '../../../config/fechaInicial'

const CodigoColor = () => {

  const { dia } = useSelector(state => state.fecha)

  return (
    <div className="CodigoColor">
      <div className="CodigoColor__titulo">Nuevos casos por 100.000 habitantes</div>
      <div className="CodigoColor__fecha">{moment(fechaInicial).add(dia, 'days').format('dddd D [de] MMMM')}</div>
      <div className="CodigoColor__espectro" />
      <div className="CodigoColor__limites">
        <div>0</div>
        <div>Más de 25</div>
      </div>
    </div>
  )
}

export default CodigoColor
