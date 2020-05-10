import React, { useState, useEffect } from 'react'
import './AppMapaCasos.css'
import MapaCasos from './MapaCasos'
import { FaClone, FaExpand, FaCompress } from 'react-icons/fa'
import axios from 'axios'

const AppMapaCasos = () => {

  const [doble, setDoble] = useState(false)
  const [pantallaCompleta, setPantallaCompleta] = useState(false)
  const [vp, setVp] = useState({
    width: '100%',
    height: 'calc(100vh -2em)',
    bearing: 10.9609308669604,
    latitude: -33.537375678675765,
    longitude: -70.81966493085949,
    pitch: 10.01281704404148,
    zoom: 11,
    altitude: 1.5,
  })

  const [poligonos, setPoligonos] = useState(null)

  useEffect(() => {
    const poligonos = axios.get('https://raw.githubusercontent.com/alavado/cmm-covid19/master/src/data/otros/hashSorteoDemografico.json')
      .then(res => setPoligonos(JSON.parse(res.data)))
  }, [])

  if (!poligonos) {
    return 'Cargando...'
  }

  return (
    <div className="AppMapaCasos">
      <div className="AppMapaCasos__barra">
        <h1 className="AppMapaCasos__titulo">Simulador de casos activos de COVID-19 en la RM</h1>
        <div className="AppMapaCasos__botones">
          <button
            className="AppMapaCasos__boton_doble"
            onClick={() => setDoble(!doble)}
            title={doble ? 'Ver solo un escenario' : 'Comparar dos escenarios'}
          >
            <FaClone />
          </button>
          <button
            className="AppMapaCasos__boton_doble"
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen()
                setPantallaCompleta(false)
              }
              else {
                document.getElementById('root').requestFullscreen()
                setPantallaCompleta(true)
              }
            }}
            title={pantallaCompleta ? 'Pantalla completa' : 'Salir de pantalla completa'}
          >
            {pantallaCompleta ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>
      <div className="AppMapaCasos__mapas">
        <MapaCasos
          vp={vp}
          setVp={setVp}
          poligonosComunas={poligonos}
        />
        {doble &&
          <MapaCasos
            vp={vp}
            setVp={setVp}
            poligonosComunas={poligonos}
          />
        }
      </div>
    </div>
  )
}

export default AppMapaCasos
