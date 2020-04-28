import demograficosComunas from '../data/demografia/comunas.json'
import demograficosRegion from '../data/demografia/regiones.json'
import { CODIGO_CHILE } from '../redux/reducers/series'

export const obtenerDemograficosComuna = codigo => {
  return demograficosComunas.find(c => Number(c.codigo) === Number(codigo))
}

export const obtenerDemograficosRegion = codigo => {
  if (codigo === CODIGO_CHILE) {
    const poblacion = demograficosRegion.reduce((sum, v) => sum + Number(v.poblacion), 0)
    return {
      poblacion,
      nombre: 'Chile'
    }
  }
  return demograficosRegion.find(r => Number(r.codigo) === Number(codigo))
}