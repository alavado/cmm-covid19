import React, { useMemo, useEffect } from 'react'
import { Chart, Line } from 'react-chartjs-2'
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import './SeccionInferior.css'
import { FaCaretRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { CODIGO_CHILE, CONTAGIOS_REGIONALES_POR_100000_HABITANTES, CASOS_COMUNALES_POR_100000_HABITANTES } from '../../redux/reducers/series'
import { fijarPosicionSerie, seleccionarSerie } from '../../redux/actions'

const SeccionInferior = () => {

  const { subserieSeleccionada: serie, serieSeleccionada, posicion } = useSelector(state => state.series)
  const fecha = serie.datos[posicion].fecha
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
        label: ({ yLabel: v }) => `Nuevos casos: ${v.toLocaleString('de-DE', { maximumFractionDigits: 2 })}`,
        title: ([{ xLabel: fecha }]) => fecha.format('dddd D [de] MMMM')
      }
    }
  }), [posicion, serie])
  
  const chartData = useMemo(() => {
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
          data: serie.datos.map(d => d.valor),
          lineTension: .2,
        }
      ]
    }
    const canvas = document.getElementById('SeccionInferior__grafico')
    if (serie.datos.length > 0 && canvas) {
      const ctx = canvas.getContext('2d')
      const gradientStroke = ctx.createLinearGradient(0, 100, 0, 0)
      const maximo = serie.datos.reduce((prev, d) => Math.max(prev, d.valor), 0)
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
  }, [serie])

  return (
    <div className="SeccionInferior">
      <div className="SeccionInferior__opciones">
        <select onChange={e => dispatch(seleccionarSerie(e.target.value))}>
          <option value={CONTAGIOS_REGIONALES_POR_100000_HABITANTES}>Regiones</option>
          <option value={CASOS_COMUNALES_POR_100000_HABITANTES}>Comunas</option>
        </select>
        <div className="SeccionInferior__cita">Why say lot word when few chart do trick</div>
      </div>
      <div className="SeccionInferior__contenedor_region">
        <div className="SeccionInferior__region">
          {serie.codigo !== CODIGO_CHILE ?
            <div className="SeccionInferior__breadcrumb">
              <Link to="/" className="SeccionInferior__breadcrumb_link">Chile</Link>
              <FaCaretRight className="SeccionInferior__breadcrumb_separador" />
              {serie.nombre}
            </div> :
            <>Chile</>
          }
        </div>
        <div className="SeccionInferior__grafico">
          <Line
            id="SeccionInferior__grafico"
            data={chartData}
            options={options}
            onElementsClick={e => {
              if (e[0]) {
                dispatch(fijarPosicionSerie(e[0]._index))
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default SeccionInferior
