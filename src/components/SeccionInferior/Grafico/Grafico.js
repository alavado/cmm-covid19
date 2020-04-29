import React, { useState, useEffect } from 'react'
import { Chart, Line } from 'react-chartjs-2'
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import { fijarPosicionSerie } from '../../../redux/actions'
import escala from '../../../helpers/escala'
import './Grafico.css'
import { useParams } from 'react-router-dom'
import demograficosComunas from '../../../data/demografia/comunas.json'
import demograficosRegiones from '../../../data/demografia/regiones.json'
import { CONTAGIOS_REGIONALES_POR_100000_HABITANTES, CODIGO_CHILE, CASOS_COMUNALES_POR_100000_HABITANTES } from '../../../redux/reducers/series'

const Grafico = () => {

  const { subserieSeleccionada: ss, series, posicion } = useSelector(state => state.series)
  const [datos, setDatos] = useState({})
  const { fecha } = ss.datos[posicion]
  const dispatch = useDispatch()
  Chart.defaults.global.defaultFontColor = 'rgba(255, 255, 255, .9)'
  const params = useParams()

  const { division, codigo } = params

  const obtenerSerieChile = () => {
    return series
      .find(s => s.id === CONTAGIOS_REGIONALES_POR_100000_HABITANTES).datos
      .find(d => d.codigo === CODIGO_CHILE).datos
  }

  const obtenerSerieRegion = codigo => {
    return series
      .find(s => s.id === CONTAGIOS_REGIONALES_POR_100000_HABITANTES).datos
      .find(d => d.codigo === Number(codigo)).datos
  }

  const obtenerSerieRegionComuna = codigoComuna => {
    const codigoRegion = Number(demograficosComunas.find(c => c.codigo === codigoComuna).region)
    return obtenerSerieRegion(codigoRegion)
  }

  const obtenerSerieComuna = codigo => {
    return series
      .find(s => s.id === CASOS_COMUNALES_POR_100000_HABITANTES).datos
      .find(d => d.codigo === Number(codigo)).datos
  }

  const estiloLineaPrincipal = {
    fillColor: 'rgba(220,220,220,0.8)',
    strokeColor: 'rgba(220,220,220,1)',
    pointColor: 'rgba(220,220,220,1)',
    pointStrokeColor: '#fff',
    pointHighlightFill: '#fff',
    pointHighlightStroke: 'rgba(220,220,220,1)',
    borderDash: [0, 0],
    lineTension: .2,
    pointRadius: 3,
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
    strokeColor: '#3F51B5',
    pointColor: '#3F51B5',
    pointStrokeColor: '#3F51B5',
    pointHighlightFill: '#3F51B5',
    pointHighlightStroke: '#3F51B5',
    borderColor: '#3F51B5',
    borderWidth: 1.5,
    pointRadius: 2,
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
    strokeColor: '#039BE5',
    pointColor: '#039BE5',
    pointStrokeColor: '#039BE5',
    pointHighlightFill: '#039BE5',
    pointHighlightStroke: '#039BE5',
    borderColor: '#039BE5',
    borderWidth: 1.5,
    pointRadius: 2,
    lineTension: .2,
    fill: false
    // borderDash: [5, 3]
  }

  const fechaEsAntesDeFechaPosicionSelecionada = f => {
    return f.diff(fecha, 'days') <= 0
  }

  useEffect(() => {
    let data = {
      labels: {},
      datasets: []
    }
    let puntosChile = obtenerSerieChile()
    let puntosRegion, puntosComuna
    let todosLosValores = [...puntosChile.filter(v => fechaEsAntesDeFechaPosicionSelecionada(v.fecha))]
    if (!division) {
      data.labels = puntosChile.map(d => d.fecha)
      data.datasets = [
        {
          ...estiloLineaPrincipal,
          label: 'Chile',
          data: puntosChile.map((d, i) => fechaEsAntesDeFechaPosicionSelecionada(d.fecha) ? d.valor : null)
        }
      ]
    }
    else if (division === 'region') {
      puntosRegion = obtenerSerieRegion(codigo)
      todosLosValores = [
        ...todosLosValores,
        ...puntosRegion.filter((v, i) => i <= posicion)
      ]
      data.labels = puntosRegion.map(d => d.fecha)
      data.datasets = [
        {
          ...estiloLineaPrincipal,
          label: demograficosRegiones.find(c => c.codigo === codigo).nombre,
          data: puntosRegion.map((d, i) => i <= posicion ? d.valor : null),
        },
        {
          ...estiloLineaChile,
          label: 'Chile',
          data: puntosChile.map((d, i) => i <= posicion ? d.valor : null)
        }
      ]
    }
    else if (division === 'comuna') {
      puntosRegion = obtenerSerieRegionComuna(codigo)
      puntosComuna = obtenerSerieComuna(codigo)
      todosLosValores = [
        ...todosLosValores,
        ...puntosRegion,
        ...puntosComuna
      ]
      let puntosConDatos = [
        { fecha: puntosChile[0].fecha.clone(), valor: null },
        ...puntosComuna
      ]
      const ultimaFechaChile = puntosChile.slice(-1)[0].fecha
      const ultimaFechaComuna = puntosComuna.slice(-1)[0].fecha
      if (ultimaFechaComuna.diff(ultimaFechaChile, 'days') !== 0) {
        puntosConDatos.push({ fecha: ultimaFechaChile.clone(), valor: null })
      }
      const puntosRellenados = puntosConDatos.reduce((prev, p, i, arr) => {
        let otros = []
        if (i > 0) {
          let fechaAnterior = arr[i - 1].fecha.clone()
          while (fechaAnterior.add(1, 'days').diff(p.fecha, 'days') !== 0) {
            otros.push({ fecha: fechaAnterior.clone(), valor: null })
          }
        }
        return [...prev, ...otros, p]
      }, [])
      data.labels = puntosRellenados.map(d => d.fecha)
      const datosComuna = demograficosComunas.find(c => c.codigo === codigo)
      data.datasets = [
        {
          ...estiloLineaPrincipal,
          label: datosComuna.nombre,
          data: puntosRellenados.map((d, i) => d.valor),
          spanGaps: true,
          borderDash: [5, 1]
        },
        {
          ...estiloLineaRegion,
          label: demograficosRegiones.find(c => c.codigo === datosComuna.region).nombre,
          data: puntosRegion.map((d, i) => d.valor)
        },
        {
          ...estiloLineaChile,
          label: 'Chile',
          data: puntosChile.map((d, i) => d.valor)
        },
      ]
    }
    const canvas = document.getElementById('Grafico')
    const ctx = canvas.getContext('2d')
    const gradientStroke = ctx.createLinearGradient(0, canvas.getBoundingClientRect().height - 28, 0, 0)
    const maximo = todosLosValores.reduce((prev, d) => Math.max(prev, d.valor), 0)
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
    data.datasets = [
      {
        ...data.datasets[0],
        borderColor: gradientStroke,
        pointStrokeColorborderColor: gradientStroke,
        pointBorderColor: gradientStroke,
        pointBackgroundColor: gradientStroke,
        pointHoverBackgroundColor: gradientStroke,
        pointHoverBorderColor: gradientStroke
      },
      ...data.datasets.slice(1),
    ]
    setDatos(data)
  }, [posicion, division, codigo])

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
              title: ([{ xLabel: fecha }]) => {
                return `${fecha.format('dddd D [de] MMMM')}`
              },
              beforeTitle: ([{datasetIndex}]) => `${datos.datasets[datasetIndex].label}`
            }
          }
        }}
        onElementsClick={e => {
          if (e[0] && e[0]._index < ss.datos.length) {
            dispatch(fijarPosicionSerie(e[0]._index))
          }
        }}
      />
    </div>
  )
}

export default Grafico
