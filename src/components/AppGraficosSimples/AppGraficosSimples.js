import React, { useState, useEffect, useMemo } from 'react'
import './AppGraficosSimples.css'
import { Line } from 'react-chartjs-2'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CASOS_COMUNALES_INTERPOLADOS } from '../../redux/reducers/series'
import moment from 'moment'
import 'chartjs-plugin-annotation'

const AppGraficosSimples = () => {

  const { series, geoJSONCuarentenas } = useSelector(state => state.series)
  const [annotation, setAnnotation] = useState({})
  const { comuna } = useParams()
  const history = useHistory()

  let codigoComuna = Number(comuna)
  if (!comuna) {
    codigoComuna = 13101
  }

  const serieComunas = series
    .find(({ id }) => id === CASOS_COMUNALES_INTERPOLADOS)

  const datos = serieComunas.datos
    .find(comuna => comuna.codigo === codigoComuna)
    .datos

  const fechas = datos.map(d => d.fecha).slice(15)
  const valores = datos.map(d => d.valor)
    .reduce((prev, v, i, arr) => {
      let sum = 0
      for (let j = i; j > 0 && j > i - 7; j--) {
        sum += arr[j] - arr[j - 1]
      }
      return [...prev, sum / Math.min(i + 1, 7)]
    }, []).slice(15)

  const cuarentenasComuna = useMemo(() => {
    const rangosCuarentenas = geoJSONCuarentenas.features
      .map(({ properties: { Cut_Com, FInicio, FTermino } }) => ({
        codigo: Cut_Com,
        inicio: moment(FInicio, 'YYYY/MM/DD'),
        fin: moment(FTermino, 'YYYY/MM/DD')
      }))
    let cuarentenas = rangosCuarentenas
      .filter(({ codigo }) => codigo === codigoComuna)
    
    for (let i = 0; i < cuarentenas.length - 1; i++) {
      let j
      for (j = i + 1; j < cuarentenas.length && Math.abs(cuarentenas[j].inicio.diff(cuarentenas[i].fin, 'days')) <= 2; j++) {
        cuarentenas[i].fin = cuarentenas[j].fin.clone()
        cuarentenas[j].eliminar = true
      }
      i = j - 1
    }
    return cuarentenas.filter(r => !r.eliminar)
  }, [comuna])

  useEffect(() => {
    setAnnotation({
      drawTime: 'afterDatasetsDraw',
      annotations: [
        ...cuarentenasComuna.map(cuarentena => {
          const { inicio, fin } = cuarentena
          let indiceInicio = fechas.findIndex(f => Math.abs(f.diff(inicio, 'days')) <= .5)
          let indiceFin = fechas.findIndex(f => Math.abs(f.diff(fin, 'days')) <= .5)
          if (indiceInicio < 0) {
            indiceInicio = fechas.length - 1
          }
          if (indiceFin < 0) {
            indiceFin = fechas.length - 1
          }
          return { i: (indiceFin + indiceInicio) / 2, dif: indiceFin - indiceInicio, indiceInicio, indiceFin }
        }).map(({ i, dif, indiceInicio, indiceFin }) => ({
          type: 'line',
          mode: 'vertical',
          scaleID: 'eje-x', 
          borderColor: 'transparent',
          value: i,
          borderWidth: 2,
          label: {
            backgroundColor: 'transparent',
            content: 'cuarentena',
            fontColor: '#5E5E5E',
            fontSize: 18 - Math.max(12 - dif, 0),
            fontStyle: 'bold',
            enabled: true,
            yAdjust: -120
          }
      })),
      ...fechas.map((f, i) => f.date() === 1 ? i : -1).filter(i => i >= 0).map(i => ({
        type: 'box',
        xScaleID: 'eje-x',
        yScaleID: 'eje-y',
        xMin: i - .1,
        xMax: i + .1,
        yMin: -valores.reduce((x, y) => Math.max(x, y)) * .03,
        yMax: valores.reduce((x, y) => Math.max(x, y)) * .03,
        borderWidth: 2,
        borderColor: '#C5C5C5',
        backgroundColor: '#C5C5C5',
      }))
      ]
    })
  }, [cuarentenasComuna, comuna])

  return (
    <div className="AppGraficosSimples">
      <div className="AppGraficosSimples__contenedor">
        <label className="AppGraficosSimples__label_selector">Comuna:
          <select onChange={e => history.push(`/graficos/comuna/${e.target.value}`)}>
            {serieComunas.datos
              .sort((c1, c2) => c1.nombre > c2.nombre ? 1 : -1)
              .map(comuna => (
                <option key={`perez-${comuna.codigo}`} value={comuna.codigo}>
                  {comuna.nombre}
                </option>
              ))
            }
          </select>
        </label>
        <div className="AppGraficosSimples__contenedor_encabezado">
          <div className="AppGraficosSimples__contenedor_encabezado_izquierda">
            <h1 className="AppGraficosSimples__nombre_comuna">{serieComunas.datos.find(c => c.codigo === codigoComuna).nombre}</h1>
            <h2 className="AppGraficosSimples__casos_totales">{Math.round(serieComunas.datos.find(comuna => comuna.codigo === codigoComuna).datos.slice(-1)[0].valor)} Casos Totales</h2>
          </div>
          <div>
          <div className="AppGraficosSimples__contenedor_encabezado_derecha">
            <h1 className="AppGraficosSimples__nombre_comuna">Nuevos casos en los<br />últimos 7 días</h1>
          </div>
          </div>
        </div>
        <div className="AppGraficosSimples__contenedor_grafico">
          <Line
            data={{
              labels: fechas.map(f => f.format('DD [de] MMMM')),
              datasets: [{
                data: valores.map(v => v + 2),
                fill: false,
                borderWidth: 8,
                lineTension: 0,
                borderColor: '#5E5E5E',
                pointRadius: 0,
                pointHitRadius: 10
              }]
            }}
            options={{
              maintainAspectRatio: false,
              scales: {
                xAxes: [{
                  id: 'eje-x',
                  display: true,
                  gridLines: {
                    display: true,
                    lineWidth: fechas.map(f => cuarentenasComuna.some(({ inicio, fin }) => {
                      return (f.diff(inicio, 'days') === 0 || f.diff(fin, 'days') === 0)
                    }) ? 4 : 0),
                    borderDash: [15, 12],
                    color: '#C3C3C3'
                  },
                  ticks: {
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                    display: true,
                    fontSize: 18,
                    fontStyle: 'bold',
                    callback: function(v, i) {
                      const fecha = fechas[i]
                      const fechaEsLimiteCuarentena = cuarentenasComuna.some(cuarentena => {
                        const { inicio, fin } = cuarentena
                        return fecha.diff(inicio, 'days') === 0 || fecha.diff(fin, 'days') === 0
                      })
                      return fecha.date() === 1 ? fecha.format('D [de] MMMM') : fechaEsLimiteCuarentena ? '' : null
                    },
                    fontColor: '#5E5E5E'
                  }
                }
              ],
                yAxes: [{
                  id: 'eje-y',
                  gridLines: {
                    lineWidth: 0,
                    zeroLineWidth: 3.5
                  },
                  ticks: {
                    suggestedMin: 0,
                    beginAtZero: true
                  }
                }]
              },
              tooltips: {
                callbacks: {
                  label: item => `${Math.round(item.value)} nuevos casos`
                }
              },
              legend: {
                display: false
              },
              annotation
            }}
          />
        </div>
        <Link style={{ textDecoration: 'underline' }} to={`/comuna/${codigoComuna}`}>Ver esta comuna en el mapa (cuidado: cambia mucho la página)</Link>
      </div>
    </div>
  )
}

export default AppGraficosSimples
