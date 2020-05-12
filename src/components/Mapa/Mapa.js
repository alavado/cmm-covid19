import React, { useState, useMemo, useEffect, useRef } from 'react'
import ReactMapGL, { Source, Layer, FlyToInterpolator, Marker } from 'react-map-gl'
import mapStyle from './mapStyle.json'
import './Mapa.css'
import { useSelector, useDispatch } from 'react-redux'
import CodigoColor from './CodigoColor'
import PopupRegion from './PopupRegion'
import viewportRegiones from './viewportsRegiones'
import { useHistory, useParams } from 'react-router-dom'
import { seleccionarSubserie, filtrarGeoJSONPorRegion, limpiarFiltros, seleccionarSerie } from '../../redux/actions'
import { CODIGO_CHILE, CONTAGIOS_REGIONALES_POR_100000_HABITANTES, NUEVOS_CASOS_COMUNALES_POR_100000_HABITANTES, NUEVOS_CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS, CASOS_COMUNALES_INTERPOLADOS, CASOS_REGIONALES } from '../../redux/reducers/series'
import { esMovil } from '../../helpers/responsive'
import demograficosComunas from '../../data/demografia/comunas.json'
import Ayuda from './Ayuda'
import texture from '../../assets/black-twill-sm.png'
import RankingComunas from './RankingComunas'
import { easeCubic } from 'd3-ease'
import polylabel from 'polylabel'
import area from '@turf/area'
import { polygon } from 'turf'
import MiniGrafico from './MiniGrafico'

const calcularPoloDeInaccesibilidad = feature => {
  let poligono = feature.geometry.coordinates
  if (feature.geometry.type === 'MultiPolygon') {
    poligono = feature.geometry.coordinates
      .reduce((x, y) => area(polygon(x)) > area(polygon(y)) ? x : y)
  }
  const [longitude, latitude] = polylabel(poligono)
  return { longitude: longitude, latitude: latitude }
}

const vpInicialLandscape = {
  width: '100%',
  height: 'calc(100vh - 15em)',
  latitude: -39.204954641160536,
  longitude: -69.26430872363804,
  zoom: esMovil() ? 2.5 : 4,
  bearing: 98.49519730510106,
  pitch: 0,
  altitude: 1.5
}

const vpInicialPortrait = {
  altitude: 1.5,
  bearing: 48.09519730510106,
  latitude: -38.36201512202589,
  longitude: -65.56203686781191,
  pitch: 33.28986658630797,
  zoom: 2.7105375924527375
}

