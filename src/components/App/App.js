import React from 'react'
import Header from '../Header'
import './App.css'
import Mapa from '../Mapa'
import SelectorFecha from '../Header/SelectorFecha'
import ContenedorGrafico from '../ContenedorGrafico'

const App = () => {
  return (
    <div className="App">
      <section className="App_contenedor_header">
        <Header />
      </section>
      <main className="App__contenedor">
        <ContenedorGrafico />
        <Mapa />
      </main>
    </div>
  )
}

export default App
