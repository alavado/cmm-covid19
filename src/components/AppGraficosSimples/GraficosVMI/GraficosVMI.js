import React, { useState } from 'react'
import moment from 'moment/min/moment-with-locales'
import { Line, Chart } from 'react-chartjs-2'
import './GraficosVMI.css'
import AppUCI from '../AppUCI'

Chart.defaults.LineWithLine = Chart.defaults.line;
Chart.controllers.LineWithLine = Chart.controllers.line.extend({
   draw: function(ease) {
      Chart.controllers.line.prototype.draw.call(this, ease);

      if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
         var activePoint = this.chart.tooltip._active[0],
             ctx = this.chart.ctx,
             x = activePoint.tooltipPosition().x,
             topY = this.chart.legend.bottom,
             bottomY = this.chart.chartArea.bottom;

         // draw line
         ctx.save();
         ctx.beginPath();
         ctx.moveTo(x, topY);
         ctx.lineTo(x, bottomY);
         ctx.lineWidth = 2;
         ctx.strokeStyle = '#07C';
         ctx.stroke();
         ctx.restore();
      }
   }
});

const data = `
  16-abr;17-abr;18-abr;19-abr;20-abr;21-abr;22-abr;23-abr;24-abr;25-abr;26-abr;27-abr;28-abr;29-abr;30-abr;01-may;02-may;03-may;04-may;05-may;06-may;07-may;08-may;09-may;10-may;11-may;12-may;13-may;14-may;15-may;16-may;17-may;18-may;19-may;20-may;21-may;22-may;23-may
  69.1%;79.0%;79.0%;82.7%;87.2%;84.0%;82.7%;81.5%;76.5%;75.3%;71.6%;66.7%;63.0%;64.2%;66.7%;70.4%;71.6%;75.3%;77.8%;82.7%;80.2%;82.7%;84.0%;90.1%;85.2%;81.5%;92.9%;90.6%;83.0%;81.6%;86.8%;91.2%;93.0%;89.7%;94.5%;91.0%;95.1%;95.9%
  46.9%;54.3%;53.1%;59.3%;59.0%;55.6%;58.0%;55.6%;55.6%;56.8%;59.3%;53.1%;45.7%;45.7%;44.4%;46.9%;53.1%;55.6%;53.1%;60.5%;56.8%;60.5%;64.2%;72.8%;76.5%;79.0%;76.5%;78.8%;73.6%;71.1%;79.8%;87.7%;88.6%;88.0%;90.9%;89.3%;91.8%;92.6%
  54.5%;54.5%;54.5%;63.6%;77.3%;68.2%;86.4%;68.2%;81.8%;77.3%;40.9%;81.8%;87.0%;87.5%;88.0%;80.0%;64.0%;68.0%;84.0%;68.0%;80.0%;72.0%;72.0%;88.0%;84.0%;87.5%;87.5%;79.2%;62.5%;75.0%;66.7%;90.3%;90.3%;81.5%;88.9%;88.0%;87.1%;79.4%
  22.7%;31.8%;31.8%;36.4%;40.9%;40.9%;40.9%;36.4%;40.9%;45.5%;36.4%;54.5%;52.2%;45.8%;48.0%;40.0%;36.0%;44.0%;40.0%;36.0%;44.0%;44.0%;40.0%;56.0%;56.0%;62.5%;54.2%;54.2%;45.8%;70.8%;50.0%;74.2%;74.2%;74.1%;85.2%;84.0%;83.9%;79.4%
  54.5%;54.5%;55.1%;48.7%;47.4%;48.1%;56.0%;60.0%;61.3%;52.5%;56.3%;51.9%;51.9%;53.1%;43.2%;58.0%;59.3%;63.0%;60.5%;66.7%;70.4%;75.9%;72.3%;72.3%;73.5%;74.7%;89.5%;79.5%;83.3%;80.9%;83.0%;88.3%;90.4%;91.1%;93.9%;97.2%;98.1%;100%
  26.0%;26.0%;26.9%;24.4%;21.8%;23.4%;24.0%;29.3%;26.3%;26.3%;27.5%;25.9%;25.9%;23.5%;19.8%;21.0%;27.2%;29.6%;35.8%;40.7%;42.0%;49.4%;51.8%;56.6%;61.4%;60.9%;66.3%;68.2%;67.8%;66.0%;64.9%;78.7%;81.9%;80.0%;81.6%;86.8%;89.5%;86.7%
  22.1%;23.4%;26.0%;29.9%;31.2%;33.8%;36.4%;42.9%;39.0%;41.6%;41.6%;48.1%;51.9%;49.4%;48.6%;50.0%;55.4%;59.5%;50.0%;60.8%;60.8%;55.4%;54.1%;54.1%;56.0%;69.7%;78.0%;50.0%;57.9%;64.3%;66.7%;71.4%;69.9%;70.1%;73.9%;81.5%;89.9%;87.5%
  9.1%;14.3%;14.3%;23.4%;27.3%;20.8%;20.8%;23.4%;20.8%;19.5%;22.1%;27.3%;31.2%;32.5%;32.4%;33.8%;37.8%;41.9%;35.1%;40.5%;47.3%;48.6%;45.9%;44.6%;49.3%;60.5%;51.2%;46.7%;51.3%;56.0%;59.5%;66.7%;68.7%;65.5%;67.0%;71.7%;76.8%;79.8%
  78.3%;73.3%;68.3%;73.3%;60.0%;66.7%;71.7%;80.0%;78.3%;80.0%;68.3%;63.3%;80.0%;71.7%;69.1%;81.7%;73.3%;78.3%;78.3%;73.3%;78.3%;91.7%;95.1%;91.8%;85.2%;81.7%;90.5%;90.1%;85.9%;89.3%;92.0%;96.1%;90.7%;94.9%;91.7%;92.8%;94.3%;95.1%
  43.3%;40.0%;38.3%;43.3%;33.3%;33.3%;33.3%;41.7%;46.7%;51.7%;40.0%;33.3%;45.0%;46.7%;41.2%;53.3%;48.3%;53.3%;51.7%;48.3%;55.0%;63.3%;67.2%;68.9%;67.2%;70.0%;74.6%;70.4%;71.8%;66.7%;72.0%;75.0%;72.0%;74.4%;71.4%;74.7%;71.3%;85.4%
  84.2%;80.7%;82.8%;91.5%;92.1%;81.0%;78.5%;81.0%;81.0%;74.6%;76.6%;71.4%;71.4%;74.6%;76.2%;79.4%;85.7%;81.0%;93.8%;95.4%;95.6%;85.1%;93.2%;87.8%;90.3%;89.0%;86.5%;86.7%;84.0%;93.6%;99.0%;95.6%;93.7%;87.9%;93.4%;89.2%;87.1%;87.4%
  38.6%;40.4%;48.3%;49.2%;44.4%;42.9%;46.2%;52.4%;47.6%;46.0%;50.0%;50.8%;54.0%;55.6%;54.0%;57.1%;66.7%;58.7%;72.3%;70.8%;73.5%;63.5%;68.9%;68.9%;70.8%;72.0%;61.8%;68.9%;69.1%;76.6%;81.7%;83.2%;79.3%;83.2%;93.4%;89.2%;87.1%;86.3%
  59.4%;60.4%;60.6%;63.7%;63.5%;62.4%;65.8%;68.3%;67.1%;64.5%;60.9%;60.9%;63.9%;63.2%;61.7%;67.7%;68.0%;70.6%;72.0%;74.9%;76.9%;77.3%;78.6%;79.4%;78.1%;79.8%;87.4%;78.8%;78.5%;81.6%;85.1%;89.1%;88.4%;86.6%;89.8%;90.4%;92.7%;92.5%
  31.6%;34.5%;35.4%;39.3%;37.3%;35.5%;36.8%;39.9%;38.9%;39.7%;39.3%;38.8%;40.3%;40.2%;38.3%;41.1%;45.1%;46.9%;48.2%;50.8%;53.7%;55.9%;58.0%;61.8%;64.5%;68.0%;65.0%;65.6%;66.2%;67.8%;71.3%;78.9%;78.7%;78.9%;81.7%;83.1%;84.0%;86.0%
`

