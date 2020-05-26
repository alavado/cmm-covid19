import React, { useState, useEffect, useMemo, useRef } from 'react'
import './AppUCI.css'
import ReactMapGL, { Source, Layer, Marker } from 'react-map-gl'
import mapStyle from './mapStyle.json'
import polylabel from 'polylabel'
import { useSelector } from 'react-redux'
import turf from 'turf'

const calcularPoloDeInaccesibilidad = puntos => {
  const [longitude, latitude] = polylabel(puntos)
  return { longitude: longitude, latitude: latitude }
}

const comunasSS = [
  {
    nombre: 'Occidente',
    comunas: [
      'Pudahuel',
      'Cerro Navia',
      'Quinta Normal',
      'Lo Prado',
      'Renca',
      'Melipilla',
      'Alhué',
      'María Pinto',
      'San Pedro',
      'Curacaví',
      'Talagante',
      'Peñaflor',
      'El Monte',
      'Padre Hurtado',
      'Isla de Maipo'
    ]
  },
  {
    nombre: 'Oriente',
    comunas: [
      'Vitacura',
      'Las Condes',
      'La Reina',
      'Lo Barnechea',
      'Peñalolén',
      'Macul',
      'Ñuñoa',
      'Providencia'
    ]
  },
  {
    nombre: 'Sur Oriente',
    comunas: [
      'Puente Alto',
      'La Florida',
      'La Pintana',
      'San José de Maipo',
      'San Ramón',
      'Pirque'
    ]
  },
  {
    nombre: 'Central',
    comunas: [
      'Santiago',
      'Estación Central',
      'Cerrillos',
      'Pedro Aguirre Cerda',
      'Maipú'
    ]
  },
  {
    nombre: 'Norte',
    comunas: [
      'Tiltil',
      'Colina',
      'Lampa',
      'Conchalí',
      'Huechuraba',
      'Independencia',
      'Recoleta',
      'Quilicura'
    ]
  },
  {
    nombre: 'Sur',
    comunas: [
      'San Joaquín',
      'San Miguel',
      'Lo Espejo',
      'La Cisterna',
      'La Granja',
      'El Bosque',
      'San Bernardo',
      'Calera de Tango',
      'Buin',
      'Paine'
    ]
  }
]

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
    const featuresSS = comunasSS.map(({ nombre, comunas }) => {
      const com1 = featuresRegion.find(f => f.properties.NOM_COM === comunas[0])
      return comunas.reduce((prev, comuna) => {
        const com = featuresRegion.find(f => f.properties.NOM_COM === comuna)
        return turf.union(prev, turf.polygon(com.geometry.coordinates))
      }, turf.polygon(com1.geometry.coordinates, { servicio: nombre }))
    })
    return {
      ...geoJSON,
      features: featuresSS
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
