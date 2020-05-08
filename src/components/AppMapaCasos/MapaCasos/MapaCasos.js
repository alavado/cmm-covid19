import React, { useState, useMemo, useRef, useEffect } from 'react'
import ReactMapGL, { Source, Layer, Marker } from 'react-map-gl'
import mapStyle from './mapStyle.json'
import './MapaCasos.css'
import { useSelector } from 'react-redux'
import { CASOS_COMUNALES_INTERPOLADOS, CASOS_COMUNALES } from '../../../redux/reducers/series'
import polylabel from 'polylabel'
import randomPointsOnPolygon from 'random-points-on-polygon'
import turf from 'turf'

const calcularPoloDeInaccesibilidad = puntos => {
  const [longitude, latitude] = polylabel(puntos)
  return { longitude: longitude, latitude: latitude }
}

const MapaCasos = () => {

  const { series } = useSelector(state => state.series)
  const { datos: datosComunas, geoJSON } = series.find(({ id }) => id === CASOS_COMUNALES_INTERPOLADOS)
  const mapCasos = useRef()

  const [posicion, setPosicion] = useState(0)
  const [recuperacion, setRecuperacion] = useState(14)

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

  const nombresComunas = useMemo(() => geoJSONFiltrado.features.map((feature, i) => (
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
  )), [])

  const cambioEnElViewport = vp => {
    setViewport(prev => ({
      ...prev,
      ...vp,
      width: '100%',
      height: '100vh'
    }))
  }

  const geoJSONInfectados = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: geoJSONFiltrado.features
        .map(feature => {
          const casosComuna = datosComunas
            .find(d => d.codigo === feature.properties.codigo)
            .datos[posicion]
            .valor
          const recuperados = posicion < recuperacion ? 0 : datosComunas
            .find(d => d.codigo === feature.properties.codigo)
            .datos[posicion - recuperacion]
            .valor
          return casosComuna > 0 ? randomPointsOnPolygon(casosComuna - recuperados, turf.polygon(feature.geometry.coordinates)) : []
        }).flat()
    }
  }, [posicion, recuperacion])

  return (
    <div className="MapaCasos">
      <div>Fecha: {datosComunas[0].datos[posicion].fecha.format('DD/MM')}</div>
      <input type="number" value={recuperacion} onChange={e => setRecuperacion(Number(e.target.value))} />
      <input value={posicion} type="range" min="0" max={datosComunas[0].datos.length - 1} onChange={e => setPosicion(e.target.value)} />
      <ReactMapGL
        {...viewport}
        mapStyle={mapStyle}
        onViewportChange={cambioEnElViewport}
        ref={mapCasos}
      >
        {nombresComunas}
        <Source
          id="puntitos"
          type="geojson"
          data={geoJSONInfectados}
        >
          <Layer
            id="data-puntitos"
            type="circle"
            paint={{
              "circle-color": "#D32F2F",
              "circle-radius": 2
            }}
          />
        </Source>
        <Source
          id="capa-datos-regiones-2"
          type="geojson"
          data={geoJSONFiltrado}
        >
          <Layer
            id="data2-poligono-stroke"
            type="line"
            paint={{
              'line-color': 'rgba(255, 255, 255, 0.5)',
              'line-width': 1.5
            }}
          />
        </Source>
      </ReactMapGL>
    </div>
  )
}

export default MapaCasos