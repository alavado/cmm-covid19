import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import './range.css'
import './SelectorFecha.css'
import { avanzarEnSerie, retrocederEnSerie, fijarPosicionSerie, fijarPosicionDatasets } from '../../../redux/actions'
import moment from 'moment/min/moment-with-locales'
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa'
import { useParams } from 'react-router-dom'
moment.locale('es')

const SelectorFecha = () => {

  const { subserieSeleccionada: serie, posicion } = useSelector(state => state.series)
  const { rankingExpandido } = useSelector(state => state.ranking)
  const dispatch = useDispatch()
  const { division } = useParams()
  const [ancho, setAncho] = useState(window.innerWidth)
  const { datasets, indice, posicion: posicionDS } = useSelector(state => state.datasets)
  const dataset = datasets[indice]
  const diferencia = serie.datos[Math.max(0, posicionDS - 1)].fecha.diff(moment(), 'days')
  const rangoDias = (division === 'comuna' ? dataset.comunas.series[0].serie.length : dataset.regiones.series[0].serie.length) - 1
  console.log({rangoDias})

  useEffect(() => {dispatch(fijarPosicionDatasets(rangoDias))}, [division])

  useEffect(() => {
    const fecha = document.getElementsByClassName('SelectorFecha__contenedor_fecha')[0]
    const slider = document.getElementsByClassName('SelectorFecha__selector')[0]
    const botones = document.getElementsByClassName('SelectorFecha__botones')[0]
    fecha.style.marginLeft = `calc(
      ${botones.clientWidth}px - ${fecha.clientWidth / 2}px + ${slider.clientWidth * posicionDS / (rangoDias - 1)}px)`
    document.getElementsByClassName('SelectorFecha')[0].style.overflow = posicionDS < rangoDias / 2 ? 'inherit' : 'hidden'
  }, [posicionDS, ancho])

  useEffect(() => {
    const listener = window.addEventListener('resize', () => setAncho(window.innerWidth))
    return () => window.removeEventListener('resize', listener)
  }, [])

  return (
    <div className="SelectorFecha">
      <div className="SelectorFecha__contenedor_rango">
        <div className="SelectorFecha__botones">
          <button
            className="SelectorFecha__boton_anterior"
            onClick={e => dispatch(fijarPosicionDatasets(posicionDS - 1))}
            title="Ir a día anterior"
            aria-label={'Ir a día anterior'}
          >
            <FaCaretLeft />
          </button>
          <button 
            className="SelectorFecha__boton_siguiente"
            onClick={e => dispatch(fijarPosicionDatasets(posicionDS + 1))}
            title="Ir a día siguiente"
            aria-label={'Ir a día siguiente'}
          >
            <FaCaretRight />
          </button>
        </div>
        <input
          type="range"
          className="SelectorFecha__selector"
          min={0}
          step={1}
          max={rangoDias}
          onChange={e => dispatch(fijarPosicionDatasets(e.target.value))}
          value={posicionDS}
        />
      </div>
      <div className={`SelectorFecha__contenedor_fecha${rankingExpandido ? ` SelectorFecha__contenedor_fecha--oculto` : ''}`}>
        <div className="SelectorFecha__fecha">
          <button
            className="SelectorFecha__fecha_boton"
            onClick={e => dispatch(retrocederEnSerie())}
            title="Ir a día anterior"
            aria-label={'Ir a día anterior'}
          >
            <FaCaretLeft />
          </button>
          <div className="SelectorFecha__texto_fecha">
            {diferencia === 0 ? 'Hoy, ' : (diferencia === -1 ? 'Ayer, ' : '')} {serie.datos[Math.max(0, posicionDS - 1)].fecha.format('dddd D [de] MMMM')}
          </div>
          <button 
            className="SelectorFecha__fecha_boton"
            onClick={e => dispatch(avanzarEnSerie())}
            title="Ir a día siguiente"
            aria-label={'Ir a día siguiente'}
          >
            <FaCaretRight />
          </button>
        </div>
      </div>
    </div>
  )
}

export default SelectorFecha
