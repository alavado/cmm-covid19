import React, { useState, useEffect } from 'react'
import Header from '../Header'
import './App.css'
import Mapa from '../Mapa'
import SeccionInferior from '../SeccionInferior'
import { Switch, Route } from 'react-router-dom'
import axios from 'axios'
import { procesarRegiones, procesarComunas } from '../../helpers/perez'
import { useDispatch, useSelector } from 'react-redux'
import { actualizarSerie, seleccionarSerie, seleccionarSubserie, avanzarEnSerie, retrocederEnSerie } from '../../redux/actions'
import { CONTAGIOS_REGIONALES_POR_100000_HABITANTES, CASOS_COMUNALES_POR_100000_HABITANTES, CODIGO_CHILE } from '../../redux/reducers/series'
import Loader from './Loader'

const urlDatosRegiones = 'https://raw.githubusercontent.com/jorgeperezrojas/covid19-data/master/csv/confirmados.csv'
const urlDatosComunas = 'https://raw.githubusercontent.com/jorgeperezrojas/covid19-data/master/csv/confirmados_comunas.csv'
const urlGeoJSONRegiones = 'https://raw.githubusercontent.com/alavado/cmm-covid19/master/src/data/geojsons/regiones.json'
const urlGeoJSONComunas = 'https://raw.githubusercontent.com/alavado/cmm-covid19/master/src/data/geojsons/comunas.json'

const App = () => {

  const [inicializada, setInicializada] = useState(false)
  const [errorAlCargar, setErrorAlCargar] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    async function inicializarDatos() {
      const { data: datosCSVRegiones } = await axios.get(urlDatosRegiones)
      const { data: geoJSONRegiones } = await axios.get(urlGeoJSONRegiones)
      const [casosRegionalesPor100000Habitantes, geoJSONRegionesConDatos] = procesarRegiones(datosCSVRegiones, geoJSONRegiones)
      dispatch(actualizarSerie(CONTAGIOS_REGIONALES_POR_100000_HABITANTES, 'geoJSON', geoJSONRegionesConDatos))
      dispatch(actualizarSerie(CONTAGIOS_REGIONALES_POR_100000_HABITANTES, 'datos', casosRegionalesPor100000Habitantes))
      dispatch(seleccionarSerie(CONTAGIOS_REGIONALES_POR_100000_HABITANTES))
      dispatch(seleccionarSubserie(CODIGO_CHILE))
      const { data: datosCSVComunas } = await axios.get(urlDatosComunas)
      const { data: geoJSONComunas } = await axios.get(urlGeoJSONComunas)
      const [casosComunalesPor100000Habitantes, geoJSONComunalConDatos] = procesarComunas(datosCSVComunas, geoJSONComunas)
      dispatch(actualizarSerie(CASOS_COMUNALES_POR_100000_HABITANTES, 'geoJSON', geoJSONComunalConDatos))
      dispatch(actualizarSerie(CASOS_COMUNALES_POR_100000_HABITANTES, 'datos', casosComunalesPor100000Habitantes))
      setInicializada(true)
    }
    inicializarDatos()
      .catch(err => {
        console.log(err)
        setErrorAlCargar('Ocurrió un error al obtener los datos')
      })
    window.addEventListener('keydown', k => {
      switch (k.code) {
        case 'PageDown':
          dispatch(avanzarEnSerie())
          break
        case 'PageUp':
          dispatch(retrocederEnSerie())
          break
      }
    })
  }, [dispatch])

  if (errorAlCargar) {
    return errorAlCargar
  }

  return (
    <div className="App">
      {inicializada ?
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
        </div> :
        <div className="App__contenedor_precarga">
          <Loader />
        </div>
      }
    </div>
  )
}

export default App
