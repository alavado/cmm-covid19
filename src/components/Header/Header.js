import React from 'react'
import './Header.css'
import SelectorFecha from './SelectorFecha'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <div className="Header">
      <div className="Header__titulo">
        <Link to="/">COVID-19 en Chile</Link>
      </div>
      <SelectorFecha />
    </div>
  )
}

export default Header
