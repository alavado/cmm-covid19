import React from 'react'
import Header from '../Header'
import './App.css'
import Mapa from '../Mapa'
import SelectorFecha from '../SelectorFecha'

const App = () => {
  return (
    <div className="App">
      <section className="App_contenedor_header">
        <Header />
        <SelectorFecha />
      </section>
      <main className="App__contenedor">
        <Mapa />
      </main>
    </div>
  )
}

export default App
