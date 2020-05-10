import React from 'react'
import './GraficoComparativo.css'
import { Line } from 'react-chartjs-2'

const GraficoComparativo = props => {
  return (
    <div className="GraficoComparativo">
      <Line
        data={props.data}
        options={{
          maintainAspectRatio: false
        }}
      />
    </div>
  )
}

export default GraficoComparativo
