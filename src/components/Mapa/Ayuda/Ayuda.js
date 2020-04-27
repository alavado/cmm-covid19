import React from 'react'
import './Ayuda.css'
import { useSelector, useDispatch } from 'react-redux'
import { mostrarAyuda } from '../../../redux/actions'

const Ayuda = () => {

  const { mostrando } = useSelector(state => state.ayuda)
  const dispatch = useDispatch()

  if (!mostrando) {
    return null
  }

  return (
    <div className="Ayuda" onClick={e => {
      e.stopPropagation()
      e.preventDefault()
      dispatch(mostrarAyuda(false))
    }}>
      <div className="Ayuda__contenedor">
        <p>El MINSAL ha informado los casos comunales el lunes 20 de abril y el viernes 24 de abril.</p>
        <p>Lo que vemos en este mapa es la diferencia de casos dividida por el número de días.</p>
        <p>Por ejemplo, para Vitacura:</p>
        <ul>
          <li>Había 400 casos el viernes 24 de abril.</li>
          <li>Había 304 casos el lunes 20 de abril.</li>
          <li>En total, 400 - 304 = 96 nuevos casos.</li>
          <li>Por lo tanto, en promedio hubo 96 / 4 = 16 nuevos casos diarios durante estos 4 días.</li>
        </ul>
        <p>La comuna de Vitacura tiene 135.000 habitantes.</p>
        <p>Por lo tanto, hubo</p>
        <p>16 * 100.000 / 135.000 = 12,5</p>
        <p>nuevos casos por 100.000 habitantes</p>
      </div>
    </div>
  )
}

export default Ayuda
