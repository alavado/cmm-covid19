import React, { useState } from 'react'
import MiniReporte from './MiniReporte'
import Breadcrumb from './Breadcrumb'
import { Route, Switch } from 'react-router-dom'
import Grafico from './Grafico'
import './SeccionInferior.css'
import Buscador from './Buscador'
import { FaTintSlash, FaExpand, FaPlane } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { activarDaltonismo, activarAnimaciones } from '../../redux/actions'

const SeccionInferior = () => {
  
  const { daltonicos, animaciones } = useSelector(state => state.colores)
  const dispatch = useDispatch()
  const [pantallaCompleta, setPantallaCompleta] = useState(false)

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
            title={daltonicos ? 'Desactivar modo daltónico' : 'Modo daltónico'}
            onClick={() => dispatch(activarDaltonismo(!daltonicos))}
          >
            <FaTintSlash />
          </button>
          <button
            className={`SeccionInferior__opcion${animaciones ? ' SeccionInferior__opcion--activa' : ''}`}
            title={animaciones ? 'Desactivar animaciones de vuelo' : 'Activar animaciones de vuelo'}
            onClick={() => dispatch(activarAnimaciones(!animaciones))}
          >
            <FaPlane />
          </button>
          <button
            className={`SeccionInferior__opcion${pantallaCompleta ? ' SeccionInferior__opcion--activa' : ''}`}
            title={pantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen()
                setPantallaCompleta(false)
              }
              else {
                document.getElementById('root').requestFullscreen()
                setPantallaCompleta(true)
              }
            }}
          >
            <FaExpand />
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
