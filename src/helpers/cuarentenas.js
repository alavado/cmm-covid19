import moment from "moment"

export const procesarCuarentenas = geoJSON => {
  return geoJSON
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