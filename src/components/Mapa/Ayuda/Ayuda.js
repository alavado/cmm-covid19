import React from 'react'
import './Ayuda.css'
import { useSelector, useDispatch } from 'react-redux'
import { mostrarAyuda } from '../../../redux/actions'
import demograficosComunas from '../../../data/demografia/comunas.json'
import { useParams } from 'react-router-dom'
import { CASOS_COMUNALES } from '../../../redux/reducers/series'
import { FaTimes } from 'react-icons/fa'

const Ayuda = () => {

  const { mostrando } = useSelector(state => state.ayuda)
  const { series, posicion } = useSelector(state => state.series)
  const dispatch = useDispatch()
  const params = useParams()
  const { division, codigo } = params

  if (!mostrando || posicion === 0 || division !== 'comuna') {
    return null
  }

  let comuna = demograficosComunas.find(c => c.codigo === codigo)
  if (!comuna) {
    comuna = demograficosComunas[Math.floor(Math.random() * demograficosComunas.length)]
  }
  const ss = series.find(s => s.id === CASOS_COMUNALES)
    .datos
    .find(d => d.codigo === Number(comuna.codigo))
  const { nombre: nombreComuna, poblacion: poblacionComuna } = comuna
  const fechaFinal = ss.datos[posicion].fecha.format('dddd D [de] MMMM')
  const fechaInicial = ss.datos[posicion - 1].fecha.format('dddd D [de] MMMM')
  const casosFinales = ss.datos[posicion].valor
  const casosIniciales = ss.datos[posicion - 1].valor
  const diferenciaCasos = Math.max(0, casosFinales - casosIniciales)
  const diferenciaDias = ss.datos[posicion].fecha.diff(ss.datos[posicion - 1].fecha, 'days')
  const promedioCasos = diferenciaCasos / diferenciaDias
  const promedioCasosPor100000Habitantes = promedioCasos * 1e5 / poblacionComuna

  const formatear = n => Number(n).toLocaleString('de-DE', { maximumFractionDigits: 1, minimumFractionDigits: 1 })

  const cerrarAyuda = e => {
    e.stopPropagation()
    e.preventDefault()
    dispatch(mostrarAyuda(false))
  }

  return (
    <div className="Ayuda">
      <button
        className="Ayuda__boton_cerrar"
        onClick={cerrarAyuda}
        title="Cerrar ayuda"
      >
        <FaTimes />
      </button>
      <div className="Ayuda__contenedor">
        <p>El MINSAL ha informado los casos comunales el {fechaInicial} y el {fechaFinal}.</p>
        <p>Lo que vemos en este mapa es la diferencia de casos dividida por el número de días.</p>
        <p>Por ejemplo, para {nombreComuna}:</p>
        <ul>
          <li>Se {casosFinales !== 1 ? `informaron ${formatear(casosFinales)} casos` : `informó ${formatear(casosFinales)} caso`} el {fechaFinal}.</li>
          <li>Se {casosIniciales !== 1 ? `informaron ${formatear(casosIniciales)} casos` : `informó ${formatear(casosIniciales)} caso`} el {fechaInicial}.</li>
          {diferenciaCasos > 0 ?
            <>
              <li>Es decir, durante estos {diferenciaDias} días {diferenciaCasos !== 1 ? 'aparecieron' : 'apareció'} {formatear(casosFinales)} - {formatear(casosIniciales)} = {formatear(diferenciaCasos)} {diferenciaCasos !== 1 ? 'nuevos casos' : 'nuevo caso'}.</li>
              <li>Entonces, en promedio hubo {formatear(diferenciaCasos)} / {diferenciaDias} = {formatear(promedioCasos)} {promedioCasos !== 1 ? 'nuevos casos diarios' : 'nuevo caso diario'} durante estos {diferenciaDias} días.</li>
            </> :
            <>
              <li>Es decir, durante estos {diferenciaDias} días no aparecieron nuevos casos.</li>
            </>
          }
        </ul>
        <p>La comuna de {nombreComuna} tiene {formatear(poblacionComuna)} habitantes de acuerdo a la proyección para 2020 del INE.</p>
        <p>Por lo tanto, en promedio hubo {formatear(promedioCasos)} × 100.000 / {formatear(poblacionComuna)} = {formatear(promedioCasosPor100000Habitantes)} nuevos casos diarios por 100.000 habitantes</p>
      </div>
    </div>
  )
}

export default Ayuda
