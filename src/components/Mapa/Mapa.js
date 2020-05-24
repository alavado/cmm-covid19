import React, { useState, useMemo, useEffect, useRef } from 'react'
import ReactMapGL, { Source, Layer, FlyToInterpolator } from 'react-map-gl'
import mapStyle from './mapStyle.json'
import './Mapa.css'
import { useSelector } from 'react-redux'
import CodigoColor from './CodigoColor'
import PopupRegion from './PopupRegion'
import viewportRegiones from './viewportsRegiones'
import { useHistory, useParams } from 'react-router-dom'
import { esMovil } from '../../helpers/responsive'
import demograficosComunas from '../../data/demografia/comunas.json'
import texture from '../../assets/black-twill-sm.png'
import RankingComunas from './RankingComunas'
import { easeCubic } from 'd3-ease'
import polylabel from 'polylabel'
import area from '@turf/area'
import { polygon } from 'turf'
import MiniGrafico from './MiniGrafico'
import { obtenerCuarentenasActivas } from '../../helpers/cuarentenas'
import geoJSONCuarentenas from '../../data/geojsons/cuarentenas.json'
import { obtenerDemograficosComuna } from '../../helpers/demograficos'
import { obtenerColor } from '../../helpers/escala'

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
  height: 'calc(100vh - 16em)',
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

const construirVPInicial = animaciones => {
  return window.innerWidth < 600 ?
    {...vpInicialLandscape, ...vpInicialPortrait, transitionDuration: animaciones ? 'auto' : 0} :
    {...vpInicialLandscape, transitionDuration: animaciones ? 'auto' : 0}
}

