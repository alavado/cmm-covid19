import demografiaRegiones from '../data/demografia/regiones.json'
import demografiaComunas from '../data/demografia/comunas.json'
import moment from 'moment/min/moment-with-locales'

const formatearDatosRegion = csv => {
  const filas = csv.split('\r\n')
  const fechas = filas[0].split(',').slice(2).map(fecha => moment(fecha, 'MM/DD/YYYY'))
  return filas
    .slice(1, -1)
    .map(fila => fila.split(','))
    .map(fila => {
      const codigo = Number(fila[0])
      const nombre = demografiaRegiones.find(r => r.codigo === codigo).nombre
      return {
        codigo,
        nombre,
        datos: fila
          .slice(2)
          .map(Number)
          .reduce((prev, x, i, arr) => {
            return i > 0 ?
              [...prev, { fecha: fechas[i], valor: Math.max(0, x - arr[i - 1]) }] :
              [{ fecha: fechas[0], valor: x }]
          }, [])
      }
    })
}

const obtenerCasosRegionalesPorHabitantes = (region, habitantes) => {
  const { poblacion } = demografiaRegiones.find(r => r.codigo === region.codigo)
    return {
      ...region,
      datos: region.datos.map(r => ({ ...r, valor: Math.round(100 * r.valor * habitantes / poblacion) / 100 }))
    }
}

export const procesarRegiones = (csv, geoJSON) => {
  let casosPorRegion = formatearDatosRegion(csv)
  let casosPor100000Habitantes = casosPorRegion.map(region => obtenerCasosRegionalesPorHabitantes(region, 100000))
  const poblacionChile = demografiaRegiones.reduce((suma, { poblacion }) => suma + poblacion, 0)
  const datosChile = casosPorRegion
    .reduce((prev, { datos }) => ({
      ...prev,
      datos: prev.datos.map((v, i) => ({ ...v, valor: v.valor + datos[i].valor }))
    }))
    .datos.map(v => ({ ...v, valor: (100000.0 * v.valor) / poblacionChile }))
  casosPor100000Habitantes = [...casosPor100000Habitantes, {
    codigo: 0,
    nombre: 'Chile',
    datos: datosChile
  }]
  const geoJSONConDatos = {
    ...geoJSON,
    features: geoJSON.features.map(region => {
      const id = Number(region.properties.codregion)
      const { datos: datosRegion } = casosPor100000Habitantes.find(({ codigo }) => codigo === id)
      if (!datosRegion) {
        return {}
      }
      return {
        ...region,
        properties: {
          ...region.properties,
          nombre: region.properties.Region,
          codigo: Number(region.properties.codregion),
          codigoRegion: Number(region.properties.codregion),
          ...datosRegion.reduce((prev, d, i) => ({...prev, [`v${i}`]: d.valor }), {})
        }
      }
    })
  }
  return [casosPor100000Habitantes, geoJSONConDatos]
}

//.map((val, i) => ({ fecha: fechas[i], valor: isNaN(val) ? -1 : Number(val) }))
const formatearDatosComuna = csv => {
  const filas = csv.split('\n')
  const fechas = filas[0].split(',').slice(4).map(fecha => moment(fecha, 'MM/DD/YYYY'))
  return filas
    .slice(1, -1)
    .map(fila => fila.split(','))
    .map(fila => {
      const codigoRegion = Number(fila[0])
      const codigo = Number(fila[2])
      const nombre = demografiaComunas.find(r => Number(r.codigo) === codigo).nombre
      return {
        codigo,
        nombre,
        codigoRegion,
        datos: fila
          .slice(4)
          .map(x => isNaN(x) ? 0 : Number(x))
          .reduce((prev, x, i, arr) => {
            const diasDiferencia = fechas[i].diff(fechas[i - 1], 'days')
            return i > 0 ?
              [...prev, { fecha: fechas[i], valor: Math.max(0, (x - arr[i - 1]) / diasDiferencia) }] :
              [{ fecha: fechas[0], valor: x }]
          }, [])
          .slice(1)
      }
    })
}

const obtenerCasosComunalesPorHabitantes = (comuna, habitantes) => {
  const { poblacion } = demografiaComunas.find(c => Number(c.codigo) === comuna.codigo)
  return {
    ...comuna,
    datos: comuna.datos.map(d => d.valor < 0 ? d : ({ ...d, valor: Math.round(100 * d.valor * habitantes / poblacion) / 100 }))
  }
}

export const procesarComunas = (csv, geoJSON) => {
  let casosPorComuna = formatearDatosComuna(csv)
  let casosPor100000Habitantes = casosPorComuna.map(comuna => obtenerCasosComunalesPorHabitantes(comuna, 100000))
  const geoJSONConDatos = {
    ...geoJSON,
    features: geoJSON.features.map(feature => {
      const id = Number(feature.properties.COD_COMUNA)
      const x = casosPor100000Habitantes.find(({ codigo }) => codigo === id)
      if (!x) {
        return {}
      }
      const datosFeature = x.datos
      return {
        ...feature,
        properties: {
          ...feature.properties,
          nombre: feature.properties.NOM_COM,
          codigo: Number(feature.properties.COD_COMUNA),
          codigoRegion: Number(x.codigoRegion),
          ...datosFeature.reduce((prev, d, i) => ({...prev, [`v${i}`]: d.valor }), {})
        }
      }
    })
  }
  return [casosPor100000Habitantes, geoJSONConDatos]
}