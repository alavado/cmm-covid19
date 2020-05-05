import React, { useState, useEffect, useMemo } from 'react'
import { Chart, Line } from 'react-chartjs-2'
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import { fijarPosicionSerie } from '../../../redux/actions'
import './Grafico.css'
import { useParams } from 'react-router-dom'
import demograficosComunas from '../../../data/demografia/comunas.json'
import demograficosRegiones from '../../../data/demografia/regiones.json'
import { CONTAGIOS_REGIONALES_POR_100000_HABITANTES, CODIGO_CHILE, CASOS_COMUNALES_POR_100000_HABITANTES, CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS } from '../../../redux/reducers/series'
import pattern from 'patternomaly'

Chart.defaults.global.defaultFontColor = 'rgba(255, 255, 255, .9)'
const diasDispositivoPequeño = 42

const Grafico = () => {

  const { escala } = useSelector(state => state.colores)
  const { subserieSeleccionada: ss, series, posicion, geoJSONCuarentenas, verCuarentenas, interpolarComunas } = useSelector(state => state.series)
  const [datos, setDatos] = useState({})
  const { fecha } = ss.datos[posicion]
  const params = useParams()
  const esDispositivoPequeño = window.innerWidth < 600 

  const { division, codigo } = params

  const serieChile = useMemo(() => {
    return series
      .find(s => s.id === CONTAGIOS_REGIONALES_POR_100000_HABITANTES).datos
      .find(d => d.codigo === CODIGO_CHILE).datos
  }, [])

  const obtenerSerieRegion = codigo => {
    return series
      .find(s => s.id === CONTAGIOS_REGIONALES_POR_100000_HABITANTES).datos
      .find(d => d.codigo === Number(codigo)).datos
  }

  const obtenerSerieRegionComuna = codigoComuna => {
    const codigoRegion = Number(demograficosComunas.find(c => c.codigo === codigoComuna).region)
    return obtenerSerieRegion(codigoRegion)
  }

  const obtenerSerieComuna = (codigo, interp) => {
    return series
      .find(s => s.id === (interp ? CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS : CASOS_COMUNALES_POR_100000_HABITANTES)).datos
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
    strokeColor: '#3F51B5',
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
    strokeColor: '#039BE5',
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

  const fechaEsAntesDeFechaPosicionSelecionada = f => {
    return f.diff(fecha, 'days') <= 0
  }

  useEffect(() => {
    let data = {
      labels: {},
      datasets: []
    }
    let puntosRegion, puntosComuna
    let todosLosValores = [...serieChile.filter(v => fechaEsAntesDeFechaPosicionSelecionada(v.fecha))]
    if (!division) {
      data.labels = serieChile.map(d => d.fecha).slice(esDispositivoPequeño ? -diasDispositivoPequeño : 0)
      data.datasets = [
        {
          ...estiloLineaPrincipal,
          label: 'Chile',
          data: serieChile.map((d, i) => fechaEsAntesDeFechaPosicionSelecionada(d.fecha) ? d.valor : null).slice(esDispositivoPequeño ? -diasDispositivoPequeño : 0)
        }
      ]
    }
    else if (division === 'region') {
      puntosRegion = obtenerSerieRegion(codigo)
      todosLosValores = [
        ...todosLosValores,
        ...puntosRegion.filter((v, i) => i <= posicion)
      ]
      data.labels = puntosRegion.map(d => d.fecha).slice(esDispositivoPequeño ? -diasDispositivoPequeño : 0)
      data.datasets = [
        {
          ...estiloLineaPrincipal,
          label: demograficosRegiones.find(c => c.codigo === codigo).nombre,
          data: puntosRegion.map((d, i) => i <= posicion ? d.valor : null).slice(esDispositivoPequeño ? -diasDispositivoPequeño : 0),
        },
        {
          ...estiloLineaChile,
          label: 'Chile',
          data: serieChile.map((d, i) => i <= posicion ? d.valor : null).slice(esDispositivoPequeño ? -diasDispositivoPequeño : 0)
        }
      ]
    }
    else if (division === 'comuna') {
      puntosRegion = obtenerSerieRegionComuna(codigo)
      puntosComuna = obtenerSerieComuna(codigo, interpolarComunas)
      todosLosValores = [
        ...todosLosValores,
        ...puntosRegion,
        ...puntosComuna
      ]
      let puntosConDatos = [
        { fecha: serieChile[0].fecha.clone(), valor: null },
        ...puntosComuna
      ]
      const ultimaFechaChile = serieChile.slice(-1)[0].fecha
      const ultimaFechaComuna = puntosComuna.slice(-1)[0].fecha
      if (ultimaFechaComuna.diff(ultimaFechaChile, 'days') !== 0) {
        puntosConDatos.push({ fecha: ultimaFechaChile.clone(), valor: null })
      }
      const puntosRellenados = interpolarComunas ?
        puntosConDatos.slice(2) :
        puntosConDatos.reduce((prev, p, i, arr) => {
          let otros = []
          if (i > 0) {
            let fechaAnterior = arr[i - 1].fecha.clone()
            while (fechaAnterior.add(1, 'days').diff(p.fecha, 'days') !== 0) {
              otros.push({ fecha: fechaAnterior.clone(), valor: null })
            }
          }
        return [...prev, ...otros, p]
        }, [])
      data.labels = puntosRellenados.map(d => d.fecha).slice(esDispositivoPequeño ? -diasDispositivoPequeño : 0)
      const datosComuna = demograficosComunas.find(c => c.codigo === codigo)
      data.datasets = [
        {
          ...estiloLineaPrincipal,
          label: datosComuna.nombre,
          data: puntosRellenados.map((d, i) => d.valor).slice(esDispositivoPequeño ? -diasDispositivoPequeño : 0),
          spanGaps: true,
          borderDash: interpolarComunas ? [3, 1] : [3, 1],
          pointStyle: puntosRellenados.map(d => d.interpolado ? 'star' : 'dot'),
          borderWidth: 2
        },
        {
          ...estiloLineaRegion,
          label: demograficosRegiones.find(c => c.codigo === datosComuna.region).nombre,
          data: puntosRegion.map((d, i) => d.valor).slice(esDispositivoPequeño ? -diasDispositivoPequeño : 0)
        },
        {
          ...estiloLineaChile,
          label: 'Chile',
          data: serieChile.map((d, i) => d.valor).slice(esDispositivoPequeño ? -diasDispositivoPequeño : 0)
        },
      ]
    }
    const canvas = document.getElementById('Grafico')
    const ctx = canvas.getContext('2d')
    const gradientStroke = ctx.createLinearGradient(0, canvas.getBoundingClientRect().height - 28, 0, 0)
    const maximo = todosLosValores.reduce((prev, d) => Math.max(prev, d.valor), 0)
    let limiteEspectro = 10
    if (maximo >= 30) {
      limiteEspectro = 10 * Math.floor((maximo + 10) / 10)
    }
    else if (maximo >= 10) {
      limiteEspectro = 5 * Math.floor((maximo + 5) / 5)
    }
    escala.forEach((v, i) => {
      const [valor, color] = v
      if (valor / limiteEspectro > 1) {
        return
      }
      gradientStroke.addColorStop(Math.max(0, valor / limiteEspectro), color)
      if (i > 0) {
        const [, colorPrevio] = escala[i - 1]
        gradientStroke.addColorStop(Math.max(0, (valor - 0.01) / limiteEspectro), colorPrevio)
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
    if (division === 'comuna' && verCuarentenas) {

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
            data: serieChile.map(({ fecha }) => {
              return cuarentenasComuna.some(({ inicio, fin }) => (
                fecha.diff(inicio, 'days') >= 0 && fecha.diff(fin, 'days') < 0
              )) ? limiteEspectro : 0
            }).slice(esDispositivoPequeño ? -diasDispositivoPequeño : 0),
            backgroundColor: pattern.draw('diagonal-right-left', 'rgba(255, 255, 255, 0.1)', '#212121', 7.5),
            barPercentage: 1.25
          }
        ]
      }
    }
    setDatos(data)
  }, [posicion, division, codigo, escala, verCuarentenas, interpolarComunas, ss])

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
              label: ({ yLabel: v, datasetIndex }) => {
                if (datos.datasets[datasetIndex].label.endsWith('cuarentena total o parcial')) {
                  return ''
                }
                return `Nuevos casos por 100.000 hab.: ${v.toLocaleString('de-DE', { maximumFractionDigits: 2 })}`
              },
              title: ([{ xLabel: fecha }]) => {
                return `${fecha.format('dddd D [de] MMMM')}`
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
