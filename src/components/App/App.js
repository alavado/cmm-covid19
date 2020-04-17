import React, { useEffect } from 'react'
import Header from '../Header'
import './App.css'
import Mapa from '../Mapa'
import SeccionInferior from '../SeccionInferior'
import { Switch, Route } from 'react-router-dom'
import axios from 'axios'
import { procesarRegiones } from '../../helpers/perez'
import { useDispatch } from 'react-redux'
import { actualizarSerie } from '../../redux/actions'
import { CONTAGIOS_REGIONALES_POR_100000_HABITANTES } from '../../redux/reducers/series'

const urlRegiones = 'https://raw.githubusercontent.com/jorgeperezrojas/covid19-data/master/csv/confirmados.csv'
const urlGeoJSONRegiones = 'https://raw.githubusercontent.com/alavado/cmm-covid19/master/src/data/geojsons/regiones.json'

const App = () => {

  const dispatch = useDispatch()

  useEffect(() => {
    async function inicializarDatos() {
      const { data: geoJSON } = await axios.get(urlGeoJSONRegiones)
      const { data: datosCSV } = await axios.get(urlRegiones)
      const [casosPor100000Habitantes, geoJSONConDatos] = procesarRegiones(datosCSV, geoJSON)
      dispatch(actualizarSerie(CONTAGIOS_REGIONALES_POR_100000_HABITANTES, 'geoJSON', geoJSONConDatos))
      dispatch(actualizarSerie(CONTAGIOS_REGIONALES_POR_100000_HABITANTES, 'datos', casosPor100000Habitantes))
    }
    inicializarDatos()
  }, [])

  return (
    <div className="App">
      <section className="App_contenedor_header">
        <Header />
      </section>
      <main className="App__contenedor">
        <Switch>
          <Route path="/" exact component={Mapa} />
          <Route path="/region/:codigo" component={Mapa} />
        </Switch>
        <SeccionInferior />
      </main>
    </div>
  )
}

export default App
