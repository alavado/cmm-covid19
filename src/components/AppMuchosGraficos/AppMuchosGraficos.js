import React from 'react'
import './AppMuchosGraficos.css'
import { useSelector } from 'react-redux'
import { Line } from 'react-chartjs-2'
import { useHistory } from 'react-router-dom'

const AppMuchosGraficos = () => {

  const { datasets } = useSelector(state => state.datasets)
  const history = useHistory()
  const comunas = datasets[4].comunas.series.filter((x, i) => datasets[1].comunas.series[i].serie.slice(-1)[0].valor > 50)

  const categorias = [
    {
      titulo: 'Comunas con aumento de casos en los últimos 7 días',
      explicacion: 'Más nuevos casos en los últimos 7 días que en los 7 días anteriores',
      comunas: comunas
        .filter(c => c.serie.slice(-1)[0].valor >= 10 && c.serie.slice(-1)[0].valor > c.serie.slice(-8)[0].valor)
        .sort((c1, c2) => c1.serie.slice(-1)[0].valor > c2.serie.slice(-1)[0].valor ? -1 : 1),
      color: '#F44336'
    },
    {
      titulo: 'Comunas con disminución de nuevos casos en los últimos 7 días',
      explicacion: 'Menos nuevos casos en los últimos 7 días que en los 7 días anteriores',
      comunas: comunas
        .filter(c => c.serie.slice(-1)[0].valor >= 10 && c.serie.slice(-1)[0].valor < c.serie.slice(-8)[0].valor)
        .sort((c1, c2) => c1.serie.slice(-1)[0] < c2.serie.slice(-1)[0] ? -1 : 1),
      color: '#FFC107'
    },
    {
      titulo: 'Comunas con menos de 10 nuevos casos en los últimos 7 días',
      explicacion: 'Lo que dice',
      comunas: comunas
        .filter(c => c.serie.slice(-1)[0].valor < 10)
        .sort((c1, c2) => c1.serie.slice(-1)[0] < c2.serie.slice(-1)[0] ? -1 : 1),
      color: '#66BB6A'
    }
  ]

  return (
    <div className="AppMuchosGraficos">
      <h1 className="AppMuchosGraficos__titulo">Todos los gráficos de comunas con más de 50 casos</h1>
      <p>De acuerdo con el último informe epidemiológico del {comunas[0].serie.slice(-1)[0].fecha}</p>
      <p className="AppMuchosGraficos__inspiracion">
        Inspirado en <a href="https://www.endcoronavirus.org/countries#action" target="_blank" rel="noopener noreferrer">EndCoronaVirus.org</a>
      </p>
      {categorias.map(({ titulo, explicacion, comunas, color }) => (
        <div className="AppMuchosGraficos__contenedor_categoria" key={titulo}>
          <h2 className="AppMuchosGraficos__titulo_categoria">
            <span title={explicacion}>{titulo}</span>
          </h2>
          <div className="AppMuchosGraficos__contenedor_graficos">
            {comunas.map(c => {
              const maximoComuna = c.serie.reduce((x, y) => Math.max(x, y.valor), 0)
              return (
                <div
                  key={`grafico-${c.codigo}`}
                  className="AppMuchosGraficos__contenedor_grafico"
                  onClick={() => history.push(`/graficos/comuna/${c.codigo}`)}
                >
                  <Line
                    data={{
                      labels: c.serie.map(v => v.fecha),
                      datasets: [{
                        data: c.serie.map(v => v.valor + Math.max(1, maximoComuna / 10)),
                        fill: false,
                        pointRadius: 0,
                        borderColor: color,
                        borderWidth: 1.85,
                        pointHoverRadius: 0
                      }]
                    }}
                    options={{
                      maintainAspectRatio: false,
                      animation: false,
                      legend: {
                        display: false
                      },
                      tooltips: {
                        display: false,
                        enabled: false
                      },
                      scales: {
                        xAxes: [{
                          gridLines: {
                            display: false
                          },
                          ticks: {
                            fontColor: '#212121',
                            maxRotation: 0,
                            fontSize: 6,
                            autoSkip: true,
                            autoSkipPadding: 10,
                            padding: -8,
                            lineHeight: 1
                          }
                        }],
                        yAxes: [{
                          gridLines: {
                            lineWidth: 0,
                            zeroLineWidth: 1,
                            zeroLineColor: '#212121'
                          },
                          ticks: {
                            suggestedMax: 10,
                            display: false,
                            max: maximoComuna * 1.1 
                          },
                          scaleLabel: {
                            display: false
                          }
                        }]
                      }
                    }}
                  />
                  <h1 className="AppMuchosGraficos__nombre_comuna">{c.nombre}</h1>
                  <h1 className="AppMuchosGraficos__nuevos_casos_comuna">
                    {c.serie.slice(-1)[0].valor.toLocaleString('de-DE')} nuevos casos
                  </h1>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AppMuchosGraficos