const procesarFilaVMI = fila => {
  return fila.split(';').map(v => Number(v.slice(0, -1)))
}
  
const filas = data.split('\n').slice(1, -1).map(d => d.trim())
const fechas = filas[0].split(';').map(f => moment(f, 'DD-MMM').format('DD/MM'))

const GraficosVMI = () => {
  const servicios = [
    {
      nombre: 'central',
      serie: procesarFilaVMI(filas[1])
    },
    {
      nombre: 'norte',
      serie: procesarFilaVMI(filas[3])
    },
    {
      nombre: 'occidente',
      serie: procesarFilaVMI(filas[5])
    },
    {
      nombre: 'oriente',
      serie: procesarFilaVMI(filas[7])
    },
    {
      nombre: 'sur',
      serie: procesarFilaVMI(filas[9])
    },
    {
      nombre: 'sur oriente',
      serie: procesarFilaVMI(filas[11])
    },
    {
      nombre: 'total RM',
      serie: procesarFilaVMI(filas[13])
    }
  ]

  const [seleccion, setSeleccion] = useState('central')

  return (
    <div className="GraficosVMI">
      <div>
        <div className="GraficosVMI__contenedor_selector">
          <label
            className="GraficosVMI__label_selector"
            htmlFor="selector-ss"
          >
            Servicio de Salud
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
        <div className="GraficosVMI__contenedor_grafico">
          <Line
            data={{
              labels: fechas,
              datasets: [
                {
                  data: servicios.find(s => s.nombre === seleccion).serie,
                  fill: false,
                  borderWidth: 8,
                  lineTension: 0.1,
                  borderColor: '#5E5E5E',
                  pointRadius: 0,
                  pointHitRadius: 10
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
                    fontStyle: 'bold'
                  },
                  position: 'right'
                }]
              },
              tooltips: {
                intersect: false,
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
              }
            }}
          />
        </div>
      </div>
      <div className="GraficosVMI__contenedor_mapa">
        <AppUCI />
      </div>
    </div>
  )
}

export default GraficosVMI
