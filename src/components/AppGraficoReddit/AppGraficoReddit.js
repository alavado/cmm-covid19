import React, { useMemo } from 'react'
import './AppGraficoReddit.css'
import { Line } from 'react-chartjs-2'
import { useSelector } from 'react-redux'

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

  console.log(dataset)

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
      <Line
        data={{
          labels: data.dataGrupoAmarillo.map((x, i) => i),
          datasets: [
            {
              label: 'verde',
              data: data.dataGrupoVerde,
              backgroundColor: '#A1DAB4',
              pointHitRadius: 0,
              pointRadius: 0,
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.25)'
            },
            {
              label: 'azul',
              data: data.dataGrupoAzul.map((v, i) => v + data.dataGrupoVerde[i]),
              backgroundColor: '#225EA8',
              pointHitRadius: 0,
              pointRadius: 0,
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.25)'
            },
            {
              label: 'amarillo',
              data: data.dataGrupoAmarillo.map((v, i) => v + data.dataGrupoAzul[i] + data.dataGrupoVerde[i]),
              backgroundColor: '#FFFFCC',
              pointHitRadius: 0,
              pointRadius: 0,
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.25)'
            },
          ]
        }}
        options={{
          maintainAspectRatio: false,
          legend: {
            display: false,
          },
          scales: {
            xAxes: [{
              gridLines: {
                display: false
              }
            }],
            yAxes: [{
              gridLines: {
                display: false
              }
            }]
          }
        }}
      />
    </div>
  )
}

export default AppGraficoReddit
