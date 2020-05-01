import React, { useState, useMemo, useEffect, useRef } from 'react'
import ReactMapGL, { Source, Layer, FlyToInterpolator } from 'react-map-gl'
import mapStyle from './mapStyle.json'
import './Mapa.css'
import { useSelector, useDispatch } from 'react-redux'
import CodigoColor from './CodigoColor'
import PopupRegion from './PopupRegion'
import viewportRegiones from './viewportsRegiones'
import { useHistory, useParams } from 'react-router-dom'
import { seleccionarSubserie, filtrarGeoJSONPorRegion, limpiarFiltros, seleccionarSerie } from '../../redux/actions'
import { CODIGO_CHILE, CONTAGIOS_REGIONALES_POR_100000_HABITANTES, CASOS_COMUNALES_POR_100000_HABITANTES, CUARENTENAS } from '../../redux/reducers/series'
import { esMovil } from '../../helpers/responsive'
import demograficosComunas from '../../data/demografia/comunas.json'
import Ayuda from './Ayuda'

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

  const { serieSeleccionada: serie, posicion, subserieSeleccionada, series } = useSelector(state => state.series)
  const { escala, colorApagado } = useSelector(state => state.colores)
  const geoJSONCuarentenas = series.find(({ id }) => id === CUARENTENAS).geoJSON
  const { filtroValor, filtroRegion } = serie
  const [viewport, setViewport] = useState(vpInicial)
  const [regionPrevia, setRegionPrevia] = useState('')
  const [poligonoDestacado, setPoligonoDestacado] = useState(null)
  const [popupRegion, setPopupRegion] = useState({
    mostrando: false,
    latitude: 0,
    longitude: 0,
    titulo: ''
  })
  const dispatch = useDispatch()
  const history = useHistory()
  const params = useParams()
  const mapa = useRef()

  useEffect(() => {
    const { division, codigo } = params
    if (division) {
      if (division === 'region') {
        const { vp: vpRegion } = viewportRegiones.find(vp => vp.codigo === Number(codigo))
        setViewport(v => ({ ...v, ...vpRegion }))
        dispatch(seleccionarSerie(CONTAGIOS_REGIONALES_POR_100000_HABITANTES))
        dispatch(seleccionarSubserie(Number(codigo)))
        setPoligonoDestacado(null)
        setRegionPrevia(codigo)
      }
      else if (division === 'comuna') {
        const codigoRegion = demograficosComunas.find(c => c.codigo === codigo).region
        if (codigoRegion !== regionPrevia) {
          const { vp: vpRegion } = viewportRegiones.find(vp => vp.codigo === Number(codigoRegion))
          setViewport(v => ({ ...v, ...vpRegion }))
        }
        dispatch(filtrarGeoJSONPorRegion(c => c === Number(codigoRegion)))
        dispatch(seleccionarSerie(CASOS_COMUNALES_POR_100000_HABITANTES))
        dispatch(seleccionarSubserie(Number(codigo)))
        setRegionPrevia(codigoRegion)
      }
    }
    else {
      dispatch(seleccionarSubserie(CODIGO_CHILE))
      setViewport(v => ({ ...v, ...vpInicial }))
      dispatch(limpiarFiltros())
      setPoligonoDestacado(null)
      setRegionPrevia(null)
    }
  }, [params.codigo])

  useEffect(() => {
    if (subserieSeleccionada) {
      const { codigo } = subserieSeleccionada
      const feature = serie.geoJSON.features.find(f => f.properties.codigo === codigo)
      if (feature)
      setPoligonoDestacado(serie.geoJSON.features.find(f => f.properties.codigo === codigo))
    }
  }, [subserieSeleccionada])

  const geoJSONFiltrado = useMemo(() => ({
    ...serie.geoJSON,
    features: serie.geoJSON.features
      .map(f => {
        let valor = f.properties[`v${posicion}`]
        let codigoRegion = f.properties.codigoRegion
        if (filtroValor(valor) && filtroRegion(codigoRegion)) {
          return f
        }
        let properties = Object.keys(f.properties)
          .reduce((prev, k) => ({
            ...prev,
            [k]: k.startsWith('v') ? -1 : f.properties[k]
          }), {})
        return {...f, properties}
      })
  }), [filtroValor, filtroRegion, posicion])

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
    const { codigo, codigoRegion } = feats[0].properties
    dispatch(seleccionarSubserie(codigo))
    dispatch(filtrarGeoJSONPorRegion(c => c === codigoRegion))
    if (serie.id === CONTAGIOS_REGIONALES_POR_100000_HABITANTES) {
      setPoligonoDestacado(null)
      history.push(`/region/${codigo}`)
    }
    else {
      setPoligonoDestacado(feats[0])
      history.push(`/comuna/${codigo}`)
    }
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
    const valorRegion = serie.datos.find(s => s.codigo === feats[0].properties.codigo)
    if (valorRegion) {
      setPopupRegion({
        mostrando: true,
        latitude: e.lngLat[1],
        longitude: e.lngLat[0],
        titulo: feats[0].properties.nombre,
        valor: valorRegion.datos[posicion].valor
      })
    }
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
        ref={mapa}
      >
        <CodigoColor />
        <Ayuda />
        {popupRegion.mostrando && <PopupRegion config={popupRegion} />}
        <Source id="capa-datos-regiones" type="geojson" data={geoJSONFiltrado}>
          <Layer
            id="data2"
            type="fill"
            paint={{
              'fill-color': {
                property: `v${posicion}`,
                stops: [
                  [-1, colorApagado],
                  ...escala.reduce((prev, [v, color], i) => (
                    i > 0 ? [...prev, [v - 0.0001, escala[i - 1][1]], [v, color]] : [[v, color]]
                  ), [])
                ]
              },
              'fill-opacity': .7
            }}
          />
        </Source>
        {geoJSONCuarentenas && 
        <Source id="capa-cuarentenas" type="geojson" data={geoJSONCuarentenas}>
          <Layer
            id="dataCuarentenas"
            type="fill"
            paint={{
              'fill-color': 'black',
              'fill-opacity': .7
            }}
          />
        </Source>
        }
        {poligonoDestacado &&
          <Source id="capa-poligono-destacado" type="geojson" data={poligonoDestacado}>
            <Layer
              id="data-poligono-fill"
              type="fill"
              paint={{
                'fill-color': 'rgba(255, 255, 255, .1)'
              }}
            />
            <Layer
              id="data-poligono-stroke"
              type="line"
              paint={{
                'line-color': 'rgba(0, 0, 0, 0.75)',
                'line-width': 2.5
              }}
            />
          </Source>
        }
      </ReactMapGL>
    </div>
  )
}

export default Mapa
