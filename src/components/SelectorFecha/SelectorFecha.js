import React from 'react'
import './range.css'
import './SelectorFecha.css'

const SelectorFecha = () => {
  return (
    <div className="SelectorFecha">
      <div className="SelectorFecha__limite">7 de marzo</div>
      <input
        type="range"
        className="SelectorFecha__selector"
        min={1}
        max={10}
        step={1}
      />
      <div className="SelectorFecha__limite">25 de marzo</div>
    </div>
  )
}

export default SelectorFecha
