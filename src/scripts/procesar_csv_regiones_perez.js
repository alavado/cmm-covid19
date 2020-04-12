const axios = require('axios')
const fs = require('fs')
const regionesChile = require('../data/geojsons/regiones.json')
const urlPerez = 'https://raw.githubusercontent.com/jorgeperezrojas/covid19-data/master/csv/confirmados.csv'
const demografia = require('./demograficos_regiones.json')

axios.get(urlPerez)
  .then(({ data }) => {
    const filas = data.split('\r\n')
    const datosRegionales = filas
      .slice(1, -1)
      .map(fila => fila.split(','))
      .map(fila => {
        const codigo = Number(fila[0])
        const { habitantes } = demografia.find(region => region.codigo === codigo)
        return {
          codigo,
          datos: fila
            .slice(2)
            .map(Number)
            .reduce((prev, x, i, arr) => i > 0 ? [...prev, x - arr[i - 1]] : [x], [])
            .map(casos => casos * 100_000 / habitantes)
        }
      })
    const geoJSONconDatos = JSON.stringify({
      ...regionesChile,
      features: regionesChile.features.map(region => {
        const id = Number(region.properties.codregion)
        const { datos: datosRegion } = datosRegionales.find(({ codigo }) => codigo === id)
        if (!datosRegion) {
          return {}
        }
        return {
          ...region,
          properties: {
            ...region.properties,
            ...datosRegion.reduce((prev, d, i) => ({...prev, [`v${i}`]: d }), {})
          }
        }
      })
    })
    fs.writeFile('./src/data/regional/infectados_por_100000.json', JSON.stringify(datosRegionales), err => console.log(err))
    fs.writeFile('./src/data/geojsons/regiones_con_datos.json', geoJSONconDatos, err => console.log(err))
  })