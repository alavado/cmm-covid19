import React, { useState, useMemo, useEffect } from 'react'
import { Chart, Line } from 'react-chartjs-2'
import { useSelector } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import fechaInicial from '../../config/fechaInicial'
import './SeccionInferior.css'

const SeccionInferior = () => {

  const { region } = useSelector(state => state.region)
  const { dia } = useSelector(state => state.fecha)
  
  Chart.defaults.global.defaultFontColor = '#263238'

  const options = useMemo(() => ({
    maintainAspectRatio: false,
    scales: {
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Nuevos casos por 100.000 hab.',
          fontColor: 'rgba(255, 255, 255, 0.75)',
          fontSize: 10
        },
        gridLines: {
          display: false
        },
        ticks: {
          maxTicksLimit: 6,
          suggestedMin: 0,
          suggestedMax: 25,
          fontColor: 'rgba(255, 255, 255, 0.75)'
        }
      }],
      xAxes: [{
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          callback: (val, i) => {
            const fecha = moment(fechaInicial).add(Number(val), 'days')
            return fecha.weekday() === 0 ? fecha.format('D MMM') : (dia === Number(val) ? '' : null)
          },
          fontColor: 'rgba(255, 255, 255, 0.75)'
        },
        gridLines: {
          color: 'rgba(255, 255, 255, .15)',
        },
      }]
    },
    legend: {
      display: false
    },
    tooltips: {
      callbacks: {
        label: function(tooltipItem, data) {
          const etiqueta = data.datasets[tooltipItem.datasetIndex].label
          const valor = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]
          return `${etiqueta}: ${Math.round(valor * 100) / 100.0}`
        },
        title: (tooltipItem, data) => {
          return moment(fechaInicial)
            .add(Number(tooltipItem[0].label), 'days')
            .format('dddd, D [de] MMMM [de] YYYY')
        }
      }
    }
  }), [dia])
  
  const chartData = useMemo(() => {
    let data = {
      labels: region.datos.map((d, i) => i),
      datasets: [
        {
          label: 'Nuevos casos por 100.000 habitantes',
          fillColor: 'rgba(220,220,220,0.2)',
          strokeColor: 'rgba(220,220,220,1)',
          pointColor: 'rgba(220,220,220,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(220,220,220,1)',
          data: region.datos,
          lineTension: .2,
        }
      ]
    }
    const canvas = document.getElementById('GraficoComuna')
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const gradientStroke = ctx.createLinearGradient(0, 100, 0, 0);
      gradientStroke.addColorStop(0.1, '#abdda4');
      gradientStroke.addColorStop(1, '#d53e4f');
      data = {
        ...data,
        datasets: [
          {
            ...data.datasets[0],
            fill: false,
            borderColor: gradientStroke,
            borderWidth: 2,
            pointStrokeColorborderColor: gradientStroke,
            pointBorderColor: gradientStroke,
            pointBackgroundColor: gradientStroke,
            pointHoverBackgroundColor: gradientStroke,
            pointHoverBorderColor: gradientStroke,
            pointBorderWidth: 1
          }
        ]
     }
    }
    return data
  }, [region])

  return (
    <div className="SeccionInferior">
      <div className="SeccionInferior__titulo">
        <p>{!region || region.codigo === 0 ? 'Selecciona una region' : region.nombre}</p>
        <Line
          id="GraficoComuna"
          data={chartData}
          className="GraficoComuna"
          options={options}
        />
      </div>
    </div>
  )
}

export default SeccionInferior
