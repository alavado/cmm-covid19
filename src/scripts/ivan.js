const axios = require('axios')
const moment = require('moment')
const fs = require('fs')

const urlIvan = 'https://raw.githubusercontent.com/ivanMSC/COVID19_Chile/master/historial_comunas.csv'

const leerDesdeGitHubIvan = async () => {
  const { data } = await axios.get(urlIvan)
  const [encabezados, ...datos] = data.split('\n')
  let maximaFecha = moment('2020-03-01', 'YYYY-MM-DD')
  const datosComunas = datos
    .reduce((obj, fila) => {
      const datosFila = fila.split(',')
      const fecha = moment(datosFila[0], 'DD-MM-YYYY')
      if (fecha.diff(maximaFecha, 'days') > 0) {
        maximaFecha = fecha
      }
      const codigoRegion = Number(datosFila[1])
      let nuevoObj = { ...obj }
      if (!nuevoObj[codigoRegion]) {
        nuevoObj[codigoRegion] = []
      }
      return {
        ...nuevoObj,
        [codigoRegion]: {
          ...nuevoObj[codigoRegion],
          [fecha.format('DD/MM')]: Number(datosFila[4])
        }
      }
    }, {})
  return { maximaFecha, datos: datosComunas }
}

leerDesdeGitHubIvan().then(datos => {
  fs.writeFile(
    './src/data/contagios/seremi.json',
    JSON.stringify(datos),
    err => console.log(err)
  )
})
