const axios = require('axios')
const fs = require('fs')
const regionesChile = require('../data/geojsons/regiones.json')
const urlPerez = 'https://raw.githubusercontent.com/jorgeperezrojas/covid19-data/master/csv/confirmados.csv'
const demografia = require('./demograficos_regiones.json')

axios.get(urlPerez)
  .then(({ data }) => {
    const filas = data.split('\r\n')
    let datosRegionales = filas
      .slice(1, -1)
      .map(fila => fila.split(','))
      .map(fila => {
        const codigo = Number(fila[0])
        return {
          codigo,
          datos: fila
            .slice(2)
            .map(Number)
            .reduce((prev, x, i, arr) => i > 0 ? [...prev, x - arr[i - 1]] : [x], [])
        }
      })
    let datosPor100000Habitantes = datosRegionales
      .map(region => {
        const { habitantes } = demografia.find(r => r.codigo === region.codigo)
        return {
          ...region,
          datos: region.datos.map(casos => casos * 100_000 / habitantes)
        }
      })
    const geoJSONconDatos = JSON.stringify({
      ...regionesChile,
      features: regionesChile.features.map(region => {
        const id = Number(region.properties.codregion)
        const { datos: datosRegion } = datosPor100000Habitantes.find(({ codigo }) => codigo === id)
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
    fs.writeFile('./src/data/geojsons/regiones_con_datos.json', geoJSONconDatos, err => console.log(err))
    const poblacion = demografia.reduce((suma, { habitantes }) => suma + habitantes, 0)
    const datosChile = datosRegionales
      .reduce((prev, { datos }) => ({
        ...prev,
        datos: prev.datos.map((v, i) => v + datos[i])
      }))
      .datos.map(v => 100_000 * v / poblacion)
    datosPor100000Habitantes = [...datosPor100000Habitantes, {
      codigo: 0,
      nombre: 'Chile',
      datos: datosChile
    }]
    fs.writeFile('./src/data/regional/infectados_por_100000.json', JSON.stringify(datosPor100000Habitantes), err => console.log(err))
  })