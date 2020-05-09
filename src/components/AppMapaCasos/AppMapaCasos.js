import React, { useState } from 'react'
import './AppMapaCasos.css'
import MapaCasos from './MapaCasos'

const AppMapaCasos = () => {

  const [doble, setDoble] = useState(false)
  const [vpMapaPrincipal, setVpMapaPrincipal] = useState({})
  const [posicionMapaPrincipal, setPosicionMapaPrincipal] = useState(30)

  return (
    <div className="AppMapaCasos">
      <button className="AppMapaCasos__boton_doble" onClick={() => setDoble(!doble)}>Dobble</button>
      <MapaCasos secundario={false} setVpMapaPrincipal={setVpMapaPrincipal} setPosicionMapaPrincipal={setPosicionMapaPrincipal} />
      {doble && <MapaCasos secundario={true} vpMapaPrincipal={vpMapaPrincipal} posicionMapaPrincipal={posicionMapaPrincipal} />}
    </div>
  )
}

export default AppMapaCasos
