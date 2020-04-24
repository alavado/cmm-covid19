import React from 'react'
import './Breadcrumb.css'
import { Link } from 'react-router-dom'
import { FaCaretRight } from 'react-icons/fa'
import { CODIGO_CHILE } from '../../../redux/reducers/series'
import { useSelector } from 'react-redux'

const Breadcrumb = () => {
  
  const { subserieSeleccionada } = useSelector(state => state.series)

  return (
    <div className="Breadcrumb">
      {subserieSeleccionada.codigo !== CODIGO_CHILE ?
        <>
          <Link to="/" className="Breadcrumb__link">Chile</Link>
          <FaCaretRight className="Breadcrumb__separador" />
          {subserieSeleccionada.nombre}
        </> :
        <>Chile</>
      }
    </div>
  )
}

export default Breadcrumb
