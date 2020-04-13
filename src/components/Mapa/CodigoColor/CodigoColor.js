import React from 'react'
import './CodigoColor.css'
import { useSelector } from 'react-redux'
import moment from 'moment/min/moment-with-locales'

const CodigoColor = () => {

  const { dia } = useSelector(state => state.fecha)
  const { region } = useSelector(state => state.region)
  const fecha = moment(region.fechaInicial).add(dia, 'days')
  const diferencia = fecha.diff(moment(), 'days')

  return (
    <div className="CodigoColor">
      <div className="CodigoColor__titulo">Contagios por 100.000 habitantes</div>
      <div className="CodigoColor__fecha">
        {diferencia === 0 ? 'Hoy, ' : (diferencia === -1 ? 'Ayer, ' : '')} {fecha.format('dddd D [de] MMMM')}
      </div>
      <div className="CodigoColor__espectro" />
      <div className="CodigoColor__limites">
        <div>0</div>
        <div>Más de 25</div>
      </div>
    </div>
  )
}

export default CodigoColor
