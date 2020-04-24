import React, { useEffect, useState } from 'react'
import './Breadcrumb.css'
import { Link, useParams } from 'react-router-dom'
import { FaCaretRight } from 'react-icons/fa'
import demograficosRegiones from '../../../data/demografia/regiones.json'
import demograficosComunas from '../../../data/demografia/comunas.json'

const Breadcrumb = () => {
  
  const params = useParams()
  const [links, setLinks] = useState('Chile')
  
  useEffect(() => {
    console.log(params)
    const { division, codigo } = params
    if (division) {
      if (division === 'region') {
        console.log(demograficosRegiones)
        const { nombre: nombreRegion } = demograficosRegiones.find(r => r.codigo === Number(codigo))
        setLinks(
          <>
            <Link to="/" className="Breadcrumb__link">Chile</Link>
            <FaCaretRight className="Breadcrumb__separador" />
            {nombreRegion}
          </>
        )
      }
      else {
        const { nombre: nombreComuna, region } = demograficosComunas.find(r => r.codigo === codigo)
        const { nombre: nombreRegion, codigo: codigoRegion } = demograficosRegiones.find(r => r.codigo === Number(region))
        setLinks(
          <>
            <Link to="/" className="Breadcrumb__link">Chile</Link>
            <FaCaretRight className="Breadcrumb__separador" />
            <Link to={`/region/${codigoRegion}`} className="Breadcrumb__link">{nombreRegion}</Link>
            <FaCaretRight className="Breadcrumb__separador" />
            {nombreComuna}
          </>
        )
      }
    }
    else {
      setLinks('Chile')
    }
  }, [params.codigo])

  return (
    <div className="Breadcrumb">{links}</div>
  )
}

export default Breadcrumb
