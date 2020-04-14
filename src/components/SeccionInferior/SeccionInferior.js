import React, { useMemo, useEffect } from 'react'
import { Chart, Line } from 'react-chartjs-2'
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import './SeccionInferior.css'
import { fijarDia, seleccionarChile } from '../../redux/actions'

const SeccionInferior = () => {

  const { region } = useSelector(state => state.region)
  const { dia } = useSelector(state => state.fecha)
  const dispatch = useDispatch()
  Chart.defaults.global.defaultFontColor = 'white'

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
          suggestedMax: 20,
          fontColor: 'rgba(255, 255, 255, 0.75)'
        }
      }],
      xAxes: [{
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          callback: (val, i) => {
            const fecha = moment(region.fechaInicial).add(Number(val), 'days')
            const visible = fecha.weekday() === 0 || i === region.datos.length - 1
            return visible ? fecha.format('D MMM') : (dia === Number(val) ? '' : null)
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
          return `${etiqueta}: ${valor.toLocaleString('de-DE', { maximumFractionDigits: 2 })}`
        },
        title: (tooltipItem, data) => {
          return moment(region.fechaInicial)
            .add(Number(tooltipItem[0].label), 'days')
            .format('dddd D [de] MMMM')
        }
      }
    }
  }), [dia, region])
  
  const chartData = useMemo(() => {
    let data = {
      labels: region.datos.map((d, i) => i),
      datasets: [
        {
          label: 'Contagios por 100.000 habitantes',
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
    const canvas = document.getElementById('SeccionInferior__grafico')
    if (canvas) {
      const ctx = canvas.getContext('2d')
      const gradientStroke = ctx.createLinearGradient(0, 100, 0, 0)
      const maximo = region.datos.reduce((prev, v) => Math.max(prev, v))
      let limiteEspectro = 1
      if (maximo >= 20) {
        limiteEspectro = 20.0 / (5 * (Math.floor((maximo + 5) / 5)))
      }
      limiteEspectro *= .6
      gradientStroke.addColorStop(0, '#abdda4')
      gradientStroke.addColorStop(limiteEspectro / 6, '#e6f598')
      gradientStroke.addColorStop(limiteEspectro / 3, '#ffffbf')
      gradientStroke.addColorStop(limiteEspectro / 2, '#fee08b')
      gradientStroke.addColorStop(2 * limiteEspectro / 3, '#fdae61')
      gradientStroke.addColorStop(5 * limiteEspectro / 6, '#f46d43')
      gradientStroke.addColorStop(limiteEspectro, '#d53e4f')
      gradientStroke.addColorStop(1, '#d53e4f')
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

  useEffect(() => {
    dispatch(seleccionarChile())
  }, [])

  return (
    <div className="SeccionInferior">
      <div className="SeccionInferior__contenedor_region">
        <div className="SeccionInferior__region">
          {region.nombre}
        </div>
      </div>
      <div className="SeccionInferior__grafico">
        <Line
          id="SeccionInferior__grafico"
          data={chartData}
          options={options}
          onElementsClick={e => {
            if (e[0]) {
              dispatch(fijarDia(e[0]._index, region))
            }
          }}
        />
      </div>
    </div>
  )
}

export default SeccionInferior
