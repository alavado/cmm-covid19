import React from 'react'
import './GraficoRedditPrincipal.css'
import { Line } from 'react-chartjs-2'

const GraficoRedditPrincipal = ({ labels, data }) => {
  return (
    <div className="GraficoRedditPrincipal">
      <div className="AppGraficoReddit__contenedor_grafico_principal">
        <Line
          data={{
            labels: labels,
            datasets: [
              {
                label: 'Noroeste',
                data: data.dataGrupoAmarillo,
                backgroundColor: '#FFFFCC',
                pointRadius: 0,
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.25)'
              },
              {
                label: 'Noreste',
                data: data.dataGrupoVerde.map((v, i) => v + data.dataGrupoAmarillo[i]),
                backgroundColor: '#A1DAB4',
                pointRadius: 0,
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.25)'
              },
              {
                label: 'Sur',
                data: data.dataGrupoAzul.map((v, i) => v + data.dataGrupoAmarillo[i] + data.dataGrupoVerde[i]),
                backgroundColor: '#225EA8',
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
    </div>
  )
}

export default GraficoRedditPrincipal
