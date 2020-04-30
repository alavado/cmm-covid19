import React, { useState } from 'react'
import './Buscador.css'
import { FaSearch, FaTimes } from 'react-icons/fa'
import comunas from '../../../data/demografia/comunas.json'
import { busqueda as busquedaLocal } from '../../../helpers/busqueda'
import { Link } from 'react-router-dom'

const Buscador = () => {

  const [comunasEncontradas, setComunasEncontradas] = useState([])
  const [busqueda, setBusqueda] = useState([])

  const filtrarComunas = e => {
    const terminoBusqueda = e.target.value
    setBusqueda(terminoBusqueda)
    if (terminoBusqueda.length > 2) {
      setComunasEncontradas(comunas.filter(({ nombre }) => busquedaLocal(terminoBusqueda, nombre) >= 0).slice(0, 3))
    }
    else {
      setComunasEncontradas([])
    }
  }

  return (
    <div className="Buscador">
      <div className="Buscador__contenedor_resultados">
        <div className="Buscador__resultados">
          {comunasEncontradas.map(comuna => (
            <Link to={`/comuna/${comuna.codigo}`} className="Buscador_resultado">{comuna.nombre}</Link>
          ))}
        </div>
      </div>
      <label className="Buscador__label">Buscar comuna
        <input
          className="Buscador__input"
          onChange={filtrarComunas}
          value={busqueda}
        />
      </label>
      {comunasEncontradas.length > 0 ?
        <FaTimes className="Buscador__icono" onClick={() => {
          setBusqueda('')
          setComunasEncontradas([])
        }} /> :
        <FaSearch className="Buscador__icono" />
      }
    </div>
  )
}

export default Buscador
