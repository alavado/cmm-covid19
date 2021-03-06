import React, { useState, useEffect } from 'react'
import moment from 'moment/min/moment-with-locales'
import { Line } from 'react-chartjs-2'
import './GraficosVMI.css'
import AppUCI from '../AppUCI'
import 'chartjs-plugin-annotation'

const data = `
  16/04;17/04;18/04;19/04;20/04;21/04;22/04;23/04;24/04;25/04;26/04;27/04;28/04;29/04;30/04;1/05;2/05;3/05;4/05;5/05;6/05;7/05;8/05;9/05;10/05;11/05;12/05;13/05;14/05;15/05;16/05;17/05;18/05;19/05;20/05;21/05;22/05;23/05;24/05;25/05;26/05;27/05;28/05;29/05;30/05;31/05;1/06;2/06;3/06;4/06;5/06;6/06;7/06;8/06;9/06;10/06;11/06;12/06;13/06;14/06;15/06;16/06;17/06;18/06;19/06;20/06;21/06;22/06;23/06;24/06;25/06;26/06;27/06;28/06;29/06
  69.1;79.0;79.0;82.7;87.2;84.0;82.7;81.5;76.5;75.3;71.6;66.7;63.0;64.2;66.7;70.4;71.6;75.3;77.8;82.7;80.2;82.7;84.0;90.1;85.2;81.5;92.9;90.6;83.0;81.6;86.8;91.2;93.0;89.7;94.5;91.0;95.1;95.9;96.8;96.0;95.2;94.7;96.9;97.7;100;99.2;97.7;93.5;90.8;92.1;79.0;79.7;87.3;86.4;81.0;80.4;87.1;87.7;97.5;85.3;85.3;85.3;93.9;95.7;90.8;87.7;90.2;89.0;87.1;90.2;91.3;89.6;89.0;84.7;84.0
  46.9;54.3;53.1;59.3;59.0;55.6;58.0;55.6;55.6;56.8;59.3;53.1;45.7;45.7;44.4;46.9;53.1;55.6;53.1;60.5;56.8;60.5;64.2;72.8;76.5;79.0;76.5;78.8;73.6;71.1;79.8;87.7;88.6;88.0;90.9;89.3;91.8;92.6;90.3;89.5;88.9;91.6;93.9;96.1;96.9;97.0;95.5;93.5;89.4;90.6;79.0;79.7;77.8;82.1;80.4;80.4;83.4;83.4;90.5;84.0;85.3;83.4;92.0;93.9;90.2;87.1;89.6;86.5;85.9;88.3;89.6;84.0;88.3;79.8;81.6
  54.5;54.5;54.5;63.6;77.3;68.2;86.4;68.2;81.8;77.3;40.9;81.8;87.0;87.5;88.0;80.0;64.0;68.0;84.0;68.0;80.0;72.0;72.0;88.0;84.0;87.5;87.5;79.2;62.5;75.0;66.7;90.3;90.3;81.5;88.9;88.0;87.1;79.4;87.9;79.4;76.5;82.4;76.5;85.3;82.4;91.2;88.2;91.2;82.4;82.4;85.3;94.1;94.1;88.2;94.1;88.2;85.3;91.2;76.5;79.4;85.3;91.2;88.2;76.5;82.4;91.2;85.3;88.2;85.3;85.3;93.9;79.4;82.4;79.4;82.4
  22.7;31.8;31.8;36.4;40.9;40.9;40.9;36.4;40.9;45.5;36.4;54.5;52.2;45.8;48.0;40.0;36.0;44.0;40.0;36.0;44.0;44.0;40.0;56.0;56.0;62.5;54.2;54.2;45.8;70.8;50.0;74.2;74.2;74.1;85.2;84.0;83.9;79.4;87.9;82.4;73.5;82.4;73.5;70.6;70.6;88.2;85.3;85.3;76.5;73.5;76.5;88.2;88.2;88.2;88.2;82.4;82.4;88.2;73.5;76.5;82.4;88.2;85.3;76.5;82.4;88.2;85.3;85.3;85.3;85.3;81.7;79.4;79.4;79.4;82.4
  54.5;54.5;55.1;48.7;47.4;48.1;56.0;60.0;61.3;52.5;56.3;51.9;51.9;53.1;43.2;58.0;59.3;63.0;60.5;66.7;70.4;75.9;72.3;72.3;73.5;74.7;89.5;79.5;83.3;80.9;83.0;88.3;90.4;91.1;93.9;97.2;98.1;100;94.1;93.1;94.6;86.0;92.4;97.7;98.5;93.9;94.2;97.2;95.0;96.5;97.9;99.3;93.8;94.3;93.8;91.8;91.3;88.7;91.1;85.2;86.2;84.6;88.1;83.2;82.4;84.6;91.1;94.9;85.4;92.9;90.7;91.8;88.8;87.7;89.5
  26.0;26.0;26.9;24.4;21.8;23.4;24.0;29.3;26.3;26.3;27.5;25.9;25.9;23.5;19.8;21.0;27.2;29.6;35.8;40.7;42.0;49.4;51.8;56.6;61.4;60.9;66.3;68.2;67.8;66.0;64.9;78.7;81.9;80.0;81.6;86.8;89.5;86.7;87.4;87.7;89.2;83.8;88.5;93.8;93.8;90.9;92.7;93.6;90.8;93.0;92.9;95.2;85.7;89.3;89.4;86.5;89.0;85.9;88.9;83.0;83.4;81.3;84.3;80.5;79.8;83.0;90.5;93.8;81.0;87.9;88.5;89.1;88.2;86.1;88.0
  22.1;23.4;26.0;29.9;31.2;33.8;36.4;42.9;39.0;41.6;41.6;48.1;51.9;49.4;48.6;50.0;55.4;59.5;50.0;60.8;60.8;55.4;54.1;54.1;56.0;69.7;78.0;50.0;57.9;64.3;66.7;71.4;69.9;70.1;73.9;81.5;89.9;87.5;89.6;89.6;84.9;84.9;81.2;84.2;86.1;85.1;84.2;83.2;86.1;82.2;81.2;83.2;79.2;85.10;88.1;93.9;91.9;91.1;88.9;86.9;90.9;87.1;94.6;89.1;86.1;88.1;89.1;84.2;90.9;84.2;89.8;88.2;82.4;81.4;82.4
  9.1;14.3;14.3;23.4;27.3;20.8;20.8;23.4;20.8;19.5;22.1;27.3;31.2;32.5;32.4;33.8;37.8;41.9;35.1;40.5;47.3;48.6;45.9;44.6;49.3;60.5;51.2;46.7;51.3;56.0;59.5;66.7;68.7;65.5;67.0;71.7;76.8;79.8;77.4;83.0;74.5;79.2;78.2;81.2;84.2;82.2;81.2;83.2;81.2;79.2;76.2;79.2;75.2;81.2;83.2;88.9;84.8;82.2;82.8;83.8;87.9;85.1;88.5;84.2;84.2;86.1;86.1;81.2;88.6;81.2;86.9;85.3;79.4;76.5;77.5
  78.3;73.3;68.3;73.3;60.0;66.7;71.7;80.0;78.3;80.0;68.3;63.3;80.0;71.7;69.1;81.7;73.3;78.3;78.3;73.3;78.3;91.7;95.1;91.8;85.2;81.7;90.5;90.1;85.9;89.3;92.0;96.1;90.7;94.9;91.7;92.8;94.3;95.1;91.0;100;93.2;94.3;94.3;95.5;93.8;91.8;93.8;87.6;91.8;96.0;94.7;92.9;94.9;94.0;93.0;93.0;93.0;90.0;96.1;96.1;97.1;98.1;94.3;95.7;94.9;96.7;88.7;80.8;91.4;88.5;78.4;83.3;83.3;82.6;83.3
  43.3;40.0;38.3;43.3;33.3;33.3;33.3;41.7;46.7;51.7;40.0;33.3;45.0;46.7;41.2;53.3;48.3;53.3;51.7;48.3;55.0;63.3;67.2;68.9;67.2;70.0;74.6;70.4;71.8;66.7;72.0;75.0;72.0;74.4;71.4;74.7;71.3;85.4;79.8;85.1;79.5;85.2;83.0;85.2;83.5;85.6;86.6;83.5;85.7;86.9;84.0;83.7;83.7;92.0;87.0;88.0;87.0;83.0;85.4;85.4;89.3;93.5;84.9;92.2;93.2;90.8;84.3;75.8;85.3;80.0;71.1;76.5;75.8;71.2;72.0
  84.2;80.7;82.8;91.5;92.1;81.0;78.5;81.0;81.0;74.6;76.6;71.4;71.4;74.6;76.2;79.4;85.7;81.0;93.8;95.4;95.6;85.1;93.2;87.8;90.3;89.0;86.5;86.7;84.0;93.6;99.0;95.6;93.7;87.9;93.4;89.2;87.1;87.4;85.1;89.7;87.6;91.1;89.2;93.1;93.1;92.1;98.0;96.1;92.5;89.6;91.5;96.4;97.2;98.2;95.6;91.1;92.9;96.5;91.4;86.6;89.6;94.1;93.8;93.2;89.8;91.5;90.7;89.9;93.2;90.8;91.5;90.7;89.0;87.3;84.9
  38.6;40.4;48.3;49.2;44.4;42.9;46.2;52.4;47.6;46.0;50.0;50.8;54.0;55.6;54.0;57.1;66.7;58.7;72.3;70.8;73.5;63.5;68.9;68.9;70.8;72.0;61.8;68.9;69.1;76.6;81.7;83.2;79.3;83.2;93.4;89.2;87.1;86.3;85.1;89.7;87.6;85.1;86.3;90.1;90.1;88.1;94.1;92.2;87.7;85.8;87.7;90.9;92.6;92.9;89.4;88.4;89.3;93.0;87.1;83.2;87.8;91.5;92.3;90.7;88.1;88.1;88.1;86.6;90.7;88.2;89.0;87.3;86.4;84.7;82.4
  59.4;60.4;60.6;63.7;63.5;62.4;65.8;68.3;67.1;64.5;60.9;60.9;63.9;63.2;61.7;67.7;68.0;70.6;72.0;74.9;76.9;77.3;78.6;79.4;78.1;79.8;87.4;78.8;78.5;81.6;85.1;89.1;88.4;86.6;89.8;90.4;92.7;92.5;91.5;92.7;90.5;89.6;90.3;93.5;94.1;92.8;93.5;92.0;91.0;91.2;88.3;90.3;90.8;91.3;90.0;89.2;90.6;90.4;92.3;87.0;88.8;89.1;92.3;90.2;88.1;89.2;89.9;88.5;89.0;89.6;89.5;88.5;86.7;84.8;85.2
  31.6;34.5;35.4;39.3;37.3;35.5;36.8;39.9;38.9;39.7;39.3;38.8;40.3;40.2;38.3;41.1;45.1;46.9;48.2;50.8;53.7;55.9;58.0;61.8;64.5;68.0;65.0;65.6;66.2;67.8;71.3;78.9;78.7;78.9;81.7;83.1;84.0;86.0;84.6;86.9;83.8;85.1;85.9;88.8;89.2;89.3;90.2;89.6;86.6;87.0;83.7;86.1;83.2;87.3;85.9;85.7;86.5;85.7;86.8;83.4;86.0;86.2;88.5;87.4;86.4;86.7;88.0;85.7;86.0;85.6;85.4;84.4;84.1;80.2;81.1
`

