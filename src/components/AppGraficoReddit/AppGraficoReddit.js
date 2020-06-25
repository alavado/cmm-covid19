import React, { useMemo } from 'react'
import './AppGraficoReddit.css'
import { useSelector } from 'react-redux'
import GraficoRedditPrincipal from './GraficoRedditPrincipal'
import MapaReddit from './MapaReddit'
import { comunasSS } from '../AppGraficosSimples/AppUCI/AppUCI'

const AppGraficoReddit = () => {

  const { datasets } = useSelector(state => state.datasets)
  const { geoJSON } = datasets[1].comunas
  const dataset = datasets[4]

  const data = useMemo(() => {
    const obtenerSerie = grupo => dataset.comunas.series
      .filter(c => grupo.includes(c.nombre))
      .map(dato => dato.serie.map(d => d.valor))
      .reduce((prev, s) => s.map((v, i) => v + prev[i]))
    return comunasSS.map(servicio => ({ nombre: servicio.nombre, serie: obtenerSerie(servicio.comunas) }))
  }, [dataset])

  return (
    <div className="AppGraficoReddit">
      <h1 className="AppGraficoReddit__titulo">
        Nuevos casos por Servicio de Salud, ventana móvil de 7 días<br />
        Esta visualización está en desarrollo...
      </h1>
      <div className="AppGraficoReddit__contenedor">
        <MapaReddit geoJSON={geoJSON} />
        <GraficoRedditPrincipal
          data={data}
          labels={dataset.comunas.series[0].serie.map(v => v.fecha)}
        />
      </div>
    </div>
  )
}

export default AppGraficoReddit
