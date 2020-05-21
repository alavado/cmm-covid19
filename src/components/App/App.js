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
import AppUCI from '../AppUCI'
import { procesarCSVRegiones, procesarCSVComunas } from '../../helpers/preprocesamiento'

const urlDatosRegiones = 'https://raw.githubusercontent.com/alavado/cmm-covid19/master/src/data/contagios/regiones.csv'
const urlDatosComunas = 'https://raw.githubusercontent.com/alavado/cmm-covid19/master/src/data/contagios/comunas.csv'
const urlGeoJSONRegiones = 'https://raw.githubusercontent.com/alavado/cmm-covid19/master/src/data/geojsons/regiones.json'
const urlGeoJSONComunas = 'https://raw.githubusercontent.com/alavado/cmm-covid19/master/src/data/geojsons/comunas.json'

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

      // const [serieChile, seriesRegiones] = procesarCSVRegiones(datosCSVRegiones)
      // const seriesComunas = procesarCSVComunas(datosCSVComunas, seriesRegiones)
      // console.log({serieChile}, {seriesRegiones}, {seriesComunas})
      // dispatch(agregarDataset(
      //   'Total de casos confirnmados',
      //   [0, 10, 100, 500, 1000, 5000, 1000],
      //   serieChile,
      //   seriesRegiones,
      //   seriesComunas
      // ))

      setInicializada(true)
    }
    inicializarDatos()
      .catch(err => {
        console.log(err)
        setErrorAlCargar('Ocurrió un error al obtener los datos. A veces pasa esto, pero se arregla en unos minutos.')
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
          <Route path="/">
            <div className="App__contenedor_poscarga">
              <section className="App_contenedor_header">
                <Header />
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
