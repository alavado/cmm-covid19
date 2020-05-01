import React, { useEffect, useState } from 'react'
import './CodigoColor.css'
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import { filtrarGeoJSONPorValor, toggleFiltro, seleccionarSerie, mostrarAyuda, seleccionarSubserie, destacarIndice } from '../../../redux/actions'
import { CONTAGIOS_REGIONALES_POR_100000_HABITANTES, CASOS_COMUNALES_POR_100000_HABITANTES, CODIGO_CHILE } from '../../../redux/reducers/series'
import { useHistory, useParams } from 'react-router-dom'
import { FaQuestionCircle as IconoAyuda } from 'react-icons/fa'

const CodigoColor = () => {

  const { serieSeleccionada, subserieSeleccionada, posicion, filtroToggle } = useSelector(state => state.series)
  const { fecha } = subserieSeleccionada.datos[posicion]
  const { escala, indiceDestacado } = useSelector(state => state.colores)

  const [vecesAnimada, setVecesAnimada] = useState(0)
  const [avanza, setAvanza] = useState(false)
  const [posicionPrevia, setPosicionPrevia] = useState(posicion)
  const history = useHistory()
  const dispatch = useDispatch()
  const { division, codigo } = useParams()

  const diferencia = fecha.diff(moment(), 'days')
  let etiqueta = `${diferencia === 0 ? 'Hoy, ' : (diferencia === -1 ? 'Ayer, ' : '')} ${fecha.format('dddd D [de] MMMM')}`
  if (posicion > 0) {
    const diferenciaMedicionAnterior = fecha.diff(subserieSeleccionada.datos[posicion - 1].fecha, 'days')
    if (diferenciaMedicionAnterior > 1) {
      etiqueta = `Promedio 
        ${subserieSeleccionada.datos[posicion - 1].fecha.clone().format('D')}–${fecha.format('D')}
        de ${fecha.format('MMMM')}`
    }
  }

  const toggleRegiones = e => {
    e.stopPropagation()
    e.preventDefault()
    if (serieSeleccionada.id === CONTAGIOS_REGIONALES_POR_100000_HABITANTES) {
      dispatch(seleccionarSerie(CASOS_COMUNALES_POR_100000_HABITANTES))
    }
    else {
      dispatch(seleccionarSerie(CONTAGIOS_REGIONALES_POR_100000_HABITANTES))
      dispatch(seleccionarSubserie(CODIGO_CHILE))
      history.push(`/`)
    }
  }

  useEffect(() => {
    setVecesAnimada(vecesAnimada + 1)
    setAvanza(posicionPrevia < posicion)
    setPosicionPrevia(posicion)
  }, [posicion])

  return (
    <div className="CodigoColor">
      <div className="CodigoColor__titulo">
        {serieSeleccionada.nombre}
      </div>
      <div
        className={`
          CodigoColor__fecha
          CodigoColor__fecha--${avanza ? 'avanza' : 'retrocede'}-${vecesAnimada % 2 + 1}`}
      >
        {etiqueta}
        {posicion > 0 && division === 'comuna' &&
          <IconoAyuda
            className="CodigoColor__icono_ayuda"
            title="¿Qué es esto?"
            onClick={() => dispatch(mostrarAyuda(true))}
          />
        }
      </div>
      <div className="CodigoColor__espectro">
        {escala.map((v, i) => (
          <div
            className="CodigoColor__fraccion"
            key={`CodigoColor__fraccion_${i}`}
          >
            <div
              className="CodigoColor__fraccion_color"
              style={{
                backgroundColor: indiceDestacado < 0 || indiceDestacado === i ? v[1] : '#999',
                filter: indiceDestacado === i ? `drop-shadow(0 0 .25em ${v[1]})` : 'none'
               }}
              onMouseEnter={e => {
                if (indiceDestacado < 0) {
                  dispatch(toggleFiltro(false))
                  dispatch(filtrarGeoJSONPorValor(x => x >= v[0] && i < escala.length - 1 && x < escala[i + 1][0]))
                }
              }}
              onMouseLeave={() => !filtroToggle && dispatch(filtrarGeoJSONPorValor(() => true))}
              onClick={() => {
                if (indiceDestacado >= 0 && indiceDestacado === i) {
                  dispatch(destacarIndice(-1))
                  dispatch(toggleFiltro(false))
                  dispatch(filtrarGeoJSONPorValor(() => true))
                }
                else {
                  dispatch(destacarIndice(i))
                  dispatch(filtrarGeoJSONPorValor(x => x >= v[0] && i < escala.length - 1 && x < escala[i + 1][0]))
                  dispatch(toggleFiltro(true))
                }
              }}
              title={i < escala.length - 1 ? `Entre ${v[0].toLocaleString()} y ${escala[i + 1][0].toLocaleString()} casos` : `Más de ${escala.slice(-1)[0][0]} casos`}
            />
            <div className="CodigoColor__fraccion_limite">
              {i === escala.length - 1 ? '50+' : v[0].toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <div className="CodigoColor__botones">
        {indiceDestacado >= 0 &&
          <button
            className="CodigoColor__boton_limpiar_filtro_rango"
            style={{ backgroundColor: escala[indiceDestacado][1] }}
            onClick={() => {
              dispatch(destacarIndice(-1))
              dispatch(toggleFiltro(false))
              dispatch(filtrarGeoJSONPorValor(() => true))
            }}
          >
            Quitar filtro
          </button>
        }
        {!division &&
        <div onMouseOver={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()} style={{zIndex: 1000}}>
          <button
            onClick={toggleRegiones}
            className="CodigoColor__boton_cambio"
            onMouseOver={e => e.stopPropagation()}
            onMouseMove={e => e.stopPropagation()}
          >
            {serieSeleccionada.id === CONTAGIOS_REGIONALES_POR_100000_HABITANTES ? 'Ver comunas' : 'Ver regiones'}
          </button></div>
        }
      </div>
    </div>
  )
}

export default CodigoColor
