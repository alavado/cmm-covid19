import React, { useState, useEffect } from 'react'
import Header from '../Header'
import './App.css'
import Mapa from '../Mapa'
import SeccionInferior from '../SeccionInferior'
import { Switch, Route } from 'react-router-dom'
import axios from 'axios'
import { procesarRegiones, procesarComunas, interpolarComunas } from '../../helpers/perez'
import { useDispatch } from 'react-redux'
import { agregarDataset, actualizarSerie, seleccionarSerie, seleccionarSubserie, avanzarEnSerie, retrocederEnSerie, fijarGeoJSONCuarentenas } from '../../redux/actions'
import { procesarCuarentenas } from '../../helpers/cuarentenas'
import {
  CASOS_COMUNALES, CASOS_REGIONALES,
  CONTAGIOS_REGIONALES_POR_100000_HABITANTES, NUEVOS_CASOS_COMUNALES_POR_100000_HABITANTES,
  CODIGO_CHILE, CASOS_COMUNALES_INTERPOLADOS,
  NUEVOS_CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS
} from '../../redux/reducers/series'
import Loader from './Loader'
import geoJSONCuarentenas from '../../data/geojsons/cuarentenas.json'
import AppMapaCasos from '../AppMapaCasos'
import AppGraficosSimples from '../AppGraficosSimples'
import AppUCI from '../AppGraficosSimples/AppUCI'
import { procesarCSVRegiones, procesarCSVComunas, calcularNuevosCasos, calcularNuevosCasosChile, formatearGeoJSONComunas, porHabitantes } from '../../helpers/preprocesamiento'

const urlDatosRegiones = 'https://raw.githubusercontent.com/jorgeperezrojas/covid19-data/master/csv/confirmados.csv'
const urlDatosComunas = 'https://raw.githubusercontent.com/alavado/cmm-covid19/master/src/data/contagios/comunas.csv'
const urlGeoJSONRegiones = 'https://raw.githubusercontent.com/alavado/cmm-covid19/master/src/data/geojsons/regiones.json'
const urlGeoJSONComunas = 'https://raw.githubusercontent.com/alavado/cmm-covid19/master/src/data/geojsons/comunas.json'
const urlMuertesRegiones = 'https://raw.githubusercontent.com/jorgeperezrojas/covid19-data/master/csv/muertes.csv'
const urlPCRRegiones = 'https://raw.githubusercontent.com/jorgeperezrojas/covid19-data/master/csv/pcrs_region.csv'

