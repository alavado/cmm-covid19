import React from 'react'
import './Header.css'
import SelectorFecha from './SelectorFecha'

const Header = () => {
  return (
    <div className="Header">
      <div className="Header__titulo">
        COVID-19 en Chile
      </div>
      <SelectorFecha />
    </div>
  )
}

export default Header