const Mapa = () => {

  const { datasets, indice, posicion } = useSelector(state => state.datasets)
  const { animaciones, escala } = useSelector(state => state.colores)
  const [viewport, setViewport] = useState(construirVPInicial(animaciones))
  const [regionPrevia, setRegionPrevia] = useState('')
  const [divisionPrevia, setDivisionPrevia] = useState('')
  const { division, codigo } = useParams()
  const history = useHistory()
  const [popupRegion, setPopupRegion] = useState({
    mostrando: false,
    latitude: 0,
    longitude: 0,
    titulo: ''
  })
  const [poligonoDestacado, setPoligonoDestacado] = useState(null)
  const codigoColor = useMemo(() => <CodigoColor />, [division])
  const rankingComunas = useMemo(() => <RankingComunas />, [])
  const mapa = useRef()

  const geoJSONCuarentenasActivas = useMemo(() => {
    if (!datasets[indice].comunas) {
      return {}
    }
    return obtenerCuarentenasActivas(
      geoJSONCuarentenas,
      datasets[indice].comunas.series[0].serie[Math.min(datasets[indice].comunas.series[0].serie.length - 1, posicion)].fecha
    )
  }, [indice, posicion])

  useEffect(() => {
    setViewport(v => ({ ...v, transitionDuration: animaciones ? animaciones ? 1500 : 0 : 0 }))
  }, [animaciones])

  useEffect(() => {
    if (division) {
      if (division === 'region' || !datasets[indice].comunas) {
        const { vp: vpRegion } = viewportRegiones.find(vp => vp.codigo === Number(codigo))
        // if (datasets[indice].comunas) {
        //   setViewport(v => ({
        //     ...v,
        //     ...vpRegion,
        //     transitionDuration: animaciones ? 1500 : 0,
        //     transitionInterpolator: new FlyToInterpolator(),
        //     transitionEasing: easeCubic
        //   }))
        // }
        setRegionPrevia(codigo)
      }
      else if (division === 'comuna') {
        const codigoRegion = demograficosComunas.find(c => Number(c.codigo) === Number(codigo)).region
        if (codigoRegion !== regionPrevia || division !== divisionPrevia) {
          const { vp: vpRegion } = viewportRegiones.find(vp => vp.codigo === Number(codigoRegion))
          setViewport(v => ({
            ...v,
            ...vpRegion,
            transitionDuration: animaciones ? 1500 : 0,
            transitionInterpolator: new FlyToInterpolator(),
            transitionEasing: easeCubic
          }))
        }
        setRegionPrevia(codigoRegion)
      }
    }
    else {
      setViewport(v => ({
        ...v,
        ...construirVPInicial(animaciones),
        transitionDuration: animaciones ? 1500 : 0,
        transitionInterpolator: new FlyToInterpolator(),
        transitionEasing: easeCubic
      }))
      setRegionPrevia(null)
    }
    setDivisionPrevia(division)
  }, [division, codigo, indice])

  useEffect(() => {
    if (division === 'comuna') {
      const poligono = geoJSON.features.find(f => Number(f.properties.COD_COMUNA) === Number(codigo))
      if (poligono) {
        setPoligonoDestacado(poligono)
        const { latitude, longitude } = calcularPoloDeInaccesibilidad(poligono)
        if (division) {
          setViewport(v => ({
            ...v,
            longitude,
            latitude,
            transitionDuration: animaciones ? 1500 : 0,
            transitionInterpolator: new FlyToInterpolator(),
            transitionEasing: easeCubic
          }))
        }
      }
    }
    else {
      setPoligonoDestacado(null)
    }
  }, [division, codigo])

  useEffect(() => mapa.current.getMap()
    .loadImage(texture, (err, image) => {
      mapa.current.getMap().addImage('texturaCuarentenas', image)
  }), [])

  const llaveDataset = division === 'comuna' ?  'comunas' : 'regiones'

  const geoJSON = useMemo(() => {
    if (division === 'comuna' && !datasets[indice].comunas) {
      return {}
    }
    return {
      ...datasets[indice][llaveDataset].geoJSON,
      features: datasets[indice][llaveDataset].geoJSON.features.map(f => {
        const serie = datasets[indice][llaveDataset].series.find(({ codigo }) => codigo === Number(f.properties[!division || division === 'region' ? 'codregion' : 'COD_COMUNA']))
        if (!serie) {
          return false
        }
        return {
          ...f,
          properties: {
            ...f.properties,
            valores: serie.serie.map(d => d.valor),
            colores: serie.serie.map(d => obtenerColor(d.valor, datasets[indice].escala, escala))
          }
        }
      }).filter(f => f !== false)
    }
  }, [indice, division, escala])

  const geoJSONTapa = useMemo(() => {
    const codigoRegion = division && (division === 'region' ? Number(codigo) : Number(obtenerDemograficosComuna(codigo).region))
    console.log(datasets[indice].regiones.geoJSON)
    return {
      ...datasets[indice][division === 'comuna' ? 'comunas' : 'regiones'].geoJSON,
      features: datasets[indice][division === 'comuna' ? 'comunas' : 'regiones'].geoJSON.features
        .filter(f => {
          return division && f.properties[division === 'comuna' ? 'codigoRegion' : 'codregion'] !== codigoRegion
      })
    }
  }, [geoJSON, division, codigo])

  const labelsComunas = useMemo(() => {
    if (division !== 'comuna') {
      return []
    }
    const codigoRegion = Number(demograficosComunas.find(c => Number(c.codigo) === Number(codigo)).region)
    const zoomRegion = viewportRegiones
      .find(vp => vp.codigo === codigoRegion)
      .vp.zoomMinimoParaMostrarMarkerComunas
    if (viewport.zoom < zoomRegion) {
      return []
    }
    const poligonosRegion = datasets[indice].comunas
      .geoJSON
      .features
      .filter(f => Number(demograficosComunas.find(c => Number(c.codigo) === Number(f.properties.COD_COMUNA)).region) === Number(codigoRegion))
    return poligonosRegion.map((feature, i) => {
      const centroVisual = calcularPoloDeInaccesibilidad(feature)
      const datos = datasets[indice].comunas.series
        .find(comuna => comuna.codigo === Number(feature.properties.COD_COMUNA)).serie
        .map(d => d.valor)
        .reduce((prev, v, i, arr) => {
          let sum = 0
          for (let j = i; j >= 0 && j > i - 2; j--) {
            sum += arr[j]
          }
          return [...prev, sum / Math.min(i + 1, 2)]
        }, [])
      return (
        <MiniGrafico
          key={`minigrafico-${feature.properties.COD_COMUNA}`}
          lat={centroVisual.latitude}
          lng={centroVisual.longitude}
          nombreComuna={feature.properties.NOM_COM}
          mostrar={viewport.zoom > zoomRegion}
          data={datos}
        />
      )
    })
  }, [division, codigo, viewport.zoom, indice])

  const clickEnPoligono = e => {
    const featurePoligono = e.features && e.features.find(f => f.source === 'capa-datos-regiones')
    if (!featurePoligono) {
      return
    }
    if (division !== 'comuna') {
      history.push(`/region/${featurePoligono.properties.codregion}`)
    }
    else {
      history.push(`/comuna/${featurePoligono.properties.COD_COMUNA}`)
    }
  }

  const actualizarPopupChico = e => {
    const featurePoligono = e.features && e.features.find(f => f.source === 'capa-datos-regiones')
    if (!featurePoligono) {
      setPopupRegion({
        ...popupRegion,
        mostrando: false
      })
      return
    }
    if (division === 'comuna') {
      const serieComuna = datasets[indice].comunas.series.find(s => s.codigo === Number(featurePoligono.properties.COD_COMUNA))
      if (serieComuna) {
        setPopupRegion({
          mostrando: true,
          latitude: e.lngLat[1],
          longitude: e.lngLat[0],
          titulo: serieComuna.nombre,
          valor: serieComuna.serie[posicion].valor
        })
      }
    }
    else {
      const serieRegion = datasets[indice].regiones.series.find(s => s.codigo === featurePoligono.properties.codregion)
      if (serieRegion) {
        setPopupRegion({
          mostrando: true,
          latitude: e.lngLat[1],
          longitude: e.lngLat[0],
          titulo: serieRegion.nombre,
          valor: serieRegion.serie[posicion].valor
        })
      }
    }
  }

  const cambioEnElViewport = vp => {
    setViewport({
      ...vp,
      width: '100%',
      height: 'calc(100vh - 16em)',
    })
  }

  return (
    <div className="Mapa">
      <ReactMapGL
        ref={mapa}
        {...viewport}
        mapStyle={mapStyle}
        onViewportChange={cambioEnElViewport}
        onHover={actualizarPopupChico}
        onMouseOut={() => setPopupRegion({ ...popupRegion, mostrando: false })}
        getCursor={() => 'pointer'}
        onClick={clickEnPoligono}
      >
        {popupRegion.mostrando && <PopupRegion config={popupRegion} />}
        <Source id="capa-datos-regiones" type="geojson" data={geoJSON}>
          <Layer
            id="data2"
            type="fill"
            paint={{
              "fill-color": ['to-color', ['at', posicion, ['get', 'colores']]],
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
              'fill-color': '#212121',
              'fill-opacity': .75
            }}
          />
        </Source>
        {division === 'comuna' &&
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
                'line-width': 2.5
              }}
            />
          </Source>
        }
        {division === 'comuna' && labelsComunas}
      </ReactMapGL>
      {codigoColor}
     {division === 'comuna' && rankingComunas}
    </div>
  )
}

export default Mapa
