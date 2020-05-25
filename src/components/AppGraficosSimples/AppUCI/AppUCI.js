import React, { useState, useMemo, useRef } from 'react'
import './AppUCI.css'
import ReactMapGL, { Source, Layer, Marker } from 'react-map-gl'
import mapStyle from './mapStyle.json'
import polylabel from 'polylabel'
import { useSelector } from 'react-redux'
import { Line } from 'react-chartjs-2'
import { CASOS_COMUNALES_INTERPOLADOS } from '../../../redux/reducers/series'

const calcularPoloDeInaccesibilidad = puntos => {
  const [longitude, latitude] = polylabel(puntos)
  return { longitude: longitude, latitude: latitude }
}

const AppUCI = () => {

  const mapa = useRef()
  const { series } = useSelector(state => state.series)
  const { geoJSON } = series.find(({ id }) => id === CASOS_COMUNALES_INTERPOLADOS)

  const [viewport, setViewport] = useState({
    width: '100%',
    height: 'calc(100vh -2em)',
    bearing: 0.8438348482250375,
    pitch: 8.966012003230043,
    latitude: -33.537375678675765,
    longitude: -70.81966493085949,
    zoom: 11,
    altitude: 1.5,
  })

  const geoJSONFiltrado = useMemo(() => {
    const featuresRegion = geoJSON
      .features
      .filter(feature => feature.properties.codigoRegion === 13)
      .map(feature => ({
        ...feature,
        properties: {
          ...feature.properties,
          centro: calcularPoloDeInaccesibilidad(feature.geometry.coordinates)
        }
      }))
    return {
      ...geoJSON,
      features: featuresRegion
    }
  }, [])

  const labelsComunas = useMemo(() => geoJSONFiltrado.features.map((feature, i) => {
    return (
      <Marker
        className="MapaCasos__marcador_nombre_comuna"
        latitude={feature.properties.centro.latitude}
        longitude={feature.properties.centro.longitude}
        key={`marker-feature-${i}`}
      >
        <div
          className="MapaCasos__marcador_nombre_comuna_contenido"
          style={{
            opacity: 1
          }}
        >
          {feature.properties.NOM_COM}
        </div>
      </Marker>
    )
  }), [])

  const cambioEnElViewport = vp => {
    setViewport(prev => {
      const nuevoVP = {
        ...prev,
        ...vp,
        width: '100%',
        height: 'calc(100vh -2em)',
        zoom: Math.min(11.5, vp.zoom)
      }
      return nuevoVP
    })
  }

  return (
    <div className="AppUCI">
      <div className="AppUCI__contenedor_mapa">
        <ReactMapGL
          {...viewport}
          mapStyle={mapStyle}
          onViewportChange={cambioEnElViewport}
          ref={mapa}
        >
          {/* {labelsComunas} */}
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
