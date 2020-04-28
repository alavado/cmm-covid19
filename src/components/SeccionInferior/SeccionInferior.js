import React from 'react'
import MiniReporte from './MiniReporte'
import Breadcrumb from './Breadcrumb'
import { Route, Switch } from 'react-router-dom'
import Grafico from './Grafico'
import './SeccionInferior.css'

const SeccionInferior = () => {

  return (
    <div className="SeccionInferior">
      <div className="SeccionInferior__superior">
        <Switch>
          <Route path="/:division/:codigo" component={Breadcrumb} />
          <Route path="/" component={Breadcrumb} />
        </Switch>
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