const App = () => {

  const [inicializada, setInicializada] = useState(false)
  const [errorAlCargar, setErrorAlCargar] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const dispatch = useDispatch()

  useEffect(() => {
    async function inicializarDatos() {
      setMensaje('Cargando datos regionales...')
      const { data: datosCSVRegiones } = await axios.get(urlDatosRegiones)
      const { data: geoJSONRegiones } = await axios.get(urlGeoJSONRegiones)
      const { data: datosMuertesRegiones } = await axios.get(urlMuertesRegiones)
      const { data: datosPCRRegiones } = await axios.get(urlPCRRegiones)
      setMensaje('Cargando datos comunales...')
      const { data: geoJSONComunas } = await axios.get(urlGeoJSONComunas)
      const { data: datosCSVComunas } = await axios.get(urlDatosComunas)
      
      setMensaje('Calculando aumento en casos...')
      const [casosComunalesPor100000Habitantes, geoJSONComunalConDatos, datosComunalesOriginales] = await procesarComunas(datosCSVComunas, geoJSONComunas)
      const [casosRegionalesPor100000Habitantes, geoJSONRegionesConDatos, datosRegionalesOriginales] = await procesarRegiones(datosCSVRegiones, geoJSONRegiones)

      // ver: https://covid19.soporta.cl/datasets/0b944d9bf1954c71a7fae96bdddee464_1/geoservice?geometry=-71.394%2C-33.683%2C-69.660%2C-33.282
      // baja geojson y usa mapshaper douglas 10%

      dispatch(fijarGeoJSONCuarentenas(procesarCuarentenas(geoJSONCuarentenas)))
      dispatch(actualizarSerie(CONTAGIOS_REGIONALES_POR_100000_HABITANTES, 'geoJSON', geoJSONRegionesConDatos))
      dispatch(actualizarSerie(CONTAGIOS_REGIONALES_POR_100000_HABITANTES, 'datos', casosRegionalesPor100000Habitantes))
      dispatch(seleccionarSerie(CONTAGIOS_REGIONALES_POR_100000_HABITANTES))
      dispatch(actualizarSerie(CASOS_REGIONALES, 'datos', datosRegionalesOriginales))
      dispatch(actualizarSerie(CASOS_REGIONALES, 'geoJSON', geoJSONRegionesConDatos))
      dispatch(seleccionarSubserie(CODIGO_CHILE))
      dispatch(actualizarSerie(NUEVOS_CASOS_COMUNALES_POR_100000_HABITANTES, 'geoJSON', geoJSONComunalConDatos))
      dispatch(actualizarSerie(NUEVOS_CASOS_COMUNALES_POR_100000_HABITANTES, 'datos', casosComunalesPor100000Habitantes))
      dispatch(actualizarSerie(CASOS_COMUNALES, 'datos', datosComunalesOriginales))
      dispatch(actualizarSerie(CASOS_COMUNALES, 'geoJSON', geoJSONComunalConDatos))

      setMensaje('Interpolando los datos desconocidos...')
      const [datosComunalesInterpolados, geoJSONInterpolado, datosComunalesOriginalesInterpolados] = await interpolarComunas(datosComunalesOriginales, datosRegionalesOriginales, geoJSONComunas)
      dispatch(actualizarSerie(NUEVOS_CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS, 'geoJSON', geoJSONInterpolado))
      dispatch(actualizarSerie(NUEVOS_CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS, 'datos', datosComunalesInterpolados))
      dispatch(actualizarSerie(CASOS_COMUNALES_INTERPOLADOS, 'datos', datosComunalesOriginalesInterpolados))
      dispatch(actualizarSerie(CASOS_COMUNALES_INTERPOLADOS, 'geoJSON', geoJSONInterpolado))

      const geoJSONComunasFormateado = formatearGeoJSONComunas(geoJSONComunas)

      const [seriePCRChile, seriePCRRegiones] = procesarCSVRegiones(datosPCRRegiones)
      dispatch(agregarDataset(
        'Total de pruebas PCR',
        [0, 50, 100, 500, 1000, 5000, 10000],
        seriePCRChile,
        { series: seriePCRRegiones, geoJSON: geoJSONRegiones },
        null,
        { invertirColores: true }
      ))
      const [serieChile, seriesRegiones] = procesarCSVRegiones(datosCSVRegiones)
      const seriesComunas = procesarCSVComunas(datosCSVComunas, seriesRegiones)
      dispatch(agregarDataset(
        'Total de casos confirmados hasta la fecha',
        [0, 10, 100, 500, 1000, 5000, 10000],
        serieChile,
        { series: seriesRegiones, geoJSON: geoJSONRegiones },
        { series: seriesComunas, geoJSON: geoJSONComunasFormateado }
      ))
      dispatch(agregarDataset(
        'Nuevos casos confirmados',
        [0, 5, 10, 25, 50, 100, 500],
        calcularNuevosCasosChile(serieChile),
        { series: calcularNuevosCasos(seriesRegiones), geoJSON: geoJSONRegiones },
        { series: calcularNuevosCasos(seriesComunas), geoJSON: geoJSONComunasFormateado }
      ))
      dispatch(agregarDataset(
        'Nuevos casos confirmados por 100.000 habitantes',
        [0, .5, 1, 2.5, 5, 10, 50],
        calcularNuevosCasosChile(serieChile, { habitantes: 100000, redondear: false }),
        { series: calcularNuevosCasos(seriesRegiones, { habitantes: 100000, redondear: false }), geoJSON: geoJSONRegiones },
        { series: calcularNuevosCasos(seriesComunas, { habitantes: 100000, redondear: false }), geoJSON: geoJSONComunasFormateado }
      ))
      dispatch(agregarDataset(
        'Nuevos casos confirmados en los últimos 7 días',
        [0, 5, 10, 25, 50, 100, 500],
        calcularNuevosCasosChile(serieChile, { dias: 7 }),
        { series: calcularNuevosCasos(seriesRegiones, { dias: 7 }), geoJSON: geoJSONRegiones },
        { series: calcularNuevosCasos(seriesComunas, { dias: 7 }), geoJSON: geoJSONComunasFormateado }
      ))
      const [serieMuertesChile, seriesMuertesRegiones] = procesarCSVRegiones(datosMuertesRegiones)
      dispatch(agregarDataset(
        'Total de muertes hasta la fecha',
        [0, 1, 10],
        serieMuertesChile,
        { series: seriesMuertesRegiones, geoJSON: geoJSONRegiones },
        null
      ))
      dispatch(agregarDataset(
        'Muertes en los últimos 7 días',
        [0, 1, 10],
        calcularNuevosCasosChile(serieMuertesChile, { dias: 7 }),
        { series: calcularNuevosCasos(seriesMuertesRegiones, { dias: 7 }), geoJSON: geoJSONRegiones },
        null
      ))
      setInicializada(true)
    }
    inicializarDatos()
      .catch(err => {
        console.log(err)
        setErrorAlCargar('Ocurrió un error al obtener los datos. A veces pasa esto, pero como por arte de magia se soluciona en unos minutos.')
      })
    window.addEventListener('keydown', k => {
      switch (k.code) {
        case 'PageDown':
          dispatch(avanzarEnSerie())
          break
        case 'PageUp':
          dispatch(retrocederEnSerie())
          break
        default:
      }
    })
  }, [dispatch])

  if (errorAlCargar) {
    return errorAlCargar
  }

  return (
    <div className="App">
      {inicializada ?
        <Switch>
          <Route path="/uci" exact component={AppUCI} />
          <Route path="/casos" exact component={AppMapaCasos} />
          <Route path="/graficos/comuna/:comuna" component={AppGraficosSimples} />
          <Route path="/graficos" component={AppGraficosSimples} />
          <Route path="/vmi" component={AppGraficosSimples} />
          <Route path="/">
            <div className="App__contenedor_poscarga">
              <section className="App_contenedor_header">
                <Switch>
                  <Route path="/" exact component={Header} />
                  <Route path="/:division/:codigo" component={Header} />
                </Switch>
              </section>
              <main className="App__contenedor">
                <Switch>
                  <Route path="/" exact component={Mapa} />
                  <Route path="/:division/:codigo" component={Mapa} />
                </Switch>
                <SeccionInferior />
              </main>
            </div>
          </Route>
        </Switch> :
        <div className="App__contenedor_precarga">
          <Loader />
          <div style={{ color: 'white' }}>{mensaje}</div>
        </div>
      }
    </div>
  )
}

export default App
