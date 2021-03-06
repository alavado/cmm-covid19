import React, { useEffect, useState } from 'react'
import './CodigoColor.css'
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import { seleccionarDataset } from '../../../redux/actions'
import { useHistory, useParams } from 'react-router-dom'

const CodigoColor = () => {

  const { datasets, indice, posicion } = useSelector(state => state.datasets)
  const { escala: colores } = useSelector(state => state.colores)

  const [vecesAnimada, setVecesAnimada] = useState(0)
  const [avanza, setAvanza] = useState(false)
  const [posicionPrevia, setPosicionPrevia] = useState(posicion)
  const { division } = useParams()
  const history = useHistory()
  const dispatch = useDispatch()

  const fecha = moment(datasets[indice].chile[posicion].fecha, 'DD/MM')
  const diferencia = fecha.diff(moment(), 'days')
  let etiqueta = `${diferencia === 0 ? 'Hoy, ' : (diferencia === -1 ? 'Ayer, ' : '')} ${fecha.format('dddd D [de] MMMM')}`

  const escala = datasets[indice].escala

  useEffect(() => {
    setVecesAnimada(vecesAnimada + 1)
    setAvanza(posicionPrevia < posicion)
    setPosicionPrevia(posicion)
  }, [posicion])

  return (
    <div className="CodigoColor">
      <div className="CodigoColor__titulo">
        <select
          onChange={e => dispatch(seleccionarDataset(e.target.value))}
          className="CodigoColor__titulo_selector"
          value={indice}
        >
          {datasets
            .map((dataset, i) => (
              <option style={{ display: (division === 'comuna' && !dataset.comunas ? 'none' : 'block') }} key={`option-dataset-${i}`} value={i}>{dataset.nombre}</option>
            ))
          }
        </select>
      </div>
      <div
        className={`
          CodigoColor__fecha
          CodigoColor__fecha--${avanza ? 'avanza' : 'retrocede'}-${vecesAnimada % 2 + 1}`}
      >
        {etiqueta}
      </div>
      <div className="CodigoColor__espectro">
        {escala.map((v, i) => {
          let indiceColor = i * Math.floor((colores.length - 1) / (escala.length - 1))
          if (datasets[indice].opciones.invertirColores) {
            indiceColor = colores.length - 1 - indiceColor
          }
          const backgroundColor = colores[indiceColor][1]
          return (
            <div
              className="CodigoColor__fraccion"
              key={`CodigoColor__fraccion_${i}`}
            >
              <div
                className="CodigoColor__fraccion_color"
                style={{ backgroundColor, opacity: 1 }}
                title={i < escala.length - 1 ? `Entre ${v.toLocaleString()} y ${escala[i + 1].toLocaleString()} casos` : `Más de ${escala.slice(-1)[0]} casos`}
              />
              <div className="CodigoColor__fraccion_limite">
                {i === escala.length - 1 ? `${v.toLocaleString()}+` : v.toLocaleString()}
              </div>
            </div>
          )
        })}
      </div>
      <div className="CodigoColor__botones">
        <button
          onClick={() => history.push('/graficos')}
          className="CodigoColor__boton_graficos"
          onMouseOver={e => e.stopPropagation()}
          title="Ir a interfaz con gráficos sencillos por comuna"
        >
          Ir a gráficos limpios
        </button>
      </div>
    </div>
  )
}

export default CodigoColor
