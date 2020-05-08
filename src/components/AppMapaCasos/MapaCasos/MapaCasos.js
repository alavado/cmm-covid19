import React, { useState, useMemo } from 'react'
import ReactMapGL, { Source, Layer, Marker } from 'react-map-gl'
import mapStyle from './mapStyle.json'
import './MapaCasos.css'
import { useSelector } from 'react-redux'
import { CASOS_COMUNALES } from '../../../redux/reducers/series'
import polylabel from 'polylabel'

const calcularPoloDeInaccesibilidad = ({ coordinates: puntos }) => {
  const [longitude, latitude] = polylabel(puntos)
  return { longitude: longitude, latitude: latitude }
}

const MapaCasos = () => {

  const { series } = useSelector(state => state.series)
  const { geoJSON } = series.find(({ id }) => id === CASOS_COMUNALES)

  const geoJSONFiltrado = useMemo(() => {
    const featuresRegion = geoJSON
      .features
      .filter(feature => feature.properties.codigoRegion === 13)
      .map(feature => ({
        ...feature,
        properties: {
          ...feature.properties,
          centro: calcularPoloDeInaccesibilidad(feature.geometry)
        }
      }))
    return {
      ...geoJSON,
      features: featuresRegion
    }
  }, [])

  const [viewport, setViewport] = useState({
    width: '100%',
    height: '100vh',
    bearing: 10.9609308669604,
    latitude: -33.537375678675765,
    longitude: -70.81966493085949,
    pitch: 10.01281704404148,
    zoom: 8.3,
    altitude: 1.5,
  })

  const cambioEnElViewport = vp => {
    setViewport(prev => ({
      ...prev,
      ...vp,
      width: '100%',
      height: '100vh'
    }))
  }

  const marcadores = useMemo(() => Array.from(Array(1000).keys()).map(n => (
    <Marker
      className="MapaCasos__marcador_nombre_comuna"
      latitude={-33 + Math.random() * 5}
      longitude={-70 + Math.random() * 5}
      key={`marker-feature-${n + 1000}`}
    >
      <div className="MapaCasos__marcador_caso">
        
      </div>
    </Marker>
  )), [])

  return (
    <div className="MapaCasos">
      <ReactMapGL
        {...viewport}
        mapStyle={mapStyle}
        onViewportChange={cambioEnElViewport}
      >
        {marcadores}
        {geoJSONFiltrado.features.map((feature, i) => (
          <Marker
            className="MapaCasos__marcador_nombre_comuna"
            latitude={feature.properties.centro.latitude}
            longitude={feature.properties.centro.longitude}
            key={`marker-feature-${i}`}
          >
            <div className="MapaCasos__marcador_nombre_comuna_contenido">
              {feature.properties.NOM_COM}
            </div>
          </Marker>
        ))}
        <Source
          id="capa-datos-regiones"
          type="geojson"
          data={geoJSONFiltrado}
        >
          <Layer
            id="data2"
            type="fill"
            paint={{
              'fill-color': 'white',
              'fill-opacity': 1
            }}
          />
          <Layer
            id="data2-poligono-stroke"
            type="line"
            paint={{
              'line-color': 'rgba(0, 0, 0, 0.5)',
              'line-width': 1
            }}
          >
        </Layer>
        </Source>
      </ReactMapGL>
    </div>
  )
}

export default MapaCasos