const procesarFilaVMI = fila => {
  return fila.split(';').map(Number)
}
  
const filas = data.split('\n').slice(1, -1).map(d => d.trim())
const fechas = filas[0].split(';').map(f => moment(f, 'DD/MM').format('DD/MM'))
const servicios = [
  {
    nombre: 'Central',
    serie: procesarFilaVMI(filas[1])
  },
  {
    nombre: 'Norte',
    serie: procesarFilaVMI(filas[3])
  },
  {
    nombre: 'Occidente',
    serie: procesarFilaVMI(filas[5])
  },
  {
    nombre: 'Oriente',
    serie: procesarFilaVMI(filas[7])
  },
  {
    nombre: 'Sur',
    serie: procesarFilaVMI(filas[9])
  },
  {
    nombre: 'Sur Oriente',
    serie: procesarFilaVMI(filas[11])
  },
  {
    nombre: 'Total RM',
    serie: procesarFilaVMI(filas[13])
  }
]

const GraficosVMI = () => {

  const [seleccion, setSeleccion] = useState('Central')
  const [annotation, setAnnotation] = useState({})
  const serie = servicios.find(s => s.nombre === seleccion).serie

  useEffect(() => {
    setAnnotation({
      drawTime: 'afterDatasetsDraw',
      annotations: [
        ...fechas
        .map((f, i) => moment(f, 'DD/MM').date() === 1 ? i : -1)
        .filter(i => i >= 0)
        .map(i => ({
          type: 'box',
          xScaleID: 'eje-x',
          yScaleID: 'eje-y',
          xMin: i - .1,
          xMax: i + .1,
          yMin: -serie.reduce((x, y) => Math.max(x, y)) * .03,
          yMax: serie.reduce((x, y) => Math.max(x, y)) * .03,
          borderWidth: 2,
          borderColor: '#C5C5C5',
          backgroundColor: '#C5C5C5'
        }))
      ]
    })
  }, [serie])

  return (
    <div className="GraficosVMI">
      <div className="GraficosVMI__contenedor_central">
        <div>
          <div className="GraficosVMI__contenedor_selector">
            <label
              className="GraficosVMI__label_selector"
              htmlFor="selector-ss"
            >
              Servicio de Salud Metropolitano
            </label>
            <select
              id="selector-ss"
              className="GraficosVMI__selector"
              value={seleccion}
              onChange={e => setSeleccion(e.target.value)}
            >
              {servicios.map(s => <option key={s.nombre} value={s.nombre}>{s.nombre}</option>)}
            </select>
          </div>
          <div className="AppGraficosSimples__contenedor_encabezado">
            <div className="AppGraficosSimples__contenedor_encabezado_izquierda">
              <h1 className="GraficosVMI__nombre_comuna">
                {seleccion !== 'total RM' && <>Servicio de Salud<br/> Metropolitano</>} {seleccion}
              </h1>
            </div>
            <div className="AppGraficosSimples__contenedor_encabezado_derecha">
              <h1 className="AppGraficosSimples__nombre_comuna">Ocupación de<br/>ventiladores mecánicos</h1>
            </div>
          </div>
          <div className="GraficosVMI__contenedor_grafico">
            <Line
              type="LineWithLine"
              data={{
                labels: fechas,
                datasets: [
                  {
                    data: [...serie],
                    fill: false,
                    borderWidth: 8,
                    lineTension: 0.1,
                    borderColor: '#5E5E5E',
                    pointRadius: 0,
                    pointHitRadius: 10,
                    borderCapStyle: 'round'
                  }
                ]
              }}
              options={{
                maintainAspectRatio: false,
                scales: {
                  xAxes: [{
                    id: 'eje-x',
                    display: true,
                    gridLines: {
                      display: true,
                      borderDash: [15, 12],
                      color: '#C3C3C3',
                      zeroLineWidth: 0,
                      lineWidth: 0
                    },
                    ticks: {
                      autoSkip: false,
                      maxRotation: 0,
                      minRotation: 0,
                      display: true,
                      fontSize: 18,
                      fontStyle: 'bold',
                      callback: function(v, i) {
                        const fecha = moment(fechas[i], 'DD/MM')
                        return fecha.date() === 1 ? fecha.format('D [de] MMMM') : null
                      },
                      fontColor: '#5E5E5E'
                    }
                  }
                ],
                  yAxes: [{
                    id: 'eje-y',
                    gridLines: {
                      zeroLineWidth: 3.5
                    },
                    ticks: {
                      suggestedMin: 0,
                      beginAtZero: true,
                      suggestedMax: 100,
                      callback: v => (v % 50 === 0) ? `${v}%` : null,
                      fontColor: '#212121',
                      fontStyle: 'bold',
                      fontSize: 16
                    },
                    position: 'right'
                  }]
                },
                tooltips: {
                  displayColors: false,
                  callbacks: {
                    title: item => moment(item[0].xLabel, 'DD/MM').format('D [de] MMMM'),
                    label: item => `${Number(item.value).toLocaleString('de-DE')}% de los ventiladores mecánicos ocupados`
                    // afterTitle: item => `${Math.round(valores[item[0].index])} ${Math.round(valores[item[0].index]) === 1 ? 'nuevo caso' : 'nuevos casos'} en los últimos 7 días`,
                    // label: item => ''//`${Math.round(valores.slice(item.index - 6, item.index + 1).reduce((sum, x) => sum + x))} nuevos casos en los últimos 7 días`
                  }
                },
                legend: {
                  display: false
                },
                annotation
              }}
            />
          </div>
        </div>
        <div className="GraficosVMI__contenedor_mapa">
          <AppUCI ss={seleccion} fijarSS={setSeleccion} datos={servicios} />
        </div>
      </div>
      <p className="AppGraficosSimples__aviso">
        Fuente: <a href="https://www.medicina-intensiva.cl/site/post.php?id=1000328&sec=9" rel="noreferer noopener">Encuesta diaria realidad nacional de la Sociedad Chilena de Medicina Intensiva (extraídos por Jorge Pérez, actualizado en esta página el 30 de junio).</a>
      </p>
    </div>
  )
}

export default GraficosVMI
