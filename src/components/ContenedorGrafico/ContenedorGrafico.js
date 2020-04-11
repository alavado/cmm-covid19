import React from 'react'
import './ContenedorGrafico.css'
import { useSelector } from 'react-redux'

const ContenedorGrafico = () => {

  const { region } = useSelector(state => state.region)
console.log({region})
  return (
    <div className="ContenedorGrafico">
      contenedor
    </div>
  )
}

export default ContenedorGrafico
