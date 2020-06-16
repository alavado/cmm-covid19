import React from 'react'
import './AppGraficosSimples.css'
import { NavLink, Switch, Route } from 'react-router-dom'
import GraficosSimples from './GraficosSimples'
import GraficosVMI from './GraficosVMI'
import AppMuchosGraficos from '../AppMuchosGraficos/AppMuchosGraficos'

const AppGraficosSimples = () => {

  return (
    <div className="AppGraficosSimples">
      <nav className="AppGraficosSimples__navegacion">
        <NavLink
          to="/graficos"
          className="AppGraficosSimples__link_navegacion"
          activeClassName="AppGraficosSimples__link_navegacion--activo"
          exact
        >
          Nuevos casos en los últimos 7 días
        </NavLink>
        <NavLink
          to="/graficos/todos"
          className="AppGraficosSimples__link_navegacion"
          activeClassName="AppGraficosSimples__link_navegacion--activo"
          exact
        >
          Todos los gráficos
        </NavLink>
        <NavLink
          to="/vmi"
          className="AppGraficosSimples__link_navegacion"
          activeClassName="AppGraficosSimples__link_navegacion--activo"
        >
          Ocupación de ventiladores en la RM
        </NavLink>
      </nav>
      <div className="AppGraficosSimples__contenedor">
        <Switch>
          <Route path="/graficos/todos" component={AppMuchosGraficos} />
          <Route path="/graficos/comuna/:comuna" component={GraficosSimples} />
          <Route path="/graficos" component={GraficosSimples} />
          <Route path="/vmi" component={GraficosVMI} />
        </Switch>
      </div>
    </div>
  )
}

export default AppGraficosSimples
