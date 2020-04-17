import React, { useState, useMemo, useEffect } from 'react'
import ReactMapGL, { Source, Layer, FlyToInterpolator } from 'react-map-gl'
import mapStyle from './mapStyle.json'
import './Mapa.css'
import { useSelector, useDispatch } from 'react-redux'
import CodigoColor from './CodigoColor'
import PopupRegion from './PopupRegion'
import viewportRegiones from './viewportsRegiones'
import { useHistory, useParams } from 'react-router-dom'
import { seleccionarSubserie } from '../../redux/actions'
import { CODIGO_CHILE } from '../../redux/reducers/series'

const vpInicial = {
  width: '100%',
  height: 'calc(100vh - 15em)',
  latitude: -39.204954641160536,
  longitude: -69.26430872363804,
  zoom: 4,
  bearing: 98.49519730510106,
  pitch: 0,
  altitude: 1.5,
  transitionDuration: 'auto',
  transitionInterpolator: new FlyToInterpolator({ speed: 1 }),
}

const Mapa = () => {

  const { serieSeleccionada: serie, posicion } = useSelector(state => state.series)
  const [viewport, setViewport] = useState(vpInicial)
  const [popupRegion, setPopupRegion] = useState({
    mostrando: false,
    latitude: 0,
    longitude: 0,
    titulo: ''
  })
  const dispatch = useDispatch()
  const history = useHistory()
  const params = useParams()

  useEffect(() => {
    const codigoRegion = params.codigo
    if (codigoRegion) {
      const vpRegion = viewportRegiones.find(({ codigo }) => codigo === Number(codigoRegion)).vp
      setViewport(v => ({ ...v, ...vpRegion }))
    }
    else {
      dispatch(seleccionarSubserie(CODIGO_CHILE))
      setViewport(v => ({ ...v, ...vpInicial }))
    }
  }, [params.codigo])

  const cambioEnElViewport = vp => {
    setViewport({
      ...vp,
      width: '100%',
      height: 'calc(100vh - 15em)',
    })
  }

  const clickEnPoligono = e => {
    const feats = e.features
    if (!feats || feats.length === 0 || feats[0].source !== 'capa-datos-regiones') {
      return
    }
    const { codigo } = feats[0].properties
    dispatch(seleccionarSubserie(codigo))
    history.push(`/region/${codigo}`)
  }

  const actualizarPopupChico = e => {
    const feats = e.features
    if (!feats || feats.length === 0 || feats[0].source !== 'capa-datos-regiones') {
      if (popupRegion.mostrando) {
        setPopupRegion({
          ...popupRegion,
          mostrando: false
        })
      }
      return
    }
    setPopupRegion({
      mostrando: true,
      latitude: e.lngLat[1],
      longitude: e.lngLat[0],
      titulo: feats[0].properties.nombre,
      valor: serie.datos[posicion]
    })
  }

  return (
    <div
      className="Mapa"
      onMouseLeave={() => setPopupRegion({...popupRegion, mostrando: false})}
    >
      <ReactMapGL
        {...viewport}
        mapStyle={mapStyle}
        getCursor={() => 'pointer'}
        onClick={clickEnPoligono}
        onViewportChange={cambioEnElViewport}
        onHover={actualizarPopupChico}
      >
        <CodigoColor />
        {popupRegion.mostrando && <PopupRegion config={popupRegion} />}
        <Source id="capa-datos-regiones" type="geojson" data={serie.geoJSON}>
          <Layer
            id="data2"
            type="fill"
            paint={{
              'fill-color': {
                property: `v${posicion}`,
                stops: [
                  // [0, '#efefef'],
                  [0.1, '#abdda4'],
                  [3.5, '#e6f598'],
                  [7, '#ffffbf'],
                  [10.5, '#fee08b'],
                  [14, '#fdae61'],
                  [17.5, '#f46d43'],
                  [20, '#d53e4f']
                ]
              },
              'fill-opacity': .7
            }}
          />
        </Source>
      </ReactMapGL>
    </div>
  )
}

export default Mapa
