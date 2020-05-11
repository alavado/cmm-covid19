import React from 'react'
import './GraficoComparativo.css'
import { Line } from 'react-chartjs-2'

const colores = [
  '#80DEEA',
  '#FFE082',
  '#C5E1A5',
  '#EF9A9A',
  '#80CBC4',
  '#CE93D8',
]

const GraficoComparativo = props => {

  if (props.datos.length === 0){
    return null
  }
  
  return (
    <div
      className="GraficoComparativo"
      style={{
        left: props.visible ? 0 : '-50vw'
      }}
    >
      <button style={{ position: 'absolute' }} onClick={() => props.setVisible(false)}>cerrar</button>
      <Line
        data={{
          labels: props.datos[0].data.map((x, i) => i),
          datasets: props.datos.map((d, i) => ({
            ...d,
            borderColor: colores[i],
            pointRadius: 0
          })),
        }}
        options={{
          maintainAspectRatio: false
        }}
      />
    </div>
  )
}

export default GraficoComparativo
