import React from 'react'
import './CodigoColor.css'

const CodigoColor = () => {
  return (
    <div className="CodigoColor">
      <div>Infectados por 100.000 habitantes</div>
      <div className="CodigoColor__espectro" />
      <div className="CodigoColor__limites">
        <div>0</div>
        <div>Más de 25</div>
      </div>
    </div>
  )
}

export default CodigoColor
