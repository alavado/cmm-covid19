import React, { useState, useEffect, useMemo, useRef } from 'react'
import './AppUCI.css'
import ReactMapGL, { Source, Layer, Marker } from 'react-map-gl'
import mapStyle from './mapStyle.json'
import polylabel from 'polylabel'
import { useSelector } from 'react-redux'
import { CASOS_COMUNALES_INTERPOLADOS } from '../../../redux/reducers/series'

const calcularPoloDeInaccesibilidad = puntos => {
  const [longitude, latitude] = polylabel(puntos)
  return { longitude: longitude, latitude: latitude }
}

const AppUCI = () => {

  const mapa = useRef()
  const { datasets } = useSelector(state => state.datasets)
  const { geoJSON } = datasets[1].comunas

  const [viewport, setViewport] = useState({
    width: '100%',
    height: '100%',
    bearing: 0.8438348482250375,
    pitch: 8.966012003230043,
    latitude: -33.57,
    longitude: -70.69,
    zoom: 7.25,
    altitude: 1.5,
  })

  const geoJSONFiltrado = useMemo(() => {
    const featuresRegion = geoJSON
      .features
      .filter(feature => feature.properties.codigoRegion === 13)
    return {
      ...geoJSON,
      features: featuresRegion
    }
  }, [])

  const cambioEnElViewport = vp => {
    setViewport(prev => prev)
  }

  return (
    <div className="AppUCI">
      <div className="AppUCI__contenedor_mapa">
        <ReactMapGL
          {...viewport}
          mapStyle={mapStyle}
          onViewportChange={cambioEnElViewport}
          getCursor={() => 'default'}
          ref={mapa}
        >
          <Source
            id="capa-datos-regiones-2"
            type="geojson"
            data={geoJSONFiltrado}
          >
            <Layer
              id="data2-poligono-stroke"
              type="line"
              paint={{
                'line-color': '#5E5E5E',
                'line-width': 1
              }}
            />
          </Source>
        </ReactMapGL>
      </div>
    </div>
  )
}

export default AppUCI
