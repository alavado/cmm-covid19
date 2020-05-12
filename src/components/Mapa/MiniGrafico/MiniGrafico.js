import React from 'react'
import { Marker } from 'react-map-gl'
import './MiniGrafico.css'
import { Line } from 'react-chartjs-2'
import { useSelector } from 'react-redux'

const MiniGrafico = props => {

  const { mostrandoMiniGraficos } = useSelector(state => state.comparacion)
  const { lat, lng, mostrar, nombreComuna, data } = props
 
  return (
    <Marker
      className="MiniGrafico__nombre_comuna"
      latitude={lat}
      longitude={lng}
    >
      <div
        className="MiniGrafico__nombre_comuna_contenido"
        style={{
          opacity: mostrar ? .9 : 0,
          transform: mostrar ? 'translateY(0em)' : 'translateY(.25em)',
        }}
      >
        {nombreComuna}
        <div
          className="MiniGrafico__contenedor_grafico"
          style={{
            opacity: mostrandoMiniGraficos ? .9 : 0,
            transform: mostrandoMiniGraficos ? 'translateY(0em)' : 'translateY(.25em)',
          }}
        >
          <Line
            data={{
              labels: data.map((x, i) => i),
              datasets: [{
                label: 'ds1',
                data,
                pointRadius: 0,
                pointHitRadius: 0,
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: .75,
                backgroundColor: 'rgba(255, 255, 255, .5)',
              }]
            }}
            options={{
              maintainAspectRatio: false,
              layout: {
                padding: {
                  bottom: 1
                }
              },
              scales: {
                xAxes: [{
                  display: false,
                  gridLines: {
                    display: false
                  }
                }],
                yAxes: [{
                  display: false,
                  gridLines: {
                    display: false
                  }
                }]
              },
              legend: {
                display: false
              }
            }}
          />
        </div>
      </div>
    </Marker>
  )
}

export default MiniGrafico
