import moment from 'moment/min/moment-with-locales'
import demografiaRegiones from '../data/demografia/regiones.json'
import demografiaComunas from '../data/demografia/comunas.json'
import { obtenerDemograficosComuna } from './demograficos'

const separarCSVEnFilas = csv => {
  let filas = csv.split('\n')
  if (filas.slice(-1)[0].trim() === '') {
    filas = filas.slice(0, -1)
  }
  const encabezados = filas[0].split(',')
  const datos = filas.slice(1).map(fila => fila.split(','))
  return [encabezados, datos]
}

export const procesarCSVRegiones = csv => {
  const [encabezados, datos] = separarCSVEnFilas(csv)
  const fechas = encabezados.slice(2).map(fecha => moment(fecha, 'MM/DD/YYYY'))
  const serieChile = fechas.map(f => ({ valor: 0, fecha: f.clone() }))
  const seriesRegiones = datos
    .map(dato => {
      const [codigo, nombre, ...serie] = dato.map((v, i) => i !== 1 ? Number(v) : v)
      return {
        codigo,
        nombre,
        serie: serie.map((valor, i) => {
          serieChile[i].valor += valor
          return {
            valor,
            fecha: fechas[i].format('DD/MM')
          }
        })
      }
    })
  return [serieChile, seriesRegiones]
}

export const procesarCSVComunas = (csv, seriesRegiones) => {
  const [encabezados, datos] = separarCSVEnFilas(csv)
  const fechaInicial = moment(seriesRegiones[0].serie[0].fecha, 'DD/MM')
  const fechasComunas = [fechaInicial, ...encabezados.slice(4).map(f => moment(f, 'MM/DD/YYYY'))]
  const hashRegiones = seriesRegiones.reduce((obj, r) => ({ ...obj, [r.codigo]: r }), {})
  const seriesComunas = datos.map(comuna => {
    const [codigoRegion, region, codigo, nombre, ...serie] = comuna
      .map((v, i) => (i !== 1 && i !== 3) ? (isNaN(v) ? 0 : Number(v)) : v)
    const serieRegion = hashRegiones[codigoRegion].serie
    return {
      codigo,
      nombre,
      codigoRegion,
      region,
      serie: [0, ...serie].reduce((prev, valor, i, arr) => {
        let secuencia = [{ fecha: fechasComunas[i].format('DD/MM'), valor, interpolado: false }]
        if (i > 0) {
          const indiceEnSerieRegional = fechasComunas[i].diff(fechaInicial, 'days')
          const indiceAnteriorEnSerieRegional = fechasComunas[i - 1].diff(fechaInicial, 'days')
          const casosFecha = serieRegion[indiceEnSerieRegional].valor
          const casosAnteriores = serieRegion[indiceAnteriorEnSerieRegional].valor
          const diferenciaRegion = Math.max(1, casosFecha - casosAnteriores)
          const diferenciaComuna = arr[i] - arr[i - 1]
          for (let j = indiceEnSerieRegional - 1; j > indiceAnteriorEnSerieRegional; j--) {
            const casosIntermedios = serieRegion[j].valor
            secuencia = [
              {
                fecha: fechaInicial.clone().add(j, 'days').format('DD/MM'),
                valor: Math.round(arr[i - 1] + diferenciaComuna * (casosIntermedios - casosAnteriores) / diferenciaRegion),
                interpolado: true
              },
              ...secuencia
            ]
          }
        }
        return [...prev, ...secuencia]
      }, [])
    }
  })
  return seriesComunas
}

export const calcularNuevosCasosChile = (serie, opciones = { redondear: true, dias: 1 }) => {
  let factor = 1
  if (opciones.habitantes) {
    const poblacion = demografiaRegiones.reduce((sum, r) => sum + Number(r.poblacion), 0)
    factor = opciones.habitantes / poblacion
  }
  const { redondear, dias } = opciones
  return serie.map((dato, i, arr) => {
    const nuevosCasos = factor * (dato.valor - arr[Math.max(0, i - (dias ? dias : 1))].valor)
    return {
      ...dato,
      valor: i > 0 ? (redondear ? Math.round(nuevosCasos) : nuevosCasos): 0
    }
  })
}

export const calcularNuevosCasos = (series, opciones = { redondear: true, dias: 1 }) => {
  return series.map(serie => {
    let factor = 1
    if (opciones.habitantes) {
      let demografia = demografiaComunas.find(comuna => serie.codigo === Number(comuna.codigo))
      if (!demografia) {
        demografia = demografiaRegiones.find(region => serie.codigo === Number(region.codigo))
      }
      factor = opciones.habitantes / Math.max(1, Number(demografia.poblacion))
    }
    const { redondear, dias } = opciones
    return {
      ...serie,
      serie: serie.serie.map((dato, i, arr) => ({
        ...dato,
        valor: i > 0 ?
          (redondear ? Math.round(factor * (dato.valor - arr[Math.max(0, i - (dias ? dias : 1))].valor)) :
          (factor * (dato.valor - arr[Math.max(0, i - (dias ? dias : 1))].valor))): 0
      }))
    }
  })
}

export const formatearGeoJSONComunas = geoJSON => {
  return {
    ...geoJSON,
    features: geoJSON.features.map(f => {
      const codigoRegion = obtenerDemograficosComuna(f.properties.COD_COMUNA).region
      return {
        ...f,
        properties: {
          ...f.properties,
          codigo: Number(f.properties.COD_COMUNA),
          codigoRegion: Number(codigoRegion)
        }
      }
    })
  }
}