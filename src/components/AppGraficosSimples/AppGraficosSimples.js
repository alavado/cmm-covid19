import React, { useState } from 'react'
import './AppGraficosSimples.css'
import { Line } from 'react-chartjs-2'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CASOS_COMUNALES_INTERPOLADOS } from '../../redux/reducers/series'
import moment from 'moment'

const AppGraficosSimples = () => {

  const { series, geoJSONCuarentenas } = useSelector(state => state.series)
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
    .slice(15)

  const fechas = datos.map(d => d.fecha)
  const valores = datos.map(d => d.valor)
    .reduce((prev, v, i, arr) => {
      let sum = 0
      for (let j = i; j > 0 && j > i - 7; j--) {
        sum += arr[j] - arr[j - 1]
      }
      return [...prev, sum / Math.min(i + 1, 7)]
    }, [])
  
  let rangosCuarentenas = geoJSONCuarentenas.features
    .map(({ properties: { Cut_Com, FInicio, FTermino } }) => ({
      codigo: Cut_Com,
      inicio: moment(FInicio, 'YYYY/MM/DD'),
      fin: moment(FTermino, 'YYYY/MM/DD').add(-1, 'days')
    }))

  let cuarentenasComuna = rangosCuarentenas
    .filter(({ codigo }) => codigo === codigoComuna)
  
  for (let i = 0; i < cuarentenasComuna.length - 1; i++) {
    let j = i + 1
    while (j < cuarentenasComuna.length - 1 && Math.abs(cuarentenasComuna[i].fin.diff(cuarentenasComuna[j].inicio, 'days')) <= 2) {
      cuarentenasComuna[i].fin = cuarentenasComuna[j].fin.clone()
      cuarentenasComuna[j].eliminar = true
    }
  }
  cuarentenasComuna = cuarentenasComuna.filter(r => !r.eliminar)

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
                pointHitRadius: 8
              }]
            }}
            options={{
              maintainAspectRatio: false,
              scales: {
                xAxes: [{
                  display: true,
                  gridLines: {
                    display: true,
                    lineWidth: fechas.map(f => cuarentenasComuna.some(({ inicio, fin }) => {
                      return (f.diff(inicio, 'days') === 0 || f.diff(fin, 'days') === 0)
                    }) ? 4 : 1),
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
                      return fecha.date() === 1 ? fecha.format('D [de] MMMM') : (fechaEsLimiteCuarentena ? '' : null)
                    },
                    fontColor: '#5E5E5E'
                  }
                }],
                yAxes: [{
                  gridLines: {
                    lineWidth: 0,
                    zeroLineWidth: 3.5
                  },
                  ticks: {
                    suggestedMin: 0
                  }
                }]
              },
              tooltips: {
                callbacks: {
                  label: item => `Nuevos casos: ${Math.round(Number(item.value))}`
                }
              },
              legend: {
                display: false
              }
            }}
          />
        </div>
        <Link style={{ textDecoration: 'underline' }} to={`/comuna/${codigoComuna}`}>Ver esta comuna en el mapa</Link>
      </div>
    </div>
  )
}

export default AppGraficosSimples
