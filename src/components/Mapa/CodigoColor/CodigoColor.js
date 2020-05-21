import React, { useEffect, useState } from 'react'
import './CodigoColor.css'
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import { filtrarGeoJSONPorValor, toggleFiltro, destacarIndice, seleccionarSerie } from '../../../redux/actions'
import { useHistory, useParams } from 'react-router-dom'
import { NUEVOS_CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS, CASOS_COMUNALES_INTERPOLADOS, CASOS_REGIONALES, CONTAGIOS_REGIONALES_POR_100000_HABITANTES } from '../../../redux/reducers/series'

const CodigoColor = () => {

  const { serieSeleccionada, subserieSeleccionada, posicion } = useSelector(state => state.series)
  const { fecha } = subserieSeleccionada.datos[posicion]
  const { escala, indiceDestacado } = useSelector(state => state.colores)

  const [vecesAnimada, setVecesAnimada] = useState(0)
  const [avanza, setAvanza] = useState(false)
  const [posicionPrevia, setPosicionPrevia] = useState(posicion)
  const history = useHistory()
  const dispatch = useDispatch()
  const { division } = useParams()

  const diferencia = fecha.diff(moment(), 'days')
  let etiqueta = `${diferencia === 0 ? 'Hoy, ' : (diferencia === -1 ? 'Ayer, ' : '')} ${fecha.format('dddd D [de] MMMM')}`
  if (posicion > 0) {
    const diferenciaMedicionAnterior = fecha.diff(subserieSeleccionada.datos[posicion - 1].fecha, 'days')
    if (diferenciaMedicionAnterior > 1) {
      etiqueta = `Promedio 
        ${subserieSeleccionada.datos[posicion - 1].fecha.format('D')}
        ${fecha.format('MMMM') !== subserieSeleccionada.datos[posicion - 1].fecha.format('MMMM') ? subserieSeleccionada.datos[posicion - 1].fecha.format('MMMM') : ''}
        –
        ${fecha.format('D [de] MMMM')}`
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
        <select onChange={e => dispatch(seleccionarSerie(e.target.value))} className="CodigoColor__titulo_selector">
          <option value={division === 'comuna' ? NUEVOS_CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS : CONTAGIOS_REGIONALES_POR_100000_HABITANTES}>Nuevos casos confirmados por 100.000 habitantes</option>
          <option value={division === 'comuna' ? CASOS_COMUNALES_INTERPOLADOS : CASOS_REGIONALES}>Total de casos confirmados hasta la fecha</option>
        </select>
        {/* {serieSeleccionada.nombre} {division === 'comuna' && '*'} */}
      </div>
      <div
        title={`Datos de casos confirmados a nivel regional extraídos del reporte diario MINSAL con fecha ${fecha.format('DD/MM')}.`}
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
              style={{
                backgroundColor: indiceDestacado < 0 || indiceDestacado === i ? v[1] : '#999',
                filter: indiceDestacado === i ? `brightness(80%) drop-shadow(0 0 .25em ${v[1]})` : 'brightness(80%)'
               }}
              title={i < escala.length - 1 ? `Entre ${v[0].toLocaleString()} y ${escala[i + 1][0].toLocaleString()} casos` : `Más de ${escala.slice(-1)[0][0]} casos`}
            />
            <div className="CodigoColor__fraccion_limite">
              {i === escala.length - 1 ? `${v[0].toLocaleString()}+` : v[0].toLocaleString()}
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
          <>
            <button
              onClick={() => history.push('/graficos')}
              className="CodigoColor__boton_graficos"
              onMouseOver={e => e.stopPropagation()}
              title="Ir a interfaz con gráficos sencillos por comuna"
            >
              Ver gráficos limpios
            </button>
          </>
        }
        {division === 'comuna' &&
          <>
            {/* <button
              className="CodigoColor__boton_interpolar"
              onClick={e => {
                e.stopPropagation()
                dispatch(seleccionarSerie(CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS))
              }}
              title="Cambiar tratamiento de días sin datos"
            >
              {'Días sin datos se interpolan'}
            </button> */}
            {/* <button
              className="CodigoColor__boton_interpolar"
              onClick={() => {
                dispatch(normalizarPor100000Habitantes(!datosNormalizadosPor100000Habitantes))
              }}
            >
              {datosNormalizadosPor100000Habitantes ? 'Casos por 100.000 habitantes' : 'Casos individuales'}
            </button> */}
            {/* <button
              className="CodigoColor__boton_cuarentenas"
              onMouseOver={e => e.stopPropagation()}
              onClick={() => dispatch(fijarVerCuarentenas(!verCuarentenas))}
            >
              Cuarentenas {verCuarentenas ? 'visibles' : 'ocultas'}
            </button> */}
          </>
        }
      </div>
    </div>
  )
}

export default CodigoColor
