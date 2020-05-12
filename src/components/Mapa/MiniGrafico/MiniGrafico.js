import React from 'react'
import { Marker } from 'react-map-gl'
import './MiniGrafico.css'

const MiniGrafico = props => {

  const { lat, lng, mostrar, nombreComuna } = props
 
  return (
    <Marker
      className="MiniGrafico__nombre_comuna"
      latitude={lat}
      longitude={lng}
    >
      <div
        className="MiniGrafico__nombre_comuna_contenido"
        style={{
          opacity: mostrar ? .9 : 0,
          transform: mostrar ? 'translateY(0em)' : 'translateY(.25em)',
        }}
      >
        {nombreComuna}
      </div>
    </Marker>
  )
}

export default MiniGrafico
