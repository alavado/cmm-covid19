import React, { useState, useMemo, useEffect } from 'react'
import { Chart, Line } from 'react-chartjs-2'
import { useSelector } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import fechaInicial from '../../config/fechaInicial'
import './ContenedorGrafico.css'

const ContenedorGrafico = () => {

  const { region } = useSelector(state => state.region)
  const { dia } = useSelector(state => state.fecha)
  
  Chart.defaults.global.defaultFontColor = '#263238'

  const options = useMemo(() => ({
    scales: {
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Casos por 100.000 habitantes',
        },
        gridLines: {
          display: false
        },
        ticks: {
          maxTicksLimit: 6,
          suggestedMin: 0,
          suggestedMax: 25
        }
      }],
      xAxes: [{
        ticks: {
          autoSkip: false,
          callback: (val, i) => {
            const fecha = moment(fechaInicial).add(Number(val), 'days')
            return fecha.weekday() === 0 ? fecha.format('D MMM') : (dia === Number(val) ? '' : null)
          },
        },
        fontFamily: 'Source Sans Pro'
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
            .add(Number(tooltipItem[0].label) - 3, 'days')
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
          label: 'Casos por 100.000 habitantes',
          fillColor: 'rgba(220,220,220,0.2)',
          strokeColor: 'rgba(220,220,220,1)',
          pointColor: 'rgba(220,220,220,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(220,220,220,1)',
          data: region.datos
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

  if (!region) {
    return null
  }

  console.log({region})

  return (
    <div className="ContenedorGrafico">
      <div className="ContenedorGrafico__titulo">
        {region.nombre}
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

export default ContenedorGrafico
