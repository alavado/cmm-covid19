import React, { useState } from 'react'
import ReactMapGL, { Source, Layer } from 'react-map-gl'
import mapStyle from './mapStyle.json'
import regiones from '../../data/geojsons/regiones.json'
import './Mapa.css'

const Mapa = () => {
  const [viewport, setViewport] = useState({
    width: '100%',
    height: 'calc(100vh - 4em)',
    latitude: -44.24,
    longitude: -70.01,
    zoom: 4,
    bearing: 57.09,
    pitch: 45.61,
    altitude: 1.5
  })

  return (
    <div className="Mapa">
      <ReactMapGL
        {...viewport}
        mapStyle={mapStyle}
        getCursor={() => 'default'}
        onViewportChange={setViewport}
      >
        <Source id="capa-datos-movilidad" type="geojson" data={regiones}>
          <Layer
            id="data"
            type="fill"
            paint={{
              'fill-color': {
                stops: [
                  [0, '#B0BEC5'],
                  [.01, '#abdda4'],
                  [.3, '#e6f598'],
                  [.45, '#ffffbf'],
                  [.6, '#fee08b'],
                  [.75, '#fdae61'],
                  [.9, '#f46d43'],
                  [1.05, '#d53e4f']
                ]
              },
              'fill-opacity': .5,
              'fill-color-transition': {
                'duration': 300,
                'delay': 0
              }
            }}/>
        </Source>
      </ReactMapGL>
    </div>
  )
}

export default Mapa
