import React, { useState } from 'react'
import './AppMapaCasos.css'
import MapaCasos from './MapaCasos'

const AppMapaCasos = () => {

  const [doble, setDoble] = useState(false)
  const [vpMapaPrincipal, setVpMapaPrincipal] = useState({
    width: '100%',
    height: '100vh',
    bearing: 10.9609308669604,
    latitude: -33.537375678675765,
    longitude: -70.81966493085949,
    pitch: 10.01281704404148,
    zoom: 8.3,
    altitude: 1.5,
  })

  return (
    <div className="AppMapaCasos">
      <button className="AppMapaCasos__boton_doble" onClick={() => setDoble(!doble)}>Dobble</button>
      <MapaCasos
        vpMapaPrincipal={vpMapaPrincipal}
        setVpMapaPrincipal={setVpMapaPrincipal}
      />
      {doble &&
        <MapaCasos
          vpMapaPrincipal={vpMapaPrincipal}
          setVpMapaPrincipal={setVpMapaPrincipal}
        />
      }
    </div>
  )
}

export default AppMapaCasos
