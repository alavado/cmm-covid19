import React, { useState, useMemo, useEffect } from 'react'
import ReactMapGL, { Source, Layer, FlyToInterpolator } from 'react-map-gl'
import mapStyle from './mapStyle.json'
import './Mapa.css'
import { useSelector, useDispatch } from 'react-redux'
import CodigoColor from './CodigoColor'
import PopupRegion from './PopupRegion'
import viewportRegiones from './viewportsRegiones'
import { useHistory, useParams } from 'react-router-dom'
import { seleccionarSubserie, seleccionarSerie } from '../../redux/actions'
import { CODIGO_CHILE, CASOS_COMUNALES_POR_100000_HABITANTES } from '../../redux/reducers/series'
import escala from '../../helpers/escala'
import { esMovil } from '../../helpers/responsive'

const vpInicial = {
  width: '100%',
  height: 'calc(100vh - 15em)',
  latitude: -39.204954641160536,
  longitude: -69.26430872363804,
  zoom: esMovil() ? 2.5 : 4,
  bearing: 98.49519730510106,
  pitch: 0,
  altitude: 1.5,
  transitionDuration: 'auto',
  transitionInterpolator: new FlyToInterpolator({ speed: 1.2 }),
}

const Mapa = () => {

  const { serieSeleccionada: serie, subserieSeleccionada, posicion } = useSelector(state => state.series)
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
      valor: serie.datos.find(s => s.codigo === feats[0].properties.codigo).datos[posicion].valor
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
                stops: escala.reduce((prev, [v, color], i) => (
                  i > 0 ? [...prev, [v - 0.0001, escala[i - 1][1]], [v, color]] : [[v, color]]
                ), [])
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