const Mapa = () => {

  const { series, serieSeleccionada: serie, posicion, subserieSeleccionada, geoJSONCuarentenasActivas, verCuarentenas, comunasInterpoladas } = useSelector(state => state.series)
  const { escala, colorApagado, animaciones } = useSelector(state => state.colores)
  const { filtroValor, filtroRegion } = serie
  const vpInicial = window.innerWidth < 600 ?
    {...vpInicialLandscape, ...vpInicialPortrait, transitionDuration: animaciones ? 'auto' : 0} :
    {...vpInicialLandscape, transitionDuration: animaciones ? 'auto' : 0}
  const [viewport, setViewport] = useState(vpInicial)
  const [regionPrevia, setRegionPrevia] = useState('')
  const [divisionPrevia, setDivisionPrevia] = useState('')
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
  const { division, codigo } = params
  const mapa = useRef()

  useEffect(() => {
    setViewport(v => ({ ...v, transitionDuration: animaciones ? animaciones ? 1500 : 0 : 0 }))
  }, [animaciones])

  useEffect(() => {
    if (division) {
      if (division === 'region') {
        const { vp: vpRegion } = viewportRegiones.find(vp => vp.codigo === Number(codigo))
        setViewport(v => ({
          ...v,
          ...vpRegion,
          transitionDuration: animaciones ? 1500 : 0,
          transitionInterpolator: new FlyToInterpolator(),
          transitionEasing: easeCubic
        }))
        dispatch(seleccionarSerie(CONTAGIOS_REGIONALES_POR_100000_HABITANTES))
        dispatch(seleccionarSubserie(Number(codigo)))
        setPoligonoDestacado(null)
        setRegionPrevia(codigo)
      }
      else if (division === 'comuna') {
        const codigoRegion = demograficosComunas.find(c => c.codigo === codigo).region
        if (codigoRegion !== regionPrevia) {
          const { vp: vpRegion } = viewportRegiones.find(vp => vp.codigo === Number(codigoRegion))
          setViewport(v => ({
            ...v,
            ...vpRegion,
            transitionDuration: animaciones ? 1500 : 0,
            transitionInterpolator: new FlyToInterpolator(),
            transitionEasing: easeCubic
          }))
        }
        dispatch(filtrarGeoJSONPorRegion(c => c === Number(codigoRegion)))
        if (divisionPrevia !== division) {
          dispatch(seleccionarSerie(comunasInterpoladas ? NUEVOS_CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS : NUEVOS_CASOS_COMUNALES_POR_100000_HABITANTES))
        }
        dispatch(seleccionarSubserie(Number(codigo)))
        setRegionPrevia(codigoRegion)
      }
    }
    else {
      dispatch(seleccionarSubserie(CODIGO_CHILE))
      setViewport(v => ({
        ...v,
        ...vpInicial,
        transitionDuration: animaciones ? 1500 : 0,
        transitionInterpolator: new FlyToInterpolator(),
        transitionEasing: easeCubic
      }))
      dispatch(limpiarFiltros())
      setPoligonoDestacado(null)
      setRegionPrevia(null)
    }
    setDivisionPrevia(division)
  }, [division, codigo])

  useEffect(() => {
    if (subserieSeleccionada) {
      const { codigo } = subserieSeleccionada
      const feature = serie.geoJSON.features.find(f => f.properties.codigo === codigo)
      if (feature)
      setPoligonoDestacado(serie.geoJSON.features.find(f => f.properties.codigo === codigo))
    }
  }, [subserieSeleccionada])

  const geoJSONFiltrado = serie.geoJSON
  const geoJSONTapa = useMemo(() => ({
    ...serie.geoJSON,
    features: serie.geoJSON.features
      .filter(f => {
        let valor = f.properties[`v${posicion}`]
        let codigoRegion = f.properties.codigoRegion
        return !filtroValor(valor) || !filtroRegion(codigoRegion)
    }),
  }), [filtroValor, filtroRegion, posicion])

  const labelsComunas = useMemo(() => {
    if (division !== 'comuna') {
      return []
    }
    const codigoRegion = Number(demograficosComunas.find(c => c.codigo === codigo).region)
    const poligonosRegion = series
      .find(({ id }) => id === NUEVOS_CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS)
      .geoJSON
      .features
      .filter(f => f.properties.codigoRegion === Number(codigoRegion))
    return poligonosRegion.map((feature, i) => {
      const centroVisual = calcularPoloDeInaccesibilidad(feature)
      const zoomRegion = viewportRegiones
        .find(vp => vp.codigo === codigoRegion)
        .vp.zoomMinimoParaMostrarMarkerComunas
      return (
        <MiniGrafico
          key={`minigrafico-${feature.properties.codigo}`}
          lat={centroVisual.latitude}
          lng={centroVisual.longitude}
          nombreComuna={feature.properties.NOM_COM}
          mostrar={viewport.zoom > zoomRegion}
        />
      )
    })
  }, [division, codigo, viewport.zoom])

  const clickEnPoligono = e => {
    const featurePoligono = e.features && e.features.find(f => f.source === 'capa-datos-regiones')
    if (!featurePoligono) {
      return
    }
    const { codigo, codigoRegion } = featurePoligono.properties
    dispatch(seleccionarSubserie(codigo))
    if (serie.id === CONTAGIOS_REGIONALES_POR_100000_HABITANTES) {
      dispatch(filtrarGeoJSONPorRegion(c => c === codigoRegion))
      setPoligonoDestacado(null)
      history.push(`/region/${codigo}`)
    }
    else {
      if (Number(codigoRegion) !== Number(regionPrevia)) {
        dispatch(filtrarGeoJSONPorRegion(c => c === codigoRegion))
      }
      setPoligonoDestacado(featurePoligono)
      history.push(`/comuna/${codigo}`)
    }
  }

  const actualizarPopupChico = e => {
    const featurePoligono = e.features && e.features.find(f => f.source === 'capa-datos-regiones')
    if (!featurePoligono) {
      if (popupRegion.mostrando) {
        setPopupRegion({
          ...popupRegion,
          mostrando: false
        })
      }
      return
    }
    const valorRegion = serie.datos.find(s => s.codigo === featurePoligono.properties.codigo)
    if (valorRegion) {
      setPopupRegion({
        mostrando: true,
        latitude: e.lngLat[1],
        longitude: e.lngLat[0],
        titulo: featurePoligono.properties.nombre,
        valor: valorRegion.datos[posicion].valor
      })
    }
  }
  
  useEffect(() => mapa.current.getMap()
    .loadImage(texture, (err, image) => {
      mapa.current.getMap().addImage('texturaCuarentenas', image)
    }), [])

  const cambioEnElViewport = vp => {
    setViewport({
      ...vp,
      width: '100%',
      height: 'calc(100vh - 15em)',
    })
  }

  const codigoColor = useMemo(() => <CodigoColor />, [])
  const rankingComunas = useMemo(() => <RankingComunas />, [])
  const actualizacion = useMemo(() => (
    <div className="Mapa__actualizacion">
      <div className="Mapa__actualizacion_contenido">
        Última actualizacion: 12/05<br />
        <a target="_blank" href="https://twitter.com/alavado_desu"><span className="Contacto">Contacto</span></a>
      </div>
    </div>
  ), [])

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
        onMouseOut={() => setPopupRegion({ ...popupRegion, mostrando: false })}
        ref={mapa}
      >
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
              'fill-opacity': .8
            }}
          />
          <Layer
            id="data2-poligono-stroke"
            type="line"
            paint={{
              'line-color': 'rgba(0, 0, 0, 0.5)',
              'line-width': 1
            }}
          />
        </Source>
        <Source id="capa-tapa" type="geojson" data={geoJSONTapa}>
          <Layer
            id="tapa-opaco"
            type="fill"
            paint={{
              'fill-color': colorApagado,
              'fill-opacity': 1
            }}
          />
          <Layer
            id="tapa-lineas"
            type="line"
            paint={{
              'line-color': 'rgba(0, 0, 0, 0.5)',
              'line-width': 1
            }}
          />
        </Source>
        {division === 'comuna' && verCuarentenas &&
          <Source id="capa-cuarentenas" type="geojson" data={geoJSONCuarentenasActivas}>
            <Layer
              id="dataCuarentenas"
              type="fill"
              paint={{
                'fill-pattern': 'texturaCuarentenas',
                'fill-opacity': 1
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
                'fill-color': 'rgb(255, 255, 255)',
                'fill-opacity': .025
              }}
            />
            <Layer
              id="data-poligono-stroke"
              type="line"
              paint={{
                'line-color': 'rgba(0, 0, 0, 0.75)',
                'line-width': 3
              }}
            />
          </Source>
        }
        {actualizacion}
        {division === 'comuna' && labelsComunas}
      </ReactMapGL>
      {codigoColor}
      {division === 'comuna' && rankingComunas}
    </div>
  )
}

export default Mapa
