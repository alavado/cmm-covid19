import React from 'react'
import './Ayuda.css'
import { useSelector, useDispatch } from 'react-redux'
import { mostrarAyuda } from '../../../redux/actions'
import demograficosComunas from '../../../data/demografia/comunas.json'
import { useParams } from 'react-router-dom'
import { CASOS_COMUNALES } from '../../../redux/reducers/series'

const Ayuda = () => {

  const { mostrando } = useSelector(state => state.ayuda)
  const { series, posicion } = useSelector(state => state.series)
  const dispatch = useDispatch()
  const params = useParams()

  if (!mostrando || posicion === 0) {
    return null
  }

  const { division, codigo } = params

  let comuna = demograficosComunas.find(c => c.codigo === codigo)
  if (division !== 'comuna' || !comuna) {
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
  const diferenciaCasos = casosFinales - casosIniciales
  const diferenciaDias = ss.datos[posicion].fecha.diff(ss.datos[posicion - 1].fecha, 'days')
  const promedioCasos = (casosFinales - casosIniciales) / diferenciaDias
  const promedioCasosPor100000Habitantes = promedioCasos * 1e5 / poblacionComuna

  const formatear = n => n.toLocaleString('de-DE', { maximumFractionDigits: 2 })

  return (
    <div className="Ayuda" onClick={e => {
      e.stopPropagation()
      e.preventDefault()
      dispatch(mostrarAyuda(false))
    }}>
      <div className="Ayuda__contenedor">
        <p>El MINSAL ha informado los casos comunales el {fechaInicial} y el {fechaFinal}.</p>
        <p>Lo que vemos en este mapa es la diferencia de casos dividida por el número de días.</p>
        <p>Por ejemplo, para {nombreComuna}:</p>
        <ul>
          <li>Se informaron {formatear(casosFinales)} casos el {fechaFinal}.</li>
          <li>Se informaron {formatear(casosIniciales)} casos el {fechaInicial}.</li>
          <li>Es decir, durante estos días aparecieron {formatear(casosFinales)} - {formatear(casosIniciales)} = {formatear(diferenciaCasos)} nuevos casos.</li>
          <li>Entonces, en promedio hubo {formatear(diferenciaCasos)} / {diferenciaDias} = {formatear(promedioCasos)} nuevos casos diarios durante estos {diferenciaDias} días.</li>
        </ul>
        <p>La comuna de {nombreComuna} tiene {formatear(poblacionComuna)} habitantes.</p>
        <p>Por lo tanto, en promedio hubo {formatear(promedioCasos)} × 100.000 / {formatear(poblacionComuna)} = {formatear(promedioCasosPor100000Habitantes)} nuevos casos diarios por 100.000 habitantes</p>
      </div>
    </div>
  )
}

export default Ayuda
