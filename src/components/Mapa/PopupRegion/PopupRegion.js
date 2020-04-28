import React from 'react'
import { Popup } from 'react-map-gl'
import './PopupRegion.css'
import escala from '../../../helpers/escala'

const PopupRegion = props => {

  const { latitude, longitude, titulo, valor } = props.config
  const valorFormateado = valor.toLocaleString('de-DE', { maximumFractionDigits: 2 })

  return (
    <Popup
      latitude={latitude}
      longitude={longitude}
      closeButton={false}
    >
      <div className="PopupRegion">
        <h1 className="PopupRegion__titulo">{titulo}</h1>
        <div className="PopupRegion__cuadro">
          <div
            className="PopupRegion__casos"
            style={{ backgroundColor: escala.find((e, i) => escala[i + 1][0] > valor)[1] }}
          >
            {valorFormateado}
          </div>
          <div className="PopupRegion__descripcion">
            {`${valorFormateado !== '1' ? 'Nuevos casos' : 'Nuevo caso'}`}<br/>por 100.000 hab.
          </div>
        </div>
      </div>
    </Popup>
  )
}

export default PopupRegion
