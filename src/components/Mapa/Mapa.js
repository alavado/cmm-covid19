import React, { useState, useMemo } from 'react'
import ReactMapGL, { Source, Layer, Popup } from 'react-map-gl'
import mapStyle from './mapStyle.json'
import regiones from '../../data/geojsons/regiones_con_datos.json'
import './Mapa.css'
import { useSelector, useDispatch } from 'react-redux'
import CodigoColor from './CodigoColor'
import { seleccionarRegion } from '../../redux/actions'
import data from '../../data/regional/infectados_por_100000.json'

const Mapa = () => {
  const [viewport, setViewport] = useState({
    width: '100%',
    height: 'calc(61vh)',
    latitude: -39.204954641160536,
    longitude: -69.26430872363804,
    zoom: 4,
    bearing: 98.49519730510106,
    pitch: 0,
    altitude: 1.5
  })

  const [popupChico, setPopupChico] = useState({
    mostrando: false,
    latitude: 0,
    longitude: 0,
    titulo: ''
  })
  const { dia } = useSelector(state => state.fecha)
  const { region } = useSelector(state => state.region)
  const dispatch = useDispatch()

  const cambioEnElViewport = vp => {
    setViewport({
      ...vp,
      width: '100%',
      height: 'calc(61vh)',
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

  const mostrarPopup = e => {
    const feats = e.features
    if (!feats || feats.length === 0 || feats[0].source !== 'capa-datos-regiones') {
      return
    }
    const { Region: nombre, codregion: codigo } = feats[0].properties
    dispatch(seleccionarRegion(nombre, codigo))
  }

  const actualizarPopupChico = e => {
    const feats = e.features
    if (!feats || feats.length === 0 || feats[0].source !== 'capa-datos-regiones') {
      setPopupChico({
        ...popupChico,
        mostrando: false
      })
      return
    }
    setPopupChico({
      mostrando: true,
      latitude: e.lngLat[1],
      longitude: e.lngLat[0],
      titulo: feats[0].properties.Region,
      valor: data.find(r => r.codigo === feats[0].properties.codregion).datos[dia]
    })
  }

  return (
    <div className="Mapa">
      <ReactMapGL
        {...viewport}
        mapStyle={mapStyle}
        getCursor={() => 'pointer'}
        onClick={mostrarPopup}
        onViewportChange={cambioEnElViewport}
        onHover={actualizarPopupChico}
        onMouseLeave={() => setPopupChico({...popupChico, mostrando: false})}
      >
        <CodigoColor />
        {popupChico.mostrando &&
          <Popup
            latitude={popupChico.latitude}
            longitude={popupChico.longitude}
            closeButton={false}
            className="PopupChico"
          >
            <h1 className="PopupChico__titulo">{popupChico.titulo}</h1>
            <p className="PopupChico__titulo">
              {popupChico.valor.toLocaleString('de-DE', { maximumFractionDigits: 1 })} nuevos casos por 100.000 habitantes
            </p>
          </Popup>
        }
        <Source id="capa-datos-regiones" type="geojson" data={regiones2}>
          <Layer
            id="data2"
            type="fill"
            paint={{
              'fill-color': {
                property: `v${dia}`,
                stops: [
                  [0, '#abdda4'],
                  [4, '#e6f598'],
                  [8, '#ffffbf'],
                  [12, '#fee08b'],
                  [16, '#fdae61'],
                  [20, '#f46d43'],
                  [24, '#d53e4f']
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
