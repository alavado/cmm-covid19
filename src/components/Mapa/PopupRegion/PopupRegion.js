import React, { useState } from 'react'
import { Popup } from 'react-map-gl'
import './PopupRegion.css'

const PopupRegion = props => {

  const { latitude, longitude, titulo, valor } = props.config
  const hayDatos = valor >= 0
  const valorFormateado = valor.toLocaleString('de-DE', { maximumFractionDigits: 1 })

  return (
    <Popup
      latitude={latitude}
      longitude={longitude}
      closeButton={false}
    >
      <div className="PopupRegion">
        <h1 className="PopupRegion__titulo">{titulo}</h1>
        {hayDatos && <div className="PopupRegion__contenido">{valorFormateado}</div>}
        <h2 className="PopupRegion__subtitulo">
          {hayDatos ? `${valorFormateado !== '1' ? 'Nuevos casos' : 'Nuevo caso'} por 100.000 hab.` : 'Sin información'}
        </h2>
      </div>
    </Popup>
  )
}

export default PopupRegion
