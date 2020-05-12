import React, { useState, useEffect } from 'react'
import './AppMapaCasos.css'
import MapaCasos from './MapaCasos'
import { FaClone, FaExpand, FaCompress, FaChartLine } from 'react-icons/fa'
import axios from 'axios'
import logo from '../../assets/logo.svg'

const AppMapaCasos = () => {

  const [doble, setDoble] = useState(false)
  const [verGraficos, setVerGraficos] = useState(false)
  const [pantallaCompleta, setPantallaCompleta] = useState(false)
  const [vp, setVp] = useState({
    width: '100%',
    height: 'calc(100vh -2em)',
    bearing: 0.8438348482250375,
    pitch: 8.966012003230043,
    latitude: -33.537375678675765,
    longitude: -70.81966493085949,
    zoom: 11,
    altitude: 1.5,
  })

  const [poligonos, setPoligonos] = useState(null)

  useEffect(() => {
    axios.get('https://raw.githubusercontent.com/alavado/cmm-covid19/master/src/data/otros/hashSorteoDemografico.json')
      .then(res => {
        setPoligonos(res.data.poligonosComunas)
      })
  }, [])

  if (!poligonos) {
    return <div style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }} />
  }

  return (
    <div className="AppMapaCasos">
      <div className="AppMapaCasos__barra">
        <div className="AppMapaCasos__barra_izquierda">
          <img className="Header__logo" src={logo} alt="Logo COVID-19 en Chile" />
          <h1 className="AppMapaCasos__titulo">Simulador simplón de casos activos de COVID-19 en la RM</h1>
        </div>
        <div className="AppMapaCasos__botones">
          <button
            className="AppMapaCasos__boton"
            onClick={() => setVerGraficos(!verGraficos)}
            title={doble ? 'Ver gráfico' : 'Ocultar gráficos'}
          >
            <FaChartLine />
          </button>
          <button
            className="AppMapaCasos__boton"
            onClick={() => setDoble(!doble)}
            title={doble ? 'Ver solo un escenario' : 'Comparar dos escenarios'}
          >
            <FaClone />
          </button>
          <button
            className="AppMapaCasos__boton"
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
          verGraficos={verGraficos}
        />
        {doble &&
          <MapaCasos
            vp={vp}
            setVp={setVp}
            poligonosComunas={poligonos}
            verGraficos={verGraficos}
          />
        }
      </div>
    </div>
  )
}

export default AppMapaCasos
