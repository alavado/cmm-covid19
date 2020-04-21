import React from 'react'
import './Header.css'
import SelectorFecha from './SelectorFecha'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.svg'

const Header = () => {
  return (
    <div className="Header">
      <div className="Header__titulo">
        <img className="Header__logo" src={logo} alt="Logo COVID-19 en Chile" />
        <Link className="Header__nombre" to="/">
          COVID-19 en Chile
        </Link>
      </div>
      <SelectorFecha />
    </div>
  )
}

export default Header
