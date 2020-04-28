import React, { useEffect, useState } from 'react'
import './Breadcrumb.css'
import { Link, useParams, useHistory } from 'react-router-dom'
import { FaCaretRight } from 'react-icons/fa'
import demograficosRegiones from '../../../data/demografia/regiones.json'
import demograficosComunas from '../../../data/demografia/comunas.json'
import { useDispatch, useSelector } from 'react-redux'
import { seleccionarSerie } from '../../../redux/actions'
import { CASOS_COMUNALES_POR_100000_HABITANTES, CONTAGIOS_REGIONALES_POR_100000_HABITANTES } from '../../../redux/reducers/series'

const Breadcrumb = () => {
  
  const [links, setLinks] = useState('Chile')
  const { serieSeleccionada } = useSelector(state => state.series)
  const dispatch = useDispatch()
  const params = useParams()
  const history = useHistory()

  const verComunas = e => {
    e.stopPropagation()
    e.preventDefault()
    if (serieSeleccionada.id === CONTAGIOS_REGIONALES_POR_100000_HABITANTES) {
      dispatch(seleccionarSerie(CASOS_COMUNALES_POR_100000_HABITANTES))
      const comunasRegion = demograficosComunas.filter(c => c.region === params.codigo)
      history.push(`/comuna/${comunasRegion[Math.floor(Math.random() * comunasRegion.length)].codigo}`)
    }
  }
  
  useEffect(() => {
    const { division, codigo } = params
    if (division) {
      if (division === 'region') {
        const { nombre: nombreRegion } = demograficosRegiones.find(r => Number(r.codigo) === Number(codigo))
        setLinks(
          <>
            <Link to="/" className="Breadcrumb__link">Chile</Link>
            <FaCaretRight className="Breadcrumb__separador" />
            {nombreRegion}
            {serieSeleccionada.id === CONTAGIOS_REGIONALES_POR_100000_HABITANTES &&
              <>
                <FaCaretRight className="Breadcrumb__separador" />
                <button onClick={verComunas} className="Breadcrumb__boton_comunas">
                  Ver comunas
                </button>
              </>
            }
          </>
        )
      }
      else {
        const { nombre: nombreComuna, region } = demograficosComunas.find(r => r.codigo === codigo)
        const { nombre: nombreRegion, codigo: codigoRegion } = demograficosRegiones.find(r => Number(r.codigo) === Number(region))
        setLinks(
          <>
            <Link to="/" className="Breadcrumb__link">Chile</Link>
            <FaCaretRight className="Breadcrumb__separador" />
            <Link to={`/region/${codigoRegion}`} className="Breadcrumb__link Breadcrumb__link--region">{nombreRegion}</Link>
            <FaCaretRight className="Breadcrumb__separador" />
            {nombreComuna}
          </>
        )
      }
    }
    else {
      setLinks('Chile')
    }
  }, [params.codigo, serieSeleccionada.id])

  return (
    <div className="Breadcrumb">{links}</div>
  )
}

export default Breadcrumb
