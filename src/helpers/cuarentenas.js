import moment from "moment"

export const procesarCuarentenas = geoJSON => {
  console.log({geoJSON})
  return {
    ...geoJSON,
    features: geoJSON.features.map(feature => ({
      ...feature,
      properties: {
        ...feature.properties,
        FTermino: feature.properties.FTermino !== null ? feature.properties.FTermino : '2020/12/31 23:59:59'
      }
    }))
  }
}

export const obtenerCuarentenasActivas = (geoJSONCuarentenas, fecha) => {
  // console.log(geoJSONCuarentenas)
  const c = {
    type: 'FeatureCollection',
    features: geoJSONCuarentenas.features.filter(feature => {
      const fechaInicio = moment(feature.properties.FInicio, 'YYYY/MM/DD hh:mm:ss')
      const fechaFinal = moment(feature.properties.FTermino, 'YYYY/MM/DD hh:mm:ss')
      return fecha.diff(fechaInicio, 'days') >= 0 && fecha.diff(fechaFinal, 'days') < 0
    })
  }
  // console.log({c})
  return c
}