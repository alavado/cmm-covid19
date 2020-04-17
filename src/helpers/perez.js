import demografiaRegiones from '../data/demografia/regiones.json'
import geoJSONRegiones from '../data/geojsons/regiones.json'

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

const obtenerCasosPorHabitantes = (region, habitantes) => {
  const { poblacion } = demografiaRegiones.find(r => r.codigo === region.codigo)
    return {
      ...region,
      datos: region.datos.map(casos => Math.round(100 * casos * habitantes / poblacion) / 100)
    }
}

export const procesarRegiones = data => {
  let casosPorRegion = formatearDatosRegion(data)
  let casosPor100000Habitantes = casosPorRegion.map(region => obtenerCasosPorHabitantes(region, 100000))
  const poblacionChile = demografiaRegiones.reduce((suma, { habitantes }) => suma + habitantes, 0)
  const datosChile = casosPorRegion
    .reduce((prev, { datos }) => ({
      ...prev,
      datos: prev.datos.map((v, i) => v + datos[i])
    }))
    .datos.map(v => (100000.0 * v) / poblacionChile)
  casosPor100000Habitantes = [...casosPor100000Habitantes, {
    codigo: 0,
    nombre: 'Chile',
    datos: datosChile
  }]
  const geoJSONConDatos = {
    ...geoJSONRegiones,
    features: geoJSONRegiones.features.map(region => {
      const id = Number(region.properties.codregion)
      const { datos: datosRegion } = casosPor100000Habitantes.find(({ codigo }) => codigo === id)
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
  }
  return [casosPor100000Habitantes, geoJSONConDatos]
}