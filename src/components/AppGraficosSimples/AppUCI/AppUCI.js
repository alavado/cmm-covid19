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

export const comunasSS = [
  {
    nombre: 'Occidente',
    comunas: [
      'Alhué',
      'Cerro Navia',
      'Curacaví',
      'El Monte',
      'Isla de Maipo',
      'Lo Prado',
      'Melipilla',
      'María Pinto',
      'Padre Hurtado',
      'Pudahuel',
      'Quinta Normal',
      'San Pedro',
      'Peñaflor',
      'Renca',
      'Talagante',
    ]
  },
  {
    nombre: 'Oriente',
    comunas: [
      'La Reina',
      'Las Condes',
      'Lo Barnechea',
      'Macul',
      'Ñuñoa',
      'Peñalolén',
      'Providencia',
      'Vitacura',
    ]
  },
  {
    nombre: 'Sur Oriente',
    comunas: [
      'La Florida',
      'La Pintana',
      'Pirque',
      'Puente Alto',
      'San José de Maipo',
      'San Ramón',
    ]
  },
  {
    nombre: 'Central',
    comunas: [
      'Cerrillos',
      'Estación Central',
      'Maipú',
      'Pedro Aguirre Cerda', // PAC norte
      'Santiago',
    ]
  },
  {
    nombre: 'Norte',
    comunas: [
      'Colina',
      'Conchalí',
      'Huechuraba',
      'Independencia',
      'Lampa',
      'Quilicura',
      'Recoleta',
      'Tiltil',
    ]
  },
  {
    nombre: 'Sur',
    comunas: [
      'Buin',
      'Calera de Tango',
      'El Bosque',
      'La Cisterna',
      'La Granja', // La Granja Sur
      'Lo Espejo',
      'Paine',
      'San Bernardo',
      'San Joaquín',
      'San Miguel',
    ]
  }
]

const AppUCI = props => {

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

  const [labels, geoJSONSS] = useMemo(() => {
    const featuresRegion = geoJSON
      .features
      .filter(feature => feature.properties.codigoRegion === 13)
    const featuresSS = comunasSS.map(({ nombre, comunas }) => {
      const com1 = featuresRegion.find(f => f.properties.NOM_COM === comunas[0])
      return comunas.reduce((prev, comuna) => {
        const com = featuresRegion.find(f => f.properties.NOM_COM === comuna)
        return turf.union(prev, turf.polygon(com.geometry.coordinates))
      }, turf.polygon(com1.geometry.coordinates, { servicio: nombre, color: props.ss === nombre ? 1 : 0 }))
    })
    const labels = featuresSS.map((feature, i) => {
      const centroVisual = calcularPoloDeInaccesibilidad(feature.geometry.coordinates)
      return (
        <div style={{ pointerEvents:'none' }} key={`marker-featuress-${i}`}>
          <Marker
            key={`minigrafico-dona-${i}`}
            latitude={centroVisual.latitude}
            longitude={centroVisual.longitude}
          >
            <div className="AppUCI__porcentaje_en_mapa">
              {props.datos.find(d => d.nombre === feature.properties.servicio).serie.slice(-1)[0].toLocaleString('de-DE')}%
            </div>
          </Marker>
        </div>
      )
    })
    return [labels, {
      ...geoJSON,
      features: featuresSS
    }]
  }, [geoJSON, props.ss])

  const cambioEnElViewport = vp => {
    setViewport(prev => prev)
  }

  const clickEnMapa = e => {
    if (e.features.length > 0) {
      props.fijarSS(e.features[0].properties.servicio)
    }
  }

  const textoComunas = useMemo(() => {
    const ss = comunasSS.find(ss => ss.nombre === props.ss)
    if (!ss) {
      return null
    }
    let comunas = [...ss.comunas]
    if (props.ss === 'Sur Oriente') {
      comunas.push('La Granja')
    }
    else if (props.ss === 'Sur') {
      comunas.push('Pedro Aguirre Cerda')
    }
    else if (props.ss === 'Oriente') {
      comunas.push('Isla de Pascua')
    }
    comunas.sort()
    const primerasComunas = comunas
      .slice(0, -1)
      .reduce((prev, c) => `${prev}, ${['La Granja', 'Pedro Aguirre Cerda'].includes(c) ? `parte de ${c}` : c}`)
    return `${primerasComunas} y ${comunas.slice(-1)[0]}`
  }, [props.ss])

  return (
    <div className="AppUCI">
      <div className="AppUCI__contenedor_mapa">
        <ReactMapGL
          {...viewport}
          mapStyle={mapStyle}
          onViewportChange={cambioEnElViewport}
          getCursor={() => 'pointer'}
          onClick={clickEnMapa}
          ref={mapa}
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
                'fill-color': {
                  property: 'color',
                  stops: [
                    [0, 'white'],
                    [1, '#e0e0e0']
                  ]
                }
              }}
            />
            <Layer
              id="data2-poligono-stroke"
              type="line"
              paint={{
                'line-color': '#5E5E5E',
                'line-width': 1
              }}
            />
          </Source>
          {labels}
        </ReactMapGL>
      </div>
      <div className="AppUCI__explicacion_comunas_ss">
        {textoComunas &&
          <>
            El <span style={{ fontWeight: 'bold' }}>Servicio de Salud Metropolitano {props.ss}</span> abarca las comunas de {textoComunas}
          </>
        }
      </div>
    </div>
  )
}

export default AppUCI
