import React, { useState, useEffect, useMemo } from 'react'
import { Chart, Line } from 'react-chartjs-2'
import { useSelector } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import './Grafico.css'
import { useParams } from 'react-router-dom'
import demograficosComunas from '../../../data/demografia/comunas.json'
import demograficosRegiones from '../../../data/demografia/regiones.json'
import { CONTAGIOS_REGIONALES_POR_100000_HABITANTES, CODIGO_CHILE, NUEVOS_CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS } from '../../../redux/reducers/series'
import pattern from 'patternomaly'

Chart.defaults.global.defaultFontColor = 'rgba(255, 255, 255, .9)'
const diasDispositivoPequeño = 42
const esDispositivoPequeño = window.innerWidth < 600

const estiloLineaPrincipal = {
  fillColor: 'rgba(220,220,220,0.8)',
  pointColor: 'rgba(220,220,220,1)',
  pointStrokeColor: '#fff',
  pointHighlightFill: '#fff',
  pointHighlightStroke: 'rgba(220,220,220,1)',
  borderDash: [0, 0],
  lineTension: .2,
  pointRadius: esDispositivoPequeño ? 2 : 3,
  pointBorderWidth: 1,
  borderWidth: 2,
  fill: false
}

const estiloLineaChile = {
  pointStrokeColorborderColor: '#3F51B5',
  pointBorderColor: '#3F51B5',
  pointBackgroundColor: '#3F51B5',
  pointHoverBackgroundColor: '#3F51B5',
  pointHoverBorderColor: '#3F51B5',
  fillColor: '#3F51B5',
  pointColor: '#3F51B5',
  pointStrokeColor: '#3F51B5',
  pointHighlightFill: '#3F51B5',
  pointHighlightStroke: '#3F51B5',
  borderColor: '#3F51B5',
  borderWidth: 1.5,
  pointRadius: esDispositivoPequeño ? .5 : 2,
  lineTension: 0,
  fill: false
}

const estiloLineaRegion = {
  pointStrokeColorborderColor: '#039BE5',
  pointBorderColor: '#039BE5',
  pointBackgroundColor: '#039BE5',
  pointHoverBackgroundColor: '#039BE5',
  pointHoverBorderColor: '#039BE5',
  fillColor: '#039BE5',
  pointColor: '#039BE5',
  pointStrokeColor: '#039BE5',
  pointHighlightFill: '#039BE5',
  pointHighlightStroke: '#039BE5',
  borderColor: '#039BE5',
  borderWidth: 1.5,
  pointRadius: esDispositivoPequeño ? .5 : 2,
  lineTension: .2,
  fill: false
}

const obtenerColor = (valor, escala, colores) => {
  const indiceLimite = escala.findIndex(limite => limite > valor)
  return indiceLimite >= 0 ? colores[indiceLimite - 1][1] : colores.slice(-1)[0][1]
}

