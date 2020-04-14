import React, { useState, useMemo } from 'react'
import ReactMapGL, { Source, Layer, FlyToInterpolator } from 'react-map-gl'
import mapStyle from './mapStyle.json'
import regiones from '../../data/geojsons/regiones_con_datos.json'
import './Mapa.css'
import { useSelector, useDispatch } from 'react-redux'
import CodigoColor from './CodigoColor'
import { seleccionarRegion } from '../../redux/actions'
import data from '../../data/regional/infectados_por_100000.json'
import PopupRegion from './PopupRegion'
import viewportRegiones from './viewportsRegiones'

const Mapa = () => {
  const [viewport, setViewport] = useState({
    width: '100%',
    height: 'calc(100vh - 15em)',
    latitude: -39.204954641160536,
    longitude: -69.26430872363804,
    zoom: 4,
    bearing: 98.49519730510106,
    pitch: 0,
    altitude: 1.5
  })

  const [popupRegion, setPopupRegion] = useState({
    mostrando: false,
    latitude: 0,
    longitude: 0,
    titulo: ''
  })
  const { dia } = useSelector(state => state.fecha)
  const { region } = useSelector(state => state.region)
  const dispatch = useDispatch()

  const cambioEnElViewport = vp => {
    console.log({vp})
    setViewport({
      ...vp,
      width: '100%',
      height: 'calc(100vh - 15em)',
    })
  }

  const regiones2 = useMemo(() => ({
    ...regiones,
    features: regiones.features.map(r => ({
      ...r,
      properties: {
        ...r.properties,
        x: Number(r.properties.codregion) !== Number(region.codigo) ? 0 : 1
      }
    }))
  }), [region])

  const clickEnRegion = e => {
    const feats = e.features
    if (!feats || feats.length === 0 || feats[0].source !== 'capa-datos-regiones') {
      return
    }
    const { Region: nombre, codregion } = feats[0].properties
    dispatch(seleccionarRegion(nombre, codregion))
    setViewport(v => ({
      ...v,
      ...viewportRegiones.find(({codigo}) => codigo === codregion).vp,
      transitionInterpolator: new FlyToInterpolator({ speed: 1 }),
      transitionDuration: 'auto'
    }))
  }

  const actualizarPopupChico = e => {
    const feats = e.features
    if (!feats || feats.length === 0 || feats[0].source !== 'capa-datos-regiones') {
      setPopupRegion({
        ...popupRegion,
        mostrando: false
      })
      return
    }
    setPopupRegion({
      mostrando: true,
      latitude: e.lngLat[1],
      longitude: e.lngLat[0],
      titulo: feats[0].properties.Region,
      valor: data.find(r => r.codigo === feats[0].properties.codregion).datos[dia]
    })
  }

  return (
    <div className="Mapa" onMouseLeave={() => setPopupRegion({...popupRegion, mostrando: false})}>
      <ReactMapGL
        {...viewport}
        mapStyle={mapStyle}
        getCursor={() => 'pointer'}
        onClick={clickEnRegion}
        onViewportChange={cambioEnElViewport}
        onHover={actualizarPopupChico}        
      >
        <CodigoColor />
        {popupRegion.mostrando && <PopupRegion config={popupRegion} />}
        <Source id="capa-datos-regiones" type="geojson" data={regiones2}>
          <Layer
            id="data2"
            type="fill"
            paint={{
              'fill-color': {
                property: `v${dia}`,
                stops: [
                  [0, '#abdda4'],
                  [3.5, '#e6f598'],
                  [7, '#ffffbf'],
                  [10.5, '#fee08b'],
                  [14, '#fdae61'],
                  [17.5, '#f46d43'],
                  [20, '#d53e4f']
                ]
              },
              'fill-opacity': .7,
              'fill-color-transition': {
                'duration': 300,
                'delay': 0
              }
            }}
          />
          <Layer
            id="data"
            type="line"
            paint={{
              'line-color': {
                property: `x`,
                stops: [
                  [0, 'rgba(0, 0, 0, 0)'],
                  [1, '#0288D1']
                ]
              },
              'line-width': 1
            }}
          />
        </Source>
      </ReactMapGL>
    </div>
  )
}

export default Mapa
