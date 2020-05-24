import React, { useEffect, useState } from 'react'
import './Breadcrumb.css'
import { Link, useParams, useHistory } from 'react-router-dom'
import { FaCaretRight } from 'react-icons/fa'
import demograficosRegiones from '../../../data/demografia/regiones.json'
import demograficosComunas from '../../../data/demografia/comunas.json'
import { useSelector } from 'react-redux'

const Breadcrumb = () => {
  
  const [links, setLinks] = useState('Chile')
  const { serieSeleccionada } = useSelector(state => state.series)
  const params = useParams()
  const history = useHistory()
  const { datasets, indice } = useSelector(state => state.datasets)

  const verComunas = e => {
    e.stopPropagation()
    e.preventDefault()
    const comunasRegion = demograficosComunas.filter(c => c.region === params.codigo)
    history.push(`/comuna/${comunasRegion[Math.floor(Math.random() * comunasRegion.length)].codigo}`)
  }
  
  useEffect(() => {
    const { division, codigo } = params
    if (division) {
      if (division === 'region') {
        const { nombre: nombreRegion } = demograficosRegiones.find(r => Number(r.codigo) === Number(codigo))
        setLinks(
          <div className="Breadcrumb__links">
            <Link to="/" className="Breadcrumb__link">Chile</Link>
            <FaCaretRight className="Breadcrumb__separador" />
            <div className="Breadcrumb__destino">{nombreRegion}</div>
            {datasets[indice].comunas && <>
              <FaCaretRight className="Breadcrumb__separador" />
              <button onClick={verComunas} className="Breadcrumb__boton_comunas">
                Ver comunas
              </button>
            </>}
          </div>
        )
      }
      else {
        const { nombre: nombreComuna, region } = demograficosComunas.find(r => Number(r.codigo) === Number(codigo))
        const { nombre: nombreRegion, codigo: codigoRegion } = demograficosRegiones.find(r => Number(r.codigo) === Number(region))
        setLinks(
          <div className="Breadcrumb__links">
            <Link to="/" className="Breadcrumb__link">Chile</Link>
            <FaCaretRight className="Breadcrumb__separador" />
            <Link to={`/region/${codigoRegion}`} className="Breadcrumb__link Breadcrumb__link--region">{nombreRegion}</Link>
            <FaCaretRight className="Breadcrumb__separador" />
            <div className="Breadcrumb__destino">{nombreComuna}</div>
          </div>
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
