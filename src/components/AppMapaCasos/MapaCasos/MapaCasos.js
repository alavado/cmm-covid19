import React, { useState, useMemo, useRef, useEffect } from 'react'
import ReactMapGL, { Source, Layer, Marker } from 'react-map-gl'
import mapStyle from './mapStyle.json'
import './MapaCasos.css'
import { useSelector } from 'react-redux'
import { CASOS_COMUNALES_INTERPOLADOS } from '../../../redux/reducers/series'
import randomPointsOnPolygon from 'random-points-on-polygon'
import turf from 'turf'
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa'
import { Line } from 'react-chartjs-2'
import GraficoComparativo from '../GraficoComparativo'
import polylabel from 'polylabel'

const calcularPoloDeInaccesibilidad = puntos => {
  const [longitude, latitude] = polylabel(puntos)
  return { longitude: longitude, latitude: latitude }
}

const MapaCasos = props => {

  const { series } = useSelector(state => state.series)
  const { datos: datosComunas, geoJSON } = series.find(({ id }) => id === CASOS_COMUNALES_INTERPOLADOS)
  const mapCasos = useRef()

  const [posicion, setPosicion] = useState(datosComunas[0].datos.length - 1)
  const [recuperacion, setRecuperacion] = useState(20)
  const [multiplicador, setMultiplicador] = useState(3.4)
  const [mostrarGrafico, setMostrarGrafico] = useState(false)
  const [datosGrafico, setDatosGrafico] = useState([])
  const posicionInicial = 25

  const geoJSONFiltrado = useMemo(() => {
    const featuresRegion = geoJSON
      .features
      .filter(feature => feature.properties.codigoRegion === 13)
      .map(feature => ({
        ...feature,
        properties: {
          ...feature.properties,
          centro: calcularPoloDeInaccesibilidad(feature.geometry.coordinates)
        }
      }))
    return {
      ...geoJSON,
      features: featuresRegion
    }
  }, [])

  useEffect(() => {
    props.setVp(props.vp)
  }, [props.vp.latitude])

  const hashComunas = useMemo(() => datosComunas.reduce((obj, comuna) => ({
    ...obj,
    [comuna.codigo]: comuna
  }), {}), [])

  const labelsComunas = useMemo(() => geoJSONFiltrado.features.map((feature, i) => {
    const serieComuna = hashComunas[feature.properties.codigo]
    const casosComuna = serieComuna.datos[posicion].valor
    const recuperados = (posicion - recuperacion) < 0 ? 0 : serieComuna.datos[posicion - recuperacion].valor
    const serieActivos = serieComuna.datos.map((x, i) => multiplicador * (x.valor - serieComuna.datos[Math.max(0, i - recuperacion)].valor))
    const activosDesdeDiaInicial = serieActivos
      .reduce((prev, v, i, arr) => {
        let sum = 0
        for (let j = i; j >= 0 && j > i - 7; j--) {
          sum += arr[j]
        }
        return [...prev, sum / Math.min(i + 1, 7)]
      }, [])
      .slice(posicionInicial)
    const maximoActivos = activosDesdeDiaInicial.reduce((x, y) => Math.max(x, y))
    return (
      <Marker
        className="MapaCasos__marcador_nombre_comuna"
        latitude={feature.properties.centro.latitude}
        longitude={feature.properties.centro.longitude}
        key={`marker-feature-${i}`}
      >
        <div
          className="MapaCasos__marcador_contenedor_mini_grafico"
          style={{
            opacity: props.vp.zoom > 10 && props.verGraficos ? 1 : 0,
            transform: props.vp.zoom > 10 && props.verGraficos ? 'translateY(-.25em)' : 'translateY(0)',
            pointerEvents: props.vp.zoom > 10 && props.verGraficos ? 'all' : 'none'
          }}
          onClick={() => {
            setMostrarGrafico(true)
            setDatosGrafico(prev => [...prev, {
              label: feature.properties.nombre,
              data: activosDesdeDiaInicial,
              borderColor: 'white'
            }])
          }}
        >
          <Line
            data={{
              labels: activosDesdeDiaInicial.map((x, i) => i),
              datasets: [
                {
                  label: `lineas-dia-grafiquito-${feature.properties.codigo}-${posicion}`,
                  data: activosDesdeDiaInicial,
                  borderColor: '#ffffff',
                  pointRadius: 0,
                  borderWidth: 2,
                  pointHoverRadius: 0
                },
                // {
                //   type: 'bar',
                //   label: `barras-dia-grafiquito-${feature.properties.codigo}-${posicion}`,
                //   data: activosDesdeDiaInicial.map((x, i) => i === (posicion - posicionInicial) ? maximoActivos : 0),
                //   backgroundColor: 'rgba(255, 255, 255, .35)',
                // }
              ]
            }}
            options={{
              maintainAspectRatio: false,
              legend: {
                display: false
              },
              animation: false,
              tooltips: {
                enabled: false
              },
              scales: {
                yAxes: [{
                  ticks: {
                    display: false
                  },
                  gridLines: {
                    display: false
                  }
                }],
                xAxes: [{
                  display: false,
                  ticks: {
                    suggestedMin: 0
                  },
                  gridLines: {
                    display: false
                  },
                }],
              }
            }}
          />
        </div>
        <div
          className="MapaCasos__marcador_nombre_comuna_contenido"
          style={{
            opacity: props.vp.zoom > 10 ? 1 : 0,
            transform: props.vp.zoom > 10 ? 'translateY(-.25em)' : 'translateY(0)',
          }}
        >
          {feature.properties.NOM_COM}<br />
          <span style={{ fontWeight: 'bold', fontSize: '1.5em', pointerEvents: 'none' }}>
            {Math.round((1 + multiplicador) * (casosComuna - recuperados)).toLocaleString('de-DE')}
          </span>
        </div>
      </Marker>
    )
  }), [posicion, recuperacion, multiplicador, props.vp.zoom, props.verGraficos])

  const geoJSONInfectados = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: geoJSONFiltrado.features
        .map(feature => {
          const serieComuna = hashComunas[feature.properties.codigo]
          const casosComuna = serieComuna.datos[posicion].valor
          if (!casosComuna) {
            return []
          }
          const recuperados = (posicion - recuperacion) < 0 ? 0 : serieComuna.datos[posicion - recuperacion].valor
          const barriosComuna = props.poligonosComunas
            .find(({ codigo }) => codigo === feature.properties.codigo)
          if (barriosComuna) {
            let puntos = []
            let puntosPorPoligono = Array.from(Array(barriosComuna.features.length)).map(() => 0)
            for (let i = 0; i < (1 + multiplicador) * (casosComuna - recuperados); i++) {
              let indice = Math.floor(Math.random() * barriosComuna.poblacion)
              if (barriosComuna.features[barriosComuna.arrayMagico[indice]].geometry.coordinates[0].length > 3) {
                puntosPorPoligono[barriosComuna.arrayMagico[indice]]++
              }
            }
            puntosPorPoligono.forEach((n, i) => {
              if (n > 0) {
                puntos.push(randomPointsOnPolygon(n, turf.polygon(barriosComuna.features[i].geometry.coordinates)))
              }
            })
            return puntos.flat()
          }
          else {
            return randomPointsOnPolygon(/*(1 + multiplicador) * (casosComuna - recuperados)*/0, turf.polygon(feature.geometry.coordinates))
          }
        })
        .flat()
    }
  }, [posicion, recuperacion, multiplicador])

  const cambioEnElViewport = vp => {
    props.setVp(prev => {
      const nuevoVP = {
        ...prev,
        ...vp,
        width: '100%',
        height: 'calc(100vh -2em)',
        zoom: Math.min(11.5, vp.zoom)
      }
      props.setVp(nuevoVP)
      return nuevoVP
    })
  }

  return (
    <div className="MapaCasos">
      <div className="MapaCasos__lateral">
        {/* <div className="MapaCasos__fecha">
          <button
            onClick={() => setPosicion(Math.max(posicionInicial, posicion - 1))}
            className="MapaCasos__fecha_boton"
            style={{ opacity: posicion === posicionInicial ? 0 : 1 }}
          >
            <FaCaretLeft />
          </button>
          <div className="MapaCasos__calendario">
            <div className="MapaCasos__calendario_mes">
              {datosComunas[0].datos[posicion].fecha.format('MMMM')}
            </div>
            <div className="MapaCasos__calendario_dia">
              {datosComunas[0].datos[posicion].fecha.format('DD')}
              <div className="MapaCasos__calendario_nombre_dia">
                {datosComunas[0].datos[posicion].fecha.format('dddd')}
              </div>
            </div>
          </div>
          <button
            onClick={() => setPosicion(Math.min(datosComunas[0].datos.length - 1, posicion + 1))}
            className="MapaCasos__fecha_boton"
            style={{ opacity: posicion === datosComunas[0].datos.length - 1 ? 0 : 1 }}
          >
            <FaCaretRight />
          </button>
        </div> */}
        <div className="MapaCasos__parametros">
          <p className="MapaCasos__explicacion">
            Los puntos rojos se ubican <span style={{ fontWeight: 'bold' }}>al azar</span>, según las <a target="_blank" rel="noopener noreferer" href="http://geoine-ine-chile.opendata.arcgis.com/datasets/4de21bbed6e94b6ead48cf83d88fcac9_6?geometry=-70.721%2C-33.433%2C-70.613%2C-33.408">densidades de población urbana del 2017</a>.
          </p>
          <p className="MapaCasos__explicacion">Cada punto rojo simula un caso activo en la comuna.</p>
          <h1 className="MapaCasos__explicacion">El número de casos activos se calcula a partir de las cifras oficiales de casos acumulados,<br />suponiendo además que:</h1>
          <label className="MapaCasos__lateral_label">
            {`1) la enfermedad dura`}
            <input
              type="number"
              min={0}
              step={1}
              value={recuperacion}
              onChange={e => setRecuperacion(Number(Math.round(e.target.value)))}
              className="MapaCasos__lateral_input_recuperacion"
            />
            {recuperacion === 1 ? 'día' : 'días'} luego del examen positivo, y
          </label>
          <label className="MapaCasos__lateral_label">
            {`2) hay`}
            <input
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={multiplicador}
              onChange={e => setMultiplicador(Number(e.target.value))}
              className="MapaCasos__lateral_input_multiplicador"
            />
            {multiplicador === 1 ? 'caso no detectado' : 'casos no detectados'} por cada examen positivo.
          </label>
          <p className="MapaCasos__explicacion">Los puntos rojos se redistribuyen si recargas la página o cambias los parámetros.</p>
        </div>
      </div>
      <ReactMapGL
        {...props.vp}
        mapStyle={mapStyle}
        onViewportChange={cambioEnElViewport}
        ref={mapCasos}
      >
        {labelsComunas}
        <Source
          id="puntitos"
          type="geojson"
          data={geoJSONInfectados}
        >
          <Layer
            id="data-puntitos"
            type="circle"
            paint={{
              "circle-color": "#C62828",
              "circle-radius": 2,
              "circle-opacity": .5
            }}
          />
        </Source>
        <Source
          id="capa-datos-regiones-2"
          type="geojson"
          data={geoJSONFiltrado}
        >
          <Layer
            id="data2-poligono-stroke"
            type="line"
            paint={{
              'line-color': 'rgba(190, 190, 190, 1)',
              'line-width': 1
            }}
          />
        </Source>
      </ReactMapGL>
      <GraficoComparativo
        visible={mostrarGrafico}
        setVisible={setMostrarGrafico}
        datos={datosGrafico}
      />
    </div>
  )
}

export default MapaCasos