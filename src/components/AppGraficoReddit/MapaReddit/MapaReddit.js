import React, { useState, useMemo } from 'react'
import ReactMapGL, { Source, Layer } from 'react-map-gl'
import mapStyle from '../../AppGraficosSimples/AppUCI/mapStyle.json'
import turf from 'turf'
import { comunasSS } from '../../AppGraficosSimples/AppUCI/AppUCI'
import './MapaReddit.css'
import { useSelector } from 'react-redux'

const MapaReddit = ({ geoJSON }) => {

  const { daltonicos } = useSelector(state => state.colores)

  const [viewport, setViewport] = useState({
    width: '100%',
    height: '100%',
    bearing: 0.8438348482250375,
    pitch: 8.966012003230043,
    latitude: -33.57,
    longitude: -70.69,
    zoom: 6.45,
    altitude: 1.5,
  })

  const colores = useMemo(() => {
    if (daltonicos) {
      return [
        '#ffffcc',
        '#c7e9b4',
        '#7fcdbb',
        '#41b6c4',
        '#2c7fb8',
        '#253494'
      ]
    }
    else {
      return [
        '#fbb4ae',
        '#b3cde3',
        '#ccebc5',
        '#decbe4',
        '#fed9a6',
        '#ffffcc'
      ]
    }
  }, [daltonicos])

  const geoJSONSS = useMemo(() => {
    const featuresRegion = geoJSON
      .features
      .filter(feature => feature.properties.codigoRegion === 13)
    const featuresSS = comunasSS.map(({ nombre, comunas }, i) => {
      const com1 = featuresRegion.find(f => f.properties.NOM_COM === comunas[0])
      return comunas.reduce((prev, comuna) => {
        const com = featuresRegion.find(f => f.properties.NOM_COM === comuna)
        return turf.union(prev, turf.polygon(com.geometry.coordinates))
      }, turf.polygon(com1.geometry.coordinates, { servicio: nombre, color: colores[i]}))
    })
    return {
      ...geoJSON,
      features: featuresSS
    }
  }, [geoJSON])

  return (
    <div className="MapaReddit">
      <ReactMapGL
        {...viewport}
        mapStyle={mapStyle}
        getCursor={() => 'pointer'}
        doubleClickZoom={false}
        touchAction="pan-y"
      >
        <Source
          id="capa-datos-regiones-2"
          type="geojson"
          data={geoJSONSS}
        >
          <Layer
            id="data2-poligono-fill"
            type="fill"
            paint={{
              'fill-color': ['get', 'color']
            }}
          />
          <Layer
            id="data2-poligono-stroke"
            type="line"
            paint={{
              'line-color': '#8c8c8c',
              'line-width': 1
            }}
          />
        </Source>
      </ReactMapGL>
    </div>
  )
}

export default MapaReddit
