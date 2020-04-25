import React, { useMemo } from 'react'
import { Chart, Line } from 'react-chartjs-2'
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import { fijarPosicionSerie } from '../../../redux/actions'
import escala from '../../../helpers/escala'
import './Grafico.css'

const Grafico = () => {

  const { subserieSeleccionada: serie, posicion } = useSelector(state => state.series)
  const { fecha } = serie.datos[posicion]
  const dispatch = useDispatch()
  Chart.defaults.global.defaultFontColor = 'rgba(255, 255, 255, .9)'
  
  const options = useMemo(() => ({
    maintainAspectRatio: false,
    scales: {
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Contagios por 100.000 hab.',
          fontColor: 'rgba(255, 255, 255, 0.75)',
          fontSize: 10
        },
        gridLines: {
          display: false
        },
        ticks: {
          maxTicksLimit: 6,
          suggestedMin: 0,
          suggestedMax: 10,
          fontColor: 'rgba(255, 255, 255, 0.75)'
        }
      }],
      xAxes: [{
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          callback: f => {
            if (f.diff(moment(), 'days') === 0) {
              return 'Hoy'
            }
            else if (f.weekday() === 0) {
              return f.format('DD[/]MM')
            }
            else if (f.diff(fecha, 'days') === 0) {
              return ''
            }
            return null
          },
          fontColor: 'rgba(255, 255, 255, 0.85)'
        },
        gridLines: {
          color: 'rgba(255, 255, 255, .25)',
        },
      }]
    },
    legend: {
      display: false
    },
    tooltips: {
      callbacks: {
        label: ({ yLabel: v }) => `Nuevos casos por 100.000 hab.: ${v.toLocaleString('de-DE', { maximumFractionDigits: 2 })}`,
        title: ([{ xLabel: fecha }]) => fecha.format('dddd D [de] MMMM')
      }
    }
  }), [posicion, serie])

  const actualizarGrafico = () => {
    let data = {
      labels: serie.datos.map(d => d.fecha),
      datasets: [
        {
          label: 'Contagios por 100.000 habitantes',
          fillColor: 'rgba(220,220,220,0.2)',
          strokeColor: 'rgba(220,220,220,1)',
          pointColor: 'rgba(220,220,220,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(220,220,220,1)',
          data: serie.datos.map((d, i) => i <= posicion ? d.valor : null),
          lineTension: .2,
        }
      ]
    }
    const canvas = document.getElementById('Grafico')
    if (serie.datos.length > 0 && canvas) {
      const ctx = canvas.getContext('2d')
      const gradientStroke = ctx.createLinearGradient(0, canvas.getBoundingClientRect().height - 28, 0, 0)
      const maximo = serie.datos.filter((v, i) => i <= posicion).reduce((prev, d) => Math.max(prev, d.valor), 0)
      let limiteEspectro = 10
      if (maximo >= 10) {
        limiteEspectro = 5 * Math.floor((maximo + 5) / 5)
      }
      escala.forEach((v, i) => {
        const [valor, color] = v
        if (valor / limiteEspectro > 1) {
          return
        }
        gradientStroke.addColorStop(valor / limiteEspectro, color)
        if (i > 0) {
          const [, colorPrevio] = escala[i - 1]
          gradientStroke.addColorStop((valor - 0.01) / limiteEspectro, colorPrevio)
        }
      })
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
  }
  
  const chartData = useMemo(actualizarGrafico, [posicion, serie])
  
  return (
    <div className="Grafico">
      <Line
        id="Grafico"
        data={chartData}
        options={options}
        onElementsClick={e => {
          if (e[0]) {
            dispatch(fijarPosicionSerie(e[0]._index))
          }
        }}
      />
    </div>
  )
}

export default Grafico
