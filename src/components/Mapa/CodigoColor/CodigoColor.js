import React, { useEffect, useState } from 'react'
import './CodigoColor.css'
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import { filtrarGeoJSONPorValor, toggleFiltro, destacarIndice, seleccionarSerie, seleccionarDataset } from '../../../redux/actions'
import { useHistory, useParams } from 'react-router-dom'
import { NUEVOS_CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS, CASOS_COMUNALES_INTERPOLADOS, CASOS_REGIONALES, CONTAGIOS_REGIONALES_POR_100000_HABITANTES } from '../../../redux/reducers/series'

const CodigoColor = () => {

  const { serieSeleccionada, subserieSeleccionada } = useSelector(state => state.series)
  const { datasets, indice, posicion } = useSelector(state => state.datasets)
  const { escala: colores } = useSelector(state => state.colores)

  const [vecesAnimada, setVecesAnimada] = useState(0)
  const [avanza, setAvanza] = useState(false)
  const [posicionPrevia, setPosicionPrevia] = useState(posicion)
  const history = useHistory()
  const dispatch = useDispatch()
  const { division } = useParams()

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
          {datasets.map((dataset, i) => <option key={`option-dataset-${i}`} value={i}>{dataset.nombre}</option>)}
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
        {escala.map((v, i) => (
          <div
            className="CodigoColor__fraccion"
            key={`CodigoColor__fraccion_${i}`}
          >
            <div
              className="CodigoColor__fraccion_color"
              style={{ backgroundColor: colores[i][1], opacity: 1 }}
              title={i < escala.length - 1 ? `Entre ${v.toLocaleString()} y ${escala[i + 1].toLocaleString()} casos` : `Más de ${escala.slice(-1)[0]} casos`}
            />
            <div className="CodigoColor__fraccion_limite">
              {i === escala.length - 1 ? `${v.toLocaleString()}+` : v.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <div className="CodigoColor__botones">
        <button
          onClick={() => history.push('/graficos')}
          className="CodigoColor__boton_graficos"
          onMouseOver={e => e.stopPropagation()}
          title="Ir a interfaz con gráficos sencillos por comuna"
        >
          Ver gráficos limpios
        </button>
      </div>
    </div>
  )
}

export default CodigoColor
