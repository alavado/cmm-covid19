import React, { useState, useMemo, useEffect } from 'react'
import ReactMapGL, { Source, Layer, FlyToInterpolator } from 'react-map-gl'
import mapStyle from './mapStyle.json'
import './Mapa.css'
import { useSelector, useDispatch } from 'react-redux'
import CodigoColor from './CodigoColor'
import { seleccionarRegion, seleccionarChile } from '../../redux/actions'
import PopupRegion from './PopupRegion'
import viewportRegiones from './viewportsRegiones'
import { useHistory, useParams } from 'react-router-dom'

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

  const [viewport, setViewport] = useState(vpInicial)
  const [popupRegion, setPopupRegion] = useState({
    mostrando: false,
    latitude: 0,
    longitude: 0,
    titulo: ''
  })
  const { dia } = useSelector(state => state.fecha)
  const { region } = useSelector(state => state.region)
  const { series, serieSeleccionada, posicion } = useSelector(state => state.series)
  const serie = useMemo(() => series.find(({ id }) => id === serieSeleccionada), [series, serieSeleccionada])
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
      dispatch(seleccionarChile())
      setViewport(v => ({ ...v, ...vpInicial }))
    }
  }, [params])

  console.log(serie)

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
    const { nombre, codregion } = feats[0].properties
    dispatch(seleccionarRegion(nombre, codregion))
    history.push(`/region/${codregion}`)
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
      titulo: feats[0].properties.nombre,
      valor: serie.datos.find(r => r.codigo === Number(feats[0].properties.codigo)).datos[dia]
    })
  }

  const obtenerCursor = e => {
    return 'pointer'
  }

  return (
    <div
      className="Mapa"
      onMouseLeave={() => setPopupRegion({...popupRegion, mostrando: false})}
    >
      <ReactMapGL
        {...viewport}
        mapStyle={mapStyle}
        getCursor={obtenerCursor}
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
                property: `v${dia}`,
                stops: [
                  [0, '#efefef'],
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
          {/* <Layer
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
          /> */}
        </Source>
      </ReactMapGL>
    </div>
  )
}

export default Mapa
