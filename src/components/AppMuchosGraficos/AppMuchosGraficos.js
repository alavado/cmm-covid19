import React from 'react'
import './AppMuchosGraficos.css'
import { useSelector } from 'react-redux'
import { Line } from 'react-chartjs-2'

const AppMuchosGraficos = () => {

  const { datasets } = useSelector(state => state.datasets)
  const dataset = datasets[4]

  console.log(dataset.comunas)

  return (
    <div style={{backgroundColor: 'white', padding: '1em', overflow: 'scroll' }}>
      <h1>Todos los gráficos</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', backgroundColor: 'white' }}>
        {datasets[4].comunas.series.map(c => {
          return (
            <div key={c.codigo} style={{ width: '200px', height: '100px', margin: '1em', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h1>{c.nombre}</h1>
              <Line
                data={{
                  labels: c.serie.map(v => v.fecha),
                  datasets: [{
                    data: c.serie.map(v => v.valor),
                    fill: false,
                    pointRadius: 0,
                    borderColor: 'pink'
                  }]
                }}
                options={{
                  maintainAspectRatio: false,
                  legend: {
                    display: false
                  },
                  scales: {
                    xAxes: [{
                      gridLines: {
                        display: false
                      },
                      ticks: {
                        display: false
                      }
                    }],
                    yAxes: [{
                      gridLines: {
                        display: false
                      },
                      ticks: {
                        suggestedMax: 10
                      }
                    }]
                  }
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AppMuchosGraficos
