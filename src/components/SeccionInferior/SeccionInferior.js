import React from 'react'
import MiniReporte from './MiniReporte'
import Breadcrumb from './Breadcrumb'
import { Route, Switch } from 'react-router-dom'
import Grafico from './Grafico'
import './SeccionInferior.css'
import Buscador from './Buscador'
import { FaPalette, FaTintSlash } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { activarDaltonismo } from '../../redux/actions'

const SeccionInferior = () => {
  
  const { daltonicos } = useSelector(state => state.colores)
  const dispatch = useDispatch()

  return (
    <div className="SeccionInferior">
      <div className="SeccionInferior__superior">
        <Switch>
          <Route path="/:division/:codigo" component={Breadcrumb} />
          <Route path="/" component={Breadcrumb} />
        </Switch>
        <div className="SeccionInferior__opciones">
          <Buscador />
          <button
            className={`SeccionInferior__opcion${daltonicos ? ' SeccionInferior__opcion--activa' : ''}`}
            title="Modo daltónico"
            onClick={() => dispatch(activarDaltonismo(!daltonicos))}
          >
            <FaTintSlash />
          </button>
        </div>
      </div>
      <div className="SeccionInferior__inferior">
        <Switch>
          <Route path="/:division/:codigo" component={MiniReporte} />
          <Route path="/" component={MiniReporte} />
        </Switch>
        <Switch>
          <Route path="/:division/:codigo" component={Grafico} />
          <Route path="/" component={Grafico} />
        </Switch>
      </div>
    </div>
  )
}

export default SeccionInferior
