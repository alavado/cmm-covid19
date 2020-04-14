import React, { useState } from 'react'
import { Popup } from 'react-map-gl'
import './PopupRegion.css'

const PopupRegion = props => {

  return (
    <Popup
      latitude={props.config.latitude}
      longitude={props.config.longitude}
      closeButton={false}
    >
      <div className="PopupRegion">
        <h1 className="PopupRegion__titulo">{props.config.titulo}</h1>
        <div className="PopupRegion__contenido">
          {props.config.valor.toLocaleString('de-DE', { maximumFractionDigits: 1 })}
        </div>
        <h2 className="PopupRegion__subtitulo"> contagios por 100.000 habitantes</h2>
      </div>
    </Popup>
  )
}

export default PopupRegion
