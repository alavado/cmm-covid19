import React, { useState, useEffect, } from 'react'
import { Chart, Line } from 'react-chartjs-2'
import { useSelector } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import './Grafico.css'
import { useParams } from 'react-router-dom'
import demograficosRegiones from '../../../data/demografia/regiones.json'
import pattern from 'patternomaly'

Chart.defaults.global.defaultFontColor = 'rgba(255, 255, 255, .9)'
const diasDispositivoPequeño = 30
const esDispositivoPequeño = window.innerWidth < 600

const estiloLineaPrincipal = {
  fillColor: 'rgba(220,220,220,0.8)',
  pointColor: 'rgba(220,220,220,1)',
  pointStrokeColor: '#fff',
  pointHighlightFill: '#fff',
  pointHighlightStroke: 'rgba(220,220,220,1)',
  borderDash: [0, 0],
  lineTension: .2,
  pointRadius: esDispositivoPequeño ? 1 : 2,
  pointBorderWidth: 0,
  borderWidth: 2.5,
  fill: false
}

const Grafico = () => {

  const { escala } = useSelector(state => state.colores)
  const { subserieSeleccionada: ss, geoJSONCuarentenas } = useSelector(state => state.series)
  const [datos, setDatos] = useState({})
  const params = useParams()
  const { datasets, indice, posicion } = useSelector(state => state.datasets)
  const dataset = datasets[indice]
  const { division, codigo } = params
  const [maximo, setMaximo] = useState(0)

  const eliminarCola = esDispositivoPequeño ? -diasDispositivoPequeño : 0

  useEffect(() => {
    let data = {
      labels: {},
      datasets: []
    }
    let puntosRegion, puntosComuna
    let todosLosValores = dataset.chile.filter((v, i) => i <= posicion)
    if (!division) {
      data.labels = dataset.chile.map(d => d.fecha).slice(eliminarCola)
      data.datasets = [
        {
          ...estiloLineaPrincipal,
          label: 'Chile',
          data: dataset.chile.map((d, i) => i <= posicion ? d.valor : null).slice(eliminarCola)
        }
      ]
    }
    else if (division === 'region') {
      puntosRegion = dataset.regiones.series.find(s => s.codigo === Number(codigo)).serie
      todosLosValores = puntosRegion.filter((v, i) => i <= posicion)
      data.labels = puntosRegion.map(d => d.fecha).slice(eliminarCola)
      data.datasets = [
        {
          ...estiloLineaPrincipal,
          label: demograficosRegiones.find(c => c.codigo === codigo).nombre,
          data: puntosRegion.map((d, i) => i <= posicion ? d.valor : null).slice(eliminarCola),
        }
      ]
    }
    else if (dataset.comunas && division === 'comuna') {
      const datosComuna = dataset.comunas.series.find(s => s.codigo === Number(codigo))
      puntosRegion = dataset.regiones.series.find(s => s.codigo === datosComuna.codigoRegion).serie
      puntosComuna = datosComuna.serie
      todosLosValores = puntosComuna.filter((v, i) => i <= posicion)
      data.labels = puntosComuna.map(d => d.fecha).slice(eliminarCola)
      data.datasets = [
        {
          ...estiloLineaPrincipal,
          label: datosComuna.nombre,
          data: puntosComuna.map((d, i) => i <= posicion ? d.valor : null).slice(eliminarCola)
        },
      ]
    }
    const canvas = document.getElementById('Grafico')
    const ctx = canvas.getContext('2d')
    const gradientStroke = ctx.createLinearGradient(0, canvas.getBoundingClientRect().height - 28, 0, 0)
    const maximo = todosLosValores.reduce((prev, d) => Math.max(prev, d.valor), 1)
    setMaximo(maximo)
    dataset.escala.forEach((v, i) => {
      if (v / maximo > 1) {
        return
      }
      let indiceColor = i * Math.floor((escala.length - 1) / (dataset.escala.length - 1))
      if (dataset.opciones.invertirColores) {
        indiceColor = escala.length - 1 - indiceColor
      }
      gradientStroke.addColorStop(Math.max(0, v / maximo), escala[indiceColor][1])
      if (i > 0) {
        const [, colorPrevio] = escala[indiceColor + (dataset.opciones.invertirColores ? 1 : -1)]
        gradientStroke.addColorStop(Math.max(0, (v - 0.01) / maximo), colorPrevio)
      }
    })
    data.datasets = [
      {
        ...data.datasets[0],
        borderColor: gradientStroke,
        pointStrokeColorborderColor: gradientStroke,
        pointBorderColor: gradientStroke,
        pointBackgroundColor: gradientStroke,
        pointHoverBackgroundColor: gradientStroke,
        pointHoverBorderColor: gradientStroke,
      },
      ...data.datasets.slice(1),
    ]
    if (dataset.comunas && division === 'comuna') {
      const rangosCuarentenas = geoJSONCuarentenas.features.map(({ properties: { Cut_Com, FInicio, FTermino } }) => ({
        codigo: Cut_Com,
        inicio: moment(FInicio, 'YYYY/MM/DD hh:mm:ss'),
        fin: moment(FTermino, 'YYYY/MM/DD hh:mm:ss')
      }))
    
      const cuarentenasComuna = rangosCuarentenas.filter(({ codigo: codigoComuna }) => codigoComuna === Number(codigo))
      if (cuarentenasComuna) {
        data.datasets = [
          ...data.datasets,
          {
            type: 'bar',
            key: 'Barras-cuarentenas-totales',
            label: 'Comuna en cuarentena total o parcial',
            data: puntosRegion.map(({ fecha }) => {
              return cuarentenasComuna.some(({ inicio, fin }) => (
                moment(fecha, 'DD/MM').diff(inicio, 'days') >= 0 && moment(fecha, 'DD/MM').diff(fin, 'days') < 0
              )) ? maximo : null
            }).slice(esDispositivoPequeño ? -diasDispositivoPequeño : 0),
            backgroundColor: pattern.draw('diagonal-right-left', 'rgba(255, 255, 255, 0.1)', '#212121', 7.5),
            barPercentage: 1.25
          }
        ]
      }
    }
    setDatos(data)
  }, [posicion, division, codigo, escala, ss, indice])
  
  return (
    <div className="Grafico">
      <Line
        id="Grafico"
        data={datos}
        options={{
          maintainAspectRatio: false,
          animation: {
            duration: 750
          },
          scales: {
            yAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                fontColor: 'rgba(255, 255, 255, 0.75)',
                fontSize: 10
              },
              gridLines: {
                display: false
              },
              position: 'right',
              ticks: {
                maxTicksLimit: 7,
                min: 0,
                max: maximo,
                fontColor: 'rgba(255, 255, 255, 0.75)',
                callback: item => {
                  if (item !== maximo && maximo - item < maximo / 7) {
                    return null
                  }
                  return item.toLocaleString('de-DE', { maximumFractionDigits: 1 })
                }
              },
            }],
            xAxes: [{
              ticks: {
                autoSkip: false,
                maxRotation: 0,
                minRotation: 0,
                callback: f => {
                  const fecha = moment(f, 'DD/MM')
                  if (fecha.diff(moment(), 'days') === 0) {
                    return 'Hoy'
                  }
                  else if (fecha.weekday() === 0 && moment().diff(fecha, 'days') > 2) {
                    return fecha.format('D[ ]MMM').slice(0, -1)
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
            intersect: false,
            callbacks: {
              label: ({ yLabel: v, datasetIndex }) => {
                if (datos.datasets[datasetIndex].label.endsWith('parcial')) {
                  return ''
                }
                return `${dataset.nombre}: ${v.toLocaleString('de-DE', { maximumFractionDigits: 1 })}`
              },
              title: ([{ xLabel: fecha }]) => {
                return `${moment(fecha, 'DD/MM').format('dddd D [de] MMMM')}`
              },
              beforeTitle: ([{datasetIndex}]) => datos.datasets[datasetIndex].label
            }
          }
        }}
      />
    </div>
  )
}

export default Grafico
