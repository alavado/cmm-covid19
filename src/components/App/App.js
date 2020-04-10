import React from 'react'
import Header from '../Header'
import './App.css'
import Mapa from '../../Mapa'

const App = () => {
  return (
    <div className="App">
      <Header />
      <main className="App__contenedor">
        <Mapa />
      </main>
    </div>
  )
}

export default App
