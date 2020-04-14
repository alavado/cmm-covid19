import React from 'react'
import Header from '../Header'
import './App.css'
import Mapa from '../Mapa'
import SeccionInferior from '../SeccionInferior'
import { Switch, Route } from 'react-router-dom'

const App = () => {
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
