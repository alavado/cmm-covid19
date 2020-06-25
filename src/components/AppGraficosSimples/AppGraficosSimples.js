import React from 'react'
import './AppGraficosSimples.css'
import { NavLink, Switch, Route } from 'react-router-dom'
import GraficosSimples from './GraficosSimples'
import GraficosVMI from './GraficosVMI'
import AppMuchosGraficos from '../AppMuchosGraficos/AppMuchosGraficos'
import AppGraficoReddit from '../AppGraficoReddit'
import logo from '../../assets/logo.svg'

const AppGraficosSimples = () => {

  return (
    <div className="AppGraficosSimples">
      <nav className="AppGraficosSimples__navegacion">
        <div className="AppGraficosSimples__titulo">
          <img className="Header__logo" src={logo} alt="Logo COVID-19 en Chile" />
          COVID-19 en Chile
        </div>
        <NavLink
          to="/graficos"
          className="AppGraficosSimples__link_navegacion"
          activeClassName="AppGraficosSimples__link_navegacion--activo"
        >
          Nuevos por comuna
        </NavLink>
        <NavLink
          to="/muchos_graficos"
          className="AppGraficosSimples__link_navegacion"
          activeClassName="AppGraficosSimples__link_navegacion--activo"
          exact
        >
          Todas las comunas
        </NavLink>
        <NavLink
          to="/vmi"
          className="AppGraficosSimples__link_navegacion"
          activeClassName="AppGraficosSimples__link_navegacion--activo"
        >
          Ocupación ventiladores RM
        </NavLink>
        <NavLink
          to="/zonas_rm"
          className="AppGraficosSimples__link_navegacion"
          activeClassName="AppGraficosSimples__link_navegacion--activo"
          exact
        >
          Casos por servicio salud RM
        </NavLink>
      </nav>
      <div className="AppGraficosSimples__contenedor">
        <Switch>
          <Route path="/muchos_graficos" component={AppMuchosGraficos} />
          <Route path="/zonas_rm" component={AppGraficoReddit} />
          <Route path="/graficos/comuna/:comuna" component={GraficosSimples} />
          <Route path="/graficos" component={GraficosSimples} />
          <Route path="/vmi" component={GraficosVMI} />
        </Switch>
      </div>
    </div>
  )
}

export default AppGraficosSimples
