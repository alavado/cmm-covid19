import React, { useState } from 'react'
import './Buscador.css'
import { FaSearch, FaTimes } from 'react-icons/fa'
import comunas from '../../../data/demografia/comunas.json'
import { busqueda as busquedaLocal } from '../../../helpers/busqueda'
import { Link, useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Buscador = () => {

  const [comunasEncontradas, setComunasEncontradas] = useState([])
  const [busqueda, setBusqueda] = useState([])
  const history = useHistory()
  const { datasets, indice } = useSelector(state => state.datasets)

  const filtrarComunas = e => {
    const terminoBusqueda = e.target.value
    setBusqueda(terminoBusqueda)
    if (terminoBusqueda.length > 1) {
      setComunasEncontradas(comunas.filter(({ nombre }) => busquedaLocal(terminoBusqueda, nombre) >= 0).slice(0, 3))
    }
    else {
      setComunasEncontradas([])
    }
  }

  const limpiarBusqueda = () => {
    setBusqueda('')
    setComunasEncontradas([])
  }

  if (!datasets[indice].comunas) {
    return null
  }

  return (
    <div className="Buscador">
      <div className="Buscador__contenedor_resultados">
        <div className="Buscador__resultados">
          {comunasEncontradas.map(comuna => (
            <Link
              to={`/comuna/${comuna.codigo}`}
              className="Buscador_resultado"
              onClick={limpiarBusqueda}
              key={`resultado-busqueda-${comuna.codigo}`}
            >
              {comuna.nombre}
            </Link>
          ))}
        </div>
      </div>
      <label className="Buscador__label">Buscar comuna
        <input
          className="Buscador__input"
          onChange={filtrarComunas}
          value={busqueda}
          onKeyUp={e => {
            if (e.keyCode === 13 && comunasEncontradas.length > 0) {
              history.push(`/comuna/${comunasEncontradas[0].codigo}`)
              limpiarBusqueda()
            }
          }}
        />
      </label>
      {comunasEncontradas.length > 0 ?
        <FaTimes className="Buscador__icono" onClick={limpiarBusqueda} /> :
        <FaSearch className="Buscador__icono" />
      }
    </div>
  )
}

export default Buscador
