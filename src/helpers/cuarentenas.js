import moment from "moment"

export const procesarCuarentenas = geoJSON => {
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
  const f = moment(fecha, 'DD/MM')
  const c = {
    type: 'FeatureCollection',
    features: geoJSONCuarentenas.features.filter(feature => {
      const fechaInicio = moment(feature.properties.FInicio, 'YYYY/MM/DD hh:mm:ss')
      const fechaFinal = feature.properties.FTermino !== null ? moment(feature.properties.FTermino, 'YYYY/MM/DD hh:mm:ss') : moment()
      return f.diff(fechaInicio, 'days') >= 0 && f.diff(fechaFinal, 'days') < 0
    })
  }
  return c
}