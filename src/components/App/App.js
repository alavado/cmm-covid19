import React, { useState, useEffect } from 'react'
import Header from '../Header'
import './App.css'
import Mapa from '../Mapa'
import SeccionInferior from '../SeccionInferior'
import { Switch, Route } from 'react-router-dom'
import axios from 'axios'
import { procesarRegiones, procesarComunas, interpolarComunas } from '../../helpers/perez'
import { useDispatch } from 'react-redux'
import { actualizarSerie, seleccionarSerie, seleccionarSubserie, avanzarEnSerie, retrocederEnSerie, fijarGeoJSONCuarentenas } from '../../redux/actions'
import { procesarCuarentenas } from '../../helpers/cuarentenas'
import { CASOS_COMUNALES, CASOS_REGIONALES, CONTAGIOS_REGIONALES_POR_100000_HABITANTES, CASOS_COMUNALES_POR_100000_HABITANTES, CODIGO_CHILE, CUARENTENAS } from '../../redux/reducers/series'
import Loader from './Loader'
import geoJSONCuarentenas from '../../data/geojsons/cuarentenas.json'

const urlDatosRegiones = 'https://raw.githubusercontent.com/alavado/cmm-covid19/master/src/data/contagios/regiones.csv'
const urlDatosComunas = 'https://raw.githubusercontent.com/alavado/cmm-covid19/master/src/data/contagios/comunas.csv'
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
      const { data: geoJSONComunas } = await axios.get(urlGeoJSONComunas)
      const { data: datosCSVComunas } = await axios.get(urlDatosComunas)
      const [casosComunalesPor100000Habitantes, geoJSONComunalConDatos, datosComunalesOriginales] = procesarComunas(datosCSVComunas, geoJSONComunas)
      const [casosRegionalesPor100000Habitantes, geoJSONRegionesConDatos, datosRegionalesOriginales] = procesarRegiones(datosCSVRegiones, geoJSONRegiones)

      // ver: https://covid19.soporta.cl/datasets/0b944d9bf1954c71a7fae96bdddee464_1/geoservice?geometry=-71.394%2C-33.683%2C-69.660%2C-33.282
      dispatch(fijarGeoJSONCuarentenas(procesarCuarentenas(geoJSONCuarentenas)))
      dispatch(actualizarSerie(CONTAGIOS_REGIONALES_POR_100000_HABITANTES, 'geoJSON', geoJSONRegionesConDatos))
      dispatch(actualizarSerie(CONTAGIOS_REGIONALES_POR_100000_HABITANTES, 'datos', casosRegionalesPor100000Habitantes))
      dispatch(seleccionarSerie(CONTAGIOS_REGIONALES_POR_100000_HABITANTES))
      dispatch(actualizarSerie(CASOS_REGIONALES, 'datos', datosRegionalesOriginales))
      dispatch(seleccionarSubserie(CODIGO_CHILE))
      dispatch(actualizarSerie(CASOS_COMUNALES_POR_100000_HABITANTES, 'geoJSON', geoJSONComunalConDatos))
      dispatch(actualizarSerie(CASOS_COMUNALES_POR_100000_HABITANTES, 'datos', casosComunalesPor100000Habitantes))
      dispatch(actualizarSerie(CASOS_COMUNALES, 'datos', datosComunalesOriginales))

      console.log({geoJSONComunalConDatos})
      console.log({casosComunalesPor100000Habitantes})
      console.log({datosComunalesOriginales})

      const [datosComunalesInterpolados, geoJSONInterpolado, datosComunalesOriginalesInterpolados] = interpolarComunas(datosComunalesOriginales, datosRegionalesOriginales, geoJSONComunas)
      // dispatch(actualizarSerie(CASOS_COMUNALES_POR_100000_HABITANTES, 'geoJSON', geoJSONInterpolado))
      // dispatch(actualizarSerie(CASOS_COMUNALES_POR_100000_HABITANTES, 'datos', datosComunalesInterpolados))
      // dispatch(actualizarSerie(CASOS_COMUNALES, 'datos', datosComunalesOriginalesInterpolados))

      console.log({geoJSONInterpolado})
      console.log({datosComunalesInterpolados})
      console.log({datosComunalesOriginalesInterpolados})
      
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
