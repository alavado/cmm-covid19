import React, { useState, useMemo, useRef, useEffect } from 'react'
import ReactMapGL, { Source, Layer, Marker } from 'react-map-gl'
import mapStyle from './mapStyle.json'
import './MapaCasos.css'
import { useSelector } from 'react-redux'
import { CASOS_COMUNALES_INTERPOLADOS, CASOS_COMUNALES } from '../../../redux/reducers/series'
import polylabel from 'polylabel'
import randomPointsOnPolygon from 'random-points-on-polygon'
import turf from 'turf'
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa'

const calcularPoloDeInaccesibilidad = puntos => {
  const [longitude, latitude] = polylabel(puntos)
  return { longitude: longitude, latitude: latitude }
}

const MapaCasos = props => {

  const { series } = useSelector(state => state.series)
  const { datos: datosComunas, geoJSON } = series.find(({ id }) => id === CASOS_COMUNALES_INTERPOLADOS)
  const mapCasos = useRef()

  const [posicion, setPosicion] = useState(datosComunas[0].datos.length - 1)
  const [recuperacion, setRecuperacion] = useState(14)
  const [multiplicador, setMultiplicador] = useState(2)
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

  const [viewport, setViewport] = useState(props.vpMapaPrincipal)

  useEffect(() => {
    setViewport(props.vpMapaPrincipal)
  }, [props.vpMapaPrincipal.latitude])

  const hashComunas = useMemo(() => datosComunas.reduce((obj, comuna) => ({
    ...obj,
    [comuna.codigo]: comuna
  }), {}), [])

  const labelsComunas = useMemo(() => geoJSONFiltrado.features.map((feature, i) => {
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

  const geoJSONInfectados = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: geoJSONFiltrado.features
        .map(feature => {
          const serieComuna = hashComunas[feature.properties.codigo]
          const casosComuna = serieComuna.datos[posicion].valor
          const recuperados = (posicion - recuperacion) < posicionInicial ? 0 : serieComuna.datos[posicion - recuperacion].valor
          return casosComuna ? randomPointsOnPolygon((1 + multiplicador) * (casosComuna - recuperados), turf.polygon(feature.geometry.coordinates)) : []
        })
        .flat()
    }
  }, [posicion, recuperacion, multiplicador])

  const cambioEnElViewport = vp => {
    setViewport(prev => {
      const nuevoVP = {
        ...prev,
        ...vp,
        width: '100%',
        height: 'calc(100vh -2em)'
      }
      props.setVpMapaPrincipal(nuevoVP)
      return nuevoVP
    })
  }

  return (
    <div className="MapaCasos">
      <div className="MapaCasos__lateral">
        <div className="MapaCasos__fecha">
          <button
            onClick={() => setPosicion(Math.max(posicionInicial, posicion - 1))}
            className="MapaCasos__fecha_boton"
          >
            <FaCaretLeft />
          </button>
          <div className="MapaCasos__calendario">
            <div className="MapaCasos__calendario_mes">
              {datosComunas[0].datos[posicion].fecha.format('MMMM')}
            </div>
            <div className="MapaCasos__calendario_dia">
              {datosComunas[0].datos[posicion].fecha.format('DD')}
              <div className="MapaCasos__calendario_nombre_dia">
                {datosComunas[0].datos[posicion].fecha.format('dddd')}
              </div>
            </div>
          </div>
          <button
            onClick={() => setPosicion(Math.min(datosComunas[0].datos.length - 1, posicion + 1))}
            className="MapaCasos__fecha_boton"
          >
            <FaCaretRight />
          </button>
        </div>
        <div className="MapaCasos__parametros">
          <label className="MapaCasos__lateral_label">
            La enfermedad dura
            <input
              type="number"
              min={0}
              value={recuperacion}
              onChange={e => setRecuperacion(Number(e.target.value))}
              className="MapaCasos__lateral_input_recuperacion"
            />
            {recuperacion === 1 ? 'día' : 'días'} luego del examen positivo
          </label>
          <label className="MapaCasos__lateral_label">
            Hay
            <input
              type="number"
              min={0}
              max={50}
              value={multiplicador}
              onChange={e => setMultiplicador(Number(e.target.value))}
              className="MapaCasos__lateral_input_multiplicador"
            />
            {multiplicador === 1 ? 'caso no detectado' : 'casos no detectados'} por cada examen positivo
          </label>
        </div>
      </div>
      <ReactMapGL
        {...viewport}
        mapStyle={mapStyle}
        onViewportChange={cambioEnElViewport}
        ref={mapCasos}
      >
        {viewport.zoom > 10 && labelsComunas}
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