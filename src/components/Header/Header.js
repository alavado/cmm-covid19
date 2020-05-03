import React from 'react'
import './Header.css'
import SelectorFecha from './SelectorFecha'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import logo from '../../assets/logo.svg'
import { activarDaltonismo } from '../../redux/actions'
import { FaTintSlash } from 'react-icons/fa'

const Header = () => {
  
  const { daltonicos } = useSelector(state => state.colores)
  const dispatch = useDispatch()

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
        </div>
      </div>
      <SelectorFecha />
    </div>
  )
}

export default Header
