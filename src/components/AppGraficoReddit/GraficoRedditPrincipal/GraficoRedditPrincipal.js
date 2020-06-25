import React, { useMemo } from 'react'
import './GraficoRedditPrincipal.css'
import { Line } from 'react-chartjs-2'
import { useSelector } from 'react-redux'

const GraficoRedditPrincipal = ({ labels, data }) => {

  const { daltonicos } = useSelector(state => state.colores)

  const colores = useMemo(() => {
    if (daltonicos) {
      return [
        '#ffffcc',
        '#c7e9b4',
        '#7fcdbb',
        '#41b6c4',
        '#2c7fb8',
        '#253494'
      ]
    }
    else {
      return [
        '#fbb4ae',
        '#b3cde3',
        '#ccebc5',
        '#decbe4',
        '#fed9a6',
        '#ffffcc'
      ]
    }
  }, [daltonicos])

  return (
    <div className="GraficoRedditPrincipal">
      <Line
        data={{
          labels: labels.slice(25),
          datasets: data.map(({ nombre }, i) => ({
            label: nombre,
            data: data
              .slice(0, i + 1)
              .map(d => d.serie.slice(25))
              .reduce((prev, d) => d.map((v, j) => v + prev[j])),
            backgroundColor: colores[i],
            pointRadius: 0,
            borderWidth: 1,
            pointHitRadius: 10,
            borderColor: 'rgba(0, 0, 0, 0.25)'
          }))
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
              },
              ticks: {
                fontColor: 'black'
              }
            }],
            yAxes: [{
              gridLines: {
                display: false
              },
              ticks: {
                fontColor: 'black'
              },
              position: 'right'
            }]
          }
        }}
      />
    </div>
  )
}

export default GraficoRedditPrincipal
