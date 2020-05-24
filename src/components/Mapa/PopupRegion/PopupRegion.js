import React from 'react'
import { Popup } from 'react-map-gl'
import './PopupRegion.css'
import { useSelector } from 'react-redux'
import { obtenerColor } from '../../../helpers/escala'

const PopupRegion = props => {

  const { latitude, longitude, titulo, valor } = props.config
  const valorFormateado = valor.toLocaleString('de-DE', { maximumFractionDigits: 1 })
  const { escala } = useSelector(state => state.colores)
  const { datasets, indice } = useSelector(state => state.datasets)
  const dataset = datasets[indice]
  let backgroundColor = obtenerColor(valor, dataset, escala)

  return (
    <Popup
      latitude={latitude}
      longitude={longitude}
      closeButton={false}
      className="PopupRegion"
    >
      <div className="PopupRegion__contenido">
        <h1 className="PopupRegion__titulo">{titulo}</h1>
        <div className="PopupRegion__cuadro">
          <div
            className="PopupRegion__casos"
            style={{ backgroundColor }}
          >
            {valorFormateado}
          </div>
        </div>
      </div>
    </Popup>
  )
}

export default PopupRegion
