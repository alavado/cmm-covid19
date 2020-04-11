import React, { useState } from 'react'
import ReactMapGL, { Source, Layer } from 'react-map-gl'
import mapStyle from './mapStyle.json'
import regiones from '../../data/geojsons/regiones_con_datos.json'
import './Mapa.css'
import { useSelector, useDispatch } from 'react-redux'
import CodigoColor from './CodigoColor'
import { seleccionarRegion } from '../../redux/actions'

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
  const { dia } = useSelector(state => state.fecha)
  const dispatch = useDispatch()

  const cambioEnElViewport = vp => {
    setViewport({
      ...vp,
      width: '100%',
      height: 'calc(100vh - 4em)',
    })
  }

  const mostrarPopup = e => {
    const feats = e.features
    if (!feats || feats.length === 0 || feats[0].source !== 'capa-datos-regiones') {
      return
    }
    const { Region: nombre, codregion: codigo } = feats[0].properties
    dispatch(seleccionarRegion(nombre, codigo))
  }

  return (
    <div className="Mapa">
      <ReactMapGL
        {...viewport}
        mapStyle={mapStyle}
        getCursor={() => 'default'}
        onClick={mostrarPopup}
        onViewportChange={cambioEnElViewport}
      >
        <CodigoColor />
        <Source id="capa-datos-regiones" type="geojson" data={regiones}>
          <Layer
            id="data"
            type="fill"
            paint={{
              'fill-color': {
                property: `v${dia}`,
                stops: [
                  [0, '#abdda4'],
                  [.5, '#abdda4'],
                  [1, '#e6f598'],
                  [2, '#ffffbf'],
                  [4, '#fee08b'],
                  [5, '#fdae61'],
                  [7.5, '#f46d43'],
                  [10, '#d53e4f']
                ]
              },
              'fill-opacity': .7,
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
