import React, { useState } from 'react'
import ReactMapGL from 'react-map-gl'
import mapStyle from './mapStyle.json'
import './Mapa.css'

const Mapa = () => {
  const [viewport, setViewport] = useState({
    width: '100%',
    height: 'calc(100vh - 2em)',
    latitude: -44.24,
    longitude: -70.01,
    zoom: 4,
    zoom: 8
  })

  return (
    <div className="Mapa">
      <ReactMapGL
        {...viewport}
        mapStyle={mapStyle}
        onViewportChange={setViewport}
      />
    </div>
  )
}

export default Mapa
