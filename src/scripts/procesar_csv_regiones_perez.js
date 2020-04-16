const axios = require('axios')
const fs = require('fs')
const regionesChile = require('../data/geojsons/regiones.json')
const comunasChile = require('../data/geojsons/comunas.json')
const urlPerezRegiones = 'https://raw.githubusercontent.com/jorgeperezrojas/covid19-data/master/csv/confirmados.csv'
const demografiaRegiones = require('./demograficos_regiones.json')
const urlPerezComunas = 'https://raw.githubusercontent.com/jorgeperezrojas/covid19-data/master/csv/confirmados_comunas.csv'
const demografiaComunas = require('./demograficos_comunas.json')
const moment = require('moment')

const formatearDatosRegion = datos => {
  const filas = datos.split('\r\n')
  return filas
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
}

axios.get(urlPerezRegiones)
  .then(({ data }) => {
    let datosRegionales = formatearDatosRegion(data)
    let datosPor100000Habitantes = datosRegionales.map(region => {
      const { habitantes } = demografiaRegiones.find(r => r.codigo === region.codigo)
        return {
          ...region,
          datos: region.datos.map(casos => Math.round(100 * casos * 100_000 / habitantes) / 100)
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
    const poblacion = demografiaRegiones.reduce((suma, { habitantes }) => suma + habitantes, 0)
    fs.writeFile('./src/data/geojsons/regiones_con_datos.json', geoJSONconDatos, err => console.log(err))
    const datosChile = datosRegionales
      .reduce((prev, { datos }) => ({
        ...prev,
        datos: prev.datos.map((v, i) => v + datos[i])
      }))
      .datos.map(v => (100000.0 * v) / poblacion)
    datosPor100000Habitantes = [...datosPor100000Habitantes, {
      codigo: 0,
      nombre: 'Chile',
      datos: datosChile
    }]
    fs.writeFile('./src/data/regional/infectados_por_100000.json', JSON.stringify(datosPor100000Habitantes), err => console.log(err))
  })

const formatearDatosComunas = datos => {
  const filas = datos.split('\r\n')
  const fechas = filas[0].split(',').slice(4).map(fecha => moment(fecha, 'MM[/]DD[/]YYYY'))
  const fechaInicial = moment('2020-03-03')
  let flags = []
  for (let fecha = fechaInicial.clone(); fecha.diff(fechas.slice(-1)[0]) <= 0; fecha = fecha.add(1, 'days')) {
    flags.push(fechas.some(f => f.diff(fecha) === 0))
  }
  return filas
    .slice(1, -1)
    .map(fila => fila.split(','))
    .map(fila => {
      const codigo = Number(fila[2])
      const datosFila = fila.slice(2).map(Number)
      return {
        codigo,
        datos: flags.reduce((prev, flag) => {
          const { datosConCeros, j } = prev
          if (!flag) {
            return { datosConCeros: [...datosConCeros, 0], j }
          }
          return { datosConCeros: [...datosConCeros, datosFila[j] || 0], j: j + 1 }
        } , { datosConCeros: [], j: 0 }).datosConCeros
      }
    })
}

axios.get(urlPerezComunas)
  .then(({ data }) => {
    let datosComunalesDelCSV = formatearDatosComunas(data)
    let datosPor100000Habitantes = datosComunalesDelCSV
      .map(comuna => {
        const datosDemograficosComuna = demografiaComunas.find(r => Number(r.codigo) === Number(comuna.codigo))
        if (!datosDemograficosComuna) {
          return {}
        }
        const { poblacion } = datosDemograficosComuna
        return {
          ...comuna,
          datos: comuna.datos.map(casos => Math.round(100 * casos * 100_000 / poblacion) / 100)
        }
      })
    console.log(datosPor100000Habitantes.find(c => c.codigo == 8409))
    const geoJSONconDatos = JSON.stringify({
      ...comunasChile,
      features: comunasChile.features.map(feature => {
        const id = Number(feature.properties.COD_COMUNA)
        const datos = datosPor100000Habitantes.find(({ codigo }) => Number(codigo) === id)
        if (!datos) {
          return feature
        }
        return {
          ...feature,
          properties: {
            ...feature.properties,
            ...datos.datos.reduce((prev, d, i) => ({...prev, [`v${i}`]: d }), {})
          }
        }
      })
    })
    const poblacion = demografiaComunas.reduce((suma, { habitantes }) => suma + habitantes, 0)
    fs.writeFile('./src/data/geojsons/comunas_con_datos.json', geoJSONconDatos, err => console.log(err))
    const datosChile = datosComunalesDelCSV
      .reduce((prev, { datos }) => ({
        ...prev,
        datos: prev.datos.map((v, i) => v + datos[i])
      }))
      .datos.map(v => (100000.0 * v) / poblacion)
    datosPor100000Habitantes = [...datosPor100000Habitantes, {
      codigo: 0,
      nombre: 'Chile',
      datos: datosChile
    }]
    fs.writeFile('./src/data/comunal/infectados_por_100000.json', JSON.stringify(datosPor100000Habitantes), err => console.log(err))
  })