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

const MapaCasos = props => {

  const { series } = useSelector(state => state.series)
  const { datos: datosComunas, geoJSON } = series.find(({ id }) => id === CASOS_COMUNALES_INTERPOLADOS)
  const mapCasos = useRef()

  const [posicion, setPosicion] = useState(30)
  const [recuperacion, setRecuperacion] = useState(14)
  const [multiplicador, setMultiplicador] = useState(0)
  const posicionInicial = 27

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

  const hashComunas = useMemo(() => datosComunas.reduce((obj, comuna) => ({
    ...obj,
    [comuna.codigo]: comuna
  }), {}), [])

  const nombresComunas = useMemo(() => geoJSONFiltrado.features.map((feature, i) => {
    const serieComuna = hashComunas[feature.properties.codigo]
    const casosComuna = serieComuna.datos[posicion].valor
    const recuperados = (posicion - recuperacion) < posicionInicial ? 0 : serieComuna.datos[posicion - recuperacion].valor
    return <Marker
      className="MapaCasos__marcador_nombre_comuna"
      latitude={feature.properties.centro.latitude}
      longitude={feature.properties.centro.longitude}
      key={`marker-feature-${i}`}
    >
      <div className="MapaCasos__marcador_nombre_comuna_contenido">
        {feature.properties.NOM_COM}<br />
        <span style={{ fontWeight: 'bold', fontSize: '1.15em' }}>{Math.round((1 + multiplicador) * (casosComuna - recuperados))}</span>
      </div>
    </Marker>
  }), [posicion, recuperacion, multiplicador])

  useEffect(() => {
    if (props.secundario) {
      setViewport(props.vpMapaPrincipal)
      setPosicion(props.posicionMapaPrincipal)
    }
  }, [props.vpMapaPrincipal, props.posicionMapaPrincipal])

  const cambioEnElViewport = vp => {
    if (props.secundario) {
      return
    }
    setViewport(prev => {
      const nuevoVP = {
        ...prev,
        ...vp,
        width: '100%',
        height: '100vh'
      }
      if (!props.secundario) {
        props.setVpMapaPrincipal(nuevoVP)
      }
      return nuevoVP
    })
  }

  const geoJSONInfectados = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: geoJSONFiltrado.features
        .map(feature => {
          const serieComuna = hashComunas[feature.properties.codigo]
          const casosComuna = serieComuna.datos[posicion].valor
          const recuperados = (posicion - recuperacion < posicionInicial) ? 0 : serieComuna.datos[posicion - recuperacion - posicionInicial].valor
          return casosComuna ? randomPointsOnPolygon((1 + multiplicador) * (casosComuna - recuperados), turf.polygon(feature.geometry.coordinates)) : []
        })
        .flat()
    }
  }, [posicion, recuperacion, multiplicador])

  return (
    <div className="MapaCasos">
      <div className="MapaCasos__lateral">
      {/* {!props.secundario && <h1>Simulador de "casos activos"</h1>} */}
        <label>
          Días de infección posexamen:
          <input
            type="number"
            min={0}
            value={recuperacion}
            onChange={e => setRecuperacion(Number(e.target.value))}
          />
        </label><br />
        <label>
          Casos no detectados por cada detección:
          <input
            type="number"
            min={0}
            max={10}
            value={multiplicador}
            onChange={e => setMultiplicador(Number(e.target.value))}
          />
        </label>
        {!props.secundario &&
          <>
            <div>Fecha: {datosComunas[0].datos[posicion].fecha.format('DD/MM')}</div>
            <input
              value={posicion}
              type="range"
              min={posicionInicial}
              max={datosComunas[0].datos.length - 1}
              onChange={e => {
                setPosicion(e.target.value)
                if (!props.secundario) {
                  props.setPosicionMapaPrincipal(e.target.value)
                }
              }}
            />
          </>
        }
      </div>
      <ReactMapGL
        {...viewport}
        mapStyle={mapStyle}
        onViewportChange={cambioEnElViewport}
        ref={mapCasos}
      >
        {viewport.zoom > 10 && nombresComunas}
        <Source
          id="puntitos"
          type="geojson"
          data={geoJSONInfectados}
        >
          <Layer
            id="data-puntitos"
            type="circle"
            paint={{
              "circle-color": "#C62828",
              "circle-radius": 2,
              "circle-opacity": .75
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
              'line-color': 'rgba(190, 190, 190, 1)',
              'line-width': 1.5
            }}
          />
        </Source>
      </ReactMapGL>
    </div>
  )
}

export default MapaCasos