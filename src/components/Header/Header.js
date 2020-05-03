import React, { useState } from 'react'
import './Header.css'
import SelectorFecha from './SelectorFecha'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import logo from '../../assets/logo.svg'
import { activarDaltonismo } from '../../redux/actions'
import { FaTintSlash, FaExpand } from 'react-icons/fa'

const Header = () => {
  
  const { daltonicos } = useSelector(state => state.colores)
  const dispatch = useDispatch()
  const [pantallaCompleta, setPantallaCompleta] = useState(false)

  return (
    <div className="Header">
      <div className="Header__titulo">
        <img className="Header__logo" src={logo} alt="Logo COVID-19 en Chile" />
        <Link className="Header__nombre" to="/">
          COVID-19 en Chile
        </Link>
        <div className="Header__separador" />
        <div className="Header__opciones">
          <button
            className={`Header__opcion${daltonicos ? ' Header__opcion--activa' : ''}`}
            title={daltonicos ? 'Desactivar modo daltónico' : 'Modo daltónico'}
            onClick={() => dispatch(activarDaltonismo(!daltonicos))}
          >
            <FaTintSlash />
          </button>
          <button
            className={`Header__opcion${pantallaCompleta ? ' Header__opcion--activa' : ''}`}
            title={pantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
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
          >
            <FaExpand />
          </button>
        </div>
      </div>
      <SelectorFecha />
    </div>
  )
}

export default Header
