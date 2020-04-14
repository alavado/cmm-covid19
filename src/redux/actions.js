import { CAMBIAR_FECHA, SELECCIONAR_REGION, SELECCIONAR_CHILE } from './actionTypes'
import infectadosPor100000 from '../data/regional/infectados_por_100000.json'

export const fijarDia = (dia, region) => {
  const dias = region.datos.length
  return {
    type: CAMBIAR_FECHA,
    payload: Math.min(Math.max(0, Number(dia)), dias - 1)
  }
}

export const seleccionarRegion = (nombre, codigo) => ({
  type: SELECCIONAR_REGION,
  payload: {
    nombre,
    codigo,
    datos: infectadosPor100000.find(r => Number(r.codigo) === Number(codigo)).datos
  }
})

export const seleccionarChile = () => ({
  type: SELECCIONAR_CHILE
})