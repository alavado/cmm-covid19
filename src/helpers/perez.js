import demografiaRegiones from '../data/demografia/regiones.json'
import moment from 'moment'

const formatearDatosRegion = datos => {
  const filas = datos.split('\r\n')
  const fechas = filas[0].split(',').slice(2).map(fecha => moment(fecha, 'MM/DD/YYYY'))
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
          .reduce((prev, x, i, arr) => {
            return i > 0 ?
              [...prev, { fecha: fechas[i], valor: x - arr[i - 1] }] :
              [{ fecha: fechas[0], valor: x }]
          }, [])
      }
    })
}

const obtenerCasosPorHabitantes = (region, habitantes) => {
  const { poblacion } = demografiaRegiones.find(r => r.codigo === region.codigo)
    return {
      ...region,
      datos: region.datos.map(r => ({ ...r, valor: Math.round(100 * r.valor * habitantes / poblacion) / 100 }))
    }
}

export const procesarRegiones = (data, geoJSON) => {
  let casosPorRegion = formatearDatosRegion(data)
  let casosPor100000Habitantes = casosPorRegion.map(region => obtenerCasosPorHabitantes(region, 100000))
  const poblacionChile = demografiaRegiones.reduce((suma, { habitantes }) => suma + habitantes, 0)
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
          codigo: region.properties.codregion,
          ...datosRegion.reduce((prev, d, i) => ({...prev, [`v${i}`]: d }), {})
        }
      }
    })
  }
  return [casosPor100000Habitantes, geoJSONConDatos]
}