import React, { useMemo } from 'react'
import './AppGraficoReddit.css'
import { useSelector } from 'react-redux'
import GraficoRedditPrincipal from './GraficoRedditPrincipal'

const grupoAmarillo = [
  'Cerro Navia',
  'Pudahuel',
  'Renca',
  'Estación Central',
  'Cerrillos',
  'Maipú',
  'Lo Prado',
  'Quinta Normal',
  'Quilicura',
  'Recoleta',
  'Independencia',
  'Santiago',
  'Conchalí',
  'Huechuraba',
]

const grupoVerde = [
  'Las Condes',
  'Lo Barnechea',
  'Vitacura',
  'Providencia',
  'Ñuñoa',
  'La Reina'
]

const grupoAzul = [
  'La Pintana',
  'San Bernardo',
  'Peñalolén',
  'Macul',
  'San Miguel',
  'San Ramón',
  'El Bosque',
  'La Cisterna',
  'Lo Espejo',
  'Pedro Aguirre Cerda',
  'San Joaquín',
  'La Granja',
  'La Florida',
  'Puente Alto'
]

const AppGraficoReddit = () => {

  const { datasets } = useSelector(state => state.datasets)
  const dataset = datasets[4]

  const data = useMemo(() => {
    const obtenerSerie = grupo => dataset.comunas.series
      .filter(c => grupo.includes(c.nombre))
      .map(dato => dato.serie.map(d => d.valor))
      .reduce((prev, s) => s.map((v, i) => v + prev[i]))
    return {
      dataGrupoAmarillo: obtenerSerie(grupoAmarillo),
      dataGrupoVerde: obtenerSerie(grupoVerde),
      dataGrupoAzul: obtenerSerie(grupoAzul)
    }
  }, [dataset])

  return (
    <div className="AppGraficoReddit">
      <h1>Blabla</h1>
      <GraficoRedditPrincipal
        data={data}
        labels={dataset.comunas.series[0].serie.map(v => v.fecha)}
      />
    </div>
  )
}

export default AppGraficoReddit