const Grafico = () => {

  const { escala } = useSelector(state => state.colores)
  const { subserieSeleccionada: ss, series, posicion, geoJSONCuarentenas } = useSelector(state => state.series)
  const [datos, setDatos] = useState({})
  const { fecha } = ss.datos[posicion]
  const params = useParams()
  const { datasets, indice } = useSelector(state => state.datasets)
  const dataset = datasets[indice]
  const { division, codigo } = params

  const fechaEsAntesDeFechaPosicionSelecionada = f => {
    return f.diff(fecha, 'days') <= 0
  }

  console.log(dataset)

  const eliminarCola = esDispositivoPequeño ? -diasDispositivoPequeño : 0

  useEffect(() => {
    let data = {
      labels: {},
      datasets: []
    }
    let puntosRegion, puntosComuna
    let todosLosValores = dataset.chile
    if (!division) {
      data.labels = dataset.chile.map(d => d.fecha).slice(eliminarCola)
      data.datasets = [
        {
          ...estiloLineaPrincipal,
          label: 'Chile',
          data: dataset.chile.map(d => d.valor).slice(eliminarCola)
        }
      ]
    }
    else if (division === 'region') {
      puntosRegion = dataset.regiones.series.find(s => s.codigo === Number(codigo)).serie
      todosLosValores = [
        // ...todosLosValores,
        ...puntosRegion.filter((v, i) => i <= posicion)
      ]
      data.labels = puntosRegion.map(d => d.fecha).slice(eliminarCola)
      data.datasets = [
        {
          ...estiloLineaPrincipal,
          label: demograficosRegiones.find(c => c.codigo === codigo).nombre,
          data: puntosRegion.map((d, i) => i <= posicion ? d.valor : null).slice(eliminarCola),
        },
        // {
        //   ...estiloLineaChile,
        //   label: 'Chile',
        //   data: dataset.chile.map(d => d.valor).slice(eliminarCola)
        // }
      ]
    }
    // else if (division === 'comuna') {
    //   puntosRegion = obtenerSerieRegionComuna(codigo)
    //   puntosComuna = obtenerSerieComuna(codigo)
    //   todosLosValores = [
    //     ...todosLosValores,
    //     ...puntosRegion,
    //     ...puntosComuna
    //   ]
    //   let puntosConDatos = [
    //     { fecha: serieChile[0].fecha.clone(), valor: null },
    //     ...puntosComuna
    //   ]
    //   const ultimaFechaChile = serieChile.slice(-1)[0].fecha
    //   let ultimaFechaComuna = puntosComuna.slice(-1)[0].fecha.clone()
    //   while (ultimaFechaComuna.diff(ultimaFechaChile, 'days') !== 0) {
    //     ultimaFechaComuna.add(1, 'days')
    //     puntosConDatos.push({ fecha: ultimaFechaComuna.clone(), valor: null })
    //   }
    //   const puntosRellenados = puntosConDatos.slice(2)
    //   data.labels = puntosRellenados.map(d => d.fecha).slice(esDispositivoPequeño ? -diasDispositivoPequeño : 0)
    //   const datosComuna = demograficosComunas.find(c => c.codigo === codigo)
    //   data.datasets = [
    //     {
    //       ...estiloLineaPrincipal,
    //       label: datosComuna.nombre,
    //       data: puntosRellenados.map((d, i) => d.valor).slice(esDispositivoPequeño ? -diasDispositivoPequeño : 0),
    //       spanGaps: true,
    //       borderDash: [3, 1],
    //       pointStyle: puntosRellenados.map(d => d.interpolado ? 'star' : 'dot'),
    //       borderWidth: 2
    //     },
    //     {
    //       ...estiloLineaRegion,
    //       label: demograficosRegiones.find(c => c.codigo === datosComuna.region).nombre,
    //       data: puntosRegion.map((d, i) => d.valor).slice(esDispositivoPequeño ? -diasDispositivoPequeño : 0)
    //     },
    //     {
    //       ...estiloLineaChile,
    //       label: 'Chile',
    //       data: serieChile.map((d, i) => d.valor).slice(esDispositivoPequeño ? -diasDispositivoPequeño : 0)
    //     },
    //   ]
    // }
    const canvas = document.getElementById('Grafico')
    const ctx = canvas.getContext('2d')
    const gradientStroke = ctx.createLinearGradient(0, canvas.getBoundingClientRect().height - 28, 0, 0)
    const maximo = todosLosValores.reduce((prev, d) => Math.max(prev, d.valor), 0)
    let limiteEspectro = Math.max(10, (maximo / 2) * Math.floor((maximo + (maximo / 2)) / (maximo / 2)))
    dataset.escala.forEach((v, i) => {
      if (v / limiteEspectro > 1) {
        return
      }
      gradientStroke.addColorStop(Math.max(0, v / limiteEspectro), escala[i][1])
      if (i > 0) {
        const [, colorPrevio] = escala[i - 1]
        gradientStroke.addColorStop(Math.max(0, (v - 0.01) / limiteEspectro), colorPrevio)
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
    // if (division === 'comuna') {

    //   const rangosCuarentenas = geoJSONCuarentenas.features.map(({ properties: { Cut_Com, FInicio, FTermino } }) => ({
    //     codigo: Cut_Com,
    //     inicio: moment(FInicio, 'YYYY/MM/DD hh:mm:ss'),
    //     fin: moment(FTermino, 'YYYY/MM/DD hh:mm:ss')
    //   }))
    
    //   const cuarentenasComuna = rangosCuarentenas.filter(({ codigo: codigoComuna }) => codigoComuna === Number(codigo))
    //   if (cuarentenasComuna) {
    //     data.datasets = [
    //       ...data.datasets,
    //       {
    //         type: 'bar',
    //         key: 'Barras-cuarentenas-totales',
    //         label: 'Comuna en cuarentena total o parcial',
    //         data: serieChile.map(({ fecha }) => {
    //           return cuarentenasComuna.some(({ inicio, fin }) => (
    //             fecha.diff(inicio, 'days') >= 0 && fecha.diff(fin, 'days') < 0
    //           )) ? limiteEspectro : 0
    //         }).slice(esDispositivoPequeño ? -diasDispositivoPequeño : 0),
    //         backgroundColor: pattern.draw('diagonal-right-left', 'rgba(255, 255, 255, 0.1)', '#212121', 7.5),
    //         barPercentage: 1.25
    //       }
    //     ]
    //   }
    // }
    setDatos(data)
  }, [posicion, division, codigo, escala, ss, indice])

  return (
    <div className="Grafico">
      <Line
        id="Grafico"
        data={datos}
        options={{
          maintainAspectRatio: false,
          scales: {
            yAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: dataset.nombre,
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
                fontColor: 'rgba(255, 255, 255, 0.75)',
                callback: item => item.toLocaleString('de-DE')
              }
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
            callbacks: {
              label: ({ yLabel: v, datasetIndex }) => {
                if (datos.datasets[datasetIndex].label.endsWith('cuarentena total o parcial')) {
                  return ''
                }
                return `${dataset.nombre}: ${v.toLocaleString('de-DE', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}`
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
